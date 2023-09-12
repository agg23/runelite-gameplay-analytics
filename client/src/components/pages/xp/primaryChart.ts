import { ApexOptions } from "apexcharts";
import { useMemo } from "react";

import { ALL_SKILLS } from "../../../osrs/types";

export const usePrimaryChartOptions = (
  startRangeTimestamp: number,
  endRangeTimestamp: number
): ApexOptions =>
  useMemo(
    () => ({
      chart: {
        id: "primary",
        type: "line",
        height: "600px",
        animations: {
          enabled: false,
        },
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
      dataLabels: {
        enabled: false,
      },
      series: ALL_SKILLS.map((skill): ApexAxisChartSeries[number] => ({
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
