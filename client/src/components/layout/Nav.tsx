import React from "react";
import { Navbar, createStyles } from "@mantine/core";
import { NavHeader } from "./NavHeader";
import { NavLinks } from "./NavLinks";
import { NavAccountSelector } from "./NavAccountSelector";

export const Nav: React.FC<{}> = () => {
  const { classes } = useStyles();

  return (
    <Navbar className={classes.nav} p="xs" width={{ base: 200 }}>
      <Navbar.Section>
        <NavHeader />
      </Navbar.Section>
      <Navbar.Section grow mt="md">
        <NavLinks />
      </Navbar.Section>
      <Navbar.Section>
        <NavAccountSelector />
      </Navbar.Section>
    </Navbar>
  );
};

const useStyles = createStyles((theme) => ({
  nav: {
    zIndex: 0,
  },
}));
