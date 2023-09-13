import React, { useEffect, useMemo, useRef, useState } from "react";
import { Checkbox, LoadingOverlay, createStyles } from "@mantine/core";
import * as echarts from "echarts";

import { useStore } from "../../../store/store";
import { AllSkills } from "../../osrs/skills/AllSkills";
import { ALL_SKILLS } from "../../../osrs/types";
import { usePrimaryChartOptions } from "./primaryChart";
import { EChart } from "../../external/EChart";
import { ErrorBoundary } from "react-error-boundary";

export const XPPage: React.FC<{}> = () => {
  const activeAccount = useStore((state) => state.accounts.activeId);
  const { api: xpApi, requestData } = useStore((state) => state.xp);
  const {
    displayDeltas,
    selectedSkills,
    setDisplayDeltas,
    toggleSelectedSkills,
    delayedSetChartRange,
  } = useStore((state) => state.xp);
  const primaryChartOptions = usePrimaryChartOptions();

  const primaryChartRef = useRef<echarts.ECharts>(null);

  const seriesData = useMemo(() => {
    if (xpApi.type !== "data") {
      return [];
    }

    return ALL_SKILLS.map((skill) => ({
      data: xpApi.data.map((item) => [item.timestamp, item[skill]]),
    }));
  }, [xpApi]);

  useEffect(() => {
    if (!activeAccount) {
      return;
    }

    requestData(activeAccount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAccount]);

  const { classes } = useStyles();

  return (
    <ErrorBoundary fallback={<div>An error occured</div>}>
      <LoadingOverlay visible={xpApi.type !== "data"} />
      <div className={classes.chartSettings}>
        <Checkbox
          checked={displayDeltas}
          onChange={(event) => setDisplayDeltas(event.currentTarget.checked)}
          label="Display deltas"
        />
      </div>
      <div className={classes.chartWrapper}>
        <div>
          <EChart
            ref={primaryChartRef}
            data={seriesData}
            activeSeries={
              selectedSkills.type === "set" ? selectedSkills.set : new Set()
            }
            options={primaryChartOptions}
            height={600}
          />
        </div>
        <div className={classes.chartSettings}>
          <div className={classes.chartManualSettings}>
            <Checkbox
              checked={selectedSkills.type === "all"}
              onChange={(event) =>
                toggleSelectedSkills(event.currentTarget.checked)
              }
              label="Select all"
            />
          </div>
          <div className={classes.allSkills}>
            <AllSkills />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

const useStyles = createStyles((theme) => ({
  allSkills: {
    width: 550,
  },
  chartSettings: {
    margin: theme.spacing.md,
  },
  chartManualSettings: {
    marginBottom: theme.spacing.md,
  },
  chartWrapper: {
    display: "grid",
    gridTemplateColumns: "1fr 550px",
    columnGap: theme.spacing.md,
    height: 600,
    padding: theme.spacing.md,
  },
}));
