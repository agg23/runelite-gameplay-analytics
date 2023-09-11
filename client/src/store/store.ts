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
import { GEPricesState, createGEPricesSlice } from "./geprices";
import { ActivityState, createActivitySlice } from "./activity";

interface StateExtraActions {
  loadSettings: (settings: SyncedSettings) => void;
}

export type Store = StateExtraActions & {
  accounts: AccountsState;
  activity: ActivityState;
  geprices: GEPricesState;
  inventory: InventoryState;
  loot: LootState;
  xp: XPState;
  settings: SettingsState;
};

enableMapSet();

export const useStore = create(
  subscribeWithSelector(
    immer<Store>((...args) => {
      const [set] = args;

      return {
        accounts: createAccountsSlice(...args),
        activity: createActivitySlice(...args),
        geprices: createGEPricesSlice(...args),
        inventory: createInventorySlice(...args),
        loot: createLootSlice(...args),
        xp: createXPSlice(...args),
        settings: createSettingsSlice(...args),

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
