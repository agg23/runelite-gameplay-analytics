import { Group, UnstyledButton, Text, createStyles } from "@mantine/core";
import { Link, RegisteredRouter, RoutePaths } from "@tanstack/react-router";
import React, { useMemo } from "react";

export const NavLinks: React.FC<{}> = () => {
  const { classes } = useStyles();

  const links = useMemo(
    (): Array<{
      label: string;
      link: RoutePaths<RegisteredRouter["routeTree"]>;
    }> => [
      {
        label: "XP",
        link: "/",
      },
      {
        label: "Wealth",
        link: "/",
      },
      {
        label: "Kills",
        link: "/loot",
      },
      {
        label: "Inventory",
        link: "/inventory",
      },
    ],
    []
  );

  return (
    <>
      {links.map(({ label, link }) => (
        <Link key={label} className={classes.link} to={link}>
          <NavLink label={label} />
        </Link>
      ))}
    </>
  );
};

const useStyles = createStyles(() => ({
  link: {
    textDecoration: "none",
  },
}));

const NavLink: React.FC<{
  label: string;
  onClick?: () => void;
}> = ({ label, onClick }) => {
  return (
    <UnstyledButton
      sx={(theme) => ({
        display: "block",
        width: "100%",
        padding: theme.spacing.xs,
        borderRadius: theme.radius.sm,
        color:
          theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.black,

        "&:hover": {
          backgroundColor:
            theme.colorScheme === "dark"
              ? theme.colors.dark[6]
              : theme.colors.gray[0],
        },
      })}
      onClick={onClick}
    >
      <Group>
        <Text size="sm">{label}</Text>
      </Group>
    </UnstyledButton>
  );
};
