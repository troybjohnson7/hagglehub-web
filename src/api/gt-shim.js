// Global compatibility shim for legacy Base44-style gateway 'gt'
import api from "@/api";

const KEY = "hh_local_db_v1";
function load(){ try{ return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; } }
function save(db){ localStorage.setItem(KEY, JSON.stringify(db)); }

const base = {
  // Minimal surfaces used by onboarding / profile flows
  async updateMyUserData(patch = {}) {
    const db = load();
    db.user = { ...(db.user || (await api.User.me()) || { id: "local-admin", email: "admin@hagglehub.app" }), ...patch };
    save(db);
    return { ok: true, user: db.user };
  },
  async getMyUserData() {
    const u = (load().user) || (await api.User.me());
    return { ok: true, user: u };
  },
  async signOut() {
    // Frontend local sign-out only
    const db = load(); db.user = null; save(db);
    return { ok: true };
  },
  async sendEmail(args) {
    return api.SendEmail(args);
  }
};

// Proxy returns no-op async function for any unknown member to prevent TypeErrors
const gt = new Proxy(base, {
  get(target, prop) {
    if (prop in target) return target[prop];
    return (..._args) => Promise.resolve({ ok: true, noop: String(prop) });
  }
});

// Expose for legacy callers and debugging
if (typeof window !== "undefined") {
  window.gt = gt;
  window.__HH_API__ = api;
}

export default gt;
