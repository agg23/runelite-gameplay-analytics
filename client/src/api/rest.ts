import { HTTPRouteResponse, RouteName } from "./types";

const HOSTNAME = "localhost:61932";

export const getRoute = async <T extends RouteName>(
  route: T,
  additionalPath?: string
): Promise<HTTPRouteResponse<T>> => {
  let url = `http://${HOSTNAME}/api/${route}/`;

  if (additionalPath) {
    url += additionalPath;
  }

  return get(url);
};

const get = async <T>(url: string): Promise<T> => {
  const response = await fetch(url, {
    method: "GET",
  });

  if (response.status !== 200 || !response.body) {
    throw new Error(
      `Failed to fetch ${url} with status code ${response.status}`
    );
  }

  return response.json();
};
