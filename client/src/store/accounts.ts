import { Account, FetchState } from "../api/types";
import { fetchData } from "./util";
import { StateSliceCreator } from "./types";

export interface AccountsState {
  activeId: string | undefined;
  api: FetchState<Array<Account>>;

  setActiveAccount: (id: string) => void;
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
  requestData: async () => {
    set((existing) => {
      existing.accounts.api = {
        ...existing.accounts.api,
        type: "loading",
      };
    });

    const event = await fetchData("accounts");

    set((existing) => {
      existing.accounts.api = {
        ...existing.accounts.api,
        ...event,
      };

      if (event.type === "data" && event.data.length > 0) {
        const useExistingAccount =
          existing.accounts.activeId &&
          !!event.data.find(
            (account) => account.id === existing.accounts.activeId
          );

        if (!useExistingAccount) {
          existing.accounts.activeId = event.data[0].id;
        }
      }
    });
  },
});
