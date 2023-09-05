package im.agg.gameplayanalytics.server.models;

import lombok.Getter;
import org.jetbrains.annotations.NotNull;
import org.knowm.yank.annotations.Column;

import java.util.Date;

@Getter
public class MapEvent extends Event {
    @NotNull
    private final Integer region;

    @NotNull
    @Column("tile_x")
    private final Integer x;

    @NotNull
    @Column("tile_y")
    private final Integer y;

    public MapEvent(@NotNull Integer region, @NotNull Integer x, @NotNull Integer y, Date timestamp) {
        super(timestamp);

        this.region = region;
        this.x = x;
        this.y = y;
    }
}
