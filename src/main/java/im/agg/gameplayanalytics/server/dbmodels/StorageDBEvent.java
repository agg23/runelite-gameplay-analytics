package im.agg.gameplayanalytics.server.dbmodels;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.*;

@Getter
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor
public class StorageDBEvent {
    private long id;

    private long timestamp;

    @JsonSerialize(using = ToStringSerializer.class)
    private long accountId;

    /**
     * 0 is player's inventory
     */
    private int type;

    public StorageDBEvent(int type, long timestamp, long accountId) {
        // Set ID to 0, as that will be set by DB
        this(0, timestamp, accountId, type);
    }
}