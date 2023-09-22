/** @jsxImportSource @emotion/react */
import React from "react";
import { Nav } from "./Nav";
import { ErrorBoundary } from "react-error-boundary";

import classes from "./Page.module.scss";
import { AppShell } from "@mantine/core";

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
