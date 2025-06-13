import { loadDevMessages, loadErrorMessages } from "@apollo/client/dev";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.tsx";

import "./styles/globals.css";

if (import.meta.env.NODE_ENV === "development") {
  // Adds messages only in a dev environment
  loadDevMessages();
  loadErrorMessages();
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
