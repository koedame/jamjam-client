// Must be first: logging is in place before any other module runs.
import "./lib/installLogging";

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import Catalog from "./Catalog";

// Import i18n (must be imported before App)
import "./i18n";

// Import brand fonts (must be imported before tokens.css uses them)
import "@fontsource/inter/400.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/roboto-mono/400.css";
import "@fontsource/roboto-mono/700.css";

// Import design tokens
import "./styles/tokens.css";

// Check if catalog mode is enabled via environment variable
const isCatalogMode = import.meta.env.VITE_CATALOG_MODE === "true";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {isCatalogMode ? <Catalog /> : <App />}
  </React.StrictMode>
);
