import { Grid } from "@mantine/core";
import { Item } from "./Item";

interface ItemGridProps {
  itemIds: number[];
}

export const ItemGrid: React.FC<ItemGridProps> = ({ itemIds }) => {
  return (
    <Grid>
      {/* {itemIds.map((id) => (
        <Item key={id} id={id} />
      ))} */}
    </Grid>
  );
};
