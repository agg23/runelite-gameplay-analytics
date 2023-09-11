import { XPEvent } from "../api/internal/types";
import { FetchState } from "../api/types";
import { ALL_SKILLS, Skill } from "../osrs/types";
import { LineChartState, StateSliceCreator } from "./types";
import { fetchAPIData, sortedIndex } from "./util";

export interface XPState {
  selectedSkills:
    | {
        type: "all";
      }
    | {
        type: "set";
        set: Set<Skill>;
      };
  displayDeltas: boolean;

  chart: LineChartState;

  api: FetchState<Array<XPEvent>>;

  requestData: (accountId: string) => Promise<void>;
  insertUpdate: (data: XPEvent) => void;

  delayedSetChartRange: (
    startRangeTimestamp: number,
    endRangeTimestamp: number
  ) => void;

  addSkill: (skill: Skill) => void;
  removeSkill: (skill: Skill) => void;
  toggleSelectedSkills: (selectAll: boolean) => void;
  setDisplayDeltas: (value: boolean) => void;
}

export const createXPSlice: StateSliceCreator<XPState> = (set, get) => ({
  selectedSkills: {
    type: "all",
  },
  displayDeltas: true,

  chart: {
    // Default to now, but will reset when data arrives
    startRangeTimestamp: calculateStartRangeTimestamp(Date.now()),
    endRangeTimestamp: Date.now(),
    zoomUpdateTimer: undefined,
  },

  api: {
    type: "data",
    data: [],
  },

  requestData: async (accountId: string) => {
    set((existing) => {
      existing.xp.api = {
        ...existing.xp.api,
        type: "loading",
      };
    });

    const event = await fetchAPIData("xp", accountId);

    set((existing) => {
      existing.xp.api = {
        ...existing.xp.api,
        ...event,
      };

      if (event.type === "data") {
        const endRangeTimestamp =
          event.data.length > 0
            ? event.data[event.data.length - 1].timestamp
            : Date.now() * 1000;

        if (existing.xp.chart.zoomUpdateTimer) {
          clearInterval(existing.xp.chart.zoomUpdateTimer);
        }

        existing.xp.chart = {
          startRangeTimestamp: calculateStartRangeTimestamp(endRangeTimestamp),
          endRangeTimestamp,
          zoomUpdateTimer: undefined,
        };
      }
    });
  },
  insertUpdate: (data: XPEvent) =>
    set((existing) => {
      if (existing.xp.api.type === "error") {
        return;
      }

      const existingData =
        existing.xp.api.type === "data" ? existing.xp.api.data : [];

      // Make sure we insert this data into the correct location
      const index = sortedIndex(
        existingData,
        data.timestamp,
        (event) => event.timestamp
      );

      existingData.splice(index, 0, data);

      existing.xp.api = {
        ...existing.xp.api,
        type: "data",
        data: existingData,
      };
    }),

  delayedSetChartRange: (startRangeTimestamp, endRangeTimestamp) => {
    const oldZoomUpdateTimer = get().xp.chart.zoomUpdateTimer;

    if (oldZoomUpdateTimer) {
      clearInterval(oldZoomUpdateTimer);
    }

    // const zoomUpdateTimer = setTimeout(() => {
    set((existing) => {
      existing.xp.chart = {
        startRangeTimestamp,
        endRangeTimestamp,
        zoomUpdateTimer: undefined,
      };
    });
    // }, 1000);

    // set((existing) => {
    //   existing.xp.chart.zoomUpdateTimer = zoomUpdateTimer;
    // });
  },

  addSkill: (skill) =>
    set((existing) => {
      if (existing.xp.selectedSkills.type === "all") {
        return;
      }

      existing.xp.selectedSkills.set.add(skill);

      if (existing.xp.selectedSkills.set.size === ALL_SKILLS.length) {
        // We just expanded to the full set, so reset to all
        existing.xp.selectedSkills = {
          type: "all",
        };
      }
    }),
  removeSkill: (skill) =>
    set((existing) => {
      if (existing.xp.selectedSkills.type === "all") {
        // Downgrade to all separate items
        existing.xp.selectedSkills = {
          type: "set",
          set: new Set(ALL_SKILLS),
        };
      }

      existing.xp.selectedSkills.set.delete(skill);
    }),
  toggleSelectedSkills: (selectAll: boolean) =>
    set((existing) => {
      existing.xp.selectedSkills = selectAll
        ? {
            type: "all",
          }
        : {
            type: "set",
            set: new Set(),
          };
    }),
  setDisplayDeltas: (value) =>
    set((existing) => {
      existing.xp.displayDeltas = value;
    }),
});

const calculateStartRangeTimestamp = (endTime: number): number => {
  // Default to one day before last data point/now
  return endTime - 24 * 60 * 60 * 1000;
};
