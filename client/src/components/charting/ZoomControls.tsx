import { ActionIcon, Button } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { IconPlus, IconMinus } from "@tabler/icons-react";
import clsx from "clsx";
import { useMemo } from "react";

import classes from "./ZoomControls.module.scss";

export type ZoomClickVariant =
  | "all"
  | "zoomout"
  | "zoomin"
  | "1d"
  | "1w"
  | "1m";

interface ZoomControlsProps {
  className?: string;

  showOnlyAll?: boolean;
  validDayTimestamps?: Set<number>;
  zoomedDayTimestamp?: number;

  onZoomClick: (variant: ZoomClickVariant) => void;
  onDatePickerSelect?: (date: Date) => void;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
  className,
  showOnlyAll,
  validDayTimestamps,
  zoomedDayTimestamp,
  onZoomClick,
  onDatePickerSelect,
}) => {
  const zoomedDayDate = useMemo(
    () => (!!zoomedDayTimestamp ? new Date(zoomedDayTimestamp) : undefined),
    [zoomedDayTimestamp]
  );

  return (
    <div className={clsx(classes.zoomControls, className)}>
      <DatePickerInput
        value={zoomedDayDate}
        onChange={(date) => {
          console.log(date);
          if (!date) {
            return;
          }

          onDatePickerSelect?.(date);
        }}
        excludeDate={(date) =>
          !!validDayTimestamps && !validDayTimestamps.has(date.getTime())
        }
      />
      <ActionIcon.Group className={classes.buttonGroup}>
        <ActionIcon
          variant="default"
          size="compact-sm"
          onClick={() => onZoomClick("zoomout")}
        >
          <IconMinus />
        </ActionIcon>
        <ActionIcon
          variant="default"
          size="compact-sm"
          onClick={() => onZoomClick("zoomin")}
        >
          <IconPlus />
        </ActionIcon>
      </ActionIcon.Group>
      <Button.Group className={classes.buttonGroup}>
        {/* For some reason default variant is needed for proper grouped styles */}
        <Button
          variant="default"
          size="compact-sm"
          onClick={() => onZoomClick("all")}
        >
          All
        </Button>
        {!showOnlyAll && (
          <>
            <Button
              variant="default"
              size="compact-sm"
              onClick={() => onZoomClick("1d")}
            >
              1D
            </Button>
            <Button
              variant="default"
              size="compact-sm"
              onClick={() => onZoomClick("1w")}
            >
              1W
            </Button>
            <Button
              variant="default"
              size="compact-sm"
              onClick={() => onZoomClick("1m")}
            >
              1M
            </Button>
          </>
        )}
      </Button.Group>
    </div>
  );
};
