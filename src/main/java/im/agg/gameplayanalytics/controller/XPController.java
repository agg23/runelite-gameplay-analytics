package im.agg.gameplayanalytics.controller;

import im.agg.gameplayanalytics.server.dbmodels.XPDBEvent;
import im.agg.gameplayanalytics.server.models.Account;
import im.agg.gameplayanalytics.server.models.Skill;
import lombok.extern.slf4j.Slf4j;

import java.util.Date;
import java.util.Timer;
import java.util.TimerTask;

@Slf4j

@SuppressWarnings("SpellCheckingInspection")
public class XPController extends Controller {
    static final Integer UPDATE_PERIOD = 60;

    private Timer timer = new Timer();

    // Skills
    private Integer attack = 0;
    private Integer strength = 0;
    private Integer defence = 0;
    private Integer ranged = 0;
    private Integer prayer = 0;
    private Integer magic = 0;
    private Integer runecraft = 0;
    private Integer hitpoints = 0;
    private Integer crafting = 0;
    private Integer mining = 0;
    private Integer smithing = 0;
    private Integer fishing = 0;
    private Integer cooking = 0;
    private Integer firemaking = 0;
    private Integer woodcutting = 0;

    // Member
    private Integer agility = 0;
    private Integer herblore = 0;
    private Integer thieving = 0;
    private Integer fletching = 0;
    private Integer slayer = 0;
    private Integer farming = 0;
    private Integer construction = 0;
    private Integer hunter = 0;

    private Integer changedSkills = 0;

    @Override
    public void logout() {
        super.logout();

        if (this.timer != null) {
            this.timer.cancel();
        }

        this.timer = new Timer();

        this.writePartialXPEventIfChanged();
    }

    private long debugTimestamp = 1694012465368L + 1000*60L;

    @Override
    public void startDataFlow(Account account) {
        super.startDataFlow(account);

        // TODO: Remove. This exists only for testing
        attack = 136;
        ranged = 12;
        prayer = 18;
        magic = 9;
        hitpoints = 1194;
        mining = 70;
        smithing = 37;
        fishing = 80;
        cooking = 160;
        firemaking = 40;
        woodcutting = 24;
        this.timer.scheduleAtFixedRate(new TimerTask() {
            @Override
            public void run() {
                debugTimestamp += 1000*60;
                attack += ((Long)Math.round(Math.random() * 10)).intValue();

                var event = new XPDBEvent(debugTimestamp,
                        1327996603691643471L,
                        1,
                        Skill.Attack.toPower(),
                        attack,
                        strength,
                        defence,
                        ranged,
                        prayer,
                        magic,
                        runecraft,
                        hitpoints,
                        crafting,
                        mining,
                        smithing,
                        fishing,
                        cooking,
                        firemaking,
                        woodcutting,

                        // Members
                        agility,
                        herblore,
                        thieving,
                        fletching,
                        slayer,
                        farming,
                        construction,
                        hunter);

                server.updatedXPData(event);
            }
        }, 1000, 1000);

        var standardPeriodMillieconds = UPDATE_PERIOD * 1000;

        this.timer.scheduleAtFixedRate(new TimerTask() {
            @Override
            public void run() {
                writePartialXPEventIfChanged();
            }
        }, standardPeriodMillieconds, standardPeriodMillieconds);

        this.initializeXp();
    }

    // Methods

