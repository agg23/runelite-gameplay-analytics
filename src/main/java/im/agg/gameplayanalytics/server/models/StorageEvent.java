package im.agg.gameplayanalytics.server.models;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;

public class StorageEvent {
    private long id;

    private long timestamp;

    @JsonSerialize(using = ToStringSerializer.class)
    private long accountId;
}
