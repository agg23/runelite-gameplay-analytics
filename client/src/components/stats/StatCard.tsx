import { Group, Paper, Stack, Text, createStyles, rem } from "@mantine/core";

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
  const { classes } = useStyles();

  return (
    <Paper withBorder p="md" radius="md" key={title}>
      <Group position="apart">
        <Stack spacing={0}>
          <Group position="apart">
            <Text size="xs" color="dimmed" className={classes.title}>
              {title}
            </Text>
            {/* <IconArrowUpRight className={classes.icon} size="1.4rem" stroke={1.5} /> */}
          </Group>

          <Group align="flex-end" spacing="xs" mt={25}>
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

const useStyles = createStyles((theme) => ({
  root: {
    padding: `calc(${theme.spacing.xl} * 1.5)`,
  },

  value: {
    fontSize: rem(24),
    fontWeight: 700,
    lineHeight: 1,
  },

  diff: {
    lineHeight: 1,
    display: "flex",
    alignItems: "center",
  },

  icon: {
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[3]
        : theme.colors.gray[4],
  },

  title: {
    fontWeight: 700,
    textTransform: "uppercase",
  },
}));
