import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { getExternalRoute } from "../../../api/external/rest";
import { FetchState } from "../../../api/types";
import { NPC } from "../../../api/external/types";
import { ObjectMap } from "../../../types/util";
import { useEffect } from "react";

export const useNPC = (npcId: number): FetchState<NPC> => {
  const npc: FetchState<NPC> | undefined = useItemStore(
    (state) => state.npcs[npcId]
  );
  const requestNPC = useItemStore((state) => state.requestItem);

  useEffect(() => {
    if (!npc) {
      // No data, fetch it
      requestNPC(npcId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [npc, npcId]);

  return !!npc
    ? npc
    : {
        type: "loading",
      };
};

interface Store {
  npcs: ObjectMap<FetchState<NPC>>;

  requestItem: (id: number) => Promise<void>;
}

const useItemStore = create(
  immer<Store>((set) => ({
    npcs: {},

    requestItem: async (id) => {
      set((existing) => {
        existing.npcs[id] = {
          type: "loading",
        };
      });

      const item = await getExternalRoute("npc", `${id}.json`);

      set((existing) => {
        existing.npcs[id] = {
          type: "data",
          data: item,
        };
      });
    },
  }))
);
