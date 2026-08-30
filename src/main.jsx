import React from "react";
import ReactDOM from "react-dom/client";
import { installStoragePolyfill } from "./storagePolyfill.js";
import App from "./App.jsx";
import "./index.css";

// Must run before App.jsx (which calls window.storage.get/set) ever mounts.
installStoragePolyfill();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
