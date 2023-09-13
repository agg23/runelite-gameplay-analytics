import { MutableRefObject, forwardRef, useEffect, useRef } from "react";
import * as echarts from "echarts";
import type { SeriesOption, EChartsOption } from "echarts";
import { usePrevious } from "../../hooks/usePrevious";

interface EChartProps {
  options: EChartsOption;

  data?: SeriesOption | SeriesOption[];
  activeSeries?: Set<string>;

  height?: number | string;
}

export const EChart = forwardRef<echarts.ECharts, EChartProps>(
  ({ options, data, activeSeries, height }, ref) => {
    const elementRef = useRef<HTMLDivElement>(null);

    const typedRef = ref as MutableRefObject<echarts.ECharts | null>;

    useEffect(() => {
      console.log("Attempting data render with", data);
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
    }, [activeSeries, data]);

    useEffect(() => {
      const chart = echarts.init(elementRef.current);
      console.log("Created", chart.id);
      typedRef.current = chart;

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
