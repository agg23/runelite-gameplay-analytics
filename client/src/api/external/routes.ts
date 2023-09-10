import { OSRS_BOXED, OSRS_WIKI } from "../internal/config";
import { GEPrice, Item, NPC, WikiResponse } from "./types";

interface GetRoutes {
  item: Item;
  npc: NPC;
  prices: WikiResponse<GEPrice>;
}

export const routeMapping: {
  [Key in keyof GetRoutes]: string;
} = {
  item: `${OSRS_BOXED}/items-json`,
  npc: `${OSRS_BOXED}/monsters-json`,
  prices: `${OSRS_WIKI}/api/v1/osrs/latest`,
};

export type ExternalRouteName = keyof GetRoutes;

// HTTP

export type HTTPGetRoute<T extends ExternalRouteName> = GetRoutes[T];
