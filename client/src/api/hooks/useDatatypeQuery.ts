import { useAccount } from "../../store/useAccount";
import { useQuery } from "../../store/useQuery";
import { fetchQueryData } from "../../store/util";
import { getExternalRoute } from "../external/rest";
import { GEPrice } from "../external/types";

export const useAccountQuery = () =>
  useQuery("accounts", () => fetchQueryData("accounts"));

export const useActivityQuery = () => {
  const account = useAccount();

  return useQuery(
    ["activity", account.id],
    () => fetchQueryData("activity", account.id),
    {
      enabled: !!account.id,
    }
  );
};

export const useInventoryQuery = () => {
  const account = useAccount();

  return useQuery(
    ["storage", account.id, "0"],
    () => fetchQueryData("storage", `${account.id}/0`),
    {
      enabled: !!account.id,
    }
  );
};

export const useBankQuery = () => {
  const account = useAccount();

  return useQuery(
    ["storage", account.id, "1"],
    () => fetchQueryData("storage", `${account.id}/1`),
    {
      enabled: !!account.id,
    }
  );
};

export const useLootQuery = () => {
  const account = useAccount();

  return useQuery(
    ["loot", account.id],
    () => fetchQueryData("loot", account.id),
    {
      enabled: !!account.id,
    }
  );
};

export const useXPQuery = () => {
  const account = useAccount();

  return useQuery(["xp", account.id], () => fetchQueryData("xp", account.id), {
    enabled: !!account.id,
  });
};

interface GEPricesLocalStorage {
  fetchedTimestamp: number;
  prices: {
    [id: number]: GEPrice;
  };
}

const GE_STORAGE_KEY = "GE_PRICES";

// One day
const GE_REFETCH_INTERVAL = 24 * 60 * 60;

export const useGEPricesQuery = () => {
  const fetch = async () => {
    const retrieveNewData = async () => {
      const prices = await getExternalRoute("prices");

      const newPrices: GEPricesLocalStorage = {
        fetchedTimestamp: Date.now(),
        prices: prices.data,
      };

      localStorage.setItem(GE_STORAGE_KEY, JSON.stringify(newPrices));

      return prices.data;
    };

    const existingPricesString = localStorage.getItem(GE_STORAGE_KEY);

    if (!existingPricesString) {
      return await retrieveNewData();
    }

    const existingPrices: GEPricesLocalStorage =
      JSON.parse(existingPricesString);

    if (Date.now() > existingPrices.fetchedTimestamp + GE_REFETCH_INTERVAL) {
      return await retrieveNewData();
    }

    // Write current data to the store
    return existingPrices.prices;
  };

  return useQuery("ge_prices", fetch);
};

export const useMapQuery = () => {
  const account = useAccount();

  return useQuery("map", () => fetchQueryData("map", account.id), {
    enabled: !!account.id,
  });
};

export const useItemQuery = (id: number) =>
  useQuery(["item", id], () => getExternalRoute("item", `/${id}.json`));

export const useNPCQuery = (id: number) =>
  useQuery(["npc", id], () => getExternalRoute("npc", `/${id}.json`));
