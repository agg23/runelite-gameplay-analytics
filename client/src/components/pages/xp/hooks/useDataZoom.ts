import type { DataZoomComponentOption, SeriesOption } from "echarts";
import { useEffect, useMemo } from "react";
import { useStore } from "store/store";
import { primaryChartOptions } from "../primaryChart";

export const useDataZoom = (seriesData: SeriesOption[]) => {
  const { setSelectedTimespan } = useStore((state) => state.shared);
  const { showOnlyPlaytime } = useStore((state) => state.xp);

  const { options, newTimespan } = useMemo((): {
    options: DataZoomComponentOption | undefined;
    newTimespan: { start: number; end: number } | undefined;
  } => {
    if (seriesData.length < 1) {
      return { options: undefined, newTimespan: undefined };
    }

    // We can't react to changes in this, otherwise we'd constantly be updating options
    const timespan = useStore.getState().shared.timespan;

    const firstSeries = seriesData[0];
    const data = firstSeries.data as Array<[number, number]>;

    type BoundValue =
      | {
          value: number | undefined;
          timestamp: number | undefined;
        }
      | undefined;

    let startValue: BoundValue = timespan
      ? { value: timespan.start, timestamp: timespan.start }
      : undefined;
    let endValue: BoundValue = timespan
      ? {
          value: timespan.end,
          timestamp: timespan.end,
        }
      : undefined;

    if (timespan && showOnlyPlaytime) {
      let playtimeStart: BoundValue = undefined;
      let playtimeEnd: BoundValue = undefined;

      for (let i = 0; i < data.length; i++) {
        const [timestamp, _] = data[i];

        if (playtimeStart === undefined && timespan.start <= timestamp) {
          playtimeStart = {
            value: i,
            timestamp,
          };
        } else if (timespan.end >= timestamp) {
          // Keep track of the highest in range index we found
          playtimeEnd = {
            value: i,
            timestamp,
          };
        }
      }

      if (
        playtimeStart !== undefined &&
        playtimeEnd !== undefined &&
        playtimeStart.value !== playtimeEnd.value
      ) {
        startValue = playtimeStart;
        endValue = playtimeEnd;
      }
    }

    return {
      options: {
        ...primaryChartOptions.dataZoom,
        start: undefined,
        end: undefined,
        startValue: startValue?.value,
        endValue: endValue?.value,
      },
      newTimespan:
        !!startValue?.timestamp && !!endValue?.timestamp
          ? {
              start: startValue.timestamp,
              end: endValue.timestamp,
            }
          : undefined,
    };
  }, [showOnlyPlaytime, seriesData]);

  useEffect(() => {
    if (!newTimespan) {
      return;
    }

    setSelectedTimespan(newTimespan.start, newTimespan.end);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newTimespan]);

  return options;
};
