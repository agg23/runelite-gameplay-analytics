import React from "react";
import { SimpleGrid, createStyles } from "@mantine/core";
import { FancyCheckbox } from "./FancyCheckbox";
import { useStore } from "../../../store/store";
import { SKILL_ENTRIES } from "./shared";

export const AllSkills: React.FC<{}> = () => {
  const { selectedSkills, addSkill, removeSkill } = useStore(
    (state) => state.xp
  );

  const { classes } = useStyles();

  return (
    <SimpleGrid cols={3}>
      {SKILL_ENTRIES.map(({ title, image, skill }) => (
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
