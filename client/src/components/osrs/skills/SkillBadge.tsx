import { Badge } from "@mantine/core";
import { Skill } from "src/osrs/types";
import { capitalizeFirstLetter } from "src/util/string";
import { skillImageUrl } from "./shared";

import classes from "./SkillBadge.module.scss";

interface SkillBadgeProps {
  skill: Skill;
}

export const SkillBadge: React.FC<SkillBadgeProps> = ({ skill }) => {
  return (
    <Badge
      className={classes.skillBadge}
      // eslint-disable-next-line jsx-a11y/alt-text
      leftSection={<img src={skillImageUrl(skill)} />}
    >
      {capitalizeFirstLetter(skill)}
    </Badge>
  );
};
