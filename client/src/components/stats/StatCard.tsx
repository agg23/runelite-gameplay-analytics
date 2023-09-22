import { Group, Paper, Stack, Text } from "@mantine/core";

import classes from "./StatCard.module.scss";

interface StatCardProps {
  title: string;
  value: string;
  // diff?: number;
  secondaryStat?: JSX.Element;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  secondaryStat,
}) => {
  return (
    <Paper withBorder p="md" radius="md" key={title}>
      <Group justify="space-between">
        <Stack gap={0}>
          <Group justify="space-between">
            <Text size="xs" color="dimmed" className={classes.title}>
              {title}
            </Text>
            {/* <IconArrowUpRight className={classes.icon} size="1.4rem" stroke={1.5} /> */}
          </Group>

          <Group align="flex-end" gap="xs" mt={25}>
            <Text className={classes.value}>{value}</Text>
            {/* <Text
          color={diff > 0 ? "teal" : "red"}
          fz="sm"
          fw={500}
          className={classes.diff}
        >
          <span>{diff}%</span>
          <IconArrowUpRight size="1rem" stroke={1.5} />
        </Text> */}
          </Group>
        </Stack>
        <Stack>{secondaryStat}</Stack>
      </Group>
    </Paper>
  );
};
