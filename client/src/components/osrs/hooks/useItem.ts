import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { getExternalRoute } from "../../../api/external/rest";
import { FetchState } from "../../../api/types";
import { Item } from "../../../api/external/types";
import { ObjectMap } from "../../../types/util";
import { useEffect } from "react";

export const useItem = (itemId: number): FetchState<Item> => {
  const item: FetchState<Item> | undefined = useItemStore(
    (state) => state.items[itemId]
  );
  const requestItem = useItemStore((state) => state.requestItem);

  useEffect(() => {
    if (!item) {
      // No data, fetch it
      requestItem(itemId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, itemId]);

  return !!item
    ? item
    : {
        type: "loading",
      };
};

interface Store {
  items: ObjectMap<FetchState<Item>>;

  requestItem: (id: number) => Promise<void>;
}

const useItemStore = create(
  immer<Store>((set) => ({
    items: {},

    requestItem: async (id) => {
      set((existing) => {
        existing.items[id] = {
          type: "loading",
        };
      });

      const item = await getExternalRoute("item", `${id}.json`);

      set((existing) => {
        existing.items[id] = {
          type: "data",
          data: item,
        };
      });
    },
  }))
);
