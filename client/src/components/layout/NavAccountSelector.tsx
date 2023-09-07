import React from "react";
import { AccountSelect } from "../account/AccountSelect";
import { Box, createStyles, rem, Text } from "@mantine/core";

export const NavAccountSelector: React.FC<{}> = () => {
  const { classes } = useStyles();

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
      <Text className={classes.text}>Account:</Text>
      <AccountSelect />
    </Box>
  );
};

const useStyles = createStyles((theme) => ({
  text: {
    textAlign: "left",
    margin: theme.spacing.xs,
  },
}));
