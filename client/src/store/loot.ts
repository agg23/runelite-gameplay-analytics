import { LootEvent } from "../api/internal/types";
import { StateSliceCreator } from "./types";

export interface LootState {
  selectedEntry: LootEvent | undefined;

  setSelectedEntry: (event: LootEvent | undefined) => void;
}

export const createLootSlice: StateSliceCreator<LootState> = (set) => ({
  selectedEntry: undefined,

  setSelectedEntry: (event) =>
    set((existing) => {
      existing.loot.selectedEntry = event;
    }),
});
