import { shallow } from "zustand/shallow";
import deepEqual from "deep-equal";

import { ALL_SKILLS, Skill } from "../../osrs/types";
import { useStore } from "../../store/store";
import { SyncedSettings } from "./types";
import { getRoute, postRoute } from "./rest";

let timer: NodeJS.Timeout | undefined;
let savedSettings: SyncedSettings | undefined;

export const init = () => {
  // Immediately begin settings fetch
  getRoute("settings")
    .then((settings) => {
      if (settings.type === "error") {
        console.error(`Could not retrieve settings: ${settings.message}`);
        return;
      }

      if (!settings.data) {
        // No settings data to load
        return;
      }

      savedSettings = settings.data;
      useStore.getState().loadSettings(settings.data);
    })
    .catch(() => {
      console.error("Failed to load settings");
      // TODO: Mark offline in store
    })
    .finally(() => {
      // Make sure we've selected the correct active ID
      useStore.getState().accounts.selectDefaultActiveAccount();
    });

  const saveSettings = (settings: SyncedSettings) => {
    if (deepEqual(settings, savedSettings)) {
      // These settings haven't changed. Nothing to save
      return;
    }

    console.log("Saving settings");
    savedSettings = settings;
    postRoute("settings", settings).catch(() => {
      console.log("Failed to save settings");
    });
  };

  useStore.subscribe(
    (state): SyncedSettings => {
      const selectedSkills =
        state.xp.selectedSkills.type === "all"
          ? // Hack to remove readonly
            (ALL_SKILLS as unknown as Skill[])
          : [...state.xp.selectedSkills.set];

      return {
        activeAccountId: state.accounts.activeId,
        darkTheme: state.settings.darkTheme,
        xp: {
          selectedSkills,
          displayDeltas: state.xp.displayDeltas,
        },
      };
    },
    (settings) => {
      clearInterval(timer);
      timer = undefined;

      // Debounce saving settings
      timer = setTimeout(() => {
        clearInterval(timer);
        timer = undefined;

        saveSettings(settings);
      }, 5000);
    },
    { equalityFn: shallow }
  );
};
