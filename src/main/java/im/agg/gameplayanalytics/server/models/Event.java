package im.agg.gameplayanalytics.server.models;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.experimental.SuperBuilder;

import java.util.Date;

@Data
@SuperBuilder
@NoArgsConstructor
public class Event {
    @NonNull
    public Date timestamp;
}
