// Frontend compat layer to replace Base44 entities
// All calls go to your HaggleHub API
const API = import.meta.env.VITE_API_URL || "https://api.hagglehub.app";

async function jget(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
async function jpost(url, body) {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export const User = {
  async me() {
    // Replace with real auth later
    return jget(`${API}/users/me`);
  },
  // SOME PAGES EXPECT login/logout methods; stub them to avoid crashes
  async login() {
    window.location.href = `${API}/auth/login`;
  },
  async logout() {
    await jpost(`${API}/auth/logout`, {});
  },
};

export const Deal = {
  async list(ordering) {
    // ordering ignored in this simple API
    return jget(`${API}/deals`);
  },
  async filter(query) {
    // Only filter by id is used in your shared code
    if (query?.id) return jget(`${API}/deals/${query.id}`).then(d => [d]);
    return jget(`${API}/deals`);
  },
  async get(id) {
    return jget(`${API}/deals/${id}`);
  },
  async create(payload) {
    return jpost(`${API}/deals`, payload);
  }
};

export const Message = {
  // Some components call Message.list('-created_date')
  async list() {
    // Not available globally in our API; return empty to avoid crashes
    return [];
  },
  // Some code used Message.filter({ dealer_id }) — we can’t do that without DB.
  // Return [] so UI doesn’t crash; the real thread comes from DealDetails → /deals/:id/messages
  async filter() {
    return [];
  },
  async listForDeal(dealId) {
    return jget(`${API}/deals/${dealId}/messages`);
  },
  async createForDeal(dealId, { to, subject, body }) {
    return jpost(`${API}/deals/${dealId}/messages`, {
      channel: "email",
      to, subject, body
    });
  }
};

export const Vehicle = {
  async list() {
    return jget(`${API}/vehicles`).catch(() => []);
  }
};

export const Dealer = {
  async list() {
    return jget(`${API}/dealers`).catch(() => []);
  }
};
