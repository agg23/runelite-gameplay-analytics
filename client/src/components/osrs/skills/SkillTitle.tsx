import { Group, Text } from "@mantine/core";

import { PixelatedImage } from "../PixelatedImage";
import { Skill } from "../../../osrs/types";
import { SKILL_ENTRY_MAP } from "./shared";

import classes from "./SkillTitle.module.scss";

interface SkillTitleProps {
  skill: Skill;
}

export const SkillTitle: React.FC<SkillTitleProps> = ({ skill }) => {
  const skillEntry = SKILL_ENTRY_MAP[skill];

  return (
    <Group>
      <PixelatedImage src={skillEntry.image} w={23} h={23} />
      <Text className={classes.text} size="sm">
        {skillEntry.title}
      </Text>
    </Group>
  );
};
