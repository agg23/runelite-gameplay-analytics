package im.agg.gameplayanalytics.server.dbmodels;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor
public class LootEntryDBEvent {
    private long lootId;

    private int itemId;
    private int quantity;
    private int gePerItem;

    public LootEntryDBEvent(int itemId, int quantity, int gePerItem) {
        // Set ID to 0, as that will be set later
        this(0, itemId, quantity, gePerItem);
    }
}
