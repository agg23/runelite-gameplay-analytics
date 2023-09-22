import type { ReactNode } from "react";

import classes from "./ChartPage.module.scss";

interface ChartPageProps {
  chart: ReactNode;
  chartSettings: ReactNode;
}

export const ChartPage: React.FC<ChartPageProps> = ({
  chart,
  chartSettings,
}) => {
  return (
    <div className={classes.chartWrapper}>
      <div>{chart}</div>
      <div className={classes.chartSettings}>{chartSettings}</div>
    </div>
  );
};
