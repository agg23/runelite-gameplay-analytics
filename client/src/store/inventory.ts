import { StorageAPIEvent } from "../api/internal/types";
import { StateSliceCreator } from "./types";

export interface InventoryState {
  selectedEntry: StorageAPIEvent | undefined;

  setSelectedEntry: (event: StorageAPIEvent | undefined) => void;
}

export const createInventorySlice: StateSliceCreator<InventoryState> = (
  set
) => ({
  selectedEntry: undefined,

  setSelectedEntry: (event) =>
    set((existing) => {
      existing.inventory.selectedEntry = event;
    }),
});
