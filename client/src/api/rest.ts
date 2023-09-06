import { HTTPRoute, RouteName } from "./types";

const HOSTNAME = "localhost:61932";

export const getRoute = async <T extends RouteName>(
  route: T
): Promise<HTTPRoute<T>> => get(`http://${HOSTNAME}/api/${route}/`);

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
