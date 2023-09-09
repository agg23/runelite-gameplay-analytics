package im.agg.gameplayanalytics.controller;

import im.agg.gameplayanalytics.server.dbmodels.StorageDBEvent;
import im.agg.gameplayanalytics.server.dbmodels.StorageEntryDBEvent;
import im.agg.gameplayanalytics.server.models.Account;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.runelite.api.InventoryID;

import java.util.*;

@Slf4j
public class StorageController extends Controller {
    static final Integer UPDATE_PERIOD = 60;

    private Timer timer = new Timer();

    private List<StorageEntryDBEvent> lastInventoryEntries = new ArrayList<>();

    @Override
    public void logout() {
        super.logout();

        if (this.timer != null) {
            this.timer.cancel();
        }

        this.timer = new Timer();

        this.updateInventory();
    }

    @Override
    public void startDataFlow(Account account) {
        super.startDataFlow(account);

        this.timer.scheduleAtFixedRate(new TimerTask() {
            @Override
            public void run() {
                clientThread.invoke(new Runnable() {
                    @Override
                    public void run() {
                        updateInventory();
                    }
                });
            }
            // Capture the map position instantly
        }, 0, UPDATE_PERIOD * 1000);
    }

    private void updateInventory() {
        // Inventory type
        var wrapper = getInventory(InventoryID.INVENTORY, 0);
        var event = wrapper.event;
        var entries = wrapper.entries;
        if (!entries.equals(this.lastInventoryEntries)) {
            log.info("Writing changed inventory");

            this.store.writeStorageEvent(event, entries);
        }

        this.lastInventoryEntries = entries;
    }

    @AllArgsConstructor
    private class StorageEventWrapper {
        final StorageDBEvent event;
        final List<StorageEntryDBEvent> entries;
    }

    private StorageEventWrapper getInventory(InventoryID inventoryID,
                                             int dbType) {
        var container = this.client.getItemContainer(inventoryID);

        var timestamp = new Date().getTime();
        var event = new StorageDBEvent(dbType, timestamp, this.account.getId());

        var entries = new ArrayList<StorageEntryDBEvent>();

        for (var i = 0; i < container.size(); i++) {
            var item = container.getItem(i);

            if (item != null) {
                var price = this.itemManager.getItemPrice(item.getId());
                var entry = new StorageEntryDBEvent(timestamp, item.getId(), i,
                        item.getQuantity(), price);

                entries.add(entry);
            }
        }

        return new StorageEventWrapper(event, entries);
    }
}
