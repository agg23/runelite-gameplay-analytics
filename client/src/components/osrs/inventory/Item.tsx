import { HOSTNAME } from "../../../api/internal/config";
import { useItem } from "../hooks/useItem";

interface ItemProps {
  id: number;
}

export const Item: React.FC<ItemProps> = ({ id }) => {
  const item = useItem(id);

  const name = item.type === "data" ? item.data.name : "Loading";

  return (
    <>
      <img src={`http://${HOSTNAME}/assets/items/${id}.png`} alt={name} />
      <div>{name}</div>
    </>
  );
};
