import { useEffect, useMemo } from "react";
import { LoadingOverlay, createStyles } from "@mantine/core";
import Chart from "react-apexcharts";

import { useStore } from "../../store/store";
import { FixedSeries } from "../../types/ApexCharts";
import { ApexOptions } from "apexcharts";
import { NoData } from "../error/NoData";
import { Timeline } from "react-svg-timeline";
import { InventoryEvent, LootEvent } from "../../api/internal/types";
import { ItemGrid } from "../osrs/items/ItemGrid";
import { NPC } from "../osrs/npc/NPC";
import { InventoryGrid } from "../osrs/items/InventoryGrid";

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

  useEffect(() => {
    if (!activeAccount) {
      return;
    }

    requestData(activeAccount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAccount]);

  const noData = inventoryApi.type === "data" && inventoryApi.data.length === 0;

  return (
    <>
      <LoadingOverlay visible={inventoryApi.type !== "data"} />
      <NoData hasData={!noData}>
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

            const data = inventoryApi.type === "data" ? inventoryApi.data : [];

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
        <InventoryGrid entries={selectedEntry?.entries ?? []} />
      </NoData>
    </>
  );
};
