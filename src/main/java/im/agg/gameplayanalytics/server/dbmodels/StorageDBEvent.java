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
    @JsonProperty("accountId")
    private long playerId;

    /**
     * 0 is player's inventory
     */
    private int type;

    public StorageDBEvent(int type, long timestamp, long playerId) {
        // Set ID to 0, as that will be set by DB
        this(0, timestamp, playerId, type);
    }
}