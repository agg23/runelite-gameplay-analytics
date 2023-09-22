import { RouterProvider } from "@tanstack/react-router";
import { ErrorBoundary } from "react-error-boundary";
import { QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import {
  CSSVariablesResolver,
  MantineProvider,
  createTheme,
} from "@mantine/core";

import { router } from "./routes";
import { queryClient } from "./api/query";
import { useStore } from "./store/store";

import "./App.css";

const theme = createTheme({});

const cssResolver: CSSVariablesResolver = (theme) => ({
  variables: {},
  light: {
    "--mantine-color-text": theme.black,
    "--mantine-color-nav-highlight": theme.colors.gray[2],
    "--mantine-color-nav-active": theme.colors.gray[2],
    "--mantine-color-nav-hover": theme.colors.gray[3],
  },
  dark: {
    "--mantine-color-text": theme.colors.dark[0],
    "--mantine-color-nav-highlight": theme.colors.dark[4],
    "--mantine-color-nav-active": theme.colors.dark[5],
    "--mantine-color-nav-hover": theme.colors.dark[4],
  },
});

export const App = () => {
  const darkTheme = useStore((state) => state.settings.darkTheme);

  const colorScheme = darkTheme ? "dark" : "light";

  return (
    <MantineProvider
      theme={theme}
      cssVariablesResolver={cssResolver}
      forceColorScheme={colorScheme}
    >
      <ErrorBoundary fallback={<div>A global error occured</div>}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </ErrorBoundary>
    </MantineProvider>
  );
};
