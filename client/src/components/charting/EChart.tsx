import {
  MutableRefObject,
  forwardRef,
  useEffect,
  useRef,
  useState,
} from "react";
import * as echarts from "echarts";
import type {
  SeriesOption,
  EChartsOption,
  InsideDataZoomComponentOption,
  ECElementEvent,
  DataZoomComponentOption,
  MarkAreaComponentOption,
  MarkLineComponentOption,
} from "echarts";
import { ZoomClickVariant, ZoomControls } from "./ZoomControls";
import { useSeriesWithMarkings } from "./hooks/useSeriesWithMarkings";

import classes from "./EChart.module.scss";
import { assertUnreachable } from "../../util/error";

interface EChartProps {
  options: EChartsOption;

  data?: SeriesOption | SeriesOption[];
  activeSeries?: Set<string>;
  validDayTimestamps?: Set<number>;
  markArea?: MarkAreaComponentOption | undefined;
  markLine?: MarkLineComponentOption | undefined;

  /**
   * If true, show only the `All` option in the chart's zoom buttons
   */
  showZoomOnlyAll?: boolean;

  height?: number | string;

  onZoom?: (startValue: number, endValue: number) => void;
  onDatePickerSelect?: (date: Date) => void;
  onMarkAreaClick?: (xAxis: number, markIndex: number) => void;
  onMarkLineClick?: (xIndex: number) => void;
}

