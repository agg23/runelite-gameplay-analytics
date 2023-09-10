import { HTTPGetRoute } from "../api/internal/routes";
import { LootEvent } from "../api/internal/types";
import { FetchState } from "../api/types";
import { StateSliceCreator } from "./types";
import { fetchAPIData } from "./util";

export interface LootState {
  api: FetchState<HTTPGetRoute<"loot">>;

  selectedEntry: LootEvent | undefined;

  requestData: (accountId: string) => Promise<void>;
  setSelectedEntry: (event: LootEvent | undefined) => void;
}

export const createLootSlice: StateSliceCreator<LootState> = (set) => ({
  api: {
    type: "data",
    data: [],
  },

  selectedEntry: undefined,

  requestData: async (accountId: string) => {
    set((existing) => {
      existing.loot.api = {
        ...existing.loot.api,
        type: "loading",
      };

      existing.loot.selectedEntry = undefined;
    });

    const event = await fetchAPIData("loot", accountId);

    set((existing) => {
      existing.loot.api = {
        ...existing.loot.api,
        ...event,
      };
    });
  },
  setSelectedEntry: (event) =>
    set((existing) => {
      existing.loot.selectedEntry = event;
    }),
});
