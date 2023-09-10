import { useEffect, useMemo } from "react";
import { LoadingOverlay, createStyles } from "@mantine/core";
import Chart from "react-apexcharts";

import { useStore } from "../../store/store";
import { FixedSeries } from "../../types/ApexCharts";
import { ApexOptions } from "apexcharts";
import { NoData } from "../error/NoData";
import { Timeline } from "react-svg-timeline";
import { LootEvent } from "../../api/internal/types";
import { InventoryGrid } from "../osrs/inventory/InventoryGrid";
import { NPC } from "../osrs/npc/NPC";

export const LootPage: React.FC<{}> = () => {
  const activeAccount = useStore((state) => state.accounts.activeId);
  const {
    selectedEntry,
    api: lootApi,
    requestData,
    setSelectedEntry,
  } = useStore((state) => state.loot);

  // const chartData = useMemo((): FixedSeries => {
  //   if (lootApi.type !== "data") {
  //     return [];
  //   }

  //   return [
  //     {
  //       name: "loot",
  //       data: lootApi.data.map((event) => [event.timestamp, 1]),
  //     },
  //   ];
  // }, [lootApi]);

  const chartData = useMemo(() => {
    if (lootApi.type !== "data") {
      return [];
    }

    return lootApi.data.map((event) => ({
      laneId: "0",
      eventId: `${event.timestamp}`,
      startTimeMillis: event.timestamp,
    }));
  }, [lootApi]);

  useEffect(() => {
    if (!activeAccount) {
      return;
    }

    requestData(activeAccount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAccount]);

  const noData = lootApi.type === "data" && lootApi.data.length === 0;

  return (
    <>
      <LoadingOverlay visible={lootApi.type !== "data"} />
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

            const data = lootApi.type === "data" ? lootApi.data : [];

            let lastEvent: LootEvent | undefined = undefined;
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
        {!!selectedEntry && <NPC id={selectedEntry.npcId} />}
        <InventoryGrid
          itemIds={selectedEntry?.entries.map((entry) => entry.itemId) ?? []}
        />
      </NoData>
    </>
  );
};

const useStyles = createStyles((theme) => ({}));

const options: ApexOptions = {
  chart: {
    height: "200px",
  },
  xaxis: {
    type: "datetime",
    title: {
      text: "Timestamp",
    },
  },
};
