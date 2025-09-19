import React, { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "https://api.hagglehub.app";

export default function InboxPage() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load current user and unmatched inbox messages
  useEffect(() => {
    const load = async () => {
      try {
        const respUser = await fetch(`${API}/users/me`);
        if (!respUser.ok) throw new Error("User not found");
        const currentUser = await respUser.json();
        setUser(currentUser);

        if (currentUser?.key) {
          const resp = await fetch(`${API}/inbox/unmatched?userKey=${currentUser.key}`);
          if (!resp.ok) throw new Error("Failed inbox fetch");
          const data = await resp.json();
          setMessages(data);
        }
      } catch (e) {
        console.error("Inbox load failed:", e);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const attachToDeal = async (msgId, dealId) => {
    try {
      const resp = await fetch(`${API}/inbox/${msgId}/attach`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dealId }),
      });
      if (!resp.ok) throw new Error("Failed to attach");
      // remove from inbox list
      setMessages(messages.filter((m) => m.id !== msgId));
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
      // remove from inbox list
      setMessages(messages.filter((m) => m.id !== msgId));
    } catch (e) {
      alert(e.message);
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <p>Loading inbox…</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Inbox</h1>
      {messages.length === 0 ? (
        <p className="text-gray-500">No unmatched messages.</p>
      ) : (
        <div className="space-y-4">
          {messages.map((m) => (
            <div key={m.id} className="border rounded p-3 bg-white shadow-sm">
              <div className="text-sm text-gray-600 mb-1">
                <span className="font-semibold">{m.sender}</span> →{" "}
                <span>{m.recipient}</span>
              </div>
              <div className="font-medium">{m.subject}</div>
              <div className="text-sm whitespace-pre-wrap mt-1">{m.preview || m.body}</div>
              <div className="flex gap-2 mt-3">
                <button
                  className="bg-brand-lime text-brand-teal px-3 py-1 rounded text-sm font-semibold"
                  onClick={() => {
                    const dealId = prompt("Enter deal ID to attach:");
                    if (dealId) attachToDeal(m.id, dealId);
                  }}
                >
                  Attach to Deal
                </button>
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
    </div>
  );
}
