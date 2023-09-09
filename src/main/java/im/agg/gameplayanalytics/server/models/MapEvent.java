package im.agg.gameplayanalytics.server.models;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import org.jetbrains.annotations.NotNull;
import org.knowm.yank.annotations.Column;

import java.util.Date;

@Getter
public class MapEvent extends Event {
    private final int region;

    @Column("tile_x")
    private final int x;

    @Column("tile_y")
    private final int y;

    public MapEvent(int region, int x, int y, long accountId, Date timestamp) {
        super(timestamp, accountId);

        this.region = region;
        this.x = x;
        this.y = y;
    }

    /**
     * Compares two events by non-unique properties for equality
     */
    public boolean changedEquals(MapEvent event) {
        return event != null && this.region == event.getRegion() &&
                this.x == event.getX() && this.y == event.getY();
    }
}
