import React from "react";
import { ErrorBoundary } from "react-error-boundary";
import { AppShell } from "@mantine/core";

import { Nav } from "./Nav";

import classes from "./Page.module.scss";

export const Page: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  return (
    <div className={classes.page}>
      <AppShell navbar={{ width: 180, breakpoint: "sm" }}>
        <Nav />
        <AppShell.Main>
          <div className={classes.content}>
            <ErrorBoundary fallback={<div>An error occured</div>}>
              {children}
            </ErrorBoundary>
          </div>
        </AppShell.Main>
      </AppShell>
    </div>
  );
};
