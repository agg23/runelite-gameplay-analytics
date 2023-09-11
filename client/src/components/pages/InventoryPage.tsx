import { useEffect, useMemo } from "react";

import { useStore } from "../../store/store";
import { Timeline } from "react-svg-timeline";
import { InventoryEvent } from "../../api/internal/types";
import { InventoryGrid } from "../osrs/items/InventoryGrid";
import { useGEPrices } from "../osrs/hooks/useGEPrices";
import { LoadingErrorBoundary } from "../error/LoadingErrorBoundary";

export const InventoryPage: React.FC<{}> = () => {
  const activeAccount = useStore((state) => state.accounts.activeId);
  const {
    selectedEntry,
    api: inventoryApi,
    requestData,
    setSelectedEntry,
  } = useStore((state) => state.inventory);

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
    if (inventoryApi.type !== "data") {
      return [];
    }

    return inventoryApi.data.map((event) => ({
      laneId: "0",
      eventId: `${event.timestamp}`,
      startTimeMillis: event.timestamp,
    }));
  }, [inventoryApi]);

  const oldGeTotal = useMemo(() => {
    return (selectedEntry?.entries ?? []).reduce((acc, current) => {
      return acc + current.gePerItem * current.quantity;
    }, 0);
  }, [selectedEntry]);

  const currentPrices = useGEPrices(
    selectedEntry?.entries.map((entry) => entry.itemId) ?? []
  );

  useEffect(() => {
    if (!activeAccount) {
      return;
    }

    requestData(activeAccount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAccount]);

  return (
    <LoadingErrorBoundary data={inventoryApi}>
      {(data) => (
        <>
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

              let lastEvent: InventoryEvent | undefined = undefined;
              for (const event of data) {
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
          <div>
            GE Now:{" "}
            {currentPrices.type === "data"
              ? currentPrices.data.total
              : "Loading"}
          </div>
          <div>GE Then: {oldGeTotal}</div>
          <InventoryGrid entries={selectedEntry?.entries ?? []} />
        </>
      )}
    </LoadingErrorBoundary>
  );
};
