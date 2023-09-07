import React from "react";
import { capitalizeFirstLetter } from "../../../util/string";
import { HOSTNAME } from "../../../api/rest";
import { SimpleGrid } from "@mantine/core";
import { FancyCheckbox } from "./FancyCheckbox";
import { ALL_SKILLS } from "../../../osrs/types";
import { useStore } from "../../../store/store";

export const AllSkills: React.FC<{}> = () => {
  const { selectedSkills, addSkill, removeSkill } = useStore(
    (state) => state.xp
  );

  return (
    <SimpleGrid cols={6}>
      {skillEntries.map(({ title, image, skill }) => (
        <FancyCheckbox
          key={title}
          // Use integer scaling on images
          imageWidth={23 * 2}
          checked={
            selectedSkills.type === "all" || selectedSkills.set.has(skill)
          }
          title={title}
          image={image}
          description=""
          pixelated
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

const skillEntries = (() =>
  ALL_SKILLS.map((skill) => ({
    title: capitalizeFirstLetter(skill),
    skill,
    image: `http://${HOSTNAME}/assets/skillicons/${skill}.png`,
  })))();
