import { Group, UnstyledButton, Text } from "@mantine/core";
import React, { useMemo } from "react";

export const NavLinks: React.FC<{}> = () => {
  const links = useMemo(
    () => [
      {
        label: "XP",
        onClick: () => console.log("Clicked XP"),
      },
      {
        label: "Wealth",
        onClick: () => console.log("Clicked Wealth"),
      },
      {
        label: "Kills",
        onClick: () => console.log("Clicked Kills"),
      },
    ],
    []
  );

  return (
    <>
      {links.map(({ label, onClick }) => (
        <NavLink key={label} label={label} onClick={onClick} />
      ))}
    </>
  );
};

const NavLink: React.FC<{
  label: string;
  onClick: () => void;
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
