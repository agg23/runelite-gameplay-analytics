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
import { useActivityQuery } from "../../../api/hooks/useDatatypeQuery";
import { ActivityEvent, XPEvent } from "../../../api/internal/types";
import { ActivityNavigator } from "./ActivityNavigator";
import { debounce } from "../../../util/util";
import { XPTopStats } from "./XPTopStats";
import { SkillFancyCheckbox } from "../../osrs/skills/SkillFancyCheckbox";
import { ChartPage } from "../../layout/ChartPage";
import { primaryChartOptions } from "./primaryChart";
import { useCombinedXPActivity } from "./hooks/useCombinedXPActivity";
import { formatDatetimeNice } from "../../../util/string";

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

  // const { data: xpData, isLoading: isXPLoading } = useXPQuery();
  const { data: activityData, isSuccess: activitySuccess } = useActivityQuery();

  const { data, isLoading: isOverallLoading } = useCombinedXPActivity();

  const primaryChartRef = useRef<echarts.ECharts>(null);

  const { classes, theme } = useStyles();
  const textColor = theme.colorScheme === "dark" ? theme.white : theme.black;

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

  const { series: seriesData, markerIndexes } = useMemo(() => {
    console.log("reload series");
    if (data.length < 1) {
      return {
        series: [],
        markerIndexes: [],
      };
    }

    const trimmedXPEvents: XPEvent[] = [];

    const markerIndexes: number[] = [];

    for (const entry of data) {
      markerIndexes.push(trimmedXPEvents.length);

      trimmedXPEvents.push(...entry.xpData);
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
  }, [displayDeltas, data]);

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

  const markLine = useMemo(
    (): MarkLineComponentOption | undefined =>
      markerIndexes.length > 0
        ? {
            data: markerIndexes.map((xAxis) => ({
              xAxis,
              label: {
                color: textColor,
                formatter: (params) => {
                  const index: number = (params.data as any).coord[0];

                  const firstSeries = seriesData[0].data as Array<
                    [number, number]
                  >;

                  const timestamp = firstSeries[index][0];
                  return `Session\n${formatDatetimeNice(new Date(timestamp))}`;
                },
                textBorderColor: textColor,
              },
            })),
            symbol: ["none", "none"],
          }
        : undefined,
    [seriesData, markerIndexes, textColor]
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

  const onMarkLineClick = useCallback(
    (xIndex: number) => {
      for (let i = 0; i < data.length; i++) {
        const { eventStartIndex } = data[i];

        if (eventStartIndex === xIndex) {
          const nextEvent = i + 1 < data.length ? data[i + 1] : undefined;

          if (!nextEvent) {
            return;
          }

          primaryChartRef.current?.dispatchAction({
            type: "dataZoom",
            startValue: eventStartIndex,
            endValue: nextEvent.eventStartIndex,
          });
          return;
        }
      }

      for (const { activity, eventStartIndex } of data) {
        if (eventStartIndex === xIndex) {
          primaryChartRef.current?.dispatchAction({
            type: "dataZoom",
            startValue: activity.startTimestamp,
            endValue: activity.endTimestamp,
          });
          return;
        }
      }
    },
    [data]
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

  return (
    <>
      <LoadingOverlay visible={isOverallLoading} />
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
                markLine={markLine}
                height={600}
                onZoom={onZoom}
                onMarkAreaClick={onMarkAreaClick}
                onMarkLineClick={onMarkLineClick}
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
