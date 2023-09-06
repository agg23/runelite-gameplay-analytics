import React from "react";
import { AccountSelect } from "../account/AccountSelect";
import { Box, rem } from "@mantine/core";

export const NavAccountSelector: React.FC<{}> = () => {
  return (
    <Box
      sx={(theme) => ({
        paddingLeft: theme.spacing.xs,
        paddingRight: theme.spacing.xs,
        paddingTop: theme.spacing.lg,
        paddingBottom: theme.spacing.lg,
        borderTop: `${rem(1)} solid ${
          theme.colorScheme === "dark"
            ? theme.colors.dark[4]
            : theme.colors.gray[2]
        }`,
      })}
    >
      <AccountSelect />
    </Box>
  );
};
