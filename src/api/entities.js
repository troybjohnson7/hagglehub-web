// Clean compatibility API for HaggleHub backend
const API = import.meta.env.VITE_API_URL || 'https://api.hagglehub.app';

async function jget(url){
  const r = await fetch(url, { credentials:'include' });
  if(!r.ok) throw new Error(await r.text());
  return r.json();
}
async function jpost(url, body){
  const r = await fetch(url, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    credentials:'include',
    body: JSON.stringify(body || {})
  });
  if(!r.ok) throw new Error(await r.text());
  return r.json();
}

// Users
// at top of the file we already set API = import.meta.env.VITE_API_URL || 'https://api.hagglehub.app';

export const User = {
  async me(){
    try{
      const u = await jget(`${API}/users/me`);
      return {
        id: u.id || u.key,
        key: u.key,
        full_name: u.full_name || u.name || 'HaggleHub User',
        email: u.email
      };
    }catch{
      return null; // unauthenticated
    }
  },
  login(){ 
    // send the browser to your backend Google OAuth
    window.location.href = `${API}/auth/google`;
  },
  logout(){ 
    // and log out via backend then come back to app
    window.location.href = `${API}/auth/logout?redirect=${encodeURIComponent(window.location.origin)}`;
  },
};


// Deals
export const Deal = {
  list(){ return jget(`${API}/deals`); },
  get(id){ return jget(`${API}/deals/${id}`); },
  filter(q){ if(q?.id) return this.get(q.id).then(d=>[d]); return Promise.resolve([]); },
  create(payload){ return jpost(`${API}/deals`, payload); },
};

// Dealers
export const Dealer = {
  list(){ return jget(`${API}/dealers`); },
  get(id){ return jget(`${API}/dealers/${id}`); },
  create(payload){ return jpost(`${API}/dealers`, payload); },
};

// Vehicles (optional)
export const Vehicle = {
  async list(){ try { return await jget(`${API}/vehicles`); } catch { return []; } },
  async get(id){ try { return await jget(`${API}/vehicles/${id}`); } catch { return null; } },
};

// Messages
export const Message = {
  list(){ return Promise.resolve([]); },
  filter(q){
    if(q?.deal_id) return jget(`${API}/deals/${q.deal_id}/messages`);
    return Promise.resolve([]);
  },
  listForDeal(dealId){ return jget(`${API}/deals/${dealId}/messages`); },
  create(dealId, data){ return jpost(`${API}/deals/${dealId}/messages`, data); },
};
