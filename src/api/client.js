export const API_BASE = import.meta.env.VITE_API_URL;
export async function postJSON(path, payload) {
  if (!API_BASE) throw new Error("VITE_API_URL not set");
  const res = await fetch(`${API_BASE}${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload), credentials: "include" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || (data && data.ok === false)) throw new Error((data && data.error) || `HTTP ${res.status}`);
  return data;
}
export async function getJSON(path) {
  if (!API_BASE) throw new Error("VITE_API_URL not set");
  const res = await fetch(`${API_BASE}${path}`, { method: "GET", credentials: "include" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || (data && data.ok === false)) throw new Error((data && data.error) || `HTTP ${res.status}`);
  return data;
}
