import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import { FetchState, XPEvent } from "../api/types";
import { getRoute } from "../api/rest";

interface State {
  api: {
    xp: FetchState<Array<XPEvent>>;
  };
}

interface Actions {
  api: {
    xp: {
      requestData: () => Promise<void>;
      insertUpdate: (data: XPEvent) => void;
    };
  };
}

export const useStore = create(
  immer<State & Actions>((set) => ({
    api: {
      xp: {
        type: "data",
        data: [],
        requestData: async () => {
          set((existing) => {
            existing.api.xp = {
              ...existing.api.xp,
              type: "loading",
            };
          });

          let event: FetchState<Array<XPEvent>>;

          try {
            const data = await getRoute("xp");

            event = {
              type: "data",
              data,
            };
          } catch (_) {
            event = {
              type: "error",
            };
          }

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
  }))
);

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
