import { Skill } from "../osrs/types";

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

export type HTTPGetRoute<T extends GetRouteName> = GetRoutes[T]["http"];
export type WSRoute<T extends GetRouteName> = GetRoutes[T]["ws"];

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

export type FetchState<T> =
  | {
      type: "loading";
    }
  | {
      type: "data";
      data: T;
    }
  | {
      type: "error";
    };

export interface SyncedSettings {
  activeAccountId: string | undefined;
  darkTheme: boolean;
  xp: {
    selectedSkills: Skill[];
    displayDeltas: boolean;
  };
}

export interface Account {
  id: string;
  username: string;
}

export interface XPEvent {
  timestamp: number;

  type: 0 | 1;

  changedSkills: number;

  xpTotal: number;

  attack: number;
  strength: number;
  defence: number;
  ranged: number;
  prayer: number;
  magic: number;
  runecraft: number;
  hitpoints: number;
  crafting: number;
  mining: number;
  smithing: number;
  fishing: number;
  cooking: number;
  firemaking: number;
  woodcutting: number;

  // Members
  agility: number;
  herblore: number;
  thieving: number;
  fletching: number;
  slayer: number;
  farming: number;
  construction: number;
  hunter: number;
}
