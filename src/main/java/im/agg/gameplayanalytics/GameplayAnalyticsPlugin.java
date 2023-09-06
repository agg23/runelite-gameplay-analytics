package im.agg.gameplayanalytics;

import com.google.inject.Provides;
import javax.inject.Inject;

import im.agg.gameplayanalytics.server.Controller;
import im.agg.gameplayanalytics.server.models.Skill;
import lombok.extern.slf4j.Slf4j;
import net.runelite.api.Client;
import net.runelite.api.events.GameStateChanged;
import net.runelite.api.events.GameTick;
import net.runelite.api.events.StatChanged;
import net.runelite.client.config.ConfigManager;
import net.runelite.client.eventbus.Subscribe;
import net.runelite.client.plugins.Plugin;
import net.runelite.client.plugins.PluginDescriptor;

import static net.runelite.api.GameState.LOGIN_SCREEN;

@Slf4j
@PluginDescriptor(
	name = "Gameplay Analytics"
)
public class GameplayAnalyticsPlugin extends Plugin
{
	@Inject
	private Client client;

	@Inject
	private GameplayAnalyticsConfig config;

	private final Controller controller = new Controller();

	private boolean firstTick = true;

	private boolean didLogin = false;

	@Override
	protected void startUp() throws Exception
	{
		this.controller.init(this.client);
	}

	@Override
	protected void shutDown() throws Exception
	{
		this.controller.shutdown();
	}

	@Subscribe
	public void onGameStateChanged(GameStateChanged gameStateChanged)
	{
		var state = gameStateChanged.getGameState();

		switch (state) {
			case LOGGED_IN -> {
				this.didLogin = true;
			}
			case CONNECTION_LOST, LOGIN_SCREEN -> {
				if (this.didLogin) {
					this.controller.logout();
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

			this.controller.startDataflow();
		}
	}

	@Subscribe
	public void onStatChanged(StatChanged statChanged) {
		if (this.firstTick) {
			return;
		}

		log.info(String.format("Skill: %s, XP: %d, Level: %d, Boosted level: %d", statChanged.getSkill().getName(), statChanged.getXp(), statChanged.getLevel(), statChanged.getBoostedLevel()));
		var skill = Skill.fromRLSkill(statChanged.getSkill());
		this.controller.updateXp(skill, statChanged.getXp());
	}

	@Provides
	GameplayAnalyticsConfig provideConfig(ConfigManager configManager)
	{
		return configManager.getConfig(GameplayAnalyticsConfig.class);
	}
}
