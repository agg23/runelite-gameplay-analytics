import { HTTPGetRoute } from "../api/internal/routes";
import { ActivityEvent } from "../api/internal/types";
import { FetchState } from "../api/types";
import { StateSliceCreator } from "./types";
import { fetchAPIData } from "./util";

export interface ActivityState {
  api: FetchState<HTTPGetRoute<"activity">>;

  selectedEntry: ActivityEvent | undefined;

  requestData: (accountId: string) => Promise<void>;
  setSelectedEntry: (event: ActivityEvent | undefined) => void;
}

export const createActivitySlice: StateSliceCreator<ActivityState> = (set) => ({
  api: {
    type: "data",
    data: [],
  },

  selectedEntry: undefined,

  requestData: async (accountId: string) => {
    set((existing) => {
      existing.activity.api = {
        ...existing.activity.api,
        type: "loading",
      };

      existing.activity.selectedEntry = undefined;
    });

    const event = await fetchAPIData("activity", accountId);

    set((existing) => {
      existing.activity.api = {
        ...existing.activity.api,
        ...event,
      };
    });
  },
  setSelectedEntry: (event) =>
    set((existing) => {
      existing.activity.selectedEntry = event;
    }),
});
