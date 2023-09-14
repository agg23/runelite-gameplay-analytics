import { HOSTNAME } from "../../../api/internal/config";
import { ALL_SKILLS, Skill } from "../../../osrs/types";
import { capitalizeFirstLetter } from "../../../util/string";

export const skillImageUrl = (skill: Skill | "overall") =>
  `http://${HOSTNAME}/assets/skillicons/${skill}.png`;

export const SKILL_ENTRIES = (() =>
  ALL_SKILLS.map((skill) => ({
    title: capitalizeFirstLetter(skill),
    skill,
    image: skillImageUrl(skill),
  })))();

export const SKILL_ENTRY_MAP = (() => {
  const map: {
    [skill: string]: {
      title: string;
      skill: Skill;
      image: string;
    };
  } = {};

  for (const entry of SKILL_ENTRIES) {
    map[entry.skill] = entry;
  }

  return map;
})();
