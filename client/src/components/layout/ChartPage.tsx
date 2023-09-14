import { createStyles } from "@mantine/core";
import { ReactNode } from "react";

interface ChartPageProps {
  chart: ReactNode;
  chartSettings: ReactNode;
}

export const ChartPage: React.FC<ChartPageProps> = ({
  chart,
  chartSettings,
}) => {
  const { classes } = useStyles();

  return (
    <div className={classes.chartWrapper}>
      <div>{chart}</div>
      <div className={classes.chartSettings}>{chartSettings}</div>
    </div>
  );
};

const useStyles = createStyles((theme) => ({
  chartWrapper: {
    display: "grid",
    gridTemplateColumns: "1fr 550px",
    columnGap: theme.spacing.md,
    height: 600,
    padding: theme.spacing.md,
  },

  chartSettings: {
    margin: theme.spacing.md,
  },
}));
