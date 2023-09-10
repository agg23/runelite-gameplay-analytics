import { get } from "../http";
import { ExternalRouteName, HTTPGetRoute, routeMapping } from "./routes";

export const getExternalRoute = async <T extends ExternalRouteName>(
  route: T,
  additionalPath?: string
): Promise<HTTPGetRoute<T>> => {
  let url = `https://${routeMapping[route]}`;

  if (additionalPath) {
    url += additionalPath;
  }

  return get(url);
};
