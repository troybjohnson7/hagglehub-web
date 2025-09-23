// src/api/functions.js
// Clean, Base44-free helpers used by the UI.

const API = import.meta.env.VITE_API_URL || "https://api.hagglehub.app";

async function postJson(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body || {}),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed: ${res.status}`);
  }
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : {};
}

/**
 * Generic function invoker (if you later expose POST /functions/:name)
 */
export async function invoke(name, data = {}) {
  return postJson(`${API}/functions/${encodeURIComponent(name)}`, data);
}
export async function run(name, data = {})         { return invoke(name, data); }
export async function call(name, data = {})        { return invoke(name, data); }
export async function callFunction(name, data = {}){ return invoke(name, data); }
export async function trigger(name, data = {})     { return invoke(name, data); }

/**
 * sendReply — used by Messages.jsx to send an email reply inside a deal thread.
 * Calls your backend route: POST /deals/:dealId/messages
 * payload shape expected by backend: { to, subject, body }
 */
export async function sendReply(dealId, payload = {}) {
  if (!dealId) throw new Error("Missing dealId");
  const { to, subject, body } = payload;
  if (!to) throw new Error("Missing 'to' address");
  if (!body) throw new Error("Missing 'body'");
  // Subject is optional; backend will prefix if needed.
  return postJson(`${API}/deals/${encodeURIComponent(dealId)}/messages`, {
    to,
    subject,
    body,
  });
}

// Default export includes the generic helpers; named export provides sendReply.
export default { invoke, run, call, callFunction, trigger, sendReply };
