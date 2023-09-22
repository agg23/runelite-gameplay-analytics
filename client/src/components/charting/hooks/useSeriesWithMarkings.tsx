import { useMemo } from "react";
import type {
  MarkAreaComponentOption,
  MarkLineComponentOption,
  SeriesOption,
} from "echarts";

export const useSeriesWithMarkings = (
  data?: SeriesOption | SeriesOption[],
  activeSeries?: Set<string>,
  markArea?: MarkAreaComponentOption | undefined,
  markLine?: MarkLineComponentOption | undefined
) =>
  useMemo(() => {
    if (!data) {
      return { series: [], seriesNames: [] };
    }

    const seriesArray = Array.isArray(data)
      ? data
      : data !== undefined
      ? [data]
      : [];

    const series: SeriesOption[] = [];
    const seriesNames: Array<string | undefined> = [];
    let isFirst = true;

    for (const seriesItem of seriesArray) {
      const active = seriesItem.name
        ? activeSeries?.has(seriesItem.name as string)
        : false;

      series.push(
        isFirst && active
          ? {
              ...seriesItem,
              markLine,
              markArea,
            }
          : seriesItem
      );

      seriesNames.push(seriesItem.name as string);

      if (active) {
        isFirst = false;
      }
    }

    return {
      series,
      seriesNames,
    };
  }, [activeSeries, markArea, markLine, data]);
