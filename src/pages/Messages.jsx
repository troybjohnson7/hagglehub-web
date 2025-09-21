import React, { useEffect, useState } from "react";

const API = "https://api.hagglehub.app"; // TEMP: hardcode for debugging

export default function MessagesPage() {
  const [user, setUser] = useState(null);

  // Unmatched inbox + deals for attach
  const [unmatched, setUnmatched] = useState([]);
  const [deals, setDeals] = useState([]);

  // Deal thread viewer/sender
  const [dealId, setDealId] = useState("");
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ to: "", subject: "", body: "" });

  // ---------- Load current user, deals, and unmatched ----------
  useEffect(() => {
    const load = async () => {
      try {
        // current user
        const rUser = await fetch(`${API}/users/me`);
        if (!rUser.ok) throw new Error("Failed to fetch user");
        const me = await rUser.json();
        setUser(me);

        // all deals (you can filter by userKey if needed)
        const rDeals = await fetch(`${API}/deals`);
        const listDeals = rDeals.ok ? await rDeals.json() : [];
        setDeals(listDeals);

        // unmatched inbox for this user
        if (me?.key) {
          const rInbox = await fetch(
            `${API}/inbox/unmatched?userKey=${encodeURIComponent(me.key)}`
          );
          const listInbox = rInbox.ok ? await rInbox.json() : [];
          setUnmatched(listInbox);
        }
      } catch (e) {
        console.error("Messages init failed:", e);
      }
    };
    load();
  }, []);

  // ---------- Load thread for the selected deal ----------
  useEffect(() => {
    if (!dealId) {
      setMessages([]);
      return;
    }
    (async () => {
      try {
        const r = await fetch(`${API}/deals/${dealId}/messages`);
        if (!r.ok) throw new Error("Failed to load messages");
        const data = await r.json();
        setMessages(
          data.map((m) => ({
            id: m.id,
            direction: m.direction === "in" ? "inbound" : "outbound",
            content: m.body,
            created_date: m.createdAt,
          }))
        );
      } catch (e) {
        console.error(e);
        setMessages([]);
      }
    })();
  }, [dealId]);

  // ---------- Attach / Create from unmatched ----------
  const attachToDeal = async (msgId, dId) => {
    try {
      const resp = await fetch(`${API}/inbox/${msgId}/attach`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dealId: Number(dId) }),
      });
      if (!resp.ok) throw new Error("Failed to attach");
      // remove from unmatched list
      setUnmatched((list) => list.filter((m) => m.id !== msgId));
      // if we're viewing that deal, refresh its thread
      if (String(dId) === String(dealId)) {
        const r = await fetch(`${API}/deals/${dId}/messages`);
        const data = r.ok ? await r.json() : [];
        setMessages(
          data.map((m) => ({
            id: m.id,
            direction: m.direction === "in" ? "inbound" : "outbound",
            content: m.body,
            created_date: m.createdAt,
          }))
        );
      }
      alert("Attached to deal.");
    } catch (e) {
      alert(e.message);
    }
  };

  const createDealFromMessage = async (msgId) => {
    try {
      const resp = await fetch(`${API}/inbox/${msgId}/createDeal`, {
        method: "POST",
      });
      if (!resp.ok) throw new Error("Failed to create deal");
      const { deal } = await resp.json();
      // remove from unmatched
      setUnmatched((list) => list.filter((m) => m.id !== msgId));
      // include new deal in the local deals list
      setDeals((prev) => [...prev, deal]);
      // jump to the new deal thread
      setDealId(String(deal.id));
      alert(`Created new deal #${deal.id} and attached the message.`);
    } catch (e) {
      alert(e.message);
    }
  };

  // ---------- Send outbound on a deal ----------
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
    <div className="p-4 space-y-8">
      <h1 className="text-2xl font-semibold">Messages</h1>

      {/* ===== Unmatched inbox (catch-all) ===== */}
      <section className="bg-white border rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-3">Unmatched</h2>
        {user && (
          <div className="text-xs text-gray-500 mb-3">
            Receiving for: <span className="font-mono">deals-{user.key}@hagglehub.app</span>
          </div>
        )}
        {unmatched.length === 0 ? (
          <div className="text-gray-500">No unmatched messages.</div>
        ) : (
          <div className="space-y-3">
            {unmatched.map((m) => (
              <div key={m.id} className="border rounded p-3">
                <div className="text-sm text-gray-600 mb-1">
                  <span className="font-semibold">{m.sender}</span> →{" "}
                  <span className="font-mono">{m.recipient}</span>{" "}
                  <span className="text-xs text-gray-400">
                    • {new Date(m.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="font-medium">{m.subject || "(no subject)"}</div>
                <div className="text-sm whitespace-pre-wrap mt-1">
                  {m.preview || m.body}
                </div>

                <div className="flex gap-2 mt-3 flex-wrap">
                  {/* Attach to existing deal (choose id) */}
                  <AttachToDealSelect
                    deals={deals}
                    onAttach={(dealId) => attachToDeal(m.id, dealId)}
                  />
                  {/* Create new deal */}
                  <button
                    className="bg-brand-teal text-white px-3 py-1 rounded text-sm font-semibold"
                    onClick={() => createDealFromMessage(m.id)}
                  >
                    Create New Deal
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ===== Deal thread viewer/sender ===== */}
      <section className="bg-white border rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-3">Deal Thread</h2>

        <div className="mb-4">
          <label className="block text-sm mb-1">Deal ID</label>
          <input
            className="border p-2 w-full"
            value={dealId}
            onChange={(e) => setDealId(e.target.value)}
            placeholder="Enter deal ID (e.g., 1)"
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

        <h3 className="text-md font-medium mb-2">Thread</h3>
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
          {dealId && messages.length === 0 && (
            <div className="text-gray-500 text-sm">
              No messages found for deal #{dealId}.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

// Small helper select to attach to a deal
function AttachToDealSelect({ deals, onAttach }) {
  const [selected, setSelected] = useState("");

  return (
    <div className="flex items-center gap-2">
      <select
        className="border p-1 rounded text-sm"
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
      >
        <option value="">Attach to deal…</option>
        {deals.map((d) => (
          <option key={d.id} value={d.id}>
            Deal #{d.id}
          </option>
        ))}
      </select>
      <button
        className="bg-brand-lime text-brand-teal px-3 py-1 rounded text-sm font-semibold disabled:opacity-50"
        disabled={!selected}
        onClick={() => selected && onAttach(selected)}
      >
        Attach
      </button>
    </div>
  );
}
