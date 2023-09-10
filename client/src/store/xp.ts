import { XPEvent } from "../api/internal/types";
import { FetchState } from "../api/types";
import { ALL_SKILLS, Skill } from "../osrs/types";
import { StateSliceCreator } from "./types";
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

  api: FetchState<Array<XPEvent>>;

  requestData: (accountId: string) => Promise<void>;
  insertUpdate: (data: XPEvent) => void;

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
