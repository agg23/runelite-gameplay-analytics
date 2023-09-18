package im.agg.gameplayanalytics.server.models;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Date;

@Getter
@AllArgsConstructor
public class ActivityEvent {
    private final long accountId;
    private final Date timestamp;
}
