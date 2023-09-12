package im.agg.gameplayanalytics.server.dbmodels.retrieval;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class LootDBRetrival {
    private long id;

    private long timestamp;

    @JsonSerialize(using = ToStringSerializer.class)
    private long accountId;

    private int type;

    private int npcId;
    private int combatLevel;

    private int itemId;
    private int quantity;
    private int gePerItem;

    private int region;
    private int tileX;
    private int tileY;
}
