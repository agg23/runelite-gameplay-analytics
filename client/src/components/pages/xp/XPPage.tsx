import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Checkbox, LoadingOverlay, createStyles } from "@mantine/core";
import type {
  EChartsType,
  MarkAreaComponentOption,
  SeriesOption,
} from "echarts";
import { ErrorBoundary } from "react-error-boundary";

import { useStore } from "../../../store/store";
import { AllSkills } from "../../osrs/skills/AllSkills";
import { ALL_SKILLS } from "../../../osrs/types";
import { usePrimaryChartOptions } from "./primaryChart";
import { EChart } from "../../external/EChart";
import {
  useActivityQuery,
  useXPQuery,
} from "../../../api/hooks/useDatatypeQuery";
import { ActivityEvent } from "../../../api/internal/types";
import { ActivityNavigator } from "./ActivityNavigator";
import { debounce } from "../../../util/util";

export const XPPage: React.FC<{}> = () => {
  const { timespan, setSelectedTimespan } = useStore((state) => state.shared);
  const {
    displayDeltas,
    selectedSkills,
    setDisplayDeltas,
    toggleSelectedSkills,
    delayedSetChartRange,
  } = useStore((state) => state.xp);
  const primaryChartOptions = usePrimaryChartOptions();

  const { data: xpData, isLoading: isXPLoading } = useXPQuery();
  const { data: activityData, isSuccess: activitySuccess } = useActivityQuery();

  const primaryChartRef = useRef<echarts.ECharts>(null);

  const seriesData = useMemo((): SeriesOption[] => {
    console.log("reload series");
    if (!xpData || !activityData || xpData.length < 1) {
      return [];
    }

    const initialValue = xpData[0];

    return ALL_SKILLS.map((skill) => ({
      data: xpData.map((item) => [
        item.timestamp,
        item[skill] - (displayDeltas ? initialValue[skill] : 0),
      ]),
      markArea: {
        data: activityData.map((activity) => [
          {
            xAxis: activity.startTimestamp,
          },
          { xAxis: activity.endTimestamp },
        ]),
      } as MarkAreaComponentOption,
    }));
  }, [displayDeltas, xpData, activityData]);

  const onZoom = useCallback(
    (startValue: number, endValue: number) => {
      setSelectedTimespan(Math.round(startValue), Math.round(endValue));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    if (!activityData || activityData.length < 1) {
      return;
    }

    let lastActivity: ActivityEvent | undefined = undefined;

    for (let i = activityData.length - 1; i >= 0; i--) {
      const activity = activityData[i];

      if (activity.endTimestamp - activity.startTimestamp >= 2000 * 60) {
        // Skip sessions less than 5 minutes
        lastActivity = activity;
        break;
      }
    }

    if (!lastActivity) {
      return;
    }

    selectActivitySpan(lastActivity, primaryChartRef.current);
  }, [activityData]);

  const { classes } = useStyles();

  return (
    <ErrorBoundary fallback={<div>An error occured</div>}>
      <LoadingOverlay visible={isXPLoading} />
      <div className={classes.chartSettings}>
        <Checkbox
          checked={displayDeltas}
          onChange={(event) => setDisplayDeltas(event.currentTarget.checked)}
          label="Display deltas"
        />
      </div>
      <div className={classes.chartWrapper}>
        <div>
          <div>
            <EChart
              ref={primaryChartRef}
              data={seriesData}
              activeSeries={
                selectedSkills.type === "set" ? selectedSkills.set : new Set()
              }
              options={primaryChartOptions}
              height={600}
              onZoom={debounce(onZoom, 250)}
            />
          </div>
          <ActivityNavigator
            activityCount={activityData?.length ?? 0}
            onChange={(newActivityIndex) => {
              if (!activitySuccess) {
                return;
              }

              selectActivitySpan(
                activityData[newActivityIndex],
                primaryChartRef.current
              );
            }}
          />
        </div>
        <div className={classes.chartSettings}>
          <div className={classes.chartManualSettings}>
            <Checkbox
              checked={selectedSkills.type === "all"}
              onChange={(event) =>
                toggleSelectedSkills(event.currentTarget.checked)
              }
              label="Select all"
            />
          </div>
          <div className={classes.allSkills}>
            <AllSkills />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

const useStyles = createStyles((theme) => ({
  allSkills: {
    width: 550,
  },
  chartSettings: {
    margin: theme.spacing.md,
  },
  chartManualSettings: {
    marginBottom: theme.spacing.md,
  },
  chartWrapper: {
    display: "grid",
    gridTemplateColumns: "1fr 550px",
    columnGap: theme.spacing.md,
    height: 600,
    padding: theme.spacing.md,
  },
}));

const selectActivitySpan = (
  activity: ActivityEvent,
  chart: EChartsType | null
) => {
  const difference = activity.endTimestamp - activity.startTimestamp;

  const THREE_HOUR = 3 * 60 * 60 * 1000;

  if (difference >= THREE_HOUR) {
    // Just render that entire span
    chart?.dispatchAction({
      type: "dataZoom",
      startValue: activity.startTimestamp,
      endValue: activity.endTimestamp,
    });
    return;
  }

  chart?.dispatchAction({
    type: "dataZoom",
    startValue: activity.startTimestamp + difference / 2 - THREE_HOUR / 2,
    endValue: activity.endTimestamp - difference + THREE_HOUR / 2,
  });
};
