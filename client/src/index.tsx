import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { init as syncSettingsInit } from "./api/internal/syncedSettings";
import { open as openWebsocket } from "./api/internal/websocket";
import { gePricesInit } from "./store/geprices";

import "leaflet/dist/leaflet.css";
import "./index.css";

syncSettingsInit();
gePricesInit();
openWebsocket();

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(<App />);
