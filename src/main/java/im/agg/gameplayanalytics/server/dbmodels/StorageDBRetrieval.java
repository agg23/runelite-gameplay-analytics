package im.agg.gameplayanalytics.server.dbmodels;

import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class StorageDBRetrieval {
    private Long id;

    private Long timestamp;
    private Long accountId;

    private Integer type;

    // Entry
    private Integer itemId;
    private Integer slot;
    private Integer quantity;
    private Integer gePerItem;
}
