package im.agg.gameplayanalytics;

import net.runelite.client.RuneLite;
import net.runelite.client.externalplugins.ExternalPluginManager;

public class GameplayAnalyticsPluginTest
{
	public static void main(String[] args) throws Exception
	{
		//noinspection unchecked
		ExternalPluginManager.loadBuiltin(GameplayAnalyticsPlugin.class);
		RuneLite.main(args);
	}
}