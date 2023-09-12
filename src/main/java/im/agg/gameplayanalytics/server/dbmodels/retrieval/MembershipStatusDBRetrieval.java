package im.agg.gameplayanalytics.server.dbmodels.retrieval;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class MembershipStatusDBRetrieval {
    @JsonSerialize(using = ToStringSerializer.class)
    private long accountId;

    private long startTimestamp;
    private long expirationTimestamp;

    public boolean isNull() {
        return this.accountId == 0 && this.startTimestamp == 0 &&
                this.expirationTimestamp == 0;
    }
}
