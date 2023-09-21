import { useMemo } from "react";
import { LoadingOverlay, createStyles } from "@mantine/core";
import { ErrorBoundary } from "react-error-boundary";

import { useStore } from "../../store/store";
import { Timeline } from "react-svg-timeline";
import { LootEvent } from "../../api/internal/types";
import { NPC } from "../osrs/npc/NPC";
import { useLootQuery } from "../../api/hooks/useDatatypeQuery";

export const LootPage: React.FC<{}> = () => {
  const { selectedEntry, setSelectedEntry } = useStore((state) => state.loot);

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

  const query = useLootQuery();

  const chartData = useMemo(() => {
    if (!query.isSuccess) {
      return [];
    }

    return query.data.map((event) => ({
      laneId: "0",
      eventId: `${event.timestamp}`,
      startTimeMillis: event.timestamp,
    }));
  }, [query]);

  return (
    <ErrorBoundary fallback={<div>An error occured</div>}>
      <LoadingOverlay visible={query.isLoading} />
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
      {!!selectedEntry && <NPC id={selectedEntry.npcId} />}
      {/* <ItemGrid
          itemIds={selectedEntry?.entries.map((entry) => entry.itemId) ?? []}
        /> */}
    </ErrorBoundary>
  );
};

const useStyles = createStyles((theme) => ({}));
