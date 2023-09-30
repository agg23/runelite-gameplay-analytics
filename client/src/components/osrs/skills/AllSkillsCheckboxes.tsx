import React from "react";
import { SimpleGrid } from "@mantine/core";
import { useStore } from "../../../store/store";
import { SKILL_ENTRIES } from "./shared";
import { SkillFancyCheckbox } from "./SkillFancyCheckbox";

interface AllSkillsProps {
  disable?: boolean;
}

export const AllSkillsCheckboxes: React.FC<AllSkillsProps> = ({ disable }) => {
  const { selectedSkills, addSkill, removeSkill } = useStore(
    (state) => state.xp
  );

  return (
    <SimpleGrid cols={3}>
      {SKILL_ENTRIES.map(({ title, skill }) => (
        <SkillFancyCheckbox
          key={skill}
          title={title}
          skill={skill}
          checked={selectedSkills.set.has(skill)}
          disabled={disable}
          onChange={(checked) => {
            if (checked) {
              addSkill(skill);
            } else {
              removeSkill(skill);
            }
          }}
        />
      ))}
    </SimpleGrid>
  );
};
