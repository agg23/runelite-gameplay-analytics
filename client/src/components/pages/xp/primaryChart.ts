import { useMemo } from "react";
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

import "./xp.css";

export const usePrimaryChartOptions = () =>
  useMemo(
    (): EChartsOption => ({
      dataZoom: [
        {
          type: "slider",
          start: 0,
          end: 10,
          // Any filtering results in lines not drawing
          filterMode: "none",
        },
      ],
      animation: false,
      grid: {
        top: 10,
        left: 70,
        // For some reason without this padding the right edge is cut off
        right: 10,
      },
      series: [
        ...ALL_SKILLS.map((skill) => ({
          id: skill as string,
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

          const items = arrayParams
            .map((param) => {
              const [_, y] = param.data as number[];
              return `<div><div>${capitalizeFirstLetter(
                param.seriesId!
              )}: ${formatNumber(y)}</div><hr style="background-color: ${
                param.color
              }"></div>`;
            })
            .join("");

          return `<div class="xpTooltip"><div>${formatedDate}</div><div class="xpTooltipItems">${items}</div></div>`;
        },
      },
      xAxis: {
        type: "time",
      },
      yAxis: {
        type: "value",

        name: "Current XP",
        nameLocation: "middle",
        nameGap: 50,

        min: ({ min, max }) => {
          // Instead of always having 0 in focus, focus around the current level
          const difference = max - min;
          const percentageDistance = difference * 0.1;
          const actualDistance =
            percentageDistance < 10 ? 10 : percentageDistance;

          const bottom = Math.round(min - actualDistance);
          return bottom > 0 ? bottom : 0;
        },
      },
    }),
    []
  );
