import {
  ColorScheme,
  ColorSchemeProvider,
  MantineProvider,
} from "@mantine/core";
import { AccountWrapper } from "./components/account/AccountWrapper";
import { XPPage } from "./components/XPPage";
import { Page } from "./components/layout/Page";

import "./App.css";
import { useStore } from "./store/store";

export const App = () => {
  const { darkTheme, setDarkTheme } = useStore((state) => state.settings);

  const toggleColorScheme = (value?: ColorScheme) => {
    if (value) {
      setDarkTheme(value === "dark");
    } else {
      setDarkTheme(!darkTheme);
    }
  };

  const colorScheme = darkTheme ? "dark" : "light";

  return (
    <div className="App">
      <ColorSchemeProvider
        colorScheme={colorScheme}
        toggleColorScheme={toggleColorScheme}
      >
        <MantineProvider
          theme={{ colorScheme }}
          withGlobalStyles
          withNormalizeCSS
        >
          <AccountWrapper>
            <Page>
              <XPPage />
            </Page>
          </AccountWrapper>
        </MantineProvider>
      </ColorSchemeProvider>
    </div>
  );
};
