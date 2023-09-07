import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { App } from "./App";
import { init as syncSettingsInit } from "./api/syncedSettings";
import { open as openWebsocket } from "./api/websocket";

syncSettingsInit();
openWebsocket();

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(<App />);
