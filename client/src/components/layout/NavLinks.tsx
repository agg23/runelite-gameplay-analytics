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
        link: "/wealth",
      },
      {
        label: "Grand Exchange",
        link: "/ge",
      },
      {
        label: "Kills",
        link: "/loot",
      },
      {
        label: "Inventory",
        link: "/inventory",
      },
      {
        label: "Map",
        link: "/map",
      },
      {
        label: "Activity",
        link: "/activity",
      },
    ],
    []
  );

  return (
    <>
      {links.map(({ label, link }) => (
        <Link key={label} className={classes.link} to={link}>
          {({ isActive }) => <NavLink label={label} active={isActive} />}
        </Link>
      ))}
    </>
  );
};

const useStyles = createStyles((theme) => ({
  link: {
    textDecoration: "none",
  },
  button: {
    display: "block",
    width: "100%",
    padding: theme.spacing.xs,
    borderRadius: theme.radius.sm,
    color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.black,

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[4]
          : theme.colors.gray[3],
    },
  },
  active: {
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[5]
        : theme.colors.gray[2],
  },
}));

const NavLink: React.FC<{
  label: string;
  active?: boolean;
  onClick?: () => void;
}> = ({ label, active, onClick }) => {
  const { classes, cx } = useStyles();

  return (
    <UnstyledButton
      className={cx(classes.button, {
        [classes.active]: active,
      })}
      onClick={onClick}
    >
      <Group>
        <Text size="sm">{label}</Text>
      </Group>
    </UnstyledButton>
  );
};
