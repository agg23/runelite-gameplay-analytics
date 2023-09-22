import { ActionIcon, Button } from "@mantine/core";
import { IconPlus, IconMinus } from "@tabler/icons-react";
import clsx from "clsx";

import classes from "./ZoomControls.module.scss";

interface ZoomControlsProps {
  className?: string;

  showOnlyAll?: boolean;

  onClick: (variant: "all" | "zoomout" | "1d" | "1w" | "1m") => void;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
  className,
  showOnlyAll,
  onClick,
}) => {
  return (
    <div className={clsx(classes.zoomControls, className)}>
      <ActionIcon.Group className={classes.buttonGroup}>
        <ActionIcon
          variant="default"
          size="compact-sm"
          onClick={() => onClick("zoomout")}
        >
          <IconMinus />
        </ActionIcon>
        <ActionIcon variant="default" size="compact-sm">
          <IconPlus />
        </ActionIcon>
      </ActionIcon.Group>
      <Button.Group className={classes.buttonGroup}>
        {/* For some reason default variant is needed for proper grouped styles */}
        <Button
          variant="default"
          size="compact-sm"
          onClick={() => onClick("all")}
        >
          All
        </Button>
        {!showOnlyAll && (
          <>
            <Button
              variant="default"
              size="compact-sm"
              onClick={() => onClick("1d")}
            >
              1D
            </Button>
            <Button
              variant="default"
              size="compact-sm"
              onClick={() => onClick("1w")}
            >
              1W
            </Button>
            <Button
              variant="default"
              size="compact-sm"
              onClick={() => onClick("1m")}
            >
              1M
            </Button>
          </>
        )}
      </Button.Group>
    </div>
  );
};
