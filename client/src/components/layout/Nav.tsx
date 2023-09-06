import React from "react";
import { Navbar } from "@mantine/core";
import { NavHeader } from "./NavHeader";
import { NavLinks } from "./NavLinks";
import { NavAccountSelector } from "./NavAccountSelector";

export const Nav: React.FC<{}> = () => {
  return (
    <Navbar p="xs" width={{ base: 200 }}>
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
