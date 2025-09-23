// src/api/integrations.js
// Clean, Base44-free integration shims used by the UI.
// You can wire these to your backend later; for now they won't crash builds.

const API = import.meta.env.VITE_API_URL || "https://api.hagglehub.app";

/**
 * LLM invocation used by SmartInsights and any AI helpers.
 * If you expose a backend endpoint later (e.g., POST /ai/invoke),
 * just change the fetch() below to call it.
 */
export async function InvokeLLM({ prompt = "", system = "", data = {} } = {}) {
  // Try a backend call if you add one; otherwise return a safe stub.
  try {
    // Example (uncomment when your API is ready):
    // const r = await fetch(`${API}/ai/invoke`, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   credentials: "include",
    //   body: JSON.stringify({ prompt, system, data }),
    // });
    // if (!r.ok) throw new Error(await r.text());
    // return await r.json();

    // Temporary stub so UI renders:
    return {
      text:
        "Insights coming soon. Your HaggleHub build is live while AI integrations are being wired.",
      summary:
        "AI analysis is not enabled on this environment yet.",
      insights: [],
      meta: { promptLength: prompt?.length || 0 },
    };
  } catch (err) {
    console.warn("InvokeLLM stub error:", err);
    return {
      text:
        "We couldn't generate insights right now. Please try again shortly.",
      summary: "",
      insights: [],
      meta: { error: String(err?.message || err) },
    };
  }
}

/**
 * Optional: transactional email via your backend.
 * Keep as a no-op stub until you expose an endpoint (e.g., POST /email/send).
 */
export async function sendTransactionalEmail(payload = {}) {
  try {
    // Example (when ready):
    // const r = await fetch(`${API}/email/send`, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   credentials: "include",
    //   body: JSON.stringify(payload),
    // });
    // if (!r.ok) throw new Error(await r.text());
    // return await r.json();

    console.info("sendTransactionalEmail (stub):", payload);
    return { ok: true, stub: true };
  } catch (err) {
    console.warn("sendTransactionalEmail stub error:", err);
    return { ok: false, error: String(err?.message || err) };
  }
}

/**
 * Optional analytics/event hook.
 */
export function trackEvent(name, props = {}) {
  // Wire to your analytics later; for now just log.
  try {
    // Example: await fetch(`${API}/events/track`, {...})
    console.info("trackEvent (stub):", { name, props });
  } catch {
    /* no-op */
  }
}

/**
 * Optional public upload helper.
 * Replace with your backend/S3 upload when available.
 */
export async function uploadPublic(file) {
  // Placeholder: return a fake URL so callers don't crash.
  if (!file) return null;
  return URL.createObjectURL(file);
}
