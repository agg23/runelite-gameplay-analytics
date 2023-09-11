package im.agg.gameplayanalytics.server.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.knowm.yank.annotations.Column;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ActivityEvent {
    private long accountId;

    private long startTimestamp;
    @Column("last_update_timestamp")
    private long endTimestamp;
}
