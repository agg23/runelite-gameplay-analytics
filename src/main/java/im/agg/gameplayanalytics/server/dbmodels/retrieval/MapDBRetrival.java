package im.agg.gameplayanalytics.server.dbmodels.retrieval;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.knowm.yank.annotations.Column;

@Data
@NoArgsConstructor
public class MapDBRetrival {
    private long timestamp;

    @JsonSerialize(using = ToStringSerializer.class)
    private long accountId;

    private int region;
    @Column("tile_x")
    private int x;

    @Column("tile_y")
    private int y;
}
