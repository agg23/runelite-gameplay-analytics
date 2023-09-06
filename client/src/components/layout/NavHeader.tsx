import React from "react";
import {
  ActionIcon,
  Box,
  Group,
  Title,
  rem,
  useMantineColorScheme,
} from "@mantine/core";
import { IconMoonStars, IconSun } from "@tabler/icons-react";
import { css } from "@emotion/react";

export const NavHeader: React.FC<{}> = () => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <Box
      sx={(theme) => ({
        paddingLeft: theme.spacing.xs,
        paddingRight: theme.spacing.xs,
        paddingBottom: theme.spacing.lg,
        borderBottom: `${rem(1)} solid ${
          theme.colorScheme === "dark"
            ? theme.colors.dark[4]
            : theme.colors.gray[2]
        }`,
      })}
    >
      <Group position="apart">
        <Title css={title}>Gameplay Analytics</Title>
        <ActionIcon
          variant="default"
          onClick={() => toggleColorScheme()}
          size={30}
        >
          {colorScheme === "dark" ? (
            <IconSun size="1rem" />
          ) : (
            <IconMoonStars size="1rem" />
          )}
        </ActionIcon>
      </Group>
    </Box>
  );
};

const title = css({
  fontSize: "1.25rem",
});
