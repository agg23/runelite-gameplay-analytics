/** @jsxImportSource @emotion/react */
import React from "react";
import { Nav } from "./Nav";
import { createStyles } from "@mantine/core";
import { ErrorBoundary } from "react-error-boundary";

export const Page: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const { classes } = useStyles();

  return (
    <div className={classes.page}>
      <Nav />
      <div className={classes.content}>
        <ErrorBoundary fallback={<div>An error occured</div>}>
          {children}
        </ErrorBoundary>
      </div>
    </div>
  );
};

const useStyles = createStyles((theme) => ({
  page: {
    display: "flex",
  },
  content: {
    // Has to be relative so LoadingOverlay is centered in main content
    position: "relative",
    flexGrow: 1,

    marginTop: theme.spacing.md,
    marginLeft: theme.spacing.xs,
    marginRight: theme.spacing.xs,
  },
}));
