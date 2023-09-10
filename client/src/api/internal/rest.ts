import { get, post } from "../http";
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
