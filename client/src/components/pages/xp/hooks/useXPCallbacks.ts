import { ActivityEvent } from "api/internal/types";
import type { EChartsType, SeriesOption } from "echarts";
import { RefObject, useMemo, useRef } from "react";
import { throttle } from "src/util/util";
import { useStore } from "store/store";
import { ActivityWithXP } from "./useCombinedXPActivity";

export const useXPCallbacks = (
  primaryChartRef: RefObject<EChartsType>,
  seriesData: SeriesOption[],
  activityData: ActivityEvent[] | undefined,
  activityAndXPData: ActivityWithXP[]
) => {
  const { setSelectedTimespan } = useStore((state) => state.shared);
  const { showOnlyPlaytime } = useStore((state) => state.xp);

  const zoomSelectionBugHackRef = useRef<
    | {
        startValue: number;
        endValue: number;
      }
    | undefined
  >(undefined);

  const onZoom = useMemo(
    () =>
      throttle((startValue: number, endValue: number) => {
        if (startValue === endValue) {
          // Weird zero edgecase. Prevent this transform
          if (!zoomSelectionBugHackRef.current) {
            // Can't do anything
            return;
          }

          primaryChartRef.current?.dispatchAction({
            type: "dataZoom",
            startValue: zoomSelectionBugHackRef.current.startValue,
            endValue: zoomSelectionBugHackRef.current.endValue,
          });

          return;
        }

        if (showOnlyPlaytime) {
          // Categories, so we are indexing the data
          if (seriesData.length < 1) {
            return;
          }

          // We can just look in the first series; we just need the timestamp
          const start = (seriesData[0].data as Array<[number, number]>)[
            startValue
          ][0];

          const end = (seriesData[0].data as Array<[number, number]>)[
            endValue
          ][0];

          setSelectedTimespan(start, end);
        } else {
          setSelectedTimespan(Math.round(startValue), Math.round(endValue));
        }

        // Save the last valid zoom selection if the chart decides to zoom to 0 selection
        // A little weird to do this in a memo, but it _is_ a hack...
        zoomSelectionBugHackRef.current = {
          startValue,
          endValue,
        };
      }, 250),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [seriesData, showOnlyPlaytime]
  );

  const onDatePickerSelect = (date: Date) => {
    const timestamp = date.getTime();

    if (showOnlyPlaytime) {
      // Need to find closest datapoints
      const closestDatapointIndexTo = (
        timestamp: number,
        closestAbove: boolean
      ) => {
        if (activityAndXPData.length < 1) {
          return undefined;
        }

        const firstSeriesData = seriesData[0].data as Array<[number, number]>;

        if (closestAbove) {
          // Iterate from bottom, find first node that's higher
          for (let i = 0; i < firstSeriesData.length; i++) {
            const entry = firstSeriesData[i];

            if (entry[0] >= timestamp) {
              return i;
            }
          }
        } else {
          // Iterate from top, find first node that's lower
          for (let i = firstSeriesData.length - 1; i >= 0; i--) {
            const entry = firstSeriesData[i];

            if (entry[0] <= timestamp) {
              return i;
            }
          }
        }

        return undefined;
      };

      // First entry at or above the timestamp
      const lowerBound = closestDatapointIndexTo(timestamp, true);
      // First entry at or below the end timestamp
      const upperBound = closestDatapointIndexTo(
        timestamp + 24 * 60 * 60 * 1000,
        false
      );

      if (lowerBound !== undefined && upperBound !== undefined) {
        primaryChartRef.current?.dispatchAction({
          type: "dataZoom",
          startValue: lowerBound,
          endValue: upperBound,
        });
      }
    } else {
      // Just jump to the timestamp
      primaryChartRef.current?.dispatchAction({
        type: "dataZoom",
        startValue: timestamp,
        endValue: timestamp + 24 * 60 * 60 * 1000,
      });
    }
  };

  const onMarkAreaClick = (_: number, markIndex: number) => {
    if (!activityData) {
      return;
    }

    const activity = activityData[markIndex];

    primaryChartRef.current?.dispatchAction({
      type: "dataZoom",
      startValue: activity.startTimestamp,
      endValue: activity.endTimestamp,
    });
  };

  const onMarkLineClick = (xIndex: number) => {
    for (let i = 0; i < activityAndXPData.length; i++) {
      const { activity, eventStartIndex } = activityAndXPData[i];

      if (eventStartIndex === xIndex) {
        if (showOnlyPlaytime) {
          // Use indexes
          let endIndex = 0;
          if (i + 1 >= activityAndXPData.length) {
            endIndex =
              activityAndXPData[i].eventStartIndex +
              activityAndXPData[i].xpData.length -
              1;
          } else {
            endIndex = activityAndXPData[i + 1].eventStartIndex;
          }

          primaryChartRef.current?.dispatchAction({
            type: "dataZoom",
            startValue: eventStartIndex,
            endValue: endIndex,
          });
        } else {
          // Use actual activity bounds
          primaryChartRef.current?.dispatchAction({
            type: "dataZoom",
            startValue: activity.startTimestamp,
            endValue: activity.endTimestamp,
          });
        }
      }
    }
  };

  return {
    onZoom,
    onDatePickerSelect,
    onMarkAreaClick,
    onMarkLineClick,
  };
};
