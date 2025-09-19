import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "https://api.hagglehub.app";

export default function MessagesPage() {
  const [dealId, setDealId] = useState(""); // user enters deal id
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({
    to: "",
    subject: "",
    body: "",
  });

  // Load messages for a given deal
  useEffect(() => {
    if (!dealId) return;
    (async () => {
      try {
        const resp = await fetch(`${API}/deals/${dealId}/messages`);
        if (!resp.ok) throw new Error("Failed to load messages");
        const data = await resp.json();
        const normalized = data.map((m) => ({
          id: m.id,
          direction: m.direction === "in" ? "inbound" : "outbound",
          content: m.body,
          created_date: m.createdAt,
        }));
        setMessages(normalized);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [dealId]);

  const send = async (e) => {
    e.preventDefault();
    if (!dealId) {
      alert("Enter a deal ID first.");
      return;
    }
    try {
      setSending(true);
      const resp = await fetch(`${API}/deals/${dealId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: "email",
          to: form.to,
          subject: form.subject,
          body: form.body,
        }),
      });
      if (!resp.ok) throw new Error("Failed to send");
      await resp.json();

      // reload thread
      const reload = await fetch(`${API}/deals/${dealId}/messages`);
      const data = await reload.json();
      setMessages(
        data.map((m) => ({
          id: m.id,
          direction: m.direction === "in" ? "inbound" : "outbound",
          content: m.body,
          created_date: m.createdAt,
        }))
      );

      setForm({ to: "", subject: "", body: "" });
    } catch (e) {
      alert(e.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-2">Messages</h1>

      <div className="mb-4">
        <label className="block text-sm mb-1">Deal ID</label>
        <input
          className="border p-2 w-full"
          value={dealId}
          onChange={(e) => setDealId(e.target.value)}
          placeholder="Enter deal ID"
        />
      </div>

      <form onSubmit={send} className="space-y-2 border p-3 rounded mb-6">
        <div>
          <label className="block text-sm mb-1">To (dealer email)</label>
          <input
            className="border p-2 w-full"
            value={form.to}
            onChange={(e) => setForm({ ...form, to: e.target.value })}
            placeholder="internet.sales@dealer.com"
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Subject</label>
          <input
            className="border p-2 w-full"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            placeholder="Request for OTD price"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Message</label>
          <textarea
            className="border p-2 w-full"
            rows={4}
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            required
          />
        </div>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={sending}
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </form>

      <h2 className="text-lg font-medium mb-2">Thread</h2>
      <div className="space-y-2">
        {messages.map((m) => (
          <div key={m.id} className="border rounded p-2">
            <div className="text-xs text-gray-500">
              {m.direction.toUpperCase()} •{" "}
              {new Date(m.created_date).toLocaleString()}
            </div>
            <div className="whitespace-pre-wrap">{m.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
