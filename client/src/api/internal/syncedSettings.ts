import { shallow } from "zustand/shallow";
import deepEqual from "deep-equal";

import { useStore } from "../../store/store";
import { Account, SyncedSettings } from "./types";
import { getInternalRoute, postRoute } from "./rest";
import { queryClient } from "../query";

let timer: NodeJS.Timeout | undefined;
let savedSettings: SyncedSettings | undefined;

export const init = () => {
  // Immediately begin settings fetch
  getInternalRoute("settings")
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
      const accounts = queryClient.getQueryData<Account[]>("accounts");
      useStore.getState().accounts.selectDefaultActiveAccount(accounts);
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
      const selectedSkillsSet = [...state.xp.selectedSkills.set];

      return {
        activeAccountId: state.accounts.activeId,
        darkTheme: state.settings.darkTheme,
        xp: {
          selectedSkills: {
            type: state.xp.selectedSkills.type,
            set: selectedSkillsSet,
          },
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
