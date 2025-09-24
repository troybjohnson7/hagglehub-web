const KEY = "hh_local_db_v1";
function load(){ try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; } }
function save(db){ localStorage.setItem(KEY, JSON.stringify(db)); }
function ensure(){
  const db = load();
  if (!db.user) db.user = { id: "local-admin", email: "admin@hagglehub.app", name: "Haggle Admin", isAdmin: true };
  if (!db.deals) db.deals = [];
  if (!db.dealers) db.dealers = [];
  if (!db.vehicles) db.vehicles = [];
  if (!db.messages) db.messages = [];
  if (!db.market) db.market = [];
  save(db);
  return db;
}
export const Local = {
  get user(){ return ensure().user; },
  setUser(u){ const db = ensure(); db.user = u; save(db); return u; },
  logout(){ const db = ensure(); db.user = null; save(db); },
  table(name){
    const db = ensure();
    if (!db[name]) db[name] = [];
    return {
      list: async () => ensure()[name],
      create: async (row) => { const rec = { id: `${name.slice(0,1)}_${Date.now()}`, ...row, ts: Date.now() }; const db2 = ensure(); db2[name].unshift(rec); save(db2); return rec; },
      get: async (id) => ensure()[name].find(r => r.id === id),
      filter: async (pred) => { const keys = Object.keys(pred||{}); return ensure()[name].filter(r => keys.every(k => r[k] === pred[k])); }
    };
  }
};
