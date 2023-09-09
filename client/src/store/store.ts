import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { enableMapSet } from "immer";

import { SyncedSettings } from "../api/types";
import { AccountsState, createAccountsSlice } from "./accounts";
import { XPState, createXPSlice } from "./xp";
import { SettingsState, createSettingsSlice } from "./settings";

interface StateExtraActions {
  loadSettings: (settings: SyncedSettings) => void;
}

export type Store = StateExtraActions & {
  accounts: AccountsState;
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
