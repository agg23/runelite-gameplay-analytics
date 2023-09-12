package im.agg.gameplayanalytics.server.dbmodels.retrieval;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.knowm.yank.annotations.Column;

@Data
@NoArgsConstructor
public class ActivityDBRetrieval {
    @JsonSerialize(using = ToStringSerializer.class)
    private long accountId;

    private long startTimestamp;
    @Column("last_update_timestamp")
    private long endTimestamp;
}
