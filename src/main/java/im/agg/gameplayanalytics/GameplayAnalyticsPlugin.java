package im.agg.gameplayanalytics;

import com.google.inject.Provides;

import javax.inject.Inject;

import im.agg.gameplayanalytics.controller.*;
import im.agg.gameplayanalytics.server.Server;
import im.agg.gameplayanalytics.server.Store;
import im.agg.gameplayanalytics.server.models.Account;
import im.agg.gameplayanalytics.server.models.Skill;
import lombok.extern.slf4j.Slf4j;
import net.runelite.client.callback.ClientThread;
import net.runelite.api.Client;
import net.runelite.api.events.GameStateChanged;
import net.runelite.api.events.GameTick;
import net.runelite.api.events.StatChanged;
import net.runelite.client.config.ConfigManager;
import net.runelite.client.eventbus.Subscribe;
import net.runelite.client.game.ItemManager;
import net.runelite.client.plugins.Plugin;
import net.runelite.client.plugins.PluginDescriptor;

import java.util.Arrays;

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
    private ClientThread clientThread;

    private final Store store = new Store();
    private final Server server = new Server(this.store);

    private final ActivityController activityController =
            new ActivityController();
    private final MapController mapController = new MapController();
    private final StorageController storageController = new StorageController();
    private final XPController xpController = new XPController();

    private final Controller[] controllers = new Controller[]{
            activityController, mapController, storageController, xpController};

    private boolean firstTick = true;

    private boolean didLogin = false;

    @Override
    protected void startUp() throws Exception {
        this.store.init();
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

            var account = new Account(id, username);

            // Write character to store
            this.store.createOrUpdatePlayer(account);

            Arrays.stream(this.controllers)
                    .forEach(controller -> controller.startDataFlow(account));
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


    @Provides
    GameplayAnalyticsConfig provideConfig(ConfigManager configManager) {
        return configManager.getConfig(GameplayAnalyticsConfig.class);
    }
}
