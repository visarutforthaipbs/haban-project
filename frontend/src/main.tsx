import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { initGA } from "./services/analytics";

// Initialize Google Analytics with your ID
const analyticsId = import.meta.env.VITE_GOOGLE_ANALYTICS_ID;
if (analyticsId) {
  initGA(analyticsId);
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
