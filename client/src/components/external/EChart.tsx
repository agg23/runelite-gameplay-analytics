import {
  MutableRefObject,
  forwardRef,
  useEffect,
  useMemo,
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
import "echarts/lib/component/markLine";

interface EChartProps {
  options: EChartsOption;

  data?: SeriesOption | SeriesOption[];
  activeSeries?: Set<string>;
  markArea?: MarkAreaComponentOption | undefined;
  markLine?: MarkLineComponentOption | undefined;

  height?: number | string;

  onZoom?: (startValue: number, endValue: number) => void;
  onMarkAreaClick?: (xAxis: number, markIndex: number) => void;
  onMarkLineClick?: (xIndex: number) => void;
}

export const EChart = forwardRef<echarts.ECharts, EChartProps>(
  (
    {
      options,
      data,
      activeSeries,
      markArea,
      markLine,
      height,
      onMarkAreaClick,
      onMarkLineClick,
      onZoom,
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

    const { series, seriesNames } = useMemo(() => {
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

      // We purposefully don't update options.series, just using the initial value
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeSeries, markArea, markLine, data]);

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
      <div
        ref={elementRef}
        style={{
          height,
        }}
      ></div>
    );
  }
);
