import { shallow } from "zustand/shallow";

import { ALL_SKILLS, Skill } from "../osrs/types";
import { useStore } from "../store/store";
import { SyncedSettings } from "./types";
import { getRoute, postRoute } from "./rest";

let timer: NodeJS.Timeout | undefined;

export const init = () => {
  // Immediately begin settings fetch
  getRoute("settings").then((settings) => {
    if (settings.type === "error") {
      console.error(`Could not retrieve settings: ${settings.message}`);
      return;
    }

    if (!settings.data) {
      // No settings data to load
      return;
    }

    useStore.getState().settings.loadSettings(settings.data);
  });

  useStore.subscribe(
    (state): SyncedSettings => {
      const selectedSkills =
        state.xp.selectedSkills.type === "all"
          ? // Hack to remove readonly
            (ALL_SKILLS as unknown as Skill[])
          : [...state.xp.selectedSkills.set];

      return {
        activeAccountId: state.activeAccount?.id,
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

        console.log("Saving settings");
        postRoute("settings", settings);
      }, 5000);
    },
    { equalityFn: shallow }
  );
};
