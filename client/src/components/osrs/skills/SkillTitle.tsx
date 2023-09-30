import { Group, Text } from "@mantine/core";

import { Skill } from "../../../osrs/types";
import { SkillImage } from "./SkillImage";
import { SKILL_ENTRY_MAP } from "./shared";

import classes from "./SkillTitle.module.scss";

interface SkillTitleProps {
  skill: Skill;
}

export const SkillTitle: React.FC<SkillTitleProps> = ({ skill }) => {
  const skillEntry = SKILL_ENTRY_MAP[skill];

  return (
    <Group>
      <SkillImage skill={skill} />
      <Text className={classes.text} size="sm">
        {skillEntry.title}
      </Text>
    </Group>
  );
};
