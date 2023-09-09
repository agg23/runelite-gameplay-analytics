package im.agg.gameplayanalytics.server.dbmodels;

import im.agg.gameplayanalytics.server.models.MapEvent;
import lombok.*;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class StorageEntryDBEvent {
    private long eventId;
    private long timestamp;

    private int itemId;
    private int slot;
    private int quantity;
    private int gePerItem;

    public StorageEntryDBEvent(long timestamp, int itemId, int slot,
                               int quantity, int gePerItem) {
        // Set ID to 0, as that will be set later
        this(0, timestamp, itemId, slot, quantity, gePerItem);
    }

    @Override
    public boolean equals(Object obj) {
        return this.changedEquals((StorageEntryDBEvent) obj);
    }

    /**
     * Compares two entries by non-unique properties for equality
     */
    public boolean changedEquals(StorageEntryDBEvent event) {
        return event != null && this.itemId == event.getItemId() &&
                this.slot == event.getSlot() &&
                this.quantity == event.getQuantity() &&
                this.gePerItem == event.getGePerItem();
    }
}
