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
import { StatCard } from "../../stats/StatCard";
import { XPTopStats } from "./XPTopStats";
import { FancyCheckbox } from "../../osrs/skills/FancyCheckbox";
import { SkillFancyCheckbox } from "../../osrs/skills/SkillFancyCheckbox";

const totalSelectedSkillSet = new Set(["xpTotal"]);

export const XPPage: React.FC<{}> = () => {
  const { setSelectedTimespan } = useStore((state) => state.shared);
  const {
    displayDeltas,
    selectedSkills,
    setDisplayDeltas,
    toggleSelectAllSkills,
    toggleSelectedTotalSkills,
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

    return [...ALL_SKILLS, "xpTotal" as const].map((skill, i) => ({
      data: xpData.map((item) => [
        item.timestamp,
        item[skill] - (displayDeltas ? initialValue[skill] : 0),
      ]),
    }));
  }, [displayDeltas, xpData, activityData]);

  const markArea = useMemo(
    (): MarkAreaComponentOption | undefined =>
      activityData
        ? {
            data: activityData.map((activity) => [
              {
                xAxis: activity.startTimestamp,
              },
              { xAxis: activity.endTimestamp },
            ]),
          }
        : undefined,
    [activityData]
  );

  const onZoom = useMemo(
    () =>
      debounce((startValue: number, endValue: number) => {
        setSelectedTimespan(Math.round(startValue), Math.round(endValue));
      }, 250),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const onMarkAreaClick = useCallback(
    (_: number, markIndex: number) => {
      if (!activityData) {
        return;
      }

      const activity = activityData[markIndex];

      primaryChartRef.current?.dispatchAction({
        type: "dataZoom",
        startValue: activity.startTimestamp,
        endValue: activity.endTimestamp,
      });
    },
    [activityData]
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
      <XPTopStats />
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
                selectedSkills.type === "set"
                  ? selectedSkills.set
                  : totalSelectedSkillSet
              }
              options={primaryChartOptions}
              markArea={markArea}
              height={600}
              onZoom={onZoom}
              onMarkAreaClick={onMarkAreaClick}
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
              checked={selectedSkills.set.size === ALL_SKILLS.length}
              onChange={(event) =>
                toggleSelectAllSkills(event.currentTarget.checked)
              }
              label="Select all"
            />
          </div>
          <div className={classes.allSkills}>
            <SkillFancyCheckbox
              title="Total XP"
              skill="overall"
              checked={selectedSkills.type === "totals"}
              onChange={toggleSelectedTotalSkills}
            />
            <AllSkills disable={selectedSkills.type === "totals"} />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

const useStyles = createStyles((theme) => ({
  allSkills: {
    width: 550,

    "& > div": {
      marginTop: theme.spacing.md,
    },
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
