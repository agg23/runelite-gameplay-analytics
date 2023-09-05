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

import java.util.Timer;
import java.util.TimerTask;

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

	private boolean initializeXP = true;

	private Timer delayTimer;

	@Override
	protected void startUp() throws Exception
	{
		log.info("Gameplay Analytics started!");

		this.controller.init();
	}

	@Override
	protected void shutDown() throws Exception
	{
		this.controller.shutdown();

		log.info("Gameplay Analytics stopped!");
	}

	@Subscribe
	public void onGameStateChanged(GameStateChanged gameStateChanged)
	{
		switch (gameStateChanged.getGameState()) {
//			case LOGGED_IN -> {
//				this.controller.initializeXp(this.client);
//			}
			case LOGIN_SCREEN -> {
				this.initializeXP = true;
			}
		}
	}

	@Subscribe
	public void onStatChanged(StatChanged statChanged) {
//		if (this.delayTimer != null) {
//			this.delayTimer.cancel();
//			this.delayTimer = null;
//		}
//
//		var skill = Skill.fromRLSkill(statChanged.getSkill());
//
//		if (this.isXPStartup) {
//			// Continue queuing data for a full update
//			// Once no updates occur in the last second, send the full XP push
//			this.delayTimer = new Timer();
//			this.delayTimer.schedule(new TimerTask() {
//				@Override
//				public void run() {
//					isXPStartup = false;
//					delayTimer = null;
//
//					controller.initializeXp();
//				}
//			}, 1000);
//
//			// Update XP, but don't write
//			this.controller.updateXp(skill, statChanged.getXp(), false);
//		} else {

		if (this.initializeXP) {
			return;
		}

		log.info(String.format("Skill: %s, XP: %d, Level: %d, Boosted level: %d", statChanged.getSkill().getName(), statChanged.getXp(), statChanged.getLevel(), statChanged.getBoostedLevel()));
		var skill = Skill.fromRLSkill(statChanged.getSkill());
		this.controller.updateXp(skill, statChanged.getXp(), true);
//		}
	}

	@Subscribe
	public void onGameTick(GameTick event) {
		// On first tick, initialize XP
		if (this.initializeXP) {
			this.initializeXP = false;

			this.controller.initializeXp(this.client);
		}
	}

	@Provides
	GameplayAnalyticsConfig provideConfig(ConfigManager configManager)
	{
		return configManager.getConfig(GameplayAnalyticsConfig.class);
	}
}
