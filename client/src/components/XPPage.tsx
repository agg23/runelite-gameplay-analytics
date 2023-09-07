import React, { useEffect, useMemo } from "react";
import { PointTooltipProps, ResponsiveLine } from "@nivo/line";
import { Checkbox, createStyles } from "@mantine/core";

import { useStore } from "../store/store";
import { AllSkills } from "./osrs/skills/AllSkills";
import { XPEvent } from "../api/types";
import { format } from "date-fns";

export const XPPage: React.FC<{}> = () => {
  const activeAccount = useStore((state) => state.activeAccount);
  const xpApi = useStore((state) => state.api.xp);
  const { displayDeltas, setDisplayDeltas } = useStore((state) => state.xp);

  const linechartData = useLinechartData();

  const formatDate = useMemo(
    () => (value: Date) => format(value, "E eo, h:m a"),
    []
  );

  const tooltipFormatter = useMemo(
    () =>
      ({ point }: PointTooltipProps) => {
        const date = formatDate(point.data.x as Date);
        const deltaAddition = displayDeltas ? "+" : "";

        // TODO: Add commas
        return (
          <div>
            <div>
              {deltaAddition}
              {point.data.y as number} XP
            </div>
            <div>{date}</div>
          </div>
        );
      },
    [displayDeltas, formatDate]
  );

  useEffect(() => {
    xpApi.requestData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAccount]);

  const { classes } = useStyles();

  return xpApi.type === "loading" ? (
    <div>Loading XP data</div>
  ) : xpApi.type === "error" ? (
    <div>Error loading XP data</div>
  ) : (
    <div className={classes.pageWrapper}>
      <AllSkills />
      <div className={classes.chartSettings}>
        <Checkbox
          checked={displayDeltas}
          onChange={(event) => setDisplayDeltas(event.currentTarget.checked)}
          label="Display deltas"
        />
      </div>
      <div className={classes.chartWrapper}>
        <ResponsiveLine
          data={linechartData}
          isInteractive
          useMesh
          enableCrosshair
          tooltip={tooltipFormatter}
          xScale={{ type: "time", precision: "minute" }}
          axisBottom={{
            // Mon 1st, 12:02 AM
            format: formatDate,
          }}
          margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
        />
      </div>
    </div>
  );
};

const useStyles = createStyles((theme) => ({
  pageWrapper: {
    marginTop: theme.spacing.md,
    marginLeft: theme.spacing.xs,
    marginRight: theme.spacing.xs,
  },
  chartSettings: {
    margin: theme.spacing.md,
  },
  chartWrapper: {
    height: 600,
  },
}));

const useLinechartData = () => {
  const xpApi = useStore((state) => state.api.xp);
  const { selectedSkills, displayDeltas } = useStore((state) => state.xp);

  return useMemo(() => {
    if (xpApi.type === "data") {
      const eventFields: Array<keyof XPEvent> = [];

      if (selectedSkills.type === "all") {
        eventFields.push("xpTotal");
      } else {
        eventFields.push(...selectedSkills.set);
      }

      // TODO: Move this into its own memo?
      const datedEntries = xpApi.data.map((event) => ({
        date: new Date(event.timestamp),
        ...event,
      }));

      return eventFields.map((fieldName) => {
        // If we display deltas, get the first (which is by definition the lowest) value and subtract
        const baseValue =
          displayDeltas && datedEntries.length > 0
            ? datedEntries[0][fieldName]
            : 0;

        return {
          id: fieldName,
          data: datedEntries.map((event) => ({
            x: event.date,
            y: event[fieldName] - baseValue,
          })),
        };
      });
    }

    return [];
  }, [selectedSkills, displayDeltas, xpApi]);
};
