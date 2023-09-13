import { StateSliceCreator } from "./types";

export interface SharedState {
  timespan:
    | {
        start: number;
        end: number;
      }
    | undefined;

  setSelectedTimespan: (start: number, end: number) => void;
}

export const createSharedSlice: StateSliceCreator<SharedState> = (set) => ({
  timespan: undefined,

  setSelectedTimespan: (start, end) =>
    set((existing) => {
      existing.shared.timespan = {
        start,
        end,
      };
    }),
});
