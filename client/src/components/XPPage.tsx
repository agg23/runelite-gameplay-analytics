/** @jsxImportSource @emotion/react */
import React, { useEffect, useMemo } from "react";
import { ResponsiveLine } from "@nivo/line";

import { useStore } from "../store/store";
import { css } from "@emotion/react";

export const XPPage: React.FC<{}> = () => {
  const activeAccount = useStore((state) => state.activeAccount);
  const xp = useStore((state) => state.api.xp);

  const linechartData = useMemo(() => {
    if (xp.type === "data") {
      const data = xp.data.map((event) => ({
        x: new Date(event.timestamp),
        y: event.xpTotal,
      }));

      return [
        {
          id: 1,
          data,
        },
      ];
    }

    return [];
  }, [xp]);

  useEffect(() => {
    xp.requestData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAccount]);

  return xp.type === "loading" ? (
    <div>Loading XP data</div>
  ) : xp.type === "error" ? (
    <div>Error loading XP data</div>
  ) : (
    <div css={chartCss}>
      <ResponsiveLine
        data={linechartData}
        margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
      />
    </div>
  );
};

const chartCss = css({
  height: 600,
});
