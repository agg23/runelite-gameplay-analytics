export const ALL_SKILLS = [
  "attack",
  "hitpoints",
  "mining",

  "strength",
  "agility",
  "smithing",

  "defence",
  "herblore",
  "fishing",

  "ranged",
  "thieving",
  "cooking",

  "prayer",
  "crafting",
  "firemaking",

  "magic",
  "fletching",
  "woodcutting",

  "runecraft",
  "slayer",
  "farming",

  "construction",
  "hunter",
] as const;

export type Skill = (typeof ALL_SKILLS)[number];
