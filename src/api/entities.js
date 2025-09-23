const API = import.meta.env.VITE_API_URL || "https://api.hagglehub.app";

async function jget(url) {
  const r = await fetch(url, { credentials: "include" });
  if (!r.ok) throw new Error(await r.text().catch(() => r.statusText));
  return r.json();
}
async function jpost(url, body) {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body || {})
  });
  if (!r.ok) throw new Error(await r.text().catch(() => r.statusText));
  const ct = r.headers.get("content-type") || "";
  return ct.includes("application/json") ? r.json() : {};
}

/* -------- Users -------- */
export const User = {
  async me() {
    try {
      const u = await jget(`${API}/users/me`);
      return {
        id: u.id || u.key,
        key: u.key,
        full_name: u.full_name || u.name || "HaggleHub User",
        email: u.email,
        user_metadata: u.user_metadata || {}
      };
    } catch {
      return null;
    }
  },
  login() {
    window.location.href = `${API}/auth/google`;
  },
  logout() {
    window.location.href = `${API}/auth/logout?redirect=${encodeURIComponent(window.location.origin)}`;
  }
};

/* -------- Deals -------- */
export const Deal = {
  list(order = "") {
    const qs = order ? `?order=${encodeURIComponent(order)}` : "";
    return jget(`${API}/deals${qs}`);
  },
  get(id) { return jget(`${API}/deals/${encodeURIComponent(id)}`); },
  filter(q) {
    if (q?.id) return this.get(q.id).then(d => [d]);
    return Promise.resolve([]);
  },
  create(payload) { return jpost(`${API}/deals`, payload); }
};

/* -------- Dealers -------- */
export const Dealer = {
  list() { return jget(`${API}/dealers`); },
  get(id) { return jget(`${API}/dealers/${encodeURIComponent(id)}`); },
  create(payload) { return jpost(`${API}/dealers`, payload); }
};

/* -------- Vehicles -------- */
export const Vehicle = {
  async list() { try { return await jget(`${API}/vehicles`); } catch { return []; } },
  async get(id) { try { return await jget(`${API}/vehicles/${encodeURIComponent(id)}`); } catch { return null; } }
};

/* -------- Messages -------- */
export const Message = {
  list() { return Promise.resolve([]); },
  filter(q) {
    if (q?.deal_id) return jget(`${API}/deals/${encodeURIComponent(q.deal_id)}/messages`);
    if (Object.prototype.hasOwnProperty.call(q || {}, "is_read")) return Promise.resolve([]);
    return Promise.resolve([]);
  },
  listForDeal(dealId) { return jget(`${API}/deals/${encodeURIComponent(dealId)}/messages`); },
  create(dealId, data) { return jpost(`${API}/deals/${encodeURIComponent(dealId)}/messages`, data); }
};

/* -------- Inbox (unmatched inbound) -------- */
export const Inbox = {
  listUnmatched(userKey) {
    return jget(`${API}/inbox/unmatched?userKey=${encodeURIComponent(userKey)}`);
  }
};

/* -------- MarketData (safe stubs) -------- */
export const MarketData = {
  async list() { return []; },
  async forVehicle() { return []; },
  async forDeal() { return []; },
  async summarize() { return { insights: [], summary: "", stats: {} }; }
};
