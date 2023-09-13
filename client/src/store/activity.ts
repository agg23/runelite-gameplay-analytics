import { ActivityEvent } from "../api/internal/types";
import { StateSliceCreator } from "./types";

export interface ActivityState {
  selectedEntry: ActivityEvent | undefined;

  setSelectedEntry: (event: ActivityEvent | undefined) => void;
}

export const createActivitySlice: StateSliceCreator<ActivityState> = (set) => ({
  selectedEntry: undefined,

  setSelectedEntry: (event) =>
    set((existing) => {
      existing.activity.selectedEntry = event;
    }),
});
