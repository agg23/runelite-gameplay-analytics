import type { SeriesOption } from "echarts";
import { useMemo } from "react";
import { XPEvent } from "api/internal/types";
import { ALL_SKILLS, Skill } from "src/osrs/types";
import { ActivityWithXP } from "./useCombinedXPActivity";

export const useSeriesData = (
  activityAndXPData: ActivityWithXP[],
  displayDeltas: boolean
) => {
  return useMemo(() => {
    console.log("reload series");
    if (activityAndXPData.length < 1) {
      return {
        series: [],
        markerIndexes: [],
      };
    }

    const trimmedXPEvents: XPEvent[] = [];

    const markerIndexes: number[] = [];

    for (const activity of activityAndXPData) {
      markerIndexes.push(trimmedXPEvents.length);

      trimmedXPEvents.push(...activity.xpData);
    }

    const lastValue = trimmedXPEvents[trimmedXPEvents.length - 1];

    const currentTime = Date.now();

    const calculateValue = (
      currentDatapoint: XPEvent,
      lastDatapoint: XPEvent | undefined,
      skill: Skill | "xpTotal"
    ): number => {
      const currentValue = currentDatapoint[skill];

      if (currentValue === 0) {
        // No matter what, return 0
        return 0;
      }

      return (
        currentValue -
        (displayDeltas ? lastDatapoint?.[skill] ?? currentValue : 0)
      );
    };

    const series = [...ALL_SKILLS, "xpTotal" as const].map(
      (skill): SeriesOption => {
        const seriesData: Array<[number, number]> = [];

        let lastItem: XPEvent | undefined = undefined;

        for (const item of trimmedXPEvents) {
          const value = calculateValue(item, lastItem, skill);
          seriesData.push([item.timestamp, value]);
          lastItem = item;
        }

        // Only insert this datapoint if there has been no data for 5 minutes
        const insertBlankDatapoint =
          currentTime - lastValue.timestamp > 5 * 60 * 1000;

        return {
          // The category markLines don't work without this type
          type: "line",
          name: skill,
          data: insertBlankDatapoint
            ? [
                ...seriesData,
                [currentTime, calculateValue(lastValue, lastValue, skill)],
              ]
            : seriesData,
        };
      }
    );

    return {
      series,
      markerIndexes,
    };
  }, [displayDeltas, activityAndXPData]);
};
