import { LoadingOverlay } from "@mantine/core";
import { useMemo } from "react";
import type { MarkAreaComponentOption, SeriesOption } from "echarts";

import {
  useActivityQuery,
  useBankQuery,
  useInventoryQuery,
} from "../../../api/hooks/useDatatypeQuery";
import { EChart } from "../../external/EChart";
import { ChartPage } from "../../layout/ChartPage";
import { primaryChartOptions } from "./primaryChart";
import { StorageAPIEvent } from "../../../api/internal/types";
import { sumDataArrays } from "./sumData";

export const WealthPage: React.FC<{}> = () => {
  const { data: bankData, isLoading: isBankLoading } = useBankQuery();
  const { data: inventoryData, isLoading: isInventoryLoading } =
    useInventoryQuery();
  const { data: activityData, isLoading: isActivityLoading } =
    useActivityQuery();

  const seriesData = useMemo((): SeriesOption[] => {
    if (!bankData && !inventoryData) {
      return [];
    }

    const calculateEntrySum = (event: StorageAPIEvent) =>
      event.type === 0
        ? event.entries.reduce(
            (acc, entry) => acc + entry.gePerItem * entry.quantity,
            0
          )
        : // Bank
          event.entries[0].gePerItem;

    const totalData = sumDataArrays(
      bankData ?? [],
      inventoryData ?? [],
      (event) => event.timestamp,
      calculateEntrySum
    );

    return [
      {
        data:
          inventoryData?.map((datum) => [
            datum.timestamp,
            calculateEntrySum(datum),
          ]) ?? [],
      },
      {
        data:
          bankData?.map((datum) => [
            datum.timestamp,
            calculateEntrySum(datum),
          ]) ?? [],
      },
      { data: totalData },
    ];
  }, [bankData, inventoryData]);

  const markArea = useMemo(
    (): MarkAreaComponentOption | undefined =>
      activityData
        ? {
            data: activityData.map((activity) => [
              {
                xAxis: activity.startTimestamp,
              },
              { xAxis: activity.endTimestamp },
            ]),
          }
        : undefined,
    [activityData]
  );

  return (
    <>
      <LoadingOverlay
        visible={isBankLoading || isInventoryLoading || isActivityLoading}
      />
      <ChartPage
        chart={
          <EChart
            data={seriesData}
            options={primaryChartOptions}
            markArea={markArea}
            height={600}
          />
        }
        chartSettings={<div>These are settings</div>}
      />
    </>
  );
};
