import { useEffect, useMemo } from "react";
import { createStyles } from "@mantine/core";

import { useStore } from "../../store/store";
import { ApexOptions } from "apexcharts";
import { Timeline } from "react-svg-timeline";
import { LootEvent } from "../../api/internal/types";
import { NPC } from "../osrs/npc/NPC";
import { LoadingErrorBoundary } from "../error/LoadingErrorBoundary";

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

  return (
    <LoadingErrorBoundary data={lootApi}>
      {(data) => (
        <>
          {" "}
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
          {/* <ItemGrid
          itemIds={selectedEntry?.entries.map((entry) => entry.itemId) ?? []}
        /> */}
        </>
      )}
    </LoadingErrorBoundary>
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
