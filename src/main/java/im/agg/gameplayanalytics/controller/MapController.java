package im.agg.gameplayanalytics.controller;

import im.agg.gameplayanalytics.server.models.Account;
import im.agg.gameplayanalytics.server.models.MapEvent;
import lombok.extern.slf4j.Slf4j;

import java.util.Date;
import java.util.Timer;
import java.util.TimerTask;

@Slf4j
public class MapController extends Controller {
    static final Integer UPDATE_PERIOD = 30;

    private Timer timer = new Timer();

    private MapEvent lastMapEvent;

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

    private void updateMap() {
        var worldPoint = this.client.getLocalPlayer().getWorldLocation();

        var event = new MapEvent(worldPoint.getRegionID(), worldPoint.getX(),
                worldPoint.getY(), this.account.getId(), new Date());

        if (event.changedEquals(this.lastMapEvent)) {
            return;
        }

        log.info(
                String.format("Writing map: Region: %d, Tile X: %d, Tile Y: %d",
                        worldPoint.getRegionID(), worldPoint.getX(),
                        worldPoint.getY()));

        this.store.writeMapEvent(event);

        this.lastMapEvent = event;
    }
}
