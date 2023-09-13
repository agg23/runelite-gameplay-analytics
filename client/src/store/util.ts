import { getInternalRoute } from "../api/internal/rest";
import { GetRouteName, HTTPGetRoute } from "../api/internal/routes";

export const fetchQueryData = async <T extends GetRouteName>(
  route: T,
  additionalPath?: string
): Promise<HTTPGetRoute<T>> => {
  const data = await getInternalRoute(route, additionalPath);

  if (data.type === "error") {
    throw new Error(`Server error: ${data.message}`);
  }

  return data.data;
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
