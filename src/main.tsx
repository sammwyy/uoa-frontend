import { scan } from "react-scan";

import { loadDevMessages, loadErrorMessages } from "@apollo/client/dev";
import { createRoot } from "react-dom/client";

import App from "./App.tsx";
import "./i18n/i18n";

import "./styles/globals.css";
import "./styles/scrollbar.css";

const isDEV = import.meta.env.VITE_NODE_ENV === "development";

if (isDEV) {
  // Adds messages only in a dev environment
  loadDevMessages();
  loadErrorMessages();

  // Enable react-scan (Profiling)
  scan({
    enabled: true,
  });
}

createRoot(document.getElementById("root")!).render(<App />);
