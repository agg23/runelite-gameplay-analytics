import { StateSliceCreator } from "./types";

export interface SettingsState {
  darkTheme: boolean;

  setDarkTheme: (value: boolean) => void;
}

export const createSettingsSlice: StateSliceCreator<SettingsState> = (set) => ({
  darkTheme: true,
  setDarkTheme: (value) =>
    set((existing) => {
      existing.settings.darkTheme = value;
    }),
});
