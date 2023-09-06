interface Routes {
  xp: {
    http: XPEvent[];
    ws: XPEvent;
  };
}

export type RouteName = keyof Routes;

export type HTTPRoute<T extends RouteName> = Routes[T]["http"];
export type WSRoute<T extends RouteName> = Routes[T]["ws"];

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