export const EChart = forwardRef<echarts.ECharts, EChartProps>(
  (
    {
      options,
      data,
      activeSeries,
      validDayTimestamps,
      markArea,
      markLine,
      showZoomOnlyAll,
      height,
      onZoom,
      onDatePickerSelect,
      onMarkAreaClick,
      onMarkLineClick,
    },
    ref
  ) => {
    const elementRef = useRef<HTMLDivElement>(null);

    const internalRef = useRef<echarts.ECharts>(
      null
    ) as MutableRefObject<echarts.ECharts | null>;
    const typedRef = ref as MutableRefObject<echarts.ECharts | null> | null;
    // Track when ref has the chart object
    const [isChartSet, setIsChartSet] = useState(false);

    const { series, seriesNames } = useSeriesWithMarkings(
      data,
      activeSeries,
      markArea,
      markLine
    );

    const onZoomClick = (variant: ZoomClickVariant) => {
      if (series.length < 1) {
        return;
      }

      const data = series[0].data as Array<[number, number]>;

      if (data.length < 1) {
        return;
      }

      const firstTimestamp = data[0][0];
      const lastTimestamp = data[data.length - 1][0];

      const totalPeriodInData = lastTimestamp - firstTimestamp;

      const oldDataZoom: InsideDataZoomComponentOption | undefined = (
        internalRef.current?.getOption().dataZoom as any
      )?.[0];

      const dynamicZoom = (zoomIn: boolean) => {
        if (
          !oldDataZoom ||
          oldDataZoom.start === undefined ||
          oldDataZoom.end === undefined
        ) {
          return;
        }

        const directionMultiplier = zoomIn ? -1 : 1;

        const distance = oldDataZoom.end - oldDataZoom.start;

        let delta: number;

        if (distance > 20) {
          delta = 10;
        } else {
          delta = distance * 0.4;
        }

        let start: number;
        let end: number;

        if (oldDataZoom.end >= 99 && oldDataZoom.start > 1) {
          // If end bound is within 1% of trailing edge, and start bound is not within 1% of leading edge,
          // keep the zoom locked to that edge
          start = oldDataZoom.start - delta * directionMultiplier;
          end = 100;
        } else {
          start = oldDataZoom.start - (delta / 2) * directionMultiplier;
          end = oldDataZoom.end + (delta / 2) * directionMultiplier;
        }

        internalRef.current?.dispatchAction({
          type: "dataZoom",
          start: Math.max(start, 0),
          end: Math.min(end, 100),
        });

        return;
      };

      let desiredTimepan = 0;
      switch (variant) {
        case "all": {
          desiredTimepan = totalPeriodInData;
          break;
        }
        case "zoomout": {
          dynamicZoom(false);
          return;
        }
        case "zoomin": {
          dynamicZoom(true);
          return;
        }
        case "1d": {
          desiredTimepan = 24 * 60 * 60 * 1000;
          break;
        }
        case "1w": {
          desiredTimepan = 7 * 24 * 60 * 60 * 1000;
          break;
        }
        case "1m": {
          desiredTimepan = 30 * 24 * 60 * 60 * 1000;
          break;
        }
        default: {
          desiredTimepan = assertUnreachable(variant);
        }
      }

      const percentOfTotal = (desiredTimepan / totalPeriodInData) * 100;
      let centerPercentOfTotal;

      if (
        oldDataZoom &&
        oldDataZoom.start !== undefined &&
        oldDataZoom.end !== undefined
      ) {
        if (oldDataZoom.end >= 99) {
          // If end bound is within 1% of trailing edge, keep the zoom locked to that edge
          centerPercentOfTotal = 100 - percentOfTotal / 2;
        } else {
          centerPercentOfTotal =
            oldDataZoom.start + (oldDataZoom.end - oldDataZoom.start) / 2;
        }
      } else {
        // No existing zoom for some reason
        // Snap to trailing edge
        centerPercentOfTotal = 100 - percentOfTotal / 2;
      }

      const lowerBound = centerPercentOfTotal - percentOfTotal / 2;
      const underfill = lowerBound < 0 ? -lowerBound : 0;

      const upperBound = centerPercentOfTotal + percentOfTotal / 2;
      const overfill = upperBound > 100 ? upperBound - 100 : 0;

      internalRef.current?.dispatchAction({
        type: "dataZoom",
        start:
          percentOfTotal === 100
            ? 0
            : // If we went off of the trailing edge, subtract that lost length here
              Math.max(lowerBound - overfill, 0),
        end:
          percentOfTotal === 100
            ? 100
            : // If we went off of the leading edge, add that lost length here
              Math.min(upperBound + underfill, 100),
      });
    };

    useEffect(() => {
      console.log(
        "Attempting data render with",
        Array.isArray(series) && series.length
      );

      if (!series) {
        return;
      }

      // Calculate zoom position
      const oldDataZoom: InsideDataZoomComponentOption | undefined = (
        internalRef.current?.getOption().dataZoom as any
      )?.[0];

      const oldSeries = internalRef.current?.getOption().series as
        | SeriesOption
        | SeriesOption[]
        | undefined;

      const getSeriesBounds = (
        series: SeriesOption | SeriesOption[] | undefined
      ) => {
        const singleSeriesData: Array<[number, number]> | undefined =
          Array.isArray(series)
            ? series.length > 0
              ? series[0].data
              : undefined
            : (series?.data as any);

        if (!singleSeriesData || singleSeriesData.length < 1) {
          return undefined;
        }

        const startTimestamp = singleSeriesData[0][0];
        const endTimestamp = singleSeriesData[singleSeriesData.length - 1][0];

        return {
          start: startTimestamp,
          end: endTimestamp,
        };
      };

      const oldSeriesBounds = getSeriesBounds(oldSeries);

      let dataZoom: DataZoomComponentOption | undefined = undefined;

      const oldZoomStartValue = oldDataZoom?.startValue as number | undefined;
      const oldZoomEndValue = oldDataZoom?.endValue as number | undefined;

      if (
        oldZoomStartValue !== undefined &&
        oldZoomEndValue !== undefined &&
        oldSeriesBounds
      ) {
        const existingZoomDuration = oldZoomEndValue - oldZoomStartValue;

        if (
          oldSeriesBounds.end !== 0 &&
          oldZoomEndValue >= oldSeriesBounds.end - 60 * 1000
        ) {
          // If previous zoom was within 1 minute of the old end, we want to slide with it on new data
          const newSeriesBounds = getSeriesBounds(series);

          const endTimestamp = newSeriesBounds?.end ?? oldSeriesBounds.end;

          dataZoom = {
            startValue: endTimestamp - existingZoomDuration,
            endValue: endTimestamp,
          };
        } else {
          // Hold zoom static
          dataZoom = {
            startValue: oldZoomStartValue,
            endValue: oldZoomEndValue,
          };
        }
      }

      const legendMap: {
        [name: string]: boolean;
      } = {};

      if (!!activeSeries) {
        // Build legend visible map
        for (const name of seriesNames) {
          if (!name) {
            continue;
          }

          legendMap[name] = activeSeries.has(name as string);
        }
      }

      // Maybe should use echartsInstance.appendData (they say it's for millions of points though)
      internalRef.current?.setOption({
        series,
        dataZoom,
        legend: {
          selected: legendMap,
        },
      });

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [series, seriesNames, activeSeries, isChartSet]);

    useEffect(() => {
      const handle = () => {
        const dataZoom: InsideDataZoomComponentOption | undefined = (
          internalRef.current?.getOption().dataZoom as any
        )?.[0];

        if (
          dataZoom?.startValue === undefined ||
          dataZoom?.endValue === undefined
        ) {
          return;
        }

        onZoom?.(dataZoom.startValue as number, dataZoom.endValue as number);
      };

      if (onZoom) {
        internalRef.current?.on("dataZoom", handle);
      }

      return () => {
        internalRef.current?.off("dataZoom", handle);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onZoom, isChartSet]);

    useEffect(() => {
      const handler = (event: ECElementEvent) => {
        if (event.componentType === "markArea") {
          onMarkAreaClick?.((event.data as any).xAxis, event.dataIndex);
        } else if (event.componentType === "markLine") {
          onMarkLineClick?.(event.value as number);
        }
      };

      if (onMarkAreaClick) {
        internalRef.current?.on("click", handler);
      }

      return () => {
        internalRef.current?.off("click", handler);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onMarkAreaClick, onMarkLineClick, isChartSet]);

    useEffect(() => {
      internalRef.current?.setOption(options);
    }, [options]);

    useEffect(() => {
      const chart = echarts.init(elementRef.current);
      console.log("Created", chart.id);
      internalRef.current = chart;

      if (typedRef) {
        typedRef.current = chart;
      }

      setIsChartSet(true);

      chart.setOption(options);

      return () => {
        console.log("Disposing", chart.id);
        chart.dispose();
        internalRef.current = null;

        if (typedRef) {
          typedRef.current = null;
        }
      };
      // Don't react to changed options
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <div className={classes.chartWrapper}>
        <ZoomControls
          className={classes.controls}
          showOnlyAll={showZoomOnlyAll}
          validDayTimestamps={validDayTimestamps}
          onZoomClick={onZoomClick}
          onDatePickerSelect={onDatePickerSelect}
        />
        <div
          ref={elementRef}
          style={{
            height,
          }}
        ></div>
      </div>
    );
  }
);
