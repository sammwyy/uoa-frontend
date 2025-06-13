import { loadDevMessages, loadErrorMessages } from "@apollo/client/dev";
import { createRoot } from "react-dom/client";

import App from "./App.tsx";
import "./i18n/i18n";

import "./styles/globals.css";
import "./styles/scrollbar.css";

if (import.meta.env.NODE_ENV === "development") {
  // Adds messages only in a dev environment
  loadDevMessages();
  loadErrorMessages();
}

createRoot(document.getElementById("root")!).render(<App />);
