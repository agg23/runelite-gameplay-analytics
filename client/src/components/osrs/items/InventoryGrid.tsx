import { SimpleGrid, createStyles } from "@mantine/core";
import { Item } from "./Item";
import { StorageEntry } from "../../../api/internal/types";
import { useMemo } from "react";

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

  const { classes } = useStyles();

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

const useStyles = createStyles((theme) => ({
  grid: {
    width: 160,
    rowGap: "0.5rem",
  },
}));
