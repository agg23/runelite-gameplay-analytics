import { StateSliceCreator } from "./types";

export interface SettingsState {
  darkTheme: boolean;

  toggleDarkTheme: () => void;
}

export const createSettingsSlice: StateSliceCreator<SettingsState> = (set) => ({
  darkTheme: true,

  toggleDarkTheme: () =>
    set((existing) => {
      existing.settings.darkTheme = !existing.settings.darkTheme;
    }),
});
