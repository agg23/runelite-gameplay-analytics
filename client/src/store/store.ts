import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { enableMapSet } from "immer";

import { SyncedSettings } from "../api/internal/types";
import { AccountsState, createAccountsSlice } from "./accounts";
import { XPState, createXPSlice } from "./xp";
import { SettingsState, createSettingsSlice } from "./settings";
import { LootState, createLootSlice } from "./loot";
import { InventoryState, createInventorySlice } from "./inventory";
import { ActivityState, createActivitySlice } from "./activity";
import { SharedState, createSharedSlice } from "./shared";

export type Store = {
  accounts: AccountsState;
  activity: ActivityState;
  inventory: InventoryState;
  loot: LootState;
  xp: XPState;
  settings: SettingsState;

  shared: SharedState;

  loadSettings: (settings: SyncedSettings) => void;
};

enableMapSet();

export const useStore = create(
  subscribeWithSelector(
    immer<Store>((...args) => {
      const [set] = args;

      return {
        // TODO: Add network status slice
        accounts: createAccountsSlice(...args),
        activity: createActivitySlice(...args),
        inventory: createInventorySlice(...args),
        loot: createLootSlice(...args),
        settings: createSettingsSlice(...args),
        shared: createSharedSlice(...args),
        xp: createXPSlice(...args),

        loadSettings: (settings) =>
          set((existing) => {
            existing.settings.darkTheme = settings.darkTheme;

            existing.accounts.activeId = settings.activeAccountId;

            existing.xp.displayDeltas = settings.xp.displayDeltas;
            existing.xp.selectedSkills = {
              type: "set",
              set: new Set(settings.xp.selectedSkills),
            };
          }),
      };
    })
  )
);