    private void initializeXp() {
        this.attack = this.client.getSkillExperience(net.runelite.api.Skill.ATTACK);
        this.strength = this.client.getSkillExperience(net.runelite.api.Skill.STRENGTH);
        this.defence = this.client.getSkillExperience(net.runelite.api.Skill.DEFENCE);
        this.ranged = this.client.getSkillExperience(net.runelite.api.Skill.RANGED);
        this.prayer = this.client.getSkillExperience(net.runelite.api.Skill.PRAYER);
        this.magic = this.client.getSkillExperience(net.runelite.api.Skill.MAGIC);
        this.runecraft = this.client.getSkillExperience(net.runelite.api.Skill.RUNECRAFT);
        this.hitpoints = this.client.getSkillExperience(net.runelite.api.Skill.HITPOINTS);
        this.crafting = this.client.getSkillExperience(net.runelite.api.Skill.CRAFTING);
        this.mining = this.client.getSkillExperience(net.runelite.api.Skill.MINING);
        this.smithing = this.client.getSkillExperience(net.runelite.api.Skill.SMITHING);
        this.fishing = this.client.getSkillExperience(net.runelite.api.Skill.FISHING);
        this.cooking = this.client.getSkillExperience(net.runelite.api.Skill.COOKING);
        this.firemaking = this.client.getSkillExperience(net.runelite.api.Skill.FIREMAKING);
        this.woodcutting = this.client.getSkillExperience(net.runelite.api.Skill.WOODCUTTING);

        // Members
        this.agility = this.client.getSkillExperience(net.runelite.api.Skill.AGILITY);
        this.herblore = this.client.getSkillExperience(net.runelite.api.Skill.HERBLORE);
        this.thieving = this.client.getSkillExperience(net.runelite.api.Skill.THIEVING);
        this.fletching = this.client.getSkillExperience(net.runelite.api.Skill.FLETCHING);
        this.slayer = this.client.getSkillExperience(net.runelite.api.Skill.SLAYER);
        this.farming = this.client.getSkillExperience(net.runelite.api.Skill.FARMING);
        this.construction = this.client.getSkillExperience(net.runelite.api.Skill.CONSTRUCTION);
        this.hunter = this.client.getSkillExperience(net.runelite.api.Skill.HUNTER);

        log.info("Initialized XP");

        // Full update
        this.writeXPEvent(true);
    }

    public void updateXp(Skill skill, Integer xp) {
        switch (skill) {
            case Attack -> this.attack = xp;
            case Strength -> this.strength = xp;
            case Defence -> this.defence = xp;
            case Ranged -> this.ranged = xp;
            case Prayer -> this.prayer = xp;
            case Magic -> this.magic = xp;
            case Runecraft -> this.runecraft = xp;
            case Hitpoints -> this.hitpoints = xp;
            case Crafting -> this.crafting = xp;
            case Mining -> this.mining = xp;
            case Smithing -> this.smithing = xp;
            case Fishing -> this.fishing = xp;
            case Cooking -> this.cooking = xp;
            case Firemaking -> this.firemaking = xp;
            case Woodcutting -> this.woodcutting = xp;
            case Agility -> this.agility = xp;
            case Herblore -> this.herblore = xp;
            case Thieving -> this.thieving = xp;
            case Fletching -> this.fletching = xp;
            case Slayer -> this.slayer = xp;
            case Farming -> this.farming = xp;
            case Construction -> this.construction = xp;
            case Hunter -> this.hunter = xp;
        }

        this.changedSkills |= skill.toPower();
    }

    // DB

    private void writePartialXPEventIfChanged() {
        if (this.changedSkills != 0) {
            this.writeXPEvent(false);
        }
    }

    private void writeXPEvent(boolean isFullUpdate) {
//        var allSkillsBitArray = Math.pow(2, 23) - 1;
        var allSkillsBitArray = 8388607;

        var event = new XPDBEvent(new Date().getTime(),
                this.account.getId(),
                isFullUpdate ? 0 : 1,
                isFullUpdate ? allSkillsBitArray : this.changedSkills,
                this.attack,
                this.strength,
                this.defence,
                this.ranged,
                this.prayer,
                this.magic,
                this.runecraft,
                this.hitpoints,
                this.crafting,
                this.mining,
                this.smithing,
                this.fishing,
                this.cooking,
                this.firemaking,
                this.woodcutting,

                // Members
                this.agility,
                this.herblore,
                this.thieving,
                this.fletching,
                this.slayer,
                this.farming,
                this.construction,
                this.hunter);

        log.info("Writing XP event");

        this.store.writeXPEvent(event);
        this.server.updatedXPData(event);

        this.changedSkills = 0;
    }
}
