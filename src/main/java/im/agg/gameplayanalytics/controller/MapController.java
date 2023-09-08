package im.agg.gameplayanalytics.controller;

import im.agg.gameplayanalytics.server.Server;
import im.agg.gameplayanalytics.server.Store;
import im.agg.gameplayanalytics.server.models.Account;
import im.agg.gameplayanalytics.server.models.MapEvent;
import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;
import net.runelite.api.Client;

import java.util.Date;
import java.util.Timer;
import java.util.TimerTask;

@Slf4j
public class MapController extends Controller {
    static final Integer UPDATE_PERIOD = 30;

    private Timer timer = new Timer();

    @Override
    public void logout() {
        super.logout();

        if (this.timer != null) {
            this.timer.cancel();
        }

        this.timer = new Timer();

        this.updateMap();
    }

    @Override
    public void startDataFlow(Account account) {
        super.startDataFlow(account);

        this.timer.scheduleAtFixedRate(new TimerTask() {
            @Override
            public void run() {
                updateMap();
            }
            // Capture the map position instantly
        }, 0, UPDATE_PERIOD * 1000);
    }

    // TODO: Make incremental
    private void updateMap() {
        var worldPoint = this.client.getLocalPlayer().getWorldLocation();
        log.info(String.format("Region: %d, Tile X: %d, Tile Y: %d", worldPoint.getRegionID(), worldPoint.getX(), worldPoint.getY()));

        this.store.writeMapEvent(new MapEvent(worldPoint.getRegionID(), worldPoint.getX(), worldPoint.getY(), this.account.getId(), new Date()));
    }
}
