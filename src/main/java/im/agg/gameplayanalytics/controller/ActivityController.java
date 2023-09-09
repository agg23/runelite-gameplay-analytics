package im.agg.gameplayanalytics.controller;

import im.agg.gameplayanalytics.server.Server;
import im.agg.gameplayanalytics.server.Store;
import im.agg.gameplayanalytics.server.models.Account;
import im.agg.gameplayanalytics.server.models.ActivityEvent;
import im.agg.gameplayanalytics.server.models.ActivityKind;
import lombok.NonNull;
import net.runelite.api.Client;

import java.util.Date;

public class ActivityController extends Controller {
    @Override
    public void logout() {
        super.logout();

        this.store.writeActivityEvent(
                new ActivityEvent(ActivityKind.Logout, this.account.getId(),
                        new Date()));
    }

    @Override
    public void startDataFlow(Account account) {
        super.startDataFlow(account);

        this.store.writeActivityEvent(
                new ActivityEvent(ActivityKind.Login, this.account.getId(),
                        new Date()));
    }
}
