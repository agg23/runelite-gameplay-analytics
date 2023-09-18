import { useMemo } from "react";
import { GEEvent } from "../../../api/internal/types";
import {
  capitalizeFirstLetter,
  formatDatetimeNice,
  formatNumber,
} from "../../../util/string";
import { Image, Tooltip, Text, createStyles } from "@mantine/core";
import { useItemQuery } from "../../../api/hooks/useDatatypeQuery";
import { intlFormatDistance } from "date-fns";

interface GEItemRowProps {
  event: GEEvent;
}

export const GEItemRow: React.FC<GEItemRowProps> = ({ event }) => {
  const query = useItemQuery(event.itemId);

  const lastEntry =
    event.entries.length > 0
      ? event.entries[event.entries.length - 1]
      : undefined;

  const openDate = useMemo(
    () => formatDatetimeNice(new Date(event.firstSeenTimestamp)),
    [event.firstSeenTimestamp]
  );

  const closeDate = useMemo(
    () =>
      event.completedTimestamp !== null
        ? formatDatetimeNice(new Date(event.completedTimestamp))
        : undefined,
    [event.completedTimestamp]
  );

  const closeMessage =
    closeDate === undefined
      ? "Active"
      : event.cancelled
      ? `Cancelled ${closeDate}`
      : `Filled ${closeDate}`;

  let transferredMessage = "?";

  if (!!lastEntry) {
    transferredMessage = `x${formatNumber(
      lastEntry.completedQuantity
    )} for ${formatNumber(lastEntry.transferredGp)}gp`;
  }

  let purchaseMessage = "";

  if (!!event.completedTimestamp) {
    // Past tense
    purchaseMessage = event.buy ? "Bought" : "Sold";
  } else {
    purchaseMessage = event.buy ? "Buying" : "Selling";
  }

  if (event.cancelled) {
    purchaseMessage += " (cancelled)";
  }

  const { classes } = useStyles();

  return (
    <tr className={classes.row}>
      <td className={classes.image}>
        <Image
          src={`https://secure.runescape.com/m=itemdb_oldschool/obj_big.gif?id=${event.itemId}`}
          width={45}
          height={45}
        />
      </td>
      <td className={classes.name}>
        <div>{query.data?.name ?? "Undefined"}</div>
        <Text size="xs" color="dimmed">
          x{formatNumber(event.totalQuantity)} at{" "}
          {formatNumber(event.pricePerItem)}
          gp each
        </Text>
      </td>
      <td>
        {formatNumber(event.totalQuantity * event.pricePerItem)}
        gp
      </td>
      <td>{transferredMessage}</td>
      <td>{purchaseMessage}</td>
      <td>
        <Tooltip
          label={
            <>
              <div>Opened {openDate}</div>
              <div>{closeMessage}</div>
            </>
          }
        >
          <div>
            {capitalizeFirstLetter(
              intlFormatDistance(
                event.completedTimestamp ?? event.firstSeenTimestamp,
                new Date()
              )
            )}
          </div>
        </Tooltip>
      </td>
    </tr>
  );
};

const useStyles = createStyles(() => ({
  row: {
    textAlign: "left",
  },

  image: {
    width: 45,

    img: {
      height: 45,
    },
  },
  name: {
    width: 200,
  },
}));
