import { get } from "../http";
import { OSRS_BOXED } from "../internal/config";
import { ExternalRouteName, HTTPGetRoute, routeMapping } from "./routes";

export const getExternalRoute = async <T extends ExternalRouteName>(
  route: T,
  additionalPath?: string
): Promise<HTTPGetRoute<T>> => {
  const finalRoute = routeMapping[route];

  let url = `${OSRS_BOXED}/${finalRoute}/`;

  if (additionalPath) {
    url += additionalPath;
  }

  return get(url);
};
