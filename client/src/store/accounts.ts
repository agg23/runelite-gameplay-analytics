import { FetchState } from "../api/types";
import { fetchAPIData } from "./util";
import { StateSliceCreator } from "./types";
import { Account } from "../api/internal/types";

export interface AccountsState {
  activeId: string | undefined;
  api: FetchState<Array<Account>>;

  setActiveAccount: (id: string) => void;
  selectDefaultActiveAccount: () => void;
  requestData: () => Promise<void>;
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

  selectDefaultActiveAccount: () => {
    // Called by both accounts data retrieval and settings loaded to switch to the active account
    set((existing) => {
      if (existing.accounts.activeId) {
        return;
      }

      if (
        existing.accounts.api.type !== "data" ||
        existing.accounts.api.data.length < 1
      ) {
        return;
      }

      existing.accounts.activeId = existing.accounts.api.data[0].id;
    });
  },

  requestData: async () => {
    set((existing) => {
      existing.accounts.api = {
        ...existing.accounts.api,
        type: "loading",
      };
    });

    const event = await fetchAPIData("accounts");

    set((existing) => {
      existing.accounts.api = {
        ...existing.accounts.api,
        ...event,
      };

      existing.accounts.selectDefaultActiveAccount();
    });
  },
});
