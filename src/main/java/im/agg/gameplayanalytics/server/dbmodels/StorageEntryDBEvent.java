package im.agg.gameplayanalytics.server.dbmodels;

import lombok.*;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode
public class StorageEntryDBEvent {
    @EqualsAndHashCode.Exclude
    private long eventId;
    @EqualsAndHashCode.Exclude
    private long timestamp;

    private int itemId;
    private int slot;
    private int quantity;
    private int gePerItem;

    public StorageEntryDBEvent(long timestamp, int itemId, int slot, int quantity, int gePerItem) {
        // Set ID to 0, as that will be set later
        this(0, timestamp, itemId, slot, quantity, gePerItem);
    }
}
