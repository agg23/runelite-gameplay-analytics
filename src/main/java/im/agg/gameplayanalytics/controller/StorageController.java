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
    static final Long MIN_BANK_UPDATE_TIME = 60L;

    private Timer timer = new Timer();

    private List<StorageEntryDBEvent> lastInventoryEntries = new ArrayList<>();

    private int lastBankValue = 0;
    private Date lastBankUpdateTime;

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

    public void bankOpen() {
        // TODO: Log last seen bank change, and write it after 5 minutes if it differs from last write.
        // This lets you open the bank (snapshot), add something, then get a new snapshot 5 minutes later
        if (this.lastBankUpdateTime == null ||
                this.lastBankUpdateTime.getTime() +
                        MIN_BANK_UPDATE_TIME * 1000 <
                        new Date().getTime()) {
            this.lastBankUpdateTime = new Date();

            // Create a bank entry
            var wrapper = getInventory(InventoryID.BANK, 1, false);
            var event = wrapper.event;
            var entry = wrapper.entries.get(0);

            this.lastBankValue = entry.getGePerItem();

            log.info(String.format("Writing bank value %d, quantity %d",
                    this.lastBankValue, entry.getQuantity()));

            this.store.writeStorageEvent(event, wrapper.entries);
        }
    }

    private void updateInventory() {
        // Inventory type
        var wrapper = getInventory(InventoryID.INVENTORY, 0, true);
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
                                             int dbType, boolean recordItems) {
        var container = this.client.getItemContainer(inventoryID);

        var timestamp = new Date().getTime();
        var event = new StorageDBEvent(dbType, timestamp, this.account.getId());

        var totalPrice = 0;
        var itemCount = 0;

        var entries = new ArrayList<StorageEntryDBEvent>();

        for (var i = 0; i < container.size(); i++) {
            var item = container.getItem(i);

            if (item != null) {
                var price = this.itemManager.getItemPrice(item.getId());

                totalPrice += price * item.getQuantity();
                itemCount += 1;

                if (recordItems) {
                    var entry = new StorageEntryDBEvent(item.getId(), i,
                            item.getQuantity(), price);

                    entries.add(entry);
                }
            }
        }

        if (!recordItems) {
            // Placeholder entry for container's price
            var entry = new StorageEntryDBEvent(0, 0,
                    itemCount, totalPrice);

            entries.add(entry);
        }

        return new StorageEventWrapper(event, entries);
    }
}
