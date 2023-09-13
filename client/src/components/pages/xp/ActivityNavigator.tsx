import { ActionIcon } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useEffect, useState } from "react";

interface ActivityNavigatorProps {
  activityCount: number;
  defaultSelectionIndex?: number;

  onChange: (index: number) => void;
}

export const ActivityNavigator: React.FC<ActivityNavigatorProps> = ({
  activityCount,
  defaultSelectionIndex,
  onChange,
}) => {
  const [_, setSelectedIndex] = useState(defaultSelectionIndex ?? 0);

  useEffect(() => {
    if (defaultSelectionIndex === undefined) {
      return;
    }

    setSelectedIndex(defaultSelectionIndex);
  }, [defaultSelectionIndex]);

  return (
    <div>
      <ActionIcon
        onClick={() =>
          setSelectedIndex((currentIndex) => {
            if (currentIndex > 0) {
              onChange(currentIndex - 1);
              return currentIndex - 1;
            }

            return currentIndex;
          })
        }
      >
        <IconChevronLeft />
      </ActionIcon>
      <ActionIcon
        onClick={() =>
          setSelectedIndex((currentIndex) => {
            if (currentIndex < activityCount - 1) {
              onChange(currentIndex + 1);
              return currentIndex + 1;
            }

            return currentIndex;
          })
        }
      >
        <IconChevronRight />
      </ActionIcon>
    </div>
  );
};
