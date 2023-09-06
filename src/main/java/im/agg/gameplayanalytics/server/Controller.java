package im.agg.gameplayanalytics.server;

import im.agg.gameplayanalytics.server.dbmodels.XPDBEvent;
import im.agg.gameplayanalytics.server.models.ActivityEvent;
import im.agg.gameplayanalytics.server.models.ActivityKind;
import im.agg.gameplayanalytics.server.models.MapEvent;
import im.agg.gameplayanalytics.server.models.Skill;
import lombok.extern.slf4j.Slf4j;
import net.runelite.api.Client;

import java.util.Date;
import java.util.Timer;
import java.util.TimerTask;

@Slf4j

@SuppressWarnings("SpellCheckingInspection")
public class Controller {
    // Specified in seconds
    static final Integer MAP_PERIOD = 30;
    static final Integer STANDARD_PERIOD = 60;

    private Client client;

    private final Server server;
    private final Store store;

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

    public Controller() {
        this.store = new Store();
        this.server = new Server(this.store);
    }

    public void init(Client client) {
        this.client = client;

        this.store.init();
        this.server.init();
    }

    public void shutdown() {
        this.store.shutdown();
    }

    public void login() {
        this.initializeTimers();

        this.store.writeActivityEvent(new ActivityEvent(ActivityKind.Login, new Date()));
    }

    public void logout() {
        if (this.timer != null) {
            this.timer.cancel();
        }

        this.timer = new Timer();

        this.writePartialXPEventIfChanged();
        this.updateMap();

        this.store.writeActivityEvent(new ActivityEvent(ActivityKind.Logout, new Date()));
    }

    private void initializeTimers() {
        this.timer.scheduleAtFixedRate(new TimerTask() {
            @Override
            public void run() {
                updateMap();
            }
            // Capture the map position instantly
        }, 0, MAP_PERIOD * 1000);

        var standardPeriodSeconds = STANDARD_PERIOD * 1000;

        this.timer.scheduleAtFixedRate(new TimerTask() {
            @Override
            public void run() {
                writePartialXPEventIfChanged();
            }
        }, standardPeriodSeconds, standardPeriodSeconds);
    }

    public void initializeXp(Client client) {
        this.attack = client.getSkillExperience(net.runelite.api.Skill.ATTACK);
        this.strength = client.getSkillExperience(net.runelite.api.Skill.STRENGTH);
        this.defence = client.getSkillExperience(net.runelite.api.Skill.DEFENCE);
        this.ranged = client.getSkillExperience(net.runelite.api.Skill.RANGED);
        this.prayer = client.getSkillExperience(net.runelite.api.Skill.PRAYER);
        this.magic = client.getSkillExperience(net.runelite.api.Skill.MAGIC);
        this.runecraft = client.getSkillExperience(net.runelite.api.Skill.RUNECRAFT);
        this.hitpoints = client.getSkillExperience(net.runelite.api.Skill.HITPOINTS);
        this.crafting = client.getSkillExperience(net.runelite.api.Skill.CRAFTING);
        this.mining = client.getSkillExperience(net.runelite.api.Skill.MINING);
        this.smithing = client.getSkillExperience(net.runelite.api.Skill.SMITHING);
        this.fishing = client.getSkillExperience(net.runelite.api.Skill.FISHING);
        this.cooking = client.getSkillExperience(net.runelite.api.Skill.COOKING);
        this.firemaking = client.getSkillExperience(net.runelite.api.Skill.FIREMAKING);
        this.woodcutting = client.getSkillExperience(net.runelite.api.Skill.WOODCUTTING);

        // Members
        this.agility = client.getSkillExperience(net.runelite.api.Skill.AGILITY);
        this.herblore = client.getSkillExperience(net.runelite.api.Skill.HERBLORE);
        this.thieving = client.getSkillExperience(net.runelite.api.Skill.THIEVING);
        this.fletching = client.getSkillExperience(net.runelite.api.Skill.FLETCHING);
        this.slayer = client.getSkillExperience(net.runelite.api.Skill.SLAYER);
        this.farming = client.getSkillExperience(net.runelite.api.Skill.FARMING);
        this.construction = client.getSkillExperience(net.runelite.api.Skill.CONSTRUCTION);
        this.hunter = client.getSkillExperience(net.runelite.api.Skill.HUNTER);

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

    private void writePartialXPEventIfChanged() {
        if (this.changedSkills != 0) {
            this.writeXPEvent(false);
        }
    }

    private void writeXPEvent(boolean isFullUpdate) {
//        var allSkillsBitArray = Math.pow(2, 23) - 1;
        var allSkillsBitArray = 8388607;

        var event = new XPDBEvent(new Date().getTime(),
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

    // TODO: Make incremental
    private void updateMap() {
        var worldPoint = this.client.getLocalPlayer().getWorldLocation();
        log.info(String.format("Region: %d, Tile X: %d, Tile Y: %d", worldPoint.getRegionID(), worldPoint.getX(), worldPoint.getY()));

        this.store.writeMapEvent(new MapEvent(worldPoint.getRegionID(), worldPoint.getX(), worldPoint.getY(), new Date()));
    }
}
