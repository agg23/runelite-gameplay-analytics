package im.agg.gameplayanalytics.server.models;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import im.agg.gameplayanalytics.server.dbmodels.retrieval.GEDBRetrieval;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class CombinedGEEvent {
    @JsonSerialize(using = ToStringSerializer.class)
    private long accountId;

    private Long firstSeenTimestamp;
    private Long completedTimestamp;

    private int itemId;
    private int totalQuantity;

    private int pricePerItem;

    private int slot;

    private boolean isBuy;
    private boolean isCancelled;

    private int worldType;

    private List<CombinedGEEntry> entries;

    public boolean equalsDBEvent(GEDBRetrieval event) {
        return this.accountId == event.getAccountId() &&
                this.slot == event.getSlot() &&
                this.itemId == event.getItemId() &&
                this.totalQuantity == event.getTotalQuantity() &&
                this.pricePerItem == event.getPricePerItem() &&
                this.isBuy == event.getIsBuy() &&
                this.worldType == event.getWorldType();
    }

    public void addEntry(CombinedGEEntry entry) {
        this.entries.add(entry);
    }
}
