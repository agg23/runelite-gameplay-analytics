import { HTTPGetRoute } from "../api/internal/routes";
import { InventoryEvent } from "../api/internal/types";
import { FetchState } from "../api/types";
import { StateSliceCreator } from "./types";
import { fetchAPIData } from "./util";

export interface InventoryState {
  api: FetchState<HTTPGetRoute<"inventory">>;

  selectedEntry: InventoryEvent | undefined;

  requestData: (accountId: string) => Promise<void>;
  setSelectedEntry: (event: InventoryEvent | undefined) => void;
}

export const createInventorySlice: StateSliceCreator<InventoryState> = (
  set
) => ({
  api: {
    type: "data",
    data: [],
  },

  selectedEntry: undefined,

  requestData: async (accountId: string) => {
    set((existing) => {
      existing.inventory.api = {
        ...existing.inventory.api,
        type: "loading",
      };

      existing.loot.selectedEntry = undefined;
    });

    // Inventory is storage type 0
    const event = await fetchAPIData("inventory", `${accountId}/0`);

    set((existing) => {
      existing.inventory.api = {
        ...existing.inventory.api,
        ...event,
      };
    });
  },
  setSelectedEntry: (event) =>
    set((existing) => {
      existing.inventory.selectedEntry = event;
    }),
});
