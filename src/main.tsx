import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import { AppErrorBoundary } from "./components/SentryErrorBoundary";
import { initSentry } from "./config/sentry";
import "./index.css";

// Initialize Sentry before rendering
initSentry();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AppErrorBoundary>
  </StrictMode>
);