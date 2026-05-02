import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// effect atom registry provider
import { RegistryProvider } from "@effect-atom/atom-react";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RegistryProvider>
      <App />
    </RegistryProvider>
  </React.StrictMode>,
);
