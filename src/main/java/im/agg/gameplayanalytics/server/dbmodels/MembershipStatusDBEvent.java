package im.agg.gameplayanalytics.server.dbmodels;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MembershipStatusDBEvent {
    private long accountId;

    private long startTimestamp;
    private long expirationTimestamp;

    public boolean isNull() {
        return this.accountId == 0 && this.startTimestamp == 0 &&
                this.expirationTimestamp == 0;
    }
}
