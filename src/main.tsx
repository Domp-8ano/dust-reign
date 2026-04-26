import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

const root = document.getElementById("root")!;

// React fully owns #root — no HTML loading screen needed
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);