import { ApexOptions } from "apexcharts";
import { useApexChart } from "./useApexChart";
import { MutableRefObject, forwardRef, useEffect } from "react";

interface ApexChartProps {
  options: ApexOptions;
  initialData?: ApexOptions["series"];
}

export const ApexChart = forwardRef<ApexCharts, ApexChartProps>(
  ({ options, initialData }, ref) => {
    const { elRef, chartRef } = useApexChart(options);

    useEffect(() => {
      if (ref) {
        (ref as MutableRefObject<ApexCharts>).current = chartRef.current!;
      }

      if (!initialData) {
        return;
      }

      chartRef.current?.updateSeries(initialData);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <div ref={elRef}></div>;
  }
);
