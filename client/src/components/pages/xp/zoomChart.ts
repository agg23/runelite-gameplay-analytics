import { ApexOptions } from "apexcharts";
import { useMemo } from "react";

import { ALL_SKILLS } from "../../../osrs/types";

export const useZoomChartOptions = (
  startRangeTimestamp: number,
  endRangeTimestamp: number,
  setChartRange: (start: number, end: number) => void
): ApexOptions =>
  useMemo(
    () => ({
      chart: {
        id: "zoom",
        type: "area",
        height: 130,
        animations: {
          enabled: false,
        },
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
          // selection: (_, { xaxis }) => {
          //   const chart = ApexCharts.getChartByID("primary");
          //   if (!chart) {
          //     return;
          //   }
          //   chart.zoomX(xaxis.min, xaxis.max);
          // },
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
      series: ALL_SKILLS.map((skill) => ({
        name: skill,
        data: [],
      })),
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
