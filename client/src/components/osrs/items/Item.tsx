import { Loader, Popover, createStyles } from "@mantine/core";
import { HOSTNAME } from "../../../api/internal/config";
import { useDisclosure } from "@mantine/hooks";
import { useItemQuery } from "../../../api/hooks/useDatatypeQuery";

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

  const { classes, cx } = useStyles();

  return (
    <Popover opened={opened}>
      <Popover.Target>
        <div
          className={cx(classes.item, {
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

const useStyles = createStyles((theme) => ({
  item: {
    height: 36,
    width: 36,
  },
  activeItem: {
    ":hover": {
      // TODO: This could probably be chosen within the theme
      backgroundColor: "rgba(0, 0, 0, 0.2)",
      borderRadius: 4,
    },
  },
  quantity: {
    position: "absolute",
    fontSize: 12,
    color: "yellow",
  },
}));
