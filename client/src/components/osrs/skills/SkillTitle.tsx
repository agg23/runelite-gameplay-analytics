import { Group, Text } from "@mantine/core";
import { PixelatedImage } from "../PixelatedImage";
import { Skill } from "../../../osrs/types";
import { SKILL_ENTRY_MAP } from "./shared";

interface SkillTitleProps {
  skill: Skill;
}

export const SkillTitle: React.FC<SkillTitleProps> = ({ skill }) => {
  const skillEntry = SKILL_ENTRY_MAP[skill];

  return (
    <Group>
      <PixelatedImage src={skillEntry.image} width={23} height={23} />
      <Text weight={500} size="sm" sx={{ lineHeight: 1 }}>
        {skillEntry.title}
      </Text>
    </Group>
  );
};
