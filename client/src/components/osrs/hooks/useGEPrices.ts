import { useMemo } from "react";
import { useStore } from "../../../store/store";
import { FetchState } from "../../../api/types";

interface GEPriceTotal {
  total: number;
  prices: {
    [id: number]: number;
  };
}

export const useGEPrices = (itemIds: number[]) => {
  const prices = useStore((state) => state.geprices.api);

  return useMemo((): FetchState<GEPriceTotal> => {
    if (prices.type !== "data") {
      return {
        type: prices.type,
      };
    }

    const priceMap: {
      [id: number]: number;
    } = {};

    let total = 0;

    for (const id of itemIds) {
      const price = prices.data[id];

      if (price === undefined) {
        console.log(`Could not find price for item with id: ${id}`);
        continue;
      }

      // TODO: This averages the price, which probably isn't right
      const averagePrice = (price.high + price.low) / 2;
      priceMap[id] = averagePrice;

      total += averagePrice;
    }

    return {
      type: "data",
      data: {
        total,
        prices: priceMap,
      },
    };
  }, [itemIds, prices]);
};
