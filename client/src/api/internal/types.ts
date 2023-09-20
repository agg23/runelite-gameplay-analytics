import { Skill } from "../../osrs/types";

export interface SyncedSettings {
  activeAccountId: string | undefined;
  darkTheme: boolean;
  xp: {
    selectedSkills:
      | {
          type: "totals";
          set: Skill[];
        }
      | {
          type: "set";
          set: Skill[];
        };
    displayDeltas: boolean;
  };
}

export interface Account {
  id: string;
  username: string;
}

// Activity

export interface ActivityEvent {
  accountID: string;

  startTimestamp: number;
  endTimestamp: number;
}

// Grand Exchange

export interface GEEvent {
  accountId: string;

  firstSeenTimestamp: number;
  completedTimestamp: number | null;

  itemId: number;
  totalQuantity: number;

  pricePerItem: number;

  slot: number;

  buy: boolean;
  cancelled: boolean;

  worldType: 0 | 1 | 2 | 3 | 4;

  entries: GEEventEntry[];
}

export interface GEEventEntry {
  timestamp: number;

  completedQuantity: number;

  transferredGp: number;

  isCancelled: boolean;
}

// Loot

export interface LootEvent {
  accountId: string;

  timestamp: number;

  type: 0;

  npcId: number;
  combatLevel: number;

  entries: LootEntry[];
}

export interface LootEntry {
  itemId: number;
  quantity: number;
  gePerItem: number;
}

// Map

export interface MapEvent {
  accountId: number;

  timestamp: number;

  region: number;
  x: number;
  y: number;
}

// Storage

// Renamed because it conflicts with DOM API type and TS keeps overriding it
export interface StorageAPIEvent {
  id: number;
  accountId: string;

  timestamp: number;

  type: 0 | 1;

  entries: StorageEntry[];
}

export interface StorageEntry {
  itemId: number;
  slot: number;
  quantity: number;
  gePerItem: number;
}

// XP

export interface XPEvent {
  accountId: string;

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

export const newXPEvent = (
  timestamp: number,
  accountId: string,
  fromEvent: XPEvent | undefined = undefined
): XPEvent => ({
  timestamp,
  accountId,
  type: 0,

  changedSkills: 0,

  xpTotal: fromEvent?.xpTotal ?? 0,

  attack: fromEvent?.attack ?? 0,
  strength: fromEvent?.strength ?? 0,
  defence: fromEvent?.defence ?? 0,
  ranged: fromEvent?.ranged ?? 0,
  prayer: fromEvent?.prayer ?? 0,
  magic: fromEvent?.magic ?? 0,
  runecraft: fromEvent?.runecraft ?? 0,
  hitpoints: fromEvent?.hitpoints ?? 0,
  crafting: fromEvent?.crafting ?? 0,
  mining: fromEvent?.mining ?? 0,
  smithing: fromEvent?.smithing ?? 0,
  fishing: fromEvent?.fishing ?? 0,
  cooking: fromEvent?.cooking ?? 0,
  firemaking: fromEvent?.firemaking ?? 0,
  woodcutting: fromEvent?.woodcutting ?? 0,

  // Members
  agility: fromEvent?.agility ?? 0,
  herblore: fromEvent?.herblore ?? 0,
  thieving: fromEvent?.thieving ?? 0,
  fletching: fromEvent?.fletching ?? 0,
  slayer: fromEvent?.slayer ?? 0,
  farming: fromEvent?.farming ?? 0,
  construction: fromEvent?.construction ?? 0,
  hunter: fromEvent?.hunter ?? 0,
});
