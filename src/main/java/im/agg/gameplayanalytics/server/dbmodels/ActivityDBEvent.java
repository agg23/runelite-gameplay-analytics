package im.agg.gameplayanalytics.server.dbmodels;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.knowm.yank.annotations.Column;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ActivityDBEvent {
    private long accountId;

    private long startTimestamp;
    @Column("last_update_timestamp")
    private long endTimestamp;
}
