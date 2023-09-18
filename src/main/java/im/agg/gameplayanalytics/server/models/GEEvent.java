package im.agg.gameplayanalytics.server.models;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Date;

@Getter
@AllArgsConstructor
public class GEEvent {
    private final Date timestamp;
    private final long accountId;

    private final int itemId;

    private final int completedQuantity;
    private final int totalQuantity;

    private final int pricePerItem;
    private final int transferredGp;

    private final boolean isBuy;
    private final boolean isCancelled;

    private final int slot;

    private final int worldType;

    public boolean representsSameTransaction(GEEvent event) {
        return this.getItemId() == event.getItemId() &&
                // If completed quantities differ, then we need to update the transaction
                this.getCompletedQuantity() == event.getCompletedQuantity() &&
                this.getTotalQuantity() == event.totalQuantity &&
                this.getPricePerItem() == event.getPricePerItem();
    }
}
