package im.agg.gameplayanalytics.server.dbmodels;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class LootDBRetrival {
    private Long id;

    private Long timestamp;

    private Long accountId;

    private Integer type;

    private Integer npcId;
    private Integer combatLevel;

    private Integer itemId;
    private Integer quantity;
    private Integer gePerItem;

    private Integer region;
    private Integer tileX;
    private Integer tileY;
}
