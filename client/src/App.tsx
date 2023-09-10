import {
  ColorScheme,
  ColorSchemeProvider,
  MantineProvider,
} from "@mantine/core";
import { RouterProvider } from "@tanstack/react-router";

import { AccountWrapper } from "./components/account/AccountWrapper";
import { XPPage } from "./components/pages/XPPage";
import { Page } from "./components/layout/Page";
import { useStore } from "./store/store";
import { router } from "./routes";

import "./App.css";

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

  return <RouterProvider router={router} />;
};

{
  /* <div className="App">
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
</div> */
}
