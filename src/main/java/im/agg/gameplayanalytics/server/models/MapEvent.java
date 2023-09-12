package im.agg.gameplayanalytics.server.models;

import lombok.*;
import org.jetbrains.annotations.NotNull;
import org.knowm.yank.annotations.Column;

import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MapEvent {
    private Date timestamp;

    private long accountId;

    private int region;

    @Column("tile_x")
    private int x;

    @Column("tile_y")
    private int y;

    /**
     * Compares two events by non-unique properties for equality
     */
    public boolean changedEquals(MapEvent event) {
        return event != null && this.region == event.getRegion() &&
                this.x == event.getX() && this.y == event.getY();
    }
}
