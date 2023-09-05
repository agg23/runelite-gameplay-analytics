package im.agg.gameplayanalytics.server.models;

@SuppressWarnings({"SpellCheckingInspection", "EnhancedSwitchMigration"})
public enum Skill {
    Attack,
    Strength,
    Defence,
    Ranged,
    Prayer,
    Magic,
    Runecraft,
    Hitpoints,
    Crafting,
    Mining,
    Smithing,
    Fishing,
    Cooking,
    Firemaking,
    Woodcutting,

    // Members
    Agility,
    Herblore,
    Thieving,
    Fletching,
    Slayer,
    Farming,
    Construction,
    Hunter;

    public static Skill fromInt(Integer value) {
        switch (value) {
            case 1: return Attack;
            case 2: return Strength;
            case 4: return Defence;
            case 8: return Ranged;
            case 16: return Prayer;
            case 32: return Magic;
            case 64: return Runecraft;
            case 128: return Hitpoints;
            case 256: return Crafting;
            case 512: return Mining;
            case 1024: return Smithing;
            case 2048: return Fishing;
            case 4096: return Cooking;
            case 8192: return Firemaking;
            case 16384: return Woodcutting;

            // Members
            case 32768: return Agility;
            case 65536: return Herblore;
            case 131072: return Thieving;
            case 262144: return Fletching;
            case 524288: return Slayer;
            case 1048576: return Farming;
            case 2097152: return Construction;
            case 4194304: return Hunter;
        }

        throw new RuntimeException("Skill was not a power of 2/didn't match");
    }

    public static Skill fromRLSkill(net.runelite.api.Skill skill) {
        switch (skill) {
            case ATTACK: return Attack;
            case STRENGTH: return Strength;
            case DEFENCE: return Defence;
            case RANGED: return Ranged;
            case PRAYER: return Prayer;
            case MAGIC: return Magic;
            case RUNECRAFT: return Runecraft;
            case HITPOINTS: return Hitpoints;
            case CRAFTING: return Crafting;
            case MINING: return Mining;
            case SMITHING: return Smithing;
            case FISHING: return Fishing;
            case COOKING: return Cooking;
            case FIREMAKING: return Firemaking;
            case WOODCUTTING: return Woodcutting;

            // Member
            case AGILITY: return Agility;
            case HERBLORE: return Herblore;
            case THIEVING: return Thieving;
            case FLETCHING: return Fletching;
            case SLAYER: return Slayer;
            case FARMING: return Farming;
            case CONSTRUCTION: return Construction;
            case HUNTER: return Hunter;
        }

        throw new RuntimeException("This switch statement is exhaustive");
    }

    public Integer toPower() {
        switch (this) {
            case Attack: return 1;
            case Strength: return 2;
            case Defence: return 4;
            case Ranged: return 8;
            case Prayer: return 16;
            case Magic: return 32;
            case Runecraft: return 64;
            case Hitpoints: return 128;
            case Crafting: return 256;
            case Mining: return 512;
            case Smithing: return 1024;
            case Fishing:return 2048;
            case Cooking: return 4096;
            case Firemaking: return 8192;
            case Woodcutting: return 16384;

            // Members
            case Agility: return 32768;
            case Herblore: return 65536;
            case Thieving: return 131072;
            case Fletching: return 262144;
            case Slayer: return 524288;
            case Farming: return 1048576;
            case Construction: return 2097152;
            case Hunter: return 4194304;
        }

        throw new RuntimeException("This switch statement is exhaustive");
    }
}
