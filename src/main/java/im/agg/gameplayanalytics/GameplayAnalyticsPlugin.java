package im.agg.gameplayanalytics;

import com.google.inject.Provides;

import javax.imageio.ImageIO;
import javax.inject.Inject;

import im.agg.gameplayanalytics.controller.*;
import im.agg.gameplayanalytics.server.InternalMetadataServer;
import im.agg.gameplayanalytics.server.Server;
import im.agg.gameplayanalytics.server.Store;
import im.agg.gameplayanalytics.server.dbmodels.LootDBEvent;
import im.agg.gameplayanalytics.server.dbmodels.LootEntryDBEvent;
import im.agg.gameplayanalytics.server.models.Account;
import im.agg.gameplayanalytics.server.models.GEEvent;
import im.agg.gameplayanalytics.server.models.Skill;
import lombok.extern.slf4j.Slf4j;
import net.runelite.api.*;
import net.runelite.api.events.*;
import net.runelite.client.callback.ClientThread;
import net.runelite.client.config.ConfigManager;
import net.runelite.client.eventbus.Subscribe;
import net.runelite.client.events.NpcLootReceived;
import net.runelite.client.game.ItemManager;
import net.runelite.client.game.NPCManager;
import net.runelite.client.game.SpriteManager;
import net.runelite.client.plugins.Plugin;
import net.runelite.client.plugins.PluginDescriptor;

import java.io.File;
import java.io.IOException;
import java.util.Arrays;
import java.util.Date;
import java.util.stream.Collectors;

import static net.runelite.api.GameState.LOGIN_SCREEN;

@Slf4j
@PluginDescriptor(
        name = "Gameplay Analytics"
)
public class GameplayAnalyticsPlugin extends Plugin {
    @Inject
    private Client client;

    @Inject
    private GameplayAnalyticsConfig config;

    @Inject
    private ItemManager itemManager;

    @Inject
    private SpriteManager spriteManager;

    @Inject
    private ClientThread clientThread;

    private final Store store = new Store();
    private final InternalMetadataServer
            internalMetadataServer = new InternalMetadataServer(this.store);
    private final Server server =
            new Server(this.store, this.internalMetadataServer);

    private final ActivityController activityController =
            new ActivityController();
    private final GEController geController = new GEController();
    private final MapController mapController = new MapController();
    private final MembershipController membershipController =
            new MembershipController();
    private final StorageController storageController = new StorageController();
    private final XPController xpController = new XPController();

    private final Controller[] controllers = new Controller[]{
            activityController, geController, mapController,
            membershipController, storageController, xpController};

    private Account account;

    private boolean firstTick = true;

    private boolean didLogin = false;

    @Override
    protected void startUp() throws Exception {
        this.store.init();
        this.internalMetadataServer.init(this.clientThread, this.itemManager);
        this.server.init();

        Arrays.stream(this.controllers).forEach(
                controller -> controller.init(this.client, this.clientThread,
                        this.itemManager, this.store, this.server));
    }

    @Override
    protected void shutDown() throws Exception {
        Arrays.stream(this.controllers).forEach(Controller::shutdown);

        this.store.shutdown();
    }

    @Subscribe
    public void onGameStateChanged(GameStateChanged gameStateChanged) {
        var state = gameStateChanged.getGameState();

        switch (state) {
            case LOGGED_IN -> {
                this.didLogin = true;
            }
            case CONNECTION_LOST, LOGIN_SCREEN -> {
                if (this.didLogin) {
                    Arrays.stream(this.controllers).forEach(Controller::logout);
                }

                this.didLogin = false;
            }
        }

        if (state == LOGIN_SCREEN) {
            this.firstTick = true;
        }
    }

    @Subscribe
    public void onGameTick(GameTick event) {
        // On first tick, initialize XP
        if (this.firstTick) {
            this.firstTick = false;

            var id = this.client.getAccountHash();
            var username = this.client.getLocalPlayer().getName();

            this.account = new Account(id, username);

            // Write character to store
            this.store.createOrUpdateAccount(this.account);

            Arrays.stream(this.controllers)
                    .forEach(controller -> controller.startDataFlow(
                            this.account));
        }
    }

    @Subscribe
    public void onStatChanged(StatChanged statChanged) {
        if (this.firstTick) {
            return;
        }

        log.info(
                String.format("Skill: %s, XP: %d, Level: %d, Boosted level: %d",
                        statChanged.getSkill().getName(), statChanged.getXp(),
                        statChanged.getLevel(), statChanged.getBoostedLevel()));
        var skill = Skill.fromRLSkill(statChanged.getSkill());

        this.xpController.updateXp(skill, statChanged.getXp());
    }

    @Subscribe
    public void onNpcLootReceived(NpcLootReceived npcLootReceived) {
        // TODO: If a NPC doesn't drop any loot, we don't get this event
        // Is there some other way to detect kills?
        var npc = npcLootReceived.getNpc();
        var items = npcLootReceived.getItems();

        var location = npc.getWorldLocation();

        var event =
                new LootDBEvent(new Date().getTime(), this.account.getId(), 0,
                        npc.getId(), npc.getCombatLevel(),
                        location.getRegionID(), location.getX(),
                        location.getY());

        var entries =
                items.stream().map(item -> new LootEntryDBEvent(item.getId(),
                        item.getQuantity(),
                        this.itemManager.getItemPrice(item.getId()))).collect(
                        Collectors.toList());

        this.store.writeLootEvent(event, entries);
    }

    @Subscribe
    public void onActorDeath(ActorDeath actorDeath) {
        var actor = actorDeath.getActor();
        if (actor instanceof Player) {
            var player = (Player) actor;
            var location = player.getWorldLocation();

            if (player == this.client.getLocalPlayer()) {
                // TODO
                log.info(
                        String.format("Player died at Region: %d, X: %d, Y: %d",
                                location.getRegionID(), location.getX(),
                                location.getY()));
            }
        }
    }

    @Subscribe
    public void onScriptPostFired(ScriptPostFired event) {
        if (event.getScriptId() == ScriptID.BANKMAIN_BUILD) {
            this.storageController.bankOpen();
        }
    }

    @Subscribe
    public void onGrandExchangeOfferChanged(
            GrandExchangeOfferChanged event) {
        this.geController.onGrandExchangeOfferChanged(event);
    }

    @Provides
    GameplayAnalyticsConfig provideConfig(ConfigManager configManager) {
        return configManager.getConfig(GameplayAnalyticsConfig.class);
    }
}
