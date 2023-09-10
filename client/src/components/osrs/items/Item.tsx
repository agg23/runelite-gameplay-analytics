import { createStyles } from "@mantine/core";
import { HOSTNAME } from "../../../api/internal/config";
import { useItem } from "../hooks/useItem";

interface ItemProps {
  id: number;
  quantity: number;
  empty?: boolean;
}

export const Item: React.FC<ItemProps> = ({ id, quantity, empty }) => {
  const item = useItem(id);

  const name = item.type === "data" ? item.data.name : "Loading";

  const { classes } = useStyles();

  return (
    <div className={classes.item}>
      {!empty && (
        <>
          {quantity > 1 && <div className={classes.quantity}>{quantity}</div>}
          <img src={`http://${HOSTNAME}/assets/items/${id}.png`} alt={name} />
        </>
      )}
    </div>
  );
};

const useStyles = createStyles((theme) => ({
  item: {
    height: 36,
    width: 36,
  },
  quantity: {
    position: "absolute",
    fontSize: 12,
    color: "yellow",
  },
}));
