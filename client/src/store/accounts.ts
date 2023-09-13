import { StateSliceCreator } from "./types";
import { Account } from "../api/internal/types";

export interface AccountsState {
  activeId: string | undefined;

  setActiveAccount: (id: string) => void;
  selectDefaultActiveAccount: (apiAccounts: Account[] | undefined) => void;
}

export const createAccountsSlice: StateSliceCreator<AccountsState> = (set) => ({
  activeId: undefined,
  api: {
    type: "data",
    data: [],
  },

  setActiveAccount: (accountId) =>
    set((existing) => {
      existing.accounts.activeId = accountId;
    }),

  selectDefaultActiveAccount: (apiAccounts) => {
    // Called by both accounts data retrieval and settings loaded to switch to the active account
    set((existing) => {
      if (existing.accounts.activeId) {
        return;
      }

      if (!apiAccounts || apiAccounts.length < 1) {
        return;
      }

      existing.accounts.activeId = apiAccounts[0].id;
    });
  },
});
