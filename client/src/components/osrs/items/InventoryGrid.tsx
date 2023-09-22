import { useMemo } from "react";
import { SimpleGrid } from "@mantine/core";

import { Item } from "./Item";
import { StorageEntry } from "../../../api/internal/types";

import classes from "./InventoryGrid.module.scss";

interface InventoryGridProps {
  entries: StorageEntry[];
}

export const InventoryGrid: React.FC<InventoryGridProps> = ({ entries }) => {
  const orderedSlots = useMemo(() => {
    const map: {
      [key: number]: StorageEntry;
    } = {};

    for (const entry of entries) {
      map[entry.slot] = entry;
    }

    const array = new Array<StorageEntry | undefined>(28);

    for (let i = 0; i < 28; i++) {
      array[i] = map[i];
    }

    return array;
  }, [entries]);

  return (
    <SimpleGrid className={classes.grid} cols={4}>
      {orderedSlots.map((entry, index) =>
        entry ? (
          <Item
            key={entry.slot}
            id={entry.itemId}
            quantity={entry.quantity}
            gePerItem={entry.gePerItem}
          />
        ) : (
          <Item key={index} id={0} quantity={0} empty />
        )
      )}
    </SimpleGrid>
  );
};
