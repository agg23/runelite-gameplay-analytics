import { Popover, SimpleGrid } from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { useXPQuery } from "api/hooks/useDatatypeQuery";
import { XPEvent } from "api/internal/types";
import { useMemo } from "react";
import { levelForXP } from "src/osrs/levels";
import { Skill } from "src/osrs/types";
import { formatNumber } from "src/util/string";

import { SKILL_ENTRIES } from "./shared";
import { SkillImage } from "./SkillImage";

export const CurrentLevelSkills: React.FC<{}> = () => {
  const { data } = useXPQuery();

  const latestEvent =
    !!data && data.length > 0 ? data[data.length - 1] : undefined;

  return (
    <SimpleGrid cols={3} w={150}>
      {SKILL_ENTRIES.map(({ skill }) => (
        <SkillItem skill={skill} lastXP={latestEvent} />
      ))}
    </SimpleGrid>
  );
};

interface SkillItemProps {
  skill: Skill;
  lastXP: XPEvent | undefined;
}

const SkillItem: React.FC<SkillItemProps> = ({ skill, lastXP }) => {
  const { hovered, ref } = useHover();

  const xpForSkill = lastXP ? lastXP[skill] : 0;
  const level = useMemo(() => levelForXP(xpForSkill), [xpForSkill]);

  return (
    <Popover opened={hovered}>
      <Popover.Target>
        <div ref={ref}>
          <SkillImage skill={skill} />
        </div>
      </Popover.Target>
      <Popover.Dropdown>
        <div>
          <div>Level {level.levelNumber}</div>
          <div>{formatNumber(level.percentToNext * 100)}% to next level</div>
        </div>
      </Popover.Dropdown>
    </Popover>
  );
};
