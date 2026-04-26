import { Component, StrictMode, type ErrorInfo, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

class RuntimeErrorBoundary extends Component<{ children: ReactNode }, { error?: Error }> {
  state: { error?: Error } = {};

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Dust Reign runtime error", error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <main className="app-shell error-screen">
        <section>
          <p className="phase-label">Runtime Error</p>
          <h1>Dust Reign</h1>
          <p>{this.state.error.message}</p>
        </section>
      </main>
    );
  }
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Dust Reign root element was not found.");
}

document.body.classList.add("react-mounted");

createRoot(rootElement).render(
  <StrictMode>
    <RuntimeErrorBoundary>
      <App />
    </RuntimeErrorBoundary>
  </StrictMode>
);