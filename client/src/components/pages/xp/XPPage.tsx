import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { Checkbox, LoadingOverlay, createStyles } from "@mantine/core";
import type {
  EChartsType,
  MarkAreaComponentOption,
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
    selectedSkills,
    setDisplayDeltas,
    toggleSelectAllSkills,
    toggleSelectedTotalSkills,
  } = useStore((state) => state.xp);

  const { data: xpData, isLoading: isXPLoading } = useXPQuery();
  const { data: activityData, isSuccess: activitySuccess } = useActivityQuery();

  const primaryChartRef = useRef<echarts.ECharts>(null);

  const seriesData = useMemo((): SeriesOption[] => {
    console.log("reload series");
    if (!xpData || !activityData || xpData.length < 1) {
      return [];
    }

    const initialValue = xpData[0];
    const lastValue = xpData[xpData.length - 1];

    const currentTime = Date.now();

    // Only insert this datapoint if there has been no data for 5 minutes
    const insertBlankDatapoint =
      currentTime - lastValue.timestamp > 5 * 60 * 1000;

    const calculateValue = (
      datapoint: XPEvent,
      skill: Skill | "xpTotal"
    ): number => datapoint[skill] - (displayDeltas ? initialValue[skill] : 0);

    return [...ALL_SKILLS, "xpTotal" as const].map((skill) => {
      const data = xpData.map((item) => [
        item.timestamp,
        calculateValue(item, skill),
      ]);

      return {
        data: insertBlankDatapoint
          ? [...data, [currentTime, calculateValue(lastValue, skill)]]
          : data,
      };
    });
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
    <>
      <LoadingOverlay visible={isXPLoading} />
      <XPTopStats />
      <div className={classes.chartSettings}>
        <Checkbox
          checked={displayDeltas}
          onChange={(event) => setDisplayDeltas(event.currentTarget.checked)}
          label="Display deltas"
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
