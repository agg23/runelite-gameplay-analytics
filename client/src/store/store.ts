import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import {
  Account,
  FetchState,
  HTTPRoute,
  RouteName,
  XPEvent,
} from "../api/types";
import { getRoute } from "../api/rest";

interface State {
  activeAccount:
    | {
        username: string;
        id: string;
      }
    | undefined;
  api: {
    accounts: FetchState<Array<Account>>;
    xp: FetchState<Array<XPEvent>>;
  };
}

interface Actions {
  api: {
    accounts: {
      requestData: () => Promise<void>;
    };
    xp: {
      requestData: () => Promise<void>;
      insertUpdate: (data: XPEvent) => void;
    };
  };
  setActiveAccount: (account: Account) => void;
}

export const useStore = create(
  immer<State & Actions>((set, get) => ({
    activeAccount: undefined,
    api: {
      accounts: {
        type: "data",
        data: [],
        requestData: async () => {
          set((existing) => {
            existing.api.accounts = {
              ...existing.api.accounts,
              type: "loading",
            };
          });

          const event = await fetchData("accounts");

          set((existing) => {
            existing.api.accounts = {
              ...existing.api.accounts,
              ...event,
            };

            if (event.type === "data" && event.data.length > 0) {
              existing.activeAccount = event.data[0];
            }
          });
        },
      },
      xp: {
        type: "data",
        data: [],
        requestData: async () => {
          const account = get().activeAccount;

          if (!account) {
            return;
          }

          set((existing) => {
            existing.api.xp = {
              ...existing.api.xp,
              type: "loading",
            };
          });

          const event = await fetchData("xp", account.id);

          set((existing) => {
            existing.api.xp = {
              ...existing.api.xp,
              ...event,
            };
          });
        },
        insertUpdate: (data: XPEvent) =>
          set((existing) => {
            if (existing.api.xp.type === "error") {
              return;
            }

            const existingData =
              existing.api.xp.type === "data" ? existing.api.xp.data : [];

            // Make sure we insert this data into the correct location
            const index = sortedIndex(
              existingData,
              data.timestamp,
              (event) => event.timestamp
            );

            existingData.splice(index, 0, data);

            existing.api.xp = {
              ...existing.api.xp,
              type: "data",
              data: existingData,
            };
          }),
      },
    },
    setActiveAccount: (account) => {
      set((existing) => {
        existing.activeAccount = account;
      });
    },
  }))
);

const fetchData = async <T extends RouteName>(
  route: T,
  additionalPath?: string
): Promise<FetchState<HTTPRoute<T>>> => {
  try {
    const data = await getRoute(route, additionalPath);

    if (data.type === "error") {
      return {
        type: "error",
      };
    }

    return {
      type: "data",
      data: data.data,
    };
  } catch (_) {
    return {
      type: "error",
    };
  }
};

// Taken from https://stackoverflow.com/a/21822316/2108817
const sortedIndex = <TData, TSort>(
  array: Array<TData>,
  value: TSort,
  mapper: (data: TData) => TSort
) => {
  let low = 0;
  let high = array.length;

  while (low < high) {
    const mid = (low + high) >>> 1;

    const midValue = mapper(array[mid]);
    if (midValue < value) {
      low = mid + 1;
    } else high = mid;
  }
  return low;
};
