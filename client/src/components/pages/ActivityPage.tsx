import { useEffect, useMemo } from "react";
import { useStore } from "../../store/store";
import { LoadingOverlay } from "@mantine/core";
import { NoData } from "../error/NoData";
import { Timeline } from "react-svg-timeline";
import { ActivityEvent } from "../../api/internal/types";

export const ActivityPage: React.FC<{}> = () => {
  const activeAccount = useStore((state) => state.accounts.activeId);
  const { api, selectedEntry, requestData, setSelectedEntry } = useStore(
    (state) => state.activity
  );

  const chartData = useMemo(() => {
    if (api.type !== "data") {
      return [];
    }

    return api.data.map((event) => ({
      laneId: "0",
      eventId: `${event.startTimestamp}`,
      startTimeMillis: event.startTimestamp,
      endTimeMillis: event.endTimestamp,
    }));
  }, [api]);

  useEffect(() => {
    if (!activeAccount) {
      return;
    }

    requestData(activeAccount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAccount]);

  const noData = api.type === "data" && api.data.length === 0;

  return (
    <>
      <LoadingOverlay visible={api.type !== "data"} />
      <NoData hasData={!noData}>
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

            const data = api.type === "data" ? api.data : [];

            let lastEvent: ActivityEvent | undefined = undefined;
            for (const event of data) {
              if (event.startTimestamp > cursor) {
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
        <div>Selected: {selectedEntry?.startTimestamp}</div>
      </NoData>
    </>
  );
};
