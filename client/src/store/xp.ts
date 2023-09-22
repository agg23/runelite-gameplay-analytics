import { ALL_SKILLS, Skill } from "../osrs/types";
import { StateSliceCreator } from "./types";

export interface XPState {
  selectedSkills:
    | {
        type: "totals";
        // Inactive skills
        set: Set<Skill>;
      }
    | {
        type: "set";
        set: Set<Skill>;
      };
  displayDeltas: boolean;
  showOnlyPlaytime: boolean;

  addSkill: (skill: Skill) => void;
  removeSkill: (skill: Skill) => void;
  toggleSelectedTotalSkills: (selectTotal: boolean) => void;
  toggleSelectAllSkills: (selectall: boolean) => void;
  setDisplayDeltas: (value: boolean) => void;
  setShowOnlyPlaytime: (value: boolean) => void;
}

const allSkillsSet = new Set(ALL_SKILLS);

export const createXPSlice: StateSliceCreator<XPState> = (set, get) => ({
  selectedSkills: {
    type: "set",
    set: allSkillsSet,
  },
  displayDeltas: true,
  showOnlyPlaytime: true,

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

  addSkill: (skill) =>
    set((existing) => {
      if (existing.xp.selectedSkills.type === "totals") {
        return;
      }

      existing.xp.selectedSkills.set.add(skill);
    }),
  removeSkill: (skill) =>
    set((existing) => {
      if (existing.xp.selectedSkills.type === "totals") {
        return;
      }

      existing.xp.selectedSkills.set.delete(skill);
    }),
  toggleSelectedTotalSkills: (selectTotal: boolean) =>
    set((existing) => {
      existing.xp.selectedSkills = {
        type: selectTotal ? "totals" : "set",
        set: existing.xp.selectedSkills.set,
      };
    }),
  toggleSelectAllSkills: (selectAll: boolean) =>
    set((existing) => {
      existing.xp.selectedSkills = selectAll
        ? {
            type: "set",
            set: allSkillsSet,
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
  setShowOnlyPlaytime: (value) =>
    set((existing) => {
      existing.xp.showOnlyPlaytime = value;
    }),
});

const calculateStartRangeTimestamp = (endTime: number): number => {
  // Default to one day before last data point/now
  return endTime - 24 * 60 * 60 * 1000;
};
