import {
  Account,
  ActivityEvent,
  InventoryEvent,
  LootEvent,
  MapEvent,
  SyncedSettings,
  XPEvent,
} from "./types";

interface GetRoutes {
  accounts: {
    http: Account[];
    ws: void;
  };
  activity: {
    http: ActivityEvent[];
    ws: void;
  };
  inventory: {
    http: InventoryEvent[];
    ws: void;
  };
  loot: {
    http: LootEvent[];
    ws: void;
  };
  map: {
    http: MapEvent[];
    ws: void;
  };
  storage: {
    http: StorageEvent[];
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

export const alternateRoutePaths: {
  [key in keyof GetRoutes]?: string;
} = {
  inventory: "storage",
};

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
// const websocketRouteNames = exhaustiveStringTuple<ValidWSRouteName>()("xp");

export type WSRouteHandlers = {
  [Key in ValidWSRouteName]: (newData: WSRoute<Key>) => void;
};

export interface WSSuccess<T extends ValidWSRouteName> {
  route: T;
  data: WSRoute<T>;
}
