import { AppShell } from "@mantine/core";

import { NavHeader } from "./NavHeader";
import { NavLinks } from "./NavLinks";
import { NavAccountSelector } from "./NavAccountSelector";

import classes from "./Nav.module.scss";

export const Nav: React.FC<{}> = () => {
  return (
    <AppShell.Navbar className={classes.nav} p="xs">
      <AppShell.Section>
        <NavHeader />
      </AppShell.Section>
      <AppShell.Section grow mt="md">
        <NavLinks />
      </AppShell.Section>
      <AppShell.Section>
        <NavAccountSelector />
      </AppShell.Section>
    </AppShell.Navbar>
  );
};
