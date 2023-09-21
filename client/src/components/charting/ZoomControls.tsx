import { Button, createStyles } from "@mantine/core";

interface ZoomControlsProps {
  showOnlyAll?: boolean;

  onClick: (variant: "all" | "zoomout" | "1d" | "1w" | "1m") => void;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
  showOnlyAll,
  onClick,
}) => {
  const { classes } = useStyles();

  return (
    <div>
      <Button.Group className={classes.buttonGroup}>
        <Button
          variant="default"
          size="compact-sm"
          onClick={() => onClick("zoomout")}
        >
          Zoom Out
        </Button>
      </Button.Group>
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

const useStyles = createStyles((theme) => ({
  buttonGroup: {
    display: "inline-block",

    marginLeft: 8,

    span: {
      color: theme.colors.dark[2],
    },
  },
}));
