import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { init as syncSettingsInit } from "./api/internal/syncedSettings";
import { open as openWebsocket } from "./api/internal/websocket";

import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "leaflet/dist/leaflet.css";
import "./index.css";

syncSettingsInit();
openWebsocket();

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(<App />);
