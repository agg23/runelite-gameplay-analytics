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

    useEffect(() => {
      console.log(
        "Attempting data render with",
        Array.isArray(data) && data.length
      );
      if (!typedRef.current || !data) {
        return;
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
            // series.push({
            //   ...existingSeries,
            //   ...(datum as any),
            // });
            series.push(datum);
          } else {
            series.push({
              data: [],
            });
          }
        }

        // Maybe should use echartsInstance.appendData (they say it's for millions of points though)
        typedRef.current.setOption({ series });

        // typedRef.current.setOption(
        //   {
        //     ...optionsRef!.current!,
        //     series,
        //   },
        //   // Don't merge, replace series
        //   true
        // );
      } else {
        // Just set the data, nothing to do
        typedRef.current.setOption({
          series: data,
        });
      }

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeSeries, data, isChartSet]);

    useEffect(() => {
      const handle = () => {
        const dataZoom: InsideDataZoomComponentOption = (
          typedRef.current?.getOption().dataZoom as any
        )[0];

        if (
          dataZoom.startValue === undefined ||
          dataZoom.endValue === undefined
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
