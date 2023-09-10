import React from "react";
import { capitalizeFirstLetter } from "../../../util/string";
import { SimpleGrid, createStyles } from "@mantine/core";
import { FancyCheckbox } from "./FancyCheckbox";
import { ALL_SKILLS } from "../../../osrs/types";
import { useStore } from "../../../store/store";
import { HOSTNAME } from "../../../api/internal/config";

export const AllSkills: React.FC<{}> = () => {
  const { selectedSkills, addSkill, removeSkill } = useStore(
    (state) => state.xp
  );

  const { classes } = useStyles();

  return (
    <SimpleGrid cols={3}>
      {skillEntries.map(({ title, image, skill }) => (
        <FancyCheckbox
          key={title}
          className={classes.checkbox}
          // Use integer scaling on images
          imageWidth={23}
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

const useStyles = createStyles((theme) => ({
  checkbox: {
    height: "2.5rem",
  },
}));

const skillEntries = (() =>
  ALL_SKILLS.map((skill) => ({
    title: capitalizeFirstLetter(skill),
    skill,
    image: `http://${HOSTNAME}/assets/skillicons/${skill}.png`,
  })))();
