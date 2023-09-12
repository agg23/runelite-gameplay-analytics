import React, { useEffect, useMemo, useRef, useState } from "react";
import { Checkbox, LoadingOverlay, createStyles } from "@mantine/core";

import { useStore } from "../../../store/store";
import { AllSkills } from "../../osrs/skills/AllSkills";
import { XPEvent } from "../../../api/internal/types";
import { FixedSeries } from "../../../types/ApexCharts";
import { LoadingErrorBoundary } from "../../error/LoadingErrorBoundary";
import { ALL_SKILLS } from "../../../osrs/types";
import { ApexChart } from "../../external/ApexChart";
import { usePrevious } from "../../../hooks/usePrevious";
import { usePrimaryChartOptions } from "./primaryChart";
import { useZoomChartOptions } from "./zoomChart";

export const XPPage: React.FC<{}> = () => {
  const activeAccount = useStore((state) => state.accounts.activeId);
  const { api: xpApi, requestData } = useStore((state) => state.xp);
  const {
    displayDeltas,
    selectedSkills,
    setDisplayDeltas,
    toggleSelectedSkills,
    delayedSetChartRange,
  } = useStore((state) => state.xp);
  const { startRangeTimestamp, endRangeTimestamp } = useStore(
    (state) => state.xp.chart
  );

  const primaryChartRef = useRef<ApexCharts | null>(null);
  const zoomChartRef = useRef<ApexCharts | null>(null);

  const linechartData = useLinechartData();

  // const formatDate = useMemo(
  //   () => (value: Date) => format(value, "E eo, h:m a"),
  //   []
  // );

  // const tooltipFormatter = useMemo(
  //   () =>
  //     ({ point }: PointTooltipProps) => {
  //       const date = formatDate(point.data.x as Date);
  //       const deltaAddition = displayDeltas ? "+" : "";

  //       // TODO: Add commas
  //       return (
  //         <div>
  //           <div>
  //             {deltaAddition}
  //             {point.data.y as number} XP
  //           </div>
  //           <div>{date}</div>
  //         </div>
  //       );
  //     },
  //   [displayDeltas, formatDate]
  // );

  const previousDataRef = usePrevious(xpApi.type);

  useEffect(() => {
    if (previousDataRef !== xpApi.type && xpApi.type === "data") {
      // Fresh load of data
      const updatedSeries = ALL_SKILLS.map((skill) => ({
        data: xpApi.data.map((item) => [item.timestamp, item[skill]]),
      }));
      primaryChartRef.current?.appendData(updatedSeries);
      zoomChartRef.current?.appendData(updatedSeries);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xpApi, previousDataRef]);

  const previousSelectedSkills = usePrevious(selectedSkills);

  useEffect(() => {
    // TODO: Handle all
    if (
      selectedSkills.type === "set" &&
      !!previousSelectedSkills &&
      previousSelectedSkills.type === "set"
    ) {
      const presentSkills = new Set<string>();

      previousSelectedSkills.set.forEach((skill) => presentSkills.add(skill));

      ALL_SKILLS.forEach((skill) => {
        if (presentSkills.has(skill) && !selectedSkills.set.has(skill)) {
          // Removed
          primaryChartRef.current?.hideSeries(skill);
        } else if (!presentSkills.has(skill) && selectedSkills.set.has(skill)) {
          // Added
          primaryChartRef.current?.showSeries(skill);
        }
      });
    }
  }, [selectedSkills]);

  const primaryChartOptions = usePrimaryChartOptions(
    startRangeTimestamp,
    endRangeTimestamp
  );

  const zoomChartOptions = useZoomChartOptions(
    startRangeTimestamp,
    endRangeTimestamp,
    delayedSetChartRange
  );

  useEffect(() => {
    if (!activeAccount) {
      return;
    }

    requestData(activeAccount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAccount]);

  const { classes } = useStyles();

  return (
    <LoadingErrorBoundary data={xpApi}>
      {(_) => (
        <>
          <div className={classes.chartSettings}>
            <Checkbox
              checked={displayDeltas}
              onChange={(event) =>
                setDisplayDeltas(event.currentTarget.checked)
              }
              label="Display deltas"
            />
          </div>
          <div className={classes.chartWrapper}>
            <div>
              {/* <Chart
                series={linechartData as ApexAxisChartSeries}
                options={primaryChartOptions}
                height="600"
              /> */}
              <ApexChart
                ref={primaryChartRef}
                initialData={linechartData as ApexAxisChartSeries}
                options={primaryChartOptions}
              />
              {/* <Chart
                type="area"
                series={linechartData as ApexAxisChartSeries}
                options={zoomChartOptions}
                height="130"
              /> */}
              <ApexChart
                ref={zoomChartRef}
                initialData={linechartData as ApexAxisChartSeries}
                options={zoomChartOptions}
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
        </>
      )}
    </LoadingErrorBoundary>
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

const useLinechartData = () => {
  const xpApi = useStore((state) => state.xp.api);
  const { selectedSkills, displayDeltas } = useStore((state) => state.xp);

  return useMemo((): FixedSeries => {
    if (xpApi.type !== "data") {
      return [];
    }

    const eventFields: Array<Exclude<keyof XPEvent, "accountId">> = [];

    // if (selectedSkills.type === "all") {
    //   eventFields.push("xpTotal");
    // } else {
    //   eventFields.push(...selectedSkills.set);
    // }
    eventFields.push(...ALL_SKILLS);

    return eventFields.map((fieldName) => {
      // If we display deltas, get the first (which is by definition the lowest) value and subtract
      const baseValue =
        displayDeltas && xpApi.data.length > 0 ? xpApi.data[0][fieldName] : 0;

      return {
        name: fieldName,
        data: xpApi.data.map(
          (event) =>
            [event.timestamp, event[fieldName] - baseValue] as [number, number]
        ),
      };
    });
  }, [selectedSkills]);
};
