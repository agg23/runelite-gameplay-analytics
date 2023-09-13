import { useMemo } from "react";
import { useGEPricesQuery } from "../../../api/hooks/useDatatypeQuery";

interface GEPriceTotal {
  total: number;
  prices: {
    [id: number]: number;
  };
}

export const useGEPrices = (itemIds: number[]) => {
  const prices = useGEPricesQuery();

  return useMemo((): GEPriceTotal => {
    if (!prices.isSuccess) {
      return {
        total: 0,
        prices: {},
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
      total,
      prices: priceMap,
    };
  }, [itemIds, prices]);
};
