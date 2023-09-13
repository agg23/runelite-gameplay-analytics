import { ALL_SKILLS, Skill } from "../osrs/types";
import { LineChartState, StateSliceCreator } from "./types";

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
