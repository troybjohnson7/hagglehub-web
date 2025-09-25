type Row = Record<string, any>;
type Table = Row[];
type DB = { user: Row | null; deals: Table; dealers: Table; vehicles: Table; messages: Table; market: Table; };
const KEY = "hh_local_db_v1";
const seed: DB = { user: { id: "local-admin", email: "admin@hagglehub.app", name: "Haggle Admin", isAdmin: true }, deals: [], dealers: [], vehicles: [], messages: [], market: [] };
function load(): DB { try { return JSON.parse(localStorage.getItem(KEY) || "") as DB; } catch { return { ...seed }; } }
function save(db: DB) { localStorage.setItem(KEY, JSON.stringify(db)); }
function dbm(): DB { const db = load(); if (!db.user) db.user = seed.user; save(db); return db; }
export const localDB = {
  getUser() { return dbm().user; },
  login(email: string, code: string) { const gate = import.meta.env.VITE_DEV_ADMIN_CODE || ""; if (gate && code !== gate) throw new Error("Invalid admin code"); const db = dbm(); db.user = { id: "local-admin", email, name: "Haggle Admin", isAdmin: true }; save(db); return db.user; },
  logout() { const db = dbm(); db.user = null; save(db); },
  Deal: { async list(){return dbm().deals;}, async create(row: Row){const db=dbm(); const id="d_"+Date.now(); const rec={id,...row}; db.deals.unshift(rec); save(db); return rec;}, async get(id: string){return dbm().deals.find(d=>d.id===id);} },
  Dealer: { async list(){return dbm().dealers;}, async create(row: Row){const db=dbm(); const id="dr_"+Date.now(); const rec={id,...row}; db.dealers.unshift(rec); save(db); return rec;} },
  Vehicle:{ async list(){return dbm().vehicles;}, async create(row: Row){const db=dbm(); const id="v_"+Date.now(); const rec={id,...row}; db.vehicles.unshift(rec); save(db); return rec;} },
  Message:{ async list(){return dbm().messages;}, async filter(pred: Row){const keys=Object.keys(pred||{}); return dbm().messages.filter(m=>keys.every(k=>m[k]===pred[k]));}, async create(row: Row){const db=dbm(); const id="m_"+Date.now(); const rec={id,ts:Date.now(),...row}; db.messages.unshift(rec); save(db); return rec;} },
  MarketData:{ async list(){return dbm().market;}, async create(row: Row){const db=dbm(); const id="md_"+Date.now(); const rec={id,...row}; db.market.unshift(rec); save(db); return rec;} }
};
