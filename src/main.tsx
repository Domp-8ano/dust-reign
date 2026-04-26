import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
// Force dark background immediately before React mounts
document.documentElement.style.background = "#080603";
document.body.style.background = "#080603";
document.body.style.margin = "0";
document.body.style.padding = "0";
const rootEl = document.getElementById("root");
if (!rootEl) {
  document.body.innerHTML =
    '<div style="color:#f2b84b;background:#080603;min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:sans-serif;font-size:2rem;font-weight:900;">ROOT NOT FOUND</div>';
} else {
  try {
    createRoot(rootEl).render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  } catch (err) {
    rootEl.innerHTML = `<div style="color:#f2b84b;background:#080603;min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:sans-serif;padding:2rem;">
      <div>
        <h1 style="margin:0;color:#ff4c38;">React Mount Error</h1>
        <pre style="color:#ffd27a;margin-top:1rem;white-space:pre-wrap;">${String(err)}</pre>
      </div>
    </div>`;
  }
}