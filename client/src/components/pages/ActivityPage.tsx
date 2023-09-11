import { useEffect, useMemo } from "react";
import { useStore } from "../../store/store";
import { Timeline } from "react-svg-timeline";
import { ActivityEvent } from "../../api/internal/types";
import { LoadingErrorBoundary } from "../error/LoadingErrorBoundary";

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
  }, [activeAccount, requestData]);

  return (
    <LoadingErrorBoundary data={api}>
      {(data) => (
        <>
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
        </>
      )}
    </LoadingErrorBoundary>
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
