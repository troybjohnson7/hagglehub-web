const API = import.meta.env.VITE_API_URL || 'https://api.hagglehub.app'

// tiny helpers
async function jget(url){
  const r = await fetch(url)
  if(!r.ok) throw new Error(await r.text())
  return r.json()
}
async function jpost(url, body){
  const r = await fetch(url, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: body? JSON.stringify(body): undefined
  })
  if(!r.ok) throw new Error(await r.text())
  return r.json()
}

// API surface used by the pages
export const Users = {
  me(){ return jget(`${API}/users/me`) },
}

export const Inbox = {
  listUnmatched(userKey){ return jget(`${API}/inbox/unmatched?userKey=${encodeURIComponent(userKey)}`) },
  attach(msgId, dealId){ return jpost(`${API}/inbox/${msgId}/attach`, { dealId:Number(dealId) }) },
  createDeal(msgId){ return jpost(`${API}/inbox/${msgId}/createDeal`) },
}

export const Deals = {
  list(){ return jget(`${API}/deals`) },
  get(id){ return jget(`${API}/deals/${id}`) },
  create(payload){ return jpost(`${API}/deals`, payload) },
  messages(id){ return jget(`${API}/deals/${id}/messages`) },
  send(id, {to, subject, body}){ return jpost(`${API}/deals/${id}/messages`, {channel:'email', to, subject, body}) },
}

export const Dealers = {
  list(){ return jget(`${API}/dealers`) },
  create(payload){ return jpost(`${API}/dealers`, payload) }
}
