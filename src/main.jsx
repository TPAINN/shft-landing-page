import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import App from "./App.jsx";
import "./styles.css";
import "./overrides.css";

// The render-blocking entry must commit before the browser captures an incoming
// document-transition frame; an asynchronously scheduled empty root flashes.
flushSync(() => createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
));
