import React, { useEffect, useMemo, useRef, useState } from "react";
import { Checkbox, LoadingOverlay, createStyles } from "@mantine/core";

import { useStore } from "../../store/store";
import { AllSkills } from "../osrs/skills/AllSkills";
import { XPEvent } from "../../api/internal/types";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { FixedSeries } from "../../types/ApexCharts";
import { LoadingErrorBoundary } from "../error/LoadingErrorBoundary";
import { ALL_SKILLS } from "../../osrs/types";
import { ApexChart } from "../external/ApexChart";
import { usePrevious } from "../../hooks/usePrevious";

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
      console.log("Sending", updatedSeries[0].data[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xpApi, previousDataRef]);

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
              <Chart
                type="area"
                series={linechartData as ApexAxisChartSeries}
                options={zoomChartOptions}
                height="130"
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

const usePrimaryChartOptions = (
  startRangeTimestamp: number,
  endRangeTimestamp: number
): ApexOptions => {
  return useMemo(
    () => ({
      chart: {
        id: "primary",
        type: "line",
        height: "600px",
        toolbar: {
          autoSelected: "pan",
          show: false,
        },
        zoom: {
          autoScaleYaxis: true,
          // Zoom disabled until I can figure out what to do with it
          enabled: false,
        },
      },
      annotations: {
        yaxis: [
          {
            y: 83,
            label: {
              text: "Level 2",
            },
          },
          {
            y: 174,
            label: {
              text: "Level 3",
            },
          },
          {
            y: 276,
            label: {
              text: "Level 4",
            },
          },
          {
            y: 388,
            label: {
              text: "Level 5",
            },
          },
          {
            y: 512,
            label: {
              text: "Level 6",
            },
          },
          {
            y: 650,
            label: {
              text: "Level 7",
            },
          },
        ],
      },
      series: ALL_SKILLS.map((skill) => ({
        name: skill,
        data: [],
      })),
      xaxis: {
        type: "datetime",
        title: {
          text: "Timestamp",
        },
        // min: startRangeTimestamp,
        // max: endRangeTimestamp,
      },
      yaxis: {
        title: {
          text: "XP",
        },
      },
    }),
    []
  );
};

const useZoomChartOptions = (
  startRangeTimestamp: number,
  endRangeTimestamp: number,
  setChartRange: (start: number, end: number) => void
): ApexOptions => {
  return useMemo(
    () => ({
      chart: {
        id: "zoom",
        type: "area",
        brush: {
          target: "primary",
          enabled: true,
        },
        offsetY: -40,
        selection: {
          enabled: true,
          // xaxis: {
          //   min: startRangeTimestamp,
          //   max: endRangeTimestamp,
          // },
        },
        events: {
          selection: (_, { xaxis }) => {
            const chart = ApexCharts.getChartByID("primary");

            if (!chart) {
              return;
            }

            chart.zoomX(xaxis.min, xaxis.max);
          },
          // brushScrolled: (_, { xaxis }) => {
          //   // setChartRange(xaxis.min, xaxis.max);
          //   const chart = ApexCharts.getChartByID("primary");

          //   if (!chart) {
          //     return;
          //   }

          //   chart.zoomX(xaxis.min, xaxis.max);
          // },
        },
      },
      colors: ["#008FFB"],
      fill: {
        type: "gradient",
        gradient: {
          type: "vertical",
          opacityFrom: 0.7,
          opacityTo: 0.9,
          stops: [0, 90, 100],
        },
      },
      grid: {
        show: false,
      },
      legend: {
        show: false,
      },
      xaxis: {
        type: "datetime",
        tooltip: {
          enabled: false,
        },
      },
      yaxis: {
        labels: {
          show: false,
        },
      },
    }),
    // [startRangeTimestamp, endRangeTimestamp]
    []
  );
};
