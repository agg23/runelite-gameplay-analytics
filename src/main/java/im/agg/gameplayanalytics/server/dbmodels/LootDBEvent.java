package im.agg.gameplayanalytics.server.dbmodels;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor
public class LootDBEvent {
    private long id;

    private long timestamp;

    @JsonSerialize(using = ToStringSerializer.class)
    private long accountId;

    /**
     * 0 is monster, 1 is player
     */
    private int type;

    private int npcId;
    private int combatLevel;

    public LootDBEvent(long timestamp, long accountId, int type,
                       int npcId,
                       int combatLevel) {
        // Set ID to 0, as that will be set by DB
        this(0, timestamp, accountId, type, npcId, combatLevel);
    }
}
