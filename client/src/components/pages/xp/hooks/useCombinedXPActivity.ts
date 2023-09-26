import { useMemo } from "react";
import {
  useActivityQuery,
  useXPQuery,
} from "../../../../api/hooks/useDatatypeQuery";
import {
  ActivityEvent,
  XPEvent,
  eventEquals,
} from "../../../../api/internal/types";

export interface ActivityWithXP {
  activity: ActivityEvent;
  eventStartIndex: number;
  xpData: XPEvent[];
}

export const useCombinedXPActivity = () => {
  const { data: xpData, isLoading: isXPLoading } = useXPQuery();
  const { data: activityData, isLoading: isActivityLoading } =
    useActivityQuery();

  const data = useMemo((): ActivityWithXP[] => {
    if (
      !xpData ||
      xpData.length < 1 ||
      !activityData ||
      activityData.length < 1
    ) {
      return [];
    }

    const activities: ActivityWithXP[] = [];

    let lastEvent: XPEvent | undefined = undefined;

    let i = 0;
    let totalEventCount = 0;
    for (const activity of activityData) {
      while (
        i < xpData.length &&
        xpData[i].timestamp < activity.startTimestamp
      ) {
        // Reject datapoints
        i += 1;
      }

      const events: XPEvent[] = [];

      while (
        i < xpData.length &&
        xpData[i].timestamp >= activity.startTimestamp &&
        xpData[i].timestamp <= activity.endTimestamp
      ) {
        // Consume datapoints
        const event = xpData[i];

        if (!!lastEvent && !eventEquals(event, lastEvent)) {
          // Only use this value if it has some sort of new data
          events.push(event);
        }
        lastEvent = event;

        i += 1;
      }

      // We're done, following activity will start from here
      if (events.length !== 0) {
        activities.push({
          activity,
          eventStartIndex: totalEventCount,
          xpData: events,
        });

        totalEventCount += events.length;
      }
    }

    return activities;
  }, [xpData, activityData]);

  return {
    data,
    isLoading: isXPLoading || isActivityLoading,
  };
};
