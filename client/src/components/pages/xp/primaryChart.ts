import { ALL_SKILLS, SKILL_COLORS } from "../../../osrs/types";
import type {
  DefaultLabelFormatterCallbackParams,
  EChartsOption,
} from "echarts";

import {
  capitalizeFirstLetter,
  formatDatetimeNice,
  formatNumber,
} from "../../../util/string";
import { sharedChartOptions } from "../../charting/shared";

import "./xp.css";

export const primaryChartOptions: EChartsOption = {
  ...sharedChartOptions,
  series: [
    ...ALL_SKILLS.map((skill) => ({
      id: skill,
      name: skill,
      type: "line" as const,
      color: `#${SKILL_COLORS[skill]}`,
    })),
    {
      id: "xpTotal",
      type: "line",
    },
  ],
  tooltip: {
    trigger: "axis",
    formatter: (params) => {
      // We know this is an array because we have multiple series
      const arrayParams = params as DefaultLabelFormatterCallbackParams[];

      const timestamp = (arrayParams[0].data as number[])[0];
      const formatedDate = formatDatetimeNice(new Date(timestamp));

      const dataIndex = arrayParams[0].dataIndex;

      const items = arrayParams
        .map((param) => {
          const [, y] = param.data as number[];
          return `<div><div>${capitalizeFirstLetter(
            param.seriesId!
          )}: ${formatNumber(y)}</div><hr style="background-color: ${
            param.color
          }"></div>`;
        })
        .join("");

      return `<div class="xpTooltip"><div>${timestamp} + ${dataIndex}</div><div>${formatedDate}</div><div class="xpTooltipItems">${items}</div></div>`;
    },
  },
  yAxis: {
    ...sharedChartOptions.yAxis,

    name: "Current XP",
  },
};
