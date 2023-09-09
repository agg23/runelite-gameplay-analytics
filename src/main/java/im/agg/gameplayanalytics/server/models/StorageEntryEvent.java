package im.agg.gameplayanalytics.server.models;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class StorageEntryEvent {
    private int itemId;
    private int slot;
    private int quantity;
    private int gePerItem;
}
