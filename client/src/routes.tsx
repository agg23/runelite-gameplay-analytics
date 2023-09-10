import { RootRoute, Route, Router } from "@tanstack/react-router";
import { RootPage } from "./components/pages/RootPage";
import { XPPage } from "./components/pages/XPPage";
import { LootPage } from "./components/pages/LootPage";
import { InventoryPage } from "./components/pages/InventoryPage";

const rootRoute = new RootRoute({
  component: () => <RootPage />,
});

const indexRoute = new Route({
  getParentRoute: () => rootRoute,
  component: () => <XPPage />,
  path: "/",
});

const inventoryRoute = new Route({
  getParentRoute: () => rootRoute,
  component: () => <InventoryPage />,
  path: "/inventory",
});

const lootRoute = new Route({
  getParentRoute: () => rootRoute,
  component: () => <LootPage />,
  path: "/loot",
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  inventoryRoute,
  lootRoute,
]);

export const router = new Router({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    // This infers the type of our router and registers it across your entire project
    router: typeof router;
  }
}