import { SimpleGrid, Text } from "@mantine/core";
import { useXPStats } from "./hooks/useXPStats";
import { StatCard } from "../../stats/StatCard";
import { formatNumber } from "../../../util/string";
import { SkillTitle } from "../../osrs/skills/SkillTitle";

export const XPTopStats: React.FC<{}> = () => {
  const { averageGainPerMinute, totalGain, maxSkill } = useXPStats();

  return (
    <SimpleGrid cols={3}>
      <StatCard
        title="Total XP"
        value={`${formatNumber(totalGain)} XP`}
        secondaryStat={
          maxSkill && (
            <>
              <Text size="md" color="dimmed">
                Max gain from:
              </Text>
              <SkillTitle skill={maxSkill} />
            </>
          )
        }
      />
      <StatCard
        title="Average Gain"
        value={`${formatNumber(averageGainPerMinute)} per minute`}
      />
    </SimpleGrid>
  );
};
