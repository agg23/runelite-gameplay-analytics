package im.agg.gameplayanalytics.controller;

import im.agg.gameplayanalytics.server.models.Account;
import im.agg.gameplayanalytics.server.models.ActivityEvent;

import java.util.Date;
import java.util.Timer;
import java.util.TimerTask;

public class ActivityController extends Controller {
    static final Integer UPDATE_PERIOD = 30;

    private Timer timer = new Timer();

    @Override
    public void logout() {
        super.logout();

        if (this.timer != null) {
            this.timer.cancel();
        }

        this.timer = new Timer();

        // Update activity one last time
        this.store.updateLastActivityEvent(
                new ActivityEvent(this.account.getId(), new Date()));
    }

    @Override
    public void startDataFlow(Account account) {
        super.startDataFlow(account);

        this.timer.scheduleAtFixedRate(new TimerTask() {
            @Override
            public void run() {
                store.updateLastActivityEvent(
                        new ActivityEvent(account.getId(), new Date()));
            }
            // Capture the map position instantly
        }, 0, UPDATE_PERIOD * 1000);

        this.store.createNewActivityEvent(
                new ActivityEvent(this.account.getId(), new Date()));
    }
}
