import { Skill } from "../../osrs/types";

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

// Activity

export interface ActivityEvent {
  accountID: string;

  startTimestamp: number;
  endTimestamp: number;
}

// Inventory

export interface InventoryEvent {
  id: number;
  accountId: string;

  timestamp: number;

  type: number;

  entries: InventoryEntry[];
}

export interface InventoryEntry {
  itemId: number;
  slot: number;
  quantity: number;
  gePerItem: number;
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

// Storage

export interface StorageEvent {
  accountId: string;

  timestamp: number;

  type: 0;

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
