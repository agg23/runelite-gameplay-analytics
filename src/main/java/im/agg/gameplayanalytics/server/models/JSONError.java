package im.agg.gameplayanalytics.server.models;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public class JSONError {
    private final String type = "error";
    private final String message;
}
