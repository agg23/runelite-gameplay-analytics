package im.agg.gameplayanalytics.server.models;

import lombok.Getter;

import java.util.Date;

@Getter
public class ActivityEvent {
    private final long accountId;
    private final Date timestamp;

    public ActivityEvent(long accountId, Date timestamp) {
        this.accountId = accountId;
        this.timestamp = timestamp;
    }
}
