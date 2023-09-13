import { useMemo } from "react";
import { useStore } from "../../store/store";
import { Timeline } from "react-svg-timeline";
import { ActivityEvent } from "../../api/internal/types";
import { useActivityQuery } from "../../api/hooks/useDatatypeQuery";
import { ErrorBoundary } from "react-error-boundary";
import { LoadingOverlay } from "@mantine/core";

export const ActivityPage: React.FC<{}> = () => {
  const { selectedEntry, setSelectedEntry } = useStore(
    (state) => state.activity
  );

  const query = useActivityQuery();

  const chartData = useMemo(() => {
    if (!query.isSuccess) {
      return [];
    }

    return query.data.map((event) => ({
      laneId: "0",
      eventId: `${event.startTimestamp}`,
      startTimeMillis: event.startTimestamp,
      endTimeMillis: event.endTimestamp,
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

          let lastEvent: ActivityEvent | undefined = undefined;
          for (const event of query.data ?? []) {
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
    </ErrorBoundary>
  );
};

// interface ActivityPageContentProps {
//   data: ActivityEvent[];
// }

// const ActivityPageContent: React.FC<ActivityPageContentProps> = ({ data }) => {
//   return (
//     <>
//       <Timeline
//         events={chartData}
//         lanes={[
//           {
//             laneId: "0" as string,
//             label: "",
//           },
//         ]}
//         dateFormat={(ms) => new Date(ms).toLocaleString()}
//         onCursorMove={(cursor) => {
//           if (!cursor) {
//             return;
//           }

//           const data = api.type === "data" ? api.data : [];

//           let lastEvent: ActivityEvent | undefined = undefined;
//           for (const event of data) {
//             if (event.startTimestamp > cursor) {
//               setSelectedEntry(lastEvent);
//               return;
//             }

//             lastEvent = event;
//           }

//           setSelectedEntry(lastEvent);
//         }}
//         height={200}
//         width={400}
//       />
//       <div>Selected: {selectedEntry?.startTimestamp}</div>
//     </>
//   );
// };
