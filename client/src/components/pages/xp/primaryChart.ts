import { useMemo } from "react";
import * as echarts from "echarts";

import { ALL_SKILLS } from "../../../osrs/types";

export const usePrimaryChartOptions = () =>
  useMemo(
    (): echarts.EChartsOption => ({
      tooltip: {
        trigger: "axis",
      },
      grid: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
      },
      animation: false,
      series: ALL_SKILLS.map((skill) => ({
        name: skill,
        type: "line",
      })),
      xAxis: {
        type: "time",
      },
      yAxis: {
        type: "value",
      },
      dataZoom: [
        {
          type: "inside",
          start: 0,
          end: 10,
          // Any filtering results in lines not drawing
          filterMode: "none",
        },
        {
          start: 0,
          end: 10,
        },
      ],
    }),
    []
  );
