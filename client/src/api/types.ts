import { Skill } from "../osrs/types";

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

  accountId: string;

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
