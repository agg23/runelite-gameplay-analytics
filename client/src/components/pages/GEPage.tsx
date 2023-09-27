import { ErrorBoundary } from "react-error-boundary";
import { LoadingOverlay, Table } from "@mantine/core";

import { useGEQuery } from "../../api/hooks/useDatatypeQuery";
import { GEItemRow } from "../osrs/items/GEItem";

import classes from "./GEPage.module.scss";
import { useMemo } from "react";

export const GEPage: React.FC<{}> = () => {
  const query = useGEQuery();

  const sortedQuery = useMemo(() => {
    const array = !!query.data ? [...query.data] : [];
    array.sort((a, b) => b.firstSeenTimestamp - a.firstSeenTimestamp);

    return array;
  }, [query]);

  return (
    <ErrorBoundary fallback={<div>An error occured</div>}>
      <LoadingOverlay visible={query.isLoading} />
      <Table className={classes.table} highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th></Table.Th>
            <Table.Th>Item</Table.Th>
            <Table.Th>Expected Total</Table.Th>
            <Table.Th>Transferred Amount</Table.Th>
            <Table.Th>Action</Table.Th>
            <Table.Th>Last update</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {sortedQuery.map((event) => (
            <GEItemRow event={event} />
          ))}
        </Table.Tbody>
      </Table>
    </ErrorBoundary>
  );
};
