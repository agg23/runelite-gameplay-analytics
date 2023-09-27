import { useMemo } from "react";
import { Image, Tooltip, Text, Table } from "@mantine/core";
import { intlFormatDistance } from "date-fns";

import { GEEvent } from "../../../api/internal/types";
import {
  capitalizeFirstLetter,
  formatDatetimeNice,
  formatNumber,
} from "../../../util/string";
import { useItemQuery } from "../../../api/hooks/useDatatypeQuery";

import classes from "./GEItem.module.scss";

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

  return (
    <Table.Tr className={classes.row}>
      <Table.Td className={classes.image}>
        <Image
          src={`https://secure.runescape.com/m=itemdb_oldschool/obj_big.gif?id=${event.itemId}`}
          width={45}
          height={45}
        />
      </Table.Td>
      <Table.Td className={classes.name}>
        <div>{query.data?.name ?? "Undefined"}</div>
        <Text size="xs" color="dimmed">
          x{formatNumber(event.totalQuantity)} at{" "}
          {formatNumber(event.pricePerItem)}
          gp each
        </Text>
      </Table.Td>
      <Table.Td>
        {formatNumber(event.totalQuantity * event.pricePerItem)}
        gp
      </Table.Td>
      <Table.Td>{transferredMessage}</Table.Td>
      <Table.Td>{purchaseMessage}</Table.Td>
      <Table.Td className={classes.lastUpdateCell}>
        <Tooltip
          label={
            <>
              <div>Opened {openDate}</div>
              <div>{closeMessage}</div>
            </>
          }
        >
          <div>
            <div>
              {capitalizeFirstLetter(
                intlFormatDistance(
                  event.completedTimestamp ?? event.firstSeenTimestamp,
                  new Date()
                )
              )}
            </div>
          </div>
        </Tooltip>
      </Table.Td>
    </Table.Tr>
  );
};
