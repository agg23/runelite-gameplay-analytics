import { useMemo } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { LoadingOverlay } from "@mantine/core";
import { Timeline } from "react-svg-timeline";

import { useStore } from "../../store/store";
import { InventoryGrid } from "../osrs/items/InventoryGrid";
import { useGEPrices } from "../osrs/hooks/useGEPrices";
import { useInventoryQuery } from "../../api/hooks/useDatatypeQuery";
import { StorageAPIEvent } from "../../api/internal/types";

export const InventoryPage: React.FC<{}> = () => {
  const { selectedEntry, setSelectedEntry } = useStore(
    (state) => state.inventory
  );

  const query = useInventoryQuery();

  // const chartData = useMemo((): FixedSeries => {
  //   if (inventoryApi.type !== "data") {
  //     return [];
  //   }

  //   return [
  //     {
  //       name: "loot",
  //       data: inventoryApi.data.map((event) => [event.timestamp, 1]),
  //     },
  //   ];
  // }, [inventoryApi]);

  const chartData = useMemo(() => {
    if (!query.isSuccess) {
      return [];
    }

    return query.data.map((event) => ({
      laneId: "0",
      eventId: `${event}`,
      startTimeMillis: event.timestamp,
    }));
  }, [query]);

  const oldGeTotal = useMemo(() => {
    return (selectedEntry?.entries ?? []).reduce((acc, current) => {
      return acc + current.gePerItem * current.quantity;
    }, 0);
  }, [selectedEntry]);

  const currentPrices = useGEPrices(
    selectedEntry?.entries.map((entry) => entry.itemId) ?? []
  );

  return (
    <ErrorBoundary fallback={<div>An error occured</div>}>
      <LoadingOverlay visible={query.isLoading} />
      {/* <Chart
          height="200"
          series={chartData as ApexAxisChartSeries}
          options={options}
        /> */}
      <Timeline
        events={chartData}
        lanes={[
          {
            laneId: "0" as string,
            label: "",
          },
        ]}
        dateFormat={(ms) => new Date(ms).toLocaleString()}
        onCursorMove={(cursor) => {
          if (!cursor) {
            return;
          }

          let lastEvent: StorageAPIEvent | undefined = undefined;
          for (const event of query.data ?? []) {
            if (event.timestamp > cursor) {
              setSelectedEntry(lastEvent);
              return;
            }

            lastEvent = event;
          }

          setSelectedEntry(lastEvent);
        }}
        height={200}
        width={400}
      />
      <div>Selected: {selectedEntry?.timestamp}</div>
      <div>GE Now: {currentPrices.total}</div>
      <div>GE Then: {oldGeTotal}</div>
      <InventoryGrid entries={selectedEntry?.entries ?? []} />
    </ErrorBoundary>
  );
};
