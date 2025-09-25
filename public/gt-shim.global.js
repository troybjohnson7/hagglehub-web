// Global GT shim to satisfy legacy onboarding/settings that expect window.gt
(function(){
  if (window.gt && typeof window.gt.updateMyUserData === "function") return;

  function loadDB(){ try { return JSON.parse(localStorage.getItem("hh_local_db_v1") || "{}"); } catch { return {}; } }
  function saveDB(db){ localStorage.setItem("hh_local_db_v1", JSON.stringify(db)); }

  async function meFallback(){
    try { const r = await fetch((window.VITE_API_URL||"https://api.hagglehub.app")+"/users/me", {credentials:"include"}); if (!r.ok) return null; return r.json(); } catch { return null; }
  }

  const apiBase = (window.VITE_API_URL || "https://api.hagglehub.app").replace(/\/$/, "");

  const gt = {
    async updateMyUserData(patch){
      const db = loadDB();
      const current = db.user || (await meFallback()) || { id:"local-admin", email:"admin@hagglehub.app" };
      db.user = Object.assign({}, current, patch || {});
      db.deals = db.deals || [];
      db.dealers = db.dealers || [];
      db.vehicles = db.vehicles || [];
      db.messages = db.messages || [];
      db.market = db.market || [];
      saveDB(db);
      return { ok:true, user: db.user };
    },
    async getMyUserData(){
      const db = loadDB();
      if (db.user) return { ok:true, user: db.user };
      const u = await meFallback();
      if (u){ db.user = u; saveDB(db); return { ok:true, user:u }; }
      return { ok:true, user: null };
    },
    async signOut(){ const db = loadDB(); db.user = null; saveDB(db); return { ok:true }; },
    async sendEmail(args){
      const r = await fetch(apiBase + "/send-email", {method:"POST", headers:{"Content-Type":"application/json"}, credentials:"include", body: JSON.stringify(args||{})});
      const data = await r.json().catch(()=>({}));
      if (!r.ok || data.ok === false) throw new Error(data.error || ("HTTP "+r.status));
      return data;
    }
  };

  // Unknown calls become safe no-ops
  window.gt = new Proxy(gt, {
    get(target, prop){ if (prop in target) return target[prop]; return async function(){ return { ok:true, noop:String(prop) }; }; }
  });

  // Expose for sanity
  window.__HH_GT_LOADED__ = true;
})();
