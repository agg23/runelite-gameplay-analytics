import { Loader, Popover } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import clsx from "clsx";

import { HOSTNAME } from "../../../api/internal/config";
import { useItemQuery } from "../../../api/hooks/useDatatypeQuery";

import classes from "./Item.module.scss";

interface ItemProps {
  id: number;
  quantity: number;
  gePerItem?: number;
  empty?: boolean;
}

export const Item: React.FC<ItemProps> = ({
  id,
  quantity,
  gePerItem,
  empty,
}) => {
  const [opened, { close, open }] = useDisclosure(false);
  const query = useItemQuery(id);

  const name = query.isSuccess ? query.data.name : "Loading";

  return (
    <Popover opened={opened}>
      <Popover.Target>
        <div
          className={clsx(classes.item, {
            [classes.activeItem]: !empty,
          })}
          onMouseEnter={!empty ? open : undefined}
          onMouseLeave={close}
        >
          {!empty && query.isSuccess && (
            <a href={query.data.wiki_url} target="_blank" rel="noreferrer">
              {quantity > 1 && (
                <div className={classes.quantity}>{quantity}</div>
              )}
              <img
                src={`http://${HOSTNAME}/assets/items/${id}.png`}
                alt={name}
              />
            </a>
          )}
        </div>
      </Popover.Target>
      <Popover.Dropdown>
        {!empty &&
          (query.isSuccess ? (
            <div>
              <div>{query.data.name}</div>
              {gePerItem && <div>GE Then: {gePerItem}</div>}
            </div>
          ) : (
            <Loader />
          ))}
      </Popover.Dropdown>
    </Popover>
  );
};
