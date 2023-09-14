import type { EChartsOption } from "echarts";
import { sharedChartOptions } from "../../charting/shared";

export const primaryChartOptions: EChartsOption = {
  ...sharedChartOptions,
  series: [
    {
      id: "inventory",
      name: "Inventory",
      type: "line",
    },
    {
      id: "bank",
      name: "Bank",
      type: "line",
    },
    {
      id: "total",
      name: "Total",
      type: "line",
    },
  ],
  xAxis: {
    type: "time",
  },
  yAxis: {
    ...sharedChartOptions.yAxis,

    name: "Wealth (gp)",
  },
};
