import { Grid } from "@mantine/core";
import { Item } from "./Item";

interface InventoryGridProps {
  itemIds: number[];
}

export const InventoryGrid: React.FC<InventoryGridProps> = ({ itemIds }) => {
  return (
    <Grid>
      {itemIds.map((id) => (
        <Item key={id} id={id} />
      ))}
    </Grid>
  );
};
