import { Item, NPC } from "./types";

interface GetRoutes {
  item: Item;
  npc: NPC;
}

export const routeMapping: {
  [Key in keyof GetRoutes]: string;
} = {
  item: "items-json",
  npc: "monsters-json",
};

export type ExternalRouteName = keyof GetRoutes;

// HTTP

export type HTTPGetRoute<T extends ExternalRouteName> = GetRoutes[T];
