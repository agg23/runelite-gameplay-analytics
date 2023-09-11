import React, { useEffect, useMemo } from "react";
import { Checkbox, LoadingOverlay, createStyles } from "@mantine/core";

import { useStore } from "../../store/store";
import { AllSkills } from "../osrs/skills/AllSkills";
import { XPEvent } from "../../api/internal/types";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { FixedSeries } from "../../types/ApexCharts";
import { LoadingErrorBoundary } from "../error/LoadingErrorBoundary";

export const XPPage: React.FC<{}> = () => {
  const activeAccount = useStore((state) => state.accounts.activeId);
  const { api: xpApi, requestData } = useStore((state) => state.xp);
  const {
    displayDeltas,
    selectedSkills,
    setDisplayDeltas,
    toggleSelectedSkills,
  } = useStore((state) => state.xp);

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
            {/* <ResponsiveLine
          data={linechartData}
          isInteractive
          useMesh
          enableCrosshair
          tooltip={tooltipFormatter}
          xScale={{ type: "time", precision: "minute" }}
          axisBottom={{
            // Mon 1st, 12:02 AM
            format: formatDate,
          }}
          margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
        /> */}
            <Chart
              series={linechartData as ApexAxisChartSeries}
              options={options}
              height="600"
            />
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

// const useLinechartData = () => {
//   const xpApi = useStore((state) => state.api.xp);
//   const { selectedSkills, displayDeltas } = useStore((state) => state.xp);

//   return useMemo(() => {
//     if (xpApi.type === "data") {
//       const eventFields: Array<keyof XPEvent> = [];

//       if (selectedSkills.type === "all") {
//         eventFields.push("xpTotal");
//       } else {
//         eventFields.push(...selectedSkills.set);
//       }

//       // TODO: Move this into its own memo?
//       const datedEntries = xpApi.data.map((event) => ({
//         date: new Date(event.timestamp),
//         ...event,
//       }));

//       return eventFields.map((fieldName) => {
//         // If we display deltas, get the first (which is by definition the lowest) value and subtract
//         const baseValue =
//           displayDeltas && datedEntries.length > 0
//             ? datedEntries[0][fieldName]
//             : 0;

//         return {
//           id: fieldName,
//           data: datedEntries.map((event) => ({
//             x: event.date,
//             y: event[fieldName] - baseValue,
//           })),
//         };
//       });
//     }

//     return [];
//   }, [selectedSkills, displayDeltas, xpApi]);
// };

const useLinechartData = () => {
  const xpApi = useStore((state) => state.xp.api);
  const { selectedSkills, displayDeltas } = useStore((state) => state.xp);

  return useMemo((): FixedSeries => {
    if (xpApi.type !== "data") {
      return [];
    }

    const eventFields: Array<Exclude<keyof XPEvent, "accountId">> = [];

    if (selectedSkills.type === "all") {
      eventFields.push("xpTotal");
    } else {
      eventFields.push(...selectedSkills.set);
    }

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
  }, [selectedSkills, displayDeltas, xpApi]);
};

const options: ApexOptions = {
  chart: {
    type: "line",
    height: "600px",
    zoom: {
      autoScaleYaxis: true,
      // Zoom disabled until I can figure out what to do with it
      enabled: false,
    },
    toolbar: {
      autoSelected: "pan",
      show: false,
    },
    // events: {
    //   beforeZoom: (chart, options) => {
    //     console.log(chart);
    //     console.log(options);
    //     console.log(options.xaxis.max - options.xaxis.min);
    //     // Allow zooming out to 10 minutes
    //     if (options.xaxis.max - options.xaxis.min < 10 * 60 * 1000) {
    //       // Block zoom
    //       console.log("Small");
    //       return {
    //         xaxis: {
    //           min: chart.minX,
    //           max: chart.maxX,
    //         },
    //       };
    //     }
    // },
    // },
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
  series: [],
  xaxis: {
    type: "datetime",
    title: {
      text: "Timestamp",
    },
  },
  yaxis: {
    title: {
      text: "XP",
    },
  },
};
