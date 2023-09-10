import {
  ColorScheme,
  ColorSchemeProvider,
  MantineProvider,
} from "@mantine/core";
import { useStore } from "../../store/store";
import { AccountWrapper } from "../account/AccountWrapper";
import { Page } from "../layout/Page";
import { Outlet } from "@tanstack/react-router";

export const RootPage: React.FC<{}> = () => {
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
              <Outlet />
            </Page>
          </AccountWrapper>
        </MantineProvider>
      </ColorSchemeProvider>
    </div>
  );
};
