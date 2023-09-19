import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { Checkbox, LoadingOverlay, createStyles } from "@mantine/core";
import type {
  EChartsOption,
  EChartsType,
  MarkAreaComponentOption,
  MarkLineComponentOption,
  SeriesOption,
} from "echarts";

import { useStore } from "../../../store/store";
import { AllSkills } from "../../osrs/skills/AllSkills";
import { ALL_SKILLS, Skill } from "../../../osrs/types";
import { EChart } from "../../external/EChart";
import {
  useActivityQuery,
  useXPQuery,
} from "../../../api/hooks/useDatatypeQuery";
import { ActivityEvent, XPEvent } from "../../../api/internal/types";
import { ActivityNavigator } from "./ActivityNavigator";
import { debounce } from "../../../util/util";
import { XPTopStats } from "./XPTopStats";
import { SkillFancyCheckbox } from "../../osrs/skills/SkillFancyCheckbox";
import { ChartPage } from "../../layout/ChartPage";
import { primaryChartOptions } from "./primaryChart";

const totalSelectedSkillSet = new Set(["xpTotal"]);

export const XPPage: React.FC<{}> = () => {
  const { setSelectedTimespan } = useStore((state) => state.shared);
  const {
    displayDeltas,
    showOnlyPlaytime,
    selectedSkills,
    setDisplayDeltas,
    setShowOnlyPlaytime,
    toggleSelectAllSkills,
    toggleSelectedTotalSkills,
  } = useStore((state) => state.xp);

  const { data: xpData, isLoading: isXPLoading } = useXPQuery();
  const { data: activityData, isSuccess: activitySuccess } = useActivityQuery();

  const primaryChartRef = useRef<echarts.ECharts>(null);

  const options = useMemo((): EChartsOption => {
    return showOnlyPlaytime
      ? {
          ...primaryChartOptions,
          xAxis: {
            type: "category",
          },
        }
      : primaryChartOptions;
  }, [showOnlyPlaytime]);

  const seriesData = useMemo((): SeriesOption[] => {
    console.log("reload series");
    if (!xpData || xpData.length < 1) {
      return [];
    }

    const lastValue = xpData[xpData.length - 1];

    const currentTime = Date.now();

    // Only insert this datapoint if there has been no data for 5 minutes
    const insertBlankDatapoint =
      currentTime - lastValue.timestamp > 5 * 60 * 1000;

    const calculateValue = (
      currentDatapoint: XPEvent,
      lastDatapoint: XPEvent | undefined,
      skill: Skill | "xpTotal"
    ): number =>
      currentDatapoint[skill] -
      (displayDeltas ? lastDatapoint?.[skill] ?? currentDatapoint[skill] : 0);

    return [...ALL_SKILLS, "xpTotal" as const].map((skill) => {
      const data: [number, number][] = [];

      let lastItem: XPEvent | undefined = undefined;
      for (const item of xpData) {
        if (
          displayDeltas &&
          !!lastItem &&
          item.timestamp - (lastItem.timestamp ?? item.timestamp) >
            7 * 60 * 1000 &&
          item[skill] !== 0
        ) {
          // If there's greater than a 7 minute gap, insert a synthetic 0 event
          data.push([lastItem.timestamp + 5 * 60 * 1000, 0]);
        }

        data.push([item.timestamp, calculateValue(item, lastItem, skill)]);
        lastItem = item;
      }

      return {
        // The category markLines don't work without this type
        type: "line",
        data: insertBlankDatapoint
          ? [
              ...data,
              [currentTime, calculateValue(lastValue, lastValue, skill)],
            ]
          : data,
        markLine: {
          data: [
            // TODO: Add break lines
            { xAxis: 200 },
          ],
        },
      };
    });
  }, [displayDeltas, xpData]);

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
    <>
      <LoadingOverlay visible={isXPLoading} />
      <XPTopStats />
      <div className={classes.chartSettings}>
        <Checkbox
          checked={displayDeltas}
          onChange={(event) => setDisplayDeltas(event.currentTarget.checked)}
          label="Display gain rates"
        />
        <Checkbox
          checked={showOnlyPlaytime}
          onChange={(event) => setShowOnlyPlaytime(event.currentTarget.checked)}
          label="Display only playtime"
        />
      </div>
      <ChartPage
        chart={
          <>
            <div>
              <EChart
                ref={primaryChartRef}
                data={seriesData}
                activeSeries={
                  selectedSkills.type === "set"
                    ? selectedSkills.set
                    : totalSelectedSkillSet
                }
                options={options}
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
          </>
        }
        chartSettings={
          <>
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
          </>
        }
      />
    </>
  );
};

const useStyles = createStyles((theme) => ({
  chartSettings: {
    margin: theme.spacing.md,
  },
  chartManualSettings: {
    marginBottom: theme.spacing.md,
  },
  allSkills: {
    width: 550,

    "& > div": {
      marginTop: theme.spacing.md,
    },
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
