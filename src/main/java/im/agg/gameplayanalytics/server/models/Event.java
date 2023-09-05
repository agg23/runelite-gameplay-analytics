package im.agg.gameplayanalytics.server.models;

import lombok.Getter;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;

import java.util.Date;

@Getter
@RequiredArgsConstructor
public class Event {
    @NonNull
    private Date timestamp;
}
