import React, { useEffect, useState } from "react";
import { Deal } from "@/api/entities";      // Base44 entity wrapper (your deals)
import { User } from "@/api/entities";      // Base44 entity wrapper (current user)
import { Button } from "@/components/ui/button";

const API = import.meta.env.VITE_API_URL || "https://api.hagglehub.app";

export default function InboxPage() {
  const [user, setUser] = useState(null);
  const [deals, setDeals] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load user, deals, and unmatched messages
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const me = await User.me();
        setUser(me);

        const allDeals = await Deal.list();
        setDeals(allDeals);

        const resp = await fetch(`${API}/inbox/unmatched?userKey=${me.key}`);
        if (!resp.ok) throw new Error("Failed to load inbox");
        const data = await resp.json();
        setMessages(data);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load inbox");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const attach = async (messageId, dealId) => {
    try {
      const resp = await fetch(`${API}/inbox/attach`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId, dealId })
      });
      if (!resp.ok) throw new Error("Failed to attach");
      const updated = await resp.json();
      alert("Message attached successfully!");

      // remove message from inbox
      setMessages(msgs => msgs.filter(m => m.id !== messageId));
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const createDeal = async (message) => {
    try {
      // For now: create a blank deal for this user, seeded with dealer email
      const newDeal = {
        userKey: user.key,
        dealerName: message.meta.sender || "Unknown Dealer",
        status: "open"
      };
      const resp = await fetch(`${API}/deals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDeal)
      });
      if (!resp.ok) throw new Error("Failed to create deal");
      const deal = await resp.json();

      await attach(message.id, deal.id);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  if (loading) return <div className="p-6">Loading inbox…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Inbox</h1>

        {messages.length === 0 && (
          <div className="text-gray-600">No unmatched messages 🎉</div>
        )}

        <div className="space-y-4">
          {messages.map((m) => (
            <div key={m.id} className="bg-white border rounded-lg shadow p-4">
              <div className="text-sm text-gray-500 mb-2">
                From: {m.meta?.sender || "Unknown"} •{" "}
                {new Date(m.createdAt).toLocaleString()}
              </div>
              <div className="font-medium mb-2">{m.meta?.subject || "(no subject)"}</div>
              <div className="whitespace-pre-wrap text-sm mb-4">
                {m.body.slice(0, 300)}
              </div>

              <div className="flex gap-2 flex-wrap">
                {/* Attach to existing deal */}
                {deals.map((d) => (
                  <Button
                    key={d.id}
                    onClick={() => attach(m.id, d.id)}
                    className="bg-brand-teal text-white hover:bg-brand-teal-dark"
                  >
                    Attach to {d.vehicleTitle || d.dealerName || `Deal #${d.id}`}
                  </Button>
                ))}

                {/* Create new deal */}
                <Button
                  onClick={() => createDeal(m)}
                  className="bg-brand-lime text-brand-teal hover:bg-brand-lime-dark"
                >
                  Create New Deal
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
