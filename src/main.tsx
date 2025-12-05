import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import { AppErrorBoundary } from "./components/SentryErrorBoundary";
import { initSentry } from "./config/sentry";
import { posthogService } from "./services/posthog";
import "./index.css";

// Initialize Sentry before rendering
initSentry();

// Initialize PostHog before rendering (ensures it's ready when first events fire)
posthogService.init();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AppErrorBoundary>
  </StrictMode>
);