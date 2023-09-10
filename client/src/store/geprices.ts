import { getExternalRoute } from "../api/external/rest";
import { GEPrice } from "../api/external/types";
import { FetchState } from "../api/types";
import { useStore } from "./store";
import { StateSliceCreator } from "./types";

const STORAGE_KEY = "GE_PRICES";

// One day
const REFETCH_INTERVAL = 24 * 60 * 60;

export interface GEPricesState {
  api: FetchState<{
    [id: number]: GEPrice;
  }>;

  loadData: () => Promise<void>;
}

interface GEPricesLocalStorage {
  fetchedTimestamp: number;
  prices: {
    [id: number]: GEPrice;
  };
}

export const createGEPricesSlice: StateSliceCreator<GEPricesState> = (set) => ({
  api: {
    type: "data",
    data: {
      data: {},
    },
  },

  selectedEntry: undefined,

  // TODO: Need to start update timer
  loadData: async () => {
    const retrieveNewData = async () => {
      set((existing) => {
        existing.geprices.api = {
          ...existing.geprices.api,
          type: "loading",
        };
      });

      const prices = await getExternalRoute("prices");

      set((existing) => {
        existing.geprices.api = {
          type: "data",
          data: prices.data,
        };
      });

      const newPrices: GEPricesLocalStorage = {
        fetchedTimestamp: Date.now(),
        prices: prices.data,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPrices));
    };

    const existingPricesString = localStorage.getItem(STORAGE_KEY);

    if (!existingPricesString) {
      await retrieveNewData();
      return;
    }

    const existingPrices: GEPricesLocalStorage =
      JSON.parse(existingPricesString);

    // Write current data to the store
    set((existing) => {
      existing.geprices.api = {
        type: "data",
        data: existingPrices.prices,
      };
    });

    if (Date.now() > existingPrices.fetchedTimestamp + REFETCH_INTERVAL) {
      await retrieveNewData();
    }
  },
});

export const gePricesInit = () => {
  const state = useStore.getState();

  state.geprices.loadData();
};
