import { useMemo } from "react";
import {
  useActivityQuery,
  useXPQuery,
} from "../../../../api/hooks/useDatatypeQuery";
import { useStore } from "../../../../store/store";
import { ALL_SKILLS, Skill } from "../../../../osrs/types";

interface Timespan {
  start: number;
  end: number;
}

const useActiveTimespans = () => {
  const { data: activities } = useActivityQuery();
  const activeTimespan = useStore((state) => state.shared.timespan);

  return useMemo(() => {
    if (!activeTimespan || !activities) {
      return [];
    }

    let foundSpans: Timespan[] = [];

    for (const activity of activities) {
      if (
        activity.startTimestamp > activeTimespan.end ||
        activity.endTimestamp < activeTimespan.start
      ) {
        // Out of range
        continue;
      }

      // Truncate edges if they overrun
      const start =
        activity.startTimestamp < activeTimespan.start
          ? activeTimespan.start
          : activity.startTimestamp;

      const end =
        activity.endTimestamp > activeTimespan.end
          ? activeTimespan.end
          : activity.endTimestamp;

      foundSpans.push({
        start,
        end,
      });
    }

    return foundSpans;
  }, [activities, activeTimespan]);
};

const useActiveXPDatapoints = () => {
  const { data } = useXPQuery();
  const timespans = useActiveTimespans();

  const datapoints = useMemo(() => {
    if (!data || timespans.length < 1) {
      return [];
    }

    const start = timespans[0].start;
    const end = timespans[timespans.length - 1].end;

    return data.filter(
      // Add 1s buffer around values
      ({ timestamp }) => timestamp >= start - 1000 && timestamp <= end + 1000
    );
  }, [data, timespans]);

  return {
    datapoints,
    timespans,
  };
};

interface UseXPStats {
  totalGain: number;
  averageGainPerMinute: number;
  maxSkill: Skill | undefined;
}

export const useXPStats = () => {
  const { datapoints, timespans } = useActiveXPDatapoints();

  return useMemo((): UseXPStats => {
    if (datapoints.length < 1) {
      return {
        totalGain: 0,
        averageGainPerMinute: 0,
        maxSkill: undefined,
      };
    }

    const firstPoint = datapoints[0];
    const lastPoint = datapoints[datapoints.length - 1];

    const totalGain = lastPoint.xpTotal - firstPoint.xpTotal;

    const durationSec =
      timespans.reduce(
        (acc, timespan) => acc + timespan.end - timespan.start,
        0
      ) / 1000;
    // const duration = data[data.length - 1].timestamp - data[0].timestamp;

    const averageGainPerMinute = totalGain / (durationSec / 60);

    let maxSkill: Skill | undefined = undefined;
    let maxSkillAmount = 0;

    for (const skill of ALL_SKILLS) {
      const total = lastPoint[skill] - firstPoint[skill];

      if (total > maxSkillAmount) {
        maxSkill = skill;
        maxSkillAmount = total;
      }
    }

    return {
      totalGain,
      averageGainPerMinute,
      maxSkill,
    };
  }, [datapoints, timespans]);
};
