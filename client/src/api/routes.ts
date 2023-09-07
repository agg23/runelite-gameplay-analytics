import { exhaustiveStringTuple } from "../types/util";
import { Account, SyncedSettings, XPEvent } from "./types";

interface GetRoutes {
  accounts: {
    http: Account[];
    ws: void;
  };
  xp: {
    http: XPEvent[];
    ws: XPEvent;
  };
  settings: {
    http: SyncedSettings;
    ws: void;
  };
}

interface PostRoutes {
  settings: {
    request: SyncedSettings;
    response: HTTPSuccess<undefined>;
  };
}

export type GetRouteName = keyof GetRoutes;
export type PostRouteName = keyof PostRoutes;

// HTTP

export type HTTPGetRoute<T extends GetRouteName> = GetRoutes[T]["http"];

export type HTTPPostRequestRoute<T extends PostRouteName> =
  PostRoutes[T]["request"];
export type HTTPPostResponseRoute<T extends PostRouteName> =
  PostRoutes[T]["response"];

export interface HTTPSuccess<T> {
  type: "success";
  data: T;
}

export interface HTTPError {
  type: "error";
  message: string;
}

export type HTTPGetRouteResponse<T extends GetRouteName> =
  | HTTPSuccess<HTTPGetRoute<T>>
  | HTTPError;

// Websocket

export type WSRoute<T extends GetRouteName> = GetRoutes[T]["ws"];

export type ValidWSRouteName = {
  [Key in keyof GetRoutes]: WSRoute<Key> extends void ? never : Key;
}[keyof GetRoutes];

// export const websocketRouteNames: Array<WSRouteName<GetRouteName>> = [];
const websocketRouteNames = exhaustiveStringTuple<ValidWSRouteName>()("xp");

export type WSRouteHandlers = {
  [Key in ValidWSRouteName]: (newData: WSRoute<Key>) => void;
};

export interface WSSuccess<T extends ValidWSRouteName> {
  route: T;
  data: WSRoute<T>;
}
