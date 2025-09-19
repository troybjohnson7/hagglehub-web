const API = import.meta.env.VITE_API_URL || "https://api.hagglehub.app";

// Deals
export const Deal = {
  list: async () => {
    const r = await fetch(`${API}/deals`);
    if (!r.ok) throw new Error("Failed to load deals");
    return r.json();
  }
};

// Messages (note: :param can be a numeric id OR your token like p8j5o5u)
export const Message = {
  list: async (param) => {
    const r = await fetch(`${API}/deals/${param}/messages`);
    if (!r.ok) throw new Error("Failed to load messages");
    return r.json();
  },
  send: async (param, { to, subject, body, html }) => {
    const r = await fetch(`${API}/deals/${param}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channel: "email",
        to,
        subject,
        body,
        html
      })
    });
    if (!r.ok) {
      const err = await r.json().catch(() => ({}));
      throw new Error(err.error || "Failed to send message");
    }
    return r.json();
  }
};
