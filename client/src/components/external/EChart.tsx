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
} from "echarts";

interface EChartProps {
  options: EChartsOption;

  data?: SeriesOption | SeriesOption[];
  activeSeries?: Set<string>;

  height?: number | string;

  onZoom?: (startValue: number, endValue: number) => void;
  onMarkAreaClick?: (xAxis: number, markIndex: number) => void;
}

export const EChart = forwardRef<echarts.ECharts, EChartProps>(
  ({ options, data, activeSeries, height, onMarkAreaClick, onZoom }, ref) => {
    const elementRef = useRef<HTMLDivElement>(null);

    const typedRef = ref as MutableRefObject<echarts.ECharts | null>;
    // Track when ref has the chart object
    const [isChartSet, setIsChartSet] = useState(false);

    const series = useMemo(() => {
      if (!data) {
        return [];
      }

      if (Array.isArray(data) && activeSeries) {
        // Limit based on activeSeries
        if (
          !Array.isArray(options.series) ||
          data.length !== options.series.length
        ) {
          console.error(
            "Either your series options or your data doesn't match"
          );
          return;
        }

        let series: SeriesOption[] = [];
        for (let i = 0; i < data.length; i++) {
          const datum = data[i];
          const existingSeries = options.series[i];

          if (activeSeries.has(existingSeries.id as string)) {
            series.push(datum);
          } else {
            series.push({
              data: [],
            });
          }
        }

        // Maybe should use echartsInstance.appendData (they say it's for millions of points though)
        return series;
      } else {
        // Just set the data, nothing to do
        return data;
      }
      // We purposefully don't update options.series, just using the initial value
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeSeries, data]);

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
        typedRef.current?.getOption().dataZoom as any
      )?.[0];

      const oldSeries = typedRef.current?.getOption().series as
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

        if (!singleSeriesData) {
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

      // Maybe should use echartsInstance.appendData (they say it's for millions of points though)
      typedRef.current?.setOption({
        series,
        dataZoom,
      });

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [series, isChartSet]);

    useEffect(() => {
      const handle = () => {
        const dataZoom: InsideDataZoomComponentOption | undefined = (
          typedRef.current?.getOption().dataZoom as any
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
        typedRef.current?.on("dataZoom", handle);
      }

      return () => {
        typedRef.current?.off("dataZoom", handle);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onZoom, isChartSet]);

    useEffect(() => {
      const handler = (event: ECElementEvent) => {
        if (event.componentType === "markArea") {
          onMarkAreaClick?.((event.data as any).xAxis, event.dataIndex);
        }
      };

      if (onMarkAreaClick) {
        typedRef.current?.on("click", handler);
      }

      return () => {
        typedRef.current?.off("click", handler);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onMarkAreaClick, isChartSet]);

    useEffect(() => {
      const chart = echarts.init(elementRef.current);
      console.log("Created", chart.id);
      typedRef.current = chart;

      setIsChartSet(true);

      chart.setOption(options);

      return () => {
        console.log("Disposing", chart.id);
        chart.dispose();
        typedRef.current = null;
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
