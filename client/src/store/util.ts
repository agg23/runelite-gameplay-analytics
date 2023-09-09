import { getRoute } from "../api/rest";
import { GetRouteName, HTTPGetRoute } from "../api/routes";
import { FetchState } from "../api/types";

export const fetchData = async <T extends GetRouteName>(
  route: T,
  additionalPath?: string
): Promise<FetchState<HTTPGetRoute<T>>> => {
  try {
    const data = await getRoute(route, additionalPath);

    if (data.type === "error") {
      return {
        type: "error",
      };
    }

    return {
      type: "data",
      data: data.data,
    };
  } catch (_) {
    return {
      type: "error",
    };
  }
};

// Taken from https://stackoverflow.com/a/21822316/2108817
export const sortedIndex = <TData, TSort>(
  array: Array<TData>,
  value: TSort,
  mapper: (data: TData) => TSort
) => {
  let low = 0;
  let high = array.length;

  while (low < high) {
    const mid = (low + high) >>> 1;

    const midValue = mapper(array[mid]);
    if (midValue < value) {
      low = mid + 1;
    } else high = mid;
  }
  return low;
};
