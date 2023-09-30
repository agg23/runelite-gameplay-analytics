import { Group, UnstyledButton, Text } from "@mantine/core";
import { Link, RegisteredRouter, RoutePaths } from "@tanstack/react-router";
import { useMemo } from "react";
import clsx from "clsx";

import classes from "./Nav.module.scss";

export const NavLinks: React.FC<{}> = () => {
  const links = useMemo(
    (): Array<{
      label: string;
      link: RoutePaths<RegisteredRouter["routeTree"]>;
    }> => [
      {
        label: "Summary",
        link: "/",
      },
      {
        label: "XP",
        link: "/xp",
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

const NavLink: React.FC<{
  label: string;
  active?: boolean;
  onClick?: () => void;
}> = ({ label, active, onClick }) => {
  return (
    <UnstyledButton
      className={clsx(classes.navButton, {
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
