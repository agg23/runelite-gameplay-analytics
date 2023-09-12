package im.agg.gameplayanalytics.server.dbmodels.retrieval;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class StorageDBRetrieval {
    private int id;

    private int timestamp;

    @JsonSerialize(using = ToStringSerializer.class)
    private int accountId;

    private int type;

    // Entry
    private int itemId;
    private int slot;
    private int quantity;
    private int gePerItem;
}
