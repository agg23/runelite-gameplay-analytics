package im.agg.gameplayanalytics.server.models;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class WSJSONWrapper {
    private final String route;
    private final Object data;
}
