const API = import.meta.env.VITE_API_URL || "https://api.hagglehub.app";

async function postJson(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body || {})
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed: ${res.status}`);
  }
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : {};
}

export async function invoke(name, data = {}) {
  return postJson(`${API}/functions/${encodeURIComponent(name)}`, data);
}
export async function run(name, data = {})         { return invoke(name, data); }
export async function call(name, data = {})        { return invoke(name, data); }
export async function callFunction(name, data = {}){ return invoke(name, data); }
export async function trigger(name, data = {})     { return invoke(name, data); }

export async function sendReply(dealId, payload = {}) {
  if (!dealId) throw new Error("Missing dealId");
  const { to, subject, body } = payload;
  if (!to) throw new Error("Missing 'to' address");
  if (!body) throw new Error("Missing 'body'");
  return postJson(`${API}/deals/${encodeURIComponent(dealId)}/messages`, { to, subject, body });
}

export default { invoke, run, call, callFunction, trigger, sendReply };
