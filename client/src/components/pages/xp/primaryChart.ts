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
      animation: false,
      grid: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
      },
      series: ALL_SKILLS.map((skill) => ({
        id: skill,
        type: "line",
        color: `#${SKILL_COLORS[skill]}`,
      })),
      tooltip: {
        trigger: "axis",
        formatter: (params) => {
          // We know this is an array because we have multiple series
          const arrayParams = params as DefaultLabelFormatterCallbackParams[];

          console.log(arrayParams);
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
      },
    }),
    []
  );
