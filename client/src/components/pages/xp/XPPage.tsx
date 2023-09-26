import React, { useEffect, useMemo, useRef } from "react";
import { Checkbox, LoadingOverlay } from "@mantine/core";
import type {
  EChartsOption,
  EChartsType,
  MarkAreaComponentOption,
  MarkLineComponentOption,
} from "echarts";
import { startOfDay } from "date-fns";

import { useStore } from "store/store";
import { AllSkills } from "components/osrs/skills/AllSkills";
import { ALL_SKILLS } from "../../../osrs/types";
import { EChart } from "../../charting/EChart";
import { useActivityQuery } from "../../../api/hooks/useDatatypeQuery";
import { ActivityEvent } from "../../../api/internal/types";
import { ActivityNavigator } from "./ActivityNavigator";
import { XPTopStats } from "./XPTopStats";
import { SkillFancyCheckbox } from "../../osrs/skills/SkillFancyCheckbox";
import { ChartPage } from "../../layout/ChartPage";
import { primaryChartOptions } from "./primaryChart";
import { useCombinedXPActivity } from "./hooks/useCombinedXPActivity";
import { formatDatetimeNice } from "../../../util/string";
import { useDataZoom } from "./hooks/useDataZoom";
import { useXPCallbacks } from "./hooks/useXPCallbacks";
import { useSeriesData } from "./hooks/useSeriesData";

import classes from "./XPPage.module.scss";
import { XPTable } from "./XPTable";

const totalSelectedSkillSet = new Set(["xpTotal"]);

export const XPPage: React.FC<{}> = () => {
  const { timespan } = useStore((state) => state.shared);
  const {
    displayDeltas,
    showOnlyPlaytime,
    selectedSkills,
    setDisplayDeltas,
    setShowOnlyPlaytime,
    toggleSelectAllSkills,
    toggleSelectedTotalSkills,
  } = useStore((state) => state.xp);

  const { data: activityData } = useActivityQuery();

  const { data: activityAndXPData, isLoading: isOverallLoading } =
    useCombinedXPActivity();

  const primaryChartRef = useRef<echarts.ECharts>(null);

  const { series: seriesData, markerIndexes } = useSeriesData(
    activityAndXPData,
    displayDeltas
  );

  const dataZoomOptions = useDataZoom(seriesData);
  const { onZoom, onDatePickerSelect, onMarkAreaClick, onMarkLineClick } =
    useXPCallbacks(
      primaryChartRef,
      seriesData,
      activityData,
      activityAndXPData
    );

  const options = useMemo((): EChartsOption => {
    return showOnlyPlaytime
      ? {
          ...primaryChartOptions,
          // dataZoomOptions contains all of dataZoom data, not just the updated zoom
          dataZoom: dataZoomOptions,
          xAxis: {
            ...primaryChartOptions.xAxis,
            type: "category",
          },
        }
      : {
          ...primaryChartOptions,
          dataZoom: dataZoomOptions,
        };
  }, [showOnlyPlaytime, dataZoomOptions]);

  const validDayTimestamps = useMemo(() => {
    const set = new Set<number>();

    if (!activityData) {
      return set;
    }

    for (const activity of activityData) {
      const start = startOfDay(activity.startTimestamp).getTime();
      const end = startOfDay(activity.endTimestamp).getTime();

      set.add(start);
      set.add(end);
    }

    return set;
  }, [activityData]);

  const zoomedDayTimestamp = useMemo(
    () => (!!timespan ? startOfDay(timespan.start).getTime() : undefined),
    [timespan]
  );

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

  useEffect(() => {
    // Select the starting range on first load to be the first activity + space to make it 3 hours
    // TODO: This does not work for only playtime
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
                validDayTimestamps={validDayTimestamps}
                zoomedDayTimestamp={zoomedDayTimestamp}
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
            {/* TODO: This isn't used */}
            {/* <ActivityNavigator
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
            /> */}
            <XPTable activityAndXPData={activityAndXPData} />
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
