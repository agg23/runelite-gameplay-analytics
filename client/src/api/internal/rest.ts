import { get, post } from "../http";
import { HOSTNAME } from "./config";
import {
  HTTPGetRouteResponse,
  HTTPPostRequestRoute,
  GetRouteName,
  PostRouteName,
  HTTPPostResponseRoute,
  // alternateRoutePaths,
} from "./routes";

export const getInternalRoute = async <T extends GetRouteName>(
  route: T,
  additionalPath?: string
): Promise<HTTPGetRouteResponse<T>> => {
  // const alternateRoute = alternateRoutePaths[route];

  // const finalRoute = alternateRoute ? alternateRoute : route;

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
