package im.agg.gameplayanalytics.server;

import io.javalin.Javalin;
import io.javalin.core.util.JavalinLogger;
import io.javalin.websocket.WsContext;
import lombok.extern.slf4j.Slf4j;

import java.util.HashSet;

@Slf4j

public class Server {
    private Javalin app;

    private final HashSet<WsContext> activeContexts = new HashSet<>();

    public void init() {
        // Disable logging
        JavalinLogger.enabled = false;

        this.app = Javalin.create().start(61932);

        log.info("Listening on http://localhost:61932");

        this.app.get("/", ctx -> {
            log.info("Received request");
            ctx.result("Hello world");
        });

        this.app.ws("/api/", ws -> {
            ws.onConnect(ctx -> {
                log.info("Connected client");

                activeContexts.add(ctx);
            });

            ws.onClose(ctx -> {
                log.info("Disconnected client");

                var didRemove = activeContexts.remove(ctx);

                assert didRemove;
            });
        });
    }

    public void recordXp() {
//        this.activeContexts.forEach(ctx -> {
//            ctx.send();
//        });
    }
}
