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

// TODO: Choose some better colors
export const SKILL_COLORS = {
  attack: "6d7273",
  hitpoints: "cf4a01",
  mining: "757b7c",

  strength: "b69a6f",
  agility: "000001",
  smithing: "342e1b",

  defence: "545b59",
  herblore: "096c02",
  fishing: "433a2d",

  ranged: "7a3d09",
  thieving: "000001",
  cooking: "b4ab06",

  prayer: "b6cdba",
  crafting: "7a3d09",
  firemaking: "c74402",

  magic: "0006fe",
  fletching: "096c02",
  woodcutting: "096c02",

  runecraft: "b03904",
  slayer: "b8a091",
  farming: "4f59ee",

  construction: "554233",
  hunter: "3b3438",
};

export type Skill = (typeof ALL_SKILLS)[number];
