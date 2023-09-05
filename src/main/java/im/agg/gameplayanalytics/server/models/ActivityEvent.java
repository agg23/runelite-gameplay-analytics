package im.agg.gameplayanalytics.server.models;

import lombok.Getter;
import org.jetbrains.annotations.NotNull;

import java.util.Date;

@Getter
public class ActivityEvent extends Event {
    @NotNull
    private final ActivityKind type;

    public ActivityEvent(@NotNull ActivityKind type, Date timestamp) {
        super(timestamp);

        this.type = type;
    }
}
