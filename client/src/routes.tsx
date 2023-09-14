import { RootRoute, Route, Router } from "@tanstack/react-router";
import { RootPage } from "./components/pages/RootPage";
import { XPPage } from "./components/pages/xp/XPPage";
import { LootPage } from "./components/pages/LootPage";
import { InventoryPage } from "./components/pages/InventoryPage";
import { ActivityPage } from "./components/pages/ActivityPage";
import { MapPage } from "./components/pages/MapPage";
import { WealthPage } from "./components/pages/wealth/WealthPage";

const rootRoute = new RootRoute({
  component: () => <RootPage />,
});

const indexRoute = new Route({
  getParentRoute: () => rootRoute,
  component: () => <XPPage />,
  path: "/",
});

const activityRoute = new Route({
  getParentRoute: () => rootRoute,
  component: () => <ActivityPage />,
  path: "/activity",
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

const mapRoute = new Route({
  getParentRoute: () => rootRoute,
  component: () => <MapPage />,
  path: "/map",
});

const wealthRoute = new Route({
  getParentRoute: () => rootRoute,
  component: () => <WealthPage />,
  path: "/wealth",
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  activityRoute,
  inventoryRoute,
  lootRoute,
  mapRoute,
  wealthRoute,
]);

export const router = new Router({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    // This infers the type of our router and registers it across your entire project
    router: typeof router;
  }
}
