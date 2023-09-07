package im.agg.gameplayanalytics.server.models;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class HTTPJSONWrapper {
    private final String type = "success";
    private final Object data;
}
