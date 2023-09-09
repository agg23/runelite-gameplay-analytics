package im.agg.gameplayanalytics.server.models;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class LootEvent {
    private long id;

    private long timestamp;

    @JsonSerialize(using = ToStringSerializer.class)
    private long accountId;

    private int type;

    private int npcId;
    private int combatLevel;

    private int region;
    private int tileX;
    private int tileY;

    private List<LootEntryEvent> entries;
}
