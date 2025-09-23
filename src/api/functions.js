// src/api/functions.js
// Clean, Base44-free function invoker used by the UI.
// Maps common "serverless function" call styles (invoke/run/callFunction/etc.)
// to your backend endpoint. Adjust the endpoint path if you prefer a different URL.

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
  // If your backend returns no JSON, guard it:
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : {};
}

/**
 * Call a named function on your backend.
 * Back your API with an Express route like:
 *   POST /functions/:name
 *     -> switch (req.params.name) { case 'something': ... }
 */
export async function invoke(name, data = {}) {
  return postJson(`${API}/functions/${encodeURIComponent(name)}`, data);
}

// Aliases to catch various import styles your UI might use:
export async function run(name, data = {})         { return invoke(name, data); }
export async function call(name, data = {})        { return invoke(name, data); }
export async function callFunction(name, data = {}){ return invoke(name, data); }
export async function trigger(name, data = {})     { return invoke(name, data); }

// Default export including all aliases
export default { invoke, run, call, callFunction, trigger };
