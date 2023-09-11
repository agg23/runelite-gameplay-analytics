package im.agg.gameplayanalytics.controller;

import im.agg.gameplayanalytics.server.Server;
import im.agg.gameplayanalytics.server.Store;
import im.agg.gameplayanalytics.server.models.Account;
import net.runelite.api.Client;
import net.runelite.api.VarPlayer;
import net.runelite.client.callback.ClientThread;
import net.runelite.client.game.ItemManager;

import java.time.ZoneId;
import java.util.Calendar;
import java.util.Date;

public class MembershipController extends Controller {

    @Override
    public void startDataFlow(Account account) {
        super.startDataFlow(account);

        this.updateStatus();
    }

    private void updateStatus() {
        int membershipDays =
                this.client.getVarpValue(VarPlayer.MEMBERSHIP_DAYS);

        if (membershipDays == 0) {
            return;
        }

        var currentTimestamp = new Date();

        var calendar = Calendar.getInstance();
        calendar.setTime(currentTimestamp);
        // Get day (not exact time) `membershipDays` into the future
        calendar.add(Calendar.DATE, membershipDays);

        var localDate = calendar.toInstant()
                .atZone(ZoneId.systemDefault()).toLocalDate().atStartOfDay();

        var expirationTimestamp =
                Date.from(localDate.atZone(ZoneId.systemDefault()).toInstant());

        // Record current membership expiry time
        this.store.createOrUpdateLastMembershipStatus(this.account.getId(),
                currentTimestamp, expirationTimestamp);
    }
}
