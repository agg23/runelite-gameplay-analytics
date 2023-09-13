import { InventoryEvent } from "../api/internal/types";
import { StateSliceCreator } from "./types";

export interface InventoryState {
  selectedEntry: InventoryEvent | undefined;

  setSelectedEntry: (event: InventoryEvent | undefined) => void;
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
