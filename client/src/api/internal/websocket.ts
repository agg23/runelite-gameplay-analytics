import { useStore } from "../../store/store";
import { HOSTNAME } from "./config";
import { ValidWSRouteName, WSRouteHandlers, WSSuccess } from "./routes";

// const connections: WSRouteHandlers = {
//   xp: useStore.getState().xp.insertUpdate,
// };

export const open = () => {
  const websocket = new WebSocket(`ws://${HOSTNAME}/api/ws`);

  websocket.addEventListener("message", (event: MessageEvent<string>) => {
    const data: WSSuccess<ValidWSRouteName> = JSON.parse(event.data);

    // const handler = connections[data.route];

    // if (!handler) {
    //   console.error(`Received unknown message of route ${data.route}`);
    //   return;
    // }

    // handler(data.data);
  });

  websocket.addEventListener("open", () => {
    console.log("Websocket connected");
  });

  websocket.addEventListener("error", () => {
    console.error("Websocket error occurered");
  });

  websocket.addEventListener("close", () => {
    console.log("Websocket closed");
    setTimeout(() => {
      // Attempt reconnect after 5 seconds
      open();
    }, 5000);
  });
};
