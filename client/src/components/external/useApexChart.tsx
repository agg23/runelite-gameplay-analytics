import { useEffect, useRef } from "react";
import ApexCharts from "apexcharts";

export const useApexChart = (options: ApexCharts.ApexOptions) => {
  const elRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ApexCharts>();
  const prevOptions = useRef<ApexCharts.ApexOptions>();

  useEffect(() => {
    chartRef.current = new ApexCharts(elRef.current!, options);
    chartRef.current.render();
    prevOptions.current = options;
    return () => {
      chartRef.current?.destroy();
    };
  }, []);

  useEffect(() => {
    const { chart, ...opts } = options!;
    chartRef.current?.updateOptions(opts);
  }, [options]);

  return { elRef, chartRef };
};
