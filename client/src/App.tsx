import { useState } from "react";
import {
  ColorScheme,
  ColorSchemeProvider,
  MantineProvider,
} from "@mantine/core";
import { AccountWrapper } from "./components/account/AccountWrapper";
import { XPPage } from "./components/XPPage";
import { Page } from "./components/layout/Page";

import "./App.css";

export const App = () => {
  const [colorScheme, setColorScheme] = useState<ColorScheme>("light");
  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

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
