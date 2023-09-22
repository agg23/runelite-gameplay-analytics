import React from "react";
import { ActionIcon, Box, Group, Title } from "@mantine/core";
import { IconMoonStars, IconSun } from "@tabler/icons-react";

import classes from "./NavHeader.module.scss";
import { useStore } from "../../store/store";

export const NavHeader: React.FC<{}> = () => {
  const { darkTheme, toggleDarkTheme } = useStore((state) => state.settings);

  return (
    <Box className={classes.box}>
      <Group justify="apart">
        <Title className={classes.title}>Gameplay Analytics</Title>
        <ActionIcon variant="default" onClick={toggleDarkTheme} size={30}>
          {darkTheme ? <IconSun size="1rem" /> : <IconMoonStars size="1rem" />}
        </ActionIcon>
      </Group>
    </Box>
  );
};
