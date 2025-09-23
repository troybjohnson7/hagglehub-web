if (typeof window !== 'undefined') {
  const suspicious = ['base44.app', 'base44'];
  const href = String(window.location.href).toLowerCase();
  if (suspicious.some(s => href.includes(s))) {
    // optional: strip tracking querystrings, then continue
  }
  // Prevent any global script from forcing redirect
  const origAssign = window.location.assign.bind(window.location);
  const origReplace = window.location.replace.bind(window.location);
  window.location.assign = (u) => { if (String(u).includes('base44.app')) return; origAssign(u); };
  window.location.replace = (u) => { if (String(u).includes('base44.app')) return; origReplace(u); };
}

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

// Defensive patch to avoid crash from old Base44 code
try {
  if (Object.isFrozen(window.location) || Object.getOwnPropertyDescriptor(window.location, "assign")?.writable === false) {
    // Do nothing — keep browser default
  }
} catch (e) {
  console.warn("Location.assign safeguard:", e);
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
// ...existing imports and ReactDOM.createRoot(...).render(...)
window.__hagglehub_boot?.();

