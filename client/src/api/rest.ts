import { HOSTNAME } from "./config";
import {
  HTTPGetRouteResponse,
  HTTPPostRequestRoute,
  GetRouteName,
  PostRouteName,
  HTTPPostResponseRoute,
} from "./routes";

export const getRoute = async <T extends GetRouteName>(
  route: T,
  additionalPath?: string
): Promise<HTTPGetRouteResponse<T>> => {
  let url = `http://${HOSTNAME}/api/${route}/`;

  if (additionalPath) {
    url += additionalPath;
  }

  return get(url);
};

export const postRoute = async <T extends PostRouteName>(
  route: T,
  request: HTTPPostRequestRoute<T>
): Promise<HTTPPostResponseRoute<T>> => {
  let url = `http://${HOSTNAME}/api/${route}/`;

  return post(url, request);
};

const get = async <T>(url: string): Promise<T> => {
  const response = await fetch(url, {
    method: "GET",
  });

  if (response.status !== 200 || !response.body) {
    throw new Error(`Failed to GET ${url} with status code ${response.status}`);
  }

  return response.json();
};

const post = async <TRequest, TResponse>(
  url: string,
  request: TRequest
): Promise<TResponse> => {
  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify(request),
  });

  if (response.status !== 200 || !response.body) {
    throw new Error(
      `Failed to POST ${url} with status code ${response.status}`
    );
  }

  return response.json();
};
