package im.agg.gameplayanalytics.server.models;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CombinedGEEntry {
    private long timestamp;

    private int completedQuantity;

    private int transferredGp;

    private boolean isCancelled;

    public boolean equals(CombinedGEEntry entry) {
        return this.completedQuantity == entry.getCompletedQuantity() &&
                this.transferredGp == entry.getTransferredGp() &&
                this.isCancelled == entry.isCancelled();
    }
}
