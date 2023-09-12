import { MutableRefObject, forwardRef, useEffect, useRef } from "react";
import * as echarts from "echarts";

interface EChartProps {
  options: echarts.EChartsOption;
  data?: echarts.SeriesOption | echarts.SeriesOption[];
  height?: number | string;
}

export const EChart = forwardRef<echarts.ECharts, EChartProps>(
  ({ options, data, height }, ref) => {
    const elementRef = useRef<HTMLDivElement>(null);

    const typedRef = ref as MutableRefObject<echarts.ECharts | null>;

    useEffect(() => {
      console.log("Attempting data render with", data);
      if (!typedRef.current) {
        return;
      }

      typedRef.current.setOption({
        series: data,
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

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
