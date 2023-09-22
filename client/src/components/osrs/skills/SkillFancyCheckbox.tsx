import { FancyCheckbox, FancyCheckboxProps } from "./FancyCheckbox";
import { Skill } from "../../../osrs/types";
import { skillImageUrl } from "./shared";

import classes from "./SkillFancyCheckbox.module.scss";

interface SkillFancyCheckboxProps
  extends Omit<FancyCheckboxProps, "onChange" | "image" | "description"> {
  checked: boolean;
  title: string;
  skill: Skill | "overall";

  onChange: (checked: boolean) => void;
}

export const SkillFancyCheckbox: React.FC<SkillFancyCheckboxProps> = ({
  checked,
  title,
  skill,
  onChange,
  ...props
}) => {
  return (
    <FancyCheckbox
      {...props}
      className={classes.checkbox}
      // Use integer scaling on images
      imageWidth={23}
      checked={checked}
      title={title}
      image={skillImageUrl(skill)}
      description=""
      onChange={onChange}
    />
  );
};
