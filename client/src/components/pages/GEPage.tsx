import { ErrorBoundary } from "react-error-boundary";
import { useGEQuery } from "../../api/hooks/useDatatypeQuery";
import { LoadingOverlay, Table } from "@mantine/core";
import { GEItemRow } from "../osrs/items/GEItem";

export const GEPage: React.FC<{}> = () => {
  const query = useGEQuery();

  return (
    <ErrorBoundary fallback={<div>An error occured</div>}>
      <LoadingOverlay visible={query.isLoading} />
      <Table>
        <thead>
          <tr>
            <th></th>
            <th>Item</th>
            <th>Expected Total</th>
            <th>Transferred Amount</th>
            <th>Action</th>
            <th>Last update</th>
          </tr>
        </thead>
        <tbody>
          {(query.data ?? []).map((event) => (
            <GEItemRow event={event} />
          ))}
        </tbody>
      </Table>
    </ErrorBoundary>
  );
};
