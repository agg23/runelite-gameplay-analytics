import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import {
  Account,
  FetchState,
  HTTPGetRoute,
  GetRouteName,
  XPEvent,
  SyncedSettings,
} from "../api/types";
import { getRoute } from "../api/rest";
import { ALL_SKILLS, Skill } from "../osrs/types";
import { enableMapSet } from "immer";

interface State {
  activeAccount: {
    id: string | undefined;
  };
  api: {
    accounts: FetchState<Array<Account>>;
    xp: FetchState<Array<XPEvent>>;
  };
  xp: {
    selectedSkills:
      | {
          type: "all";
        }
      | {
          type: "set";
          set: Set<Skill>;
        };
    displayDeltas: boolean;
  };
  settings: {
    darkTheme: boolean;
  };
}

interface Actions {
  activeAccount: {
    setActiveAccount: (accountId: string) => void;
  };
  api: {
    accounts: {
      requestData: () => Promise<void>;
    };
    xp: {
      requestData: () => Promise<void>;
      insertUpdate: (data: XPEvent) => void;
    };
  };
  xp: {
    addSkill: (skill: Skill) => void;
    removeSkill: (skill: Skill) => void;
    toggleSelectedSkills: (selectAll: boolean) => void;
    setDisplayDeltas: (value: boolean) => void;
  };
  settings: {
    loadSettings: (settings: SyncedSettings) => void;
    setDarkTheme: (value: boolean) => void;
  };
}

enableMapSet();

export const useStore = create(
  subscribeWithSelector(
    immer<State & Actions>((set, get) => ({
      activeAccount: {
        id: undefined,
        setActiveAccount: (accountId) => {
          set((existing) => {
            existing.activeAccount.id = accountId;
          });
        },
      },
      api: {
        accounts: {
          type: "data",
          data: [],
          requestData: async () => {
            set((existing) => {
              existing.api.accounts = {
                ...existing.api.accounts,
                type: "loading",
              };
            });

            const event = await fetchData("accounts");

            set((existing) => {
              existing.api.accounts = {
                ...existing.api.accounts,
                ...event,
              };

              if (event.type === "data" && event.data.length > 0) {
                existing.activeAccount.id = event.data[0].id;
              }
            });
          },
        },
        xp: {
          type: "data",
          data: [],
          requestData: async () => {
            const accountId = get().activeAccount.id;

            if (!accountId) {
              return;
            }

            set((existing) => {
              existing.api.xp = {
                ...existing.api.xp,
                type: "loading",
              };
            });

            const event = await fetchData("xp", accountId);

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
      xp: {
        selectedSkills: {
          type: "all",
        },
        displayDeltas: true,
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
      },
      settings: {
        darkTheme: true,
        loadSettings: (settings) =>
          set((existing) => {
            existing.settings.darkTheme = settings.darkTheme;

            existing.xp.displayDeltas = settings.xp.displayDeltas;
            existing.xp.selectedSkills = {
              type: "set",
              set: new Set(settings.xp.selectedSkills),
            };
          }),
        setDarkTheme: (value) =>
          set((existing) => {
            existing.settings.darkTheme = value;
          }),
      },
    }))
  )
);

const fetchData = async <T extends GetRouteName>(
  route: T,
  additionalPath?: string
): Promise<FetchState<HTTPGetRoute<T>>> => {
  try {
    const data = await getRoute(route, additionalPath);

    if (data.type === "error") {
      return {
        type: "error",
      };
    }

    return {
      type: "data",
      data: data.data,
    };
  } catch (_) {
    return {
      type: "error",
    };
  }
};

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
