package im.agg.gameplayanalytics.server.dbmodels.retrieval;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@NoArgsConstructor
public class GEDBRetrieval {
    private long timestamp;
    @JsonSerialize(using = ToStringSerializer.class)
    private long accountId;

    private int itemId;

    private int completedQuantity;
    private int totalQuantity;

    private int pricePerItem;
    private int transferredGp;

    // Boolean object is required for Yank retrieval
    private Boolean isBuy;
    private Boolean isCancelled;

    private int slot;

    private int worldType;

    public boolean isEmpty() {
        return this.itemId == 0 && this.completedQuantity == 0 &&
                this.totalQuantity == 0;
    }
}
