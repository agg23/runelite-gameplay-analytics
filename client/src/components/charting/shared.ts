import { EChartsOption } from "echarts";
import { yAxisMinSelector } from "./util";
import { formatDateToParts, formatDatetimeNice } from "../../util/string";

export const sharedChartOptions: EChartsOption = {
  animation: false,
  dataZoom: [
    {
      type: "slider",
      start: 0,
      end: 10,
      // Any filtering results in lines not drawing
      filterMode: "none",
      labelFormatter: (value, string): string => {
        if (value > 1000000000) {
          // There will never be this many datapoints. This must be an actual Unix timestamp
          return formatDatetimeNice(new Date(value));
        }

        if (!string) {
          return "";
        }

        // This must be a category, so the string has our timestamp
        const number = parseInt(string, 10);
        return formatDatetimeNice(new Date(number));
      },
    },
  ],
  grid: {
    top: 30,
    left: 70,
    // For some reason without this padding the right edge is cut off
    right: 10,
    bottom: 86,
  },
  legend: {
    show: false,
  },
  tooltip: {
    trigger: "axis",
  },
  xAxis: {
    type: "time",
    axisLabel: {
      formatter: (value: any, _index: number) => {
        // Value could be string or number
        const number = typeof value === "string" ? parseInt(value, 10) : value;
        const { hourString, dateString } = formatDateToParts(new Date(number));
        return `${hourString}\n${dateString}`;
      },
    },
  },
  yAxis: {
    type: "value",

    nameLocation: "middle",
    nameGap: 50,

    min: yAxisMinSelector,
  },
};
