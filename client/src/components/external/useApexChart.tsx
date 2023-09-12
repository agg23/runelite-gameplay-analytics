import { useEffect, useRef } from "react";
// const ApexCharts = require("apexcharts/dist/apexcharts");
import ApexCharts from "apexcharts";

// Register Apex so it can be used within the library itself
(window as any).ApexCharts = ApexCharts;

export const useApexChart = (options: ApexCharts.ApexOptions) => {
  const elRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ApexCharts>();
  const prevOptions = useRef<ApexCharts.ApexOptions>();

  useEffect(() => {
    chartRef.current = new ApexCharts(elRef.current!, options);
    chartRef.current!.render();
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
