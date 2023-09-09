package im.agg.gameplayanalytics.server.models;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LootEntryEvent {
    private int itemId;
    private int quantity;
    private int gePerItem;
}
