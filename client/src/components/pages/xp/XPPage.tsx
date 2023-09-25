import React, { useEffect, useMemo, useRef } from "react";
import { Checkbox, LoadingOverlay } from "@mantine/core";
import type {
  EChartsOption,
  EChartsType,
  MarkAreaComponentOption,
  MarkLineComponentOption,
  SeriesOption,
} from "echarts";

import { useStore } from "store/store";
import { AllSkills } from "components/osrs/skills/AllSkills";
import { ALL_SKILLS, Skill } from "../../../osrs/types";
import { EChart } from "../../charting/EChart";
import { useActivityQuery } from "../../../api/hooks/useDatatypeQuery";
import { ActivityEvent, XPEvent } from "../../../api/internal/types";
import { ActivityNavigator } from "./ActivityNavigator";
import { throttle } from "../../../util/util";
import { XPTopStats } from "./XPTopStats";
import { SkillFancyCheckbox } from "../../osrs/skills/SkillFancyCheckbox";
import { ChartPage } from "../../layout/ChartPage";
import { primaryChartOptions } from "./primaryChart";
import { useCombinedXPActivity } from "./hooks/useCombinedXPActivity";
import { formatDatetimeNice } from "../../../util/string";

import classes from "./XPPage.module.scss";

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

  const { data: activityData, isSuccess: activitySuccess } = useActivityQuery();

  const { data: activityAndXPData, isLoading: isOverallLoading } =
    useCombinedXPActivity();

  const primaryChartRef = useRef<echarts.ECharts>(null);

  const options = useMemo((): EChartsOption => {
    return showOnlyPlaytime
      ? {
          ...primaryChartOptions,
          xAxis: {
            ...primaryChartOptions.xAxis,
            type: "category",
          },
        }
      : primaryChartOptions;
  }, [showOnlyPlaytime]);

  const { series: seriesData, markerIndexes } = useMemo(() => {
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
                color: "var(--mantine-color-text)",
                formatter: (params) => {
                  const index: number = (params.data as any).coord[0];

                  const firstSeries = seriesData[0].data as Array<
                    [number, number]
                  >;

                  const timestamp = firstSeries[index][0];
                  return `Session\n${formatDatetimeNice(new Date(timestamp))}`;
                },
                textBorderColor: "var(--mantine-color-text)",
              },
            })),
            symbol: ["none", "none"],
          }
        : undefined,
    [seriesData, markerIndexes]
  );

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

        // TODO: Handle empty cases

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

      console.log(lowerBound, upperBound);

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
      const { eventStartIndex } = activityAndXPData[i];

      if (eventStartIndex === xIndex) {
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
        return;
      }
    }

    for (const { activity, eventStartIndex } of activityAndXPData) {
      if (eventStartIndex === xIndex) {
        primaryChartRef.current?.dispatchAction({
          type: "dataZoom",
          startValue: activity.startTimestamp,
          endValue: activity.endTimestamp,
        });
        return;
      }
    }
  };

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
                showZoomOnlyAll={showOnlyPlaytime}
                height={600}
                onZoom={onZoom}
                onDatePickerSelect={onDatePickerSelect}
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
