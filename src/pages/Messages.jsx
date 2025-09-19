import { useEffect, useMemo, useRef, useState } from "react";
import { Deal, Message } from "../api/hh";

export default function MessagesPage() {
  // token or numeric id (you can replace this with a router param later)
  const [param, setParam] = useState("p8j5o5u");

  const [deals, setDeals] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({ to: "", subject: "", body: "" });

  // find the current deal (by id or key/token) to show its proxy email
  const currentDeal = useMemo(() => {
    if (!deals?.length) return null;
    const num = Number(param);
    if (!Number.isNaN(num)) return deals.find((d) => d.id === num) || null;
    return deals.find((d) => d.key === param) || null;
  }, [deals, param]);

  // load deals once (to show proxyEmail and basic info)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await Deal.list();
        if (!cancelled) setDeals(list);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // load messages when param changes; light auto-refresh
  const intervalRef = useRef(null);
  const loadMessages = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await Message.list(param);
      setMessages(data);
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
    // auto-refresh every 10s
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(loadMessages, 10000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [param]);

  const send = async (e) => {
    e.preventDefault();
    try {
      setSending(true);
      setError("");
      await Message.send(param, {
        to: form.to,
        subject: form.subject,
        body: form.body,
      });
      await loadMessages();
      setForm({ to: "", subject: "", body: "" });
    } catch (e2) {
      console.error(e2);
      setError(e2.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied!");
    } catch {
      alert("Copy failed. Please copy manually.");
    }
  };

  const prettyWhen = (iso) => {
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-end flex-wrap gap-3">
        <div className="grow min-w-[260px]">
          <label className="block text-sm mb-1">Deal token or id</label>
          <input
            className="border p-2 w-full rounded"
            value={param}
            onChange={(e) => setParam(e.target.value.trim())}
            placeholder="e.g., p8j5o5u or 1"
          />
        </div>

        <button
          onClick={loadMessages}
          className="h-10 px-4 rounded bg-gray-100 border hover:bg-gray-200"
          disabled={loading}
          title="Refresh"
        >
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      <div className="border rounded p-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="font-medium">
              {currentDeal
                ? `${currentDeal.vehicleTitle || "Deal"} — ${currentDeal.dealerName || ""}`
                : "Deal info"}
            </div>
            <div className="text-sm text-gray-600">
              {currentDeal ? `ID: ${currentDeal.id} • Token: ${currentDeal.key}` : "—"}
            </div>
          </div>

          <div className="text-sm">
            <div className="text-gray-600">Proxy email (Reply-To)</div>
            <div className="flex items-center gap-2">
              <code className="px-2 py-1 bg-gray-50 border rounded">
                {currentDeal?.proxyEmail || "—"}
              </code>
              {currentDeal?.proxyEmail && (
                <button
                  onClick={() => copy(currentDeal.proxyEmail)}
                  className="text-blue-600 hover:underline"
                >
                  Copy
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={send} className="space-y-3 border p-4 rounded">
        <div className="font-medium">Send email to dealer</div>
        <div>
          <label className="block text-sm mb-1">To (dealer email)</label>
          <input
            className="border p-2 w-full rounded"
            value={form.to}
            onChange={(e) => setForm({ ...form, to: e.target.value })}
            placeholder="internet.sales@dealer.com"
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Subject</label>
          <input
            className="border p-2 w-full rounded"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            placeholder="Request for OTD price"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Message</label>
          <textarea
            className="border p-2 w-full rounded"
            rows={4}
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            required
          />
        </div>
        {error && (
          <div className="text-red-600 text-sm">
            {error}
          </div>
        )}
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={sending}
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </form>

      <div>
        <h2 className="text-lg font-medium mb-2">Thread</h2>
        <div className="space-y-2">
          {messages.length === 0 && (
            <div className="text-sm text-gray-500">No messages yet.</div>
          )}
          {messages.map((m) => {
            const isIn = m.direction === "in";
            const who =
              isIn
                ? (m.meta?.sender || "Dealer")
                : (m.meta?.to || "Dealer");
            const sub =
              m.meta?.subject ? ` • ${m.meta.subject}` : "";
            return (
              <div key={m.id} className="border rounded p-2">
                <div className="text-xs text-gray-500 flex justify-between">
                  <span>
                    <span className={`inline-block px-1.5 py-0.5 rounded mr-1 ${isIn ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                      {isIn ? "IN" : "OUT"}
                    </span>
                    {who}{sub}
                  </span>
                  <span>{prettyWhen(m.createdAt)}</span>
                </div>
                <div className="whitespace-pre-wrap mt-1">{m.body}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
