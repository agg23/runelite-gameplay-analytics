import { Skill } from "src/osrs/types";
import { PixelatedImage } from "../PixelatedImage";
import { SKILL_ENTRY_MAP } from "./shared";

interface SkillImageProps {
  skill: Skill;
}

export const SkillImage: React.FC<SkillImageProps> = ({ skill }) => {
  const skillEntry = SKILL_ENTRY_MAP[skill];

  return <PixelatedImage src={skillEntry.image} w={23} h={23} />;
};
