export const API_BASE: string = import.meta.env.VITE_API_URL as string;
export async function postJSON(path: string, payload: any) {
  if (!API_BASE) throw new Error("VITE_API_URL not set");
  const res = await fetch(`${API_BASE}${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload), credentials: "include" });
  const data = await res.json().catch(() => ({} as any));
  if (!res.ok || (data && data.ok === false)) throw new Error((data && data.error) || `HTTP ${res.status}`);
  return data;
}
export async function getJSON(path: string) {
  if (!API_BASE) throw new Error("VITE_API_URL not set");
  const res = await fetch(`${API_BASE}${path}`, { method: "GET", credentials: "include" });
  const data = await res.json().catch(() => ({} as any));
  if (!res.ok || (data && data.ok === false)) throw new Error((data && data.error) || `HTTP ${res.status}`);
  return data;
}
