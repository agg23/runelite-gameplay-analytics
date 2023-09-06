import React, { useEffect, useMemo } from "react";
import { ResponsiveLine } from "@nivo/line";

import "./XPPage.scss";

import { useStore } from "../store/store";

export const XPPage: React.FC<{}> = () => {
  const store = useStore((state) => state.api.xp);

  const linechartData = useMemo(() => {
    if (store.type === "data") {
      const data = store.data.map((event) => ({
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
  }, [store]);

  useEffect(() => {
    store.requestData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return store.type === "loading" ? (
    <div>Loading XP data</div>
  ) : store.type === "error" ? (
    <div>Error loading XP data</div>
  ) : (
    <div className="chart">
      <ResponsiveLine
        data={linechartData}
        margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
      />
    </div>
  );
};
