import { EChartsOption } from "echarts";
import { yAxisMinSelector } from "./util";

export const sharedChartOptions: EChartsOption = {
  animation: false,
  dataZoom: [
    {
      type: "slider",
      start: 0,
      end: 10,
      // Any filtering results in lines not drawing
      filterMode: "none",
    },
  ],
  grid: {
    top: 30,
    left: 70,
    // For some reason without this padding the right edge is cut off
    right: 10,
  },
  legend: {
    show: false,
  },
  tooltip: {
    trigger: "axis",
  },
  xAxis: {
    type: "time",
  },
  yAxis: {
    type: "value",

    nameLocation: "middle",
    nameGap: 50,

    min: yAxisMinSelector,
  },
};
