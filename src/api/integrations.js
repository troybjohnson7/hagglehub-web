const API = import.meta.env.VITE_API_URL || "https://api.hagglehub.app";

export async function InvokeLLM({ prompt = "", system = "", data = {} } = {}) {
  try {
    return {
      text: "Insights coming soon. (LLM not wired yet.)",
      summary: "Stubbed response.",
      insights: [],
      meta: { promptLength: prompt?.length || 0 }
    };
  } catch (err) {
    console.warn("InvokeLLM stub error:", err);
    return { text: "LLM unavailable.", summary: "", insights: [], meta: { error: String(err?.message || err) } };
  }
}

export async function sendTransactionalEmail(payload = {}) {
  try {
    console.info("sendTransactionalEmail (stub):", payload);
    return { ok: true, stub: true };
  } catch (err) {
    return { ok: false, error: String(err?.message || err) };
  }
}

export function trackEvent(name, props = {}) {
  try { console.info("trackEvent (stub):", { name, props }); } catch {}
}

export async function uploadPublic(file) {
  if (!file) return null;
  return URL.createObjectURL(file);
}
