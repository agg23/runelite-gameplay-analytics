package im.agg.gameplayanalytics.server;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import im.agg.gameplayanalytics.server.dbmodels.XPDBEvent;
import im.agg.gameplayanalytics.server.models.JSONError;
import im.agg.gameplayanalytics.server.models.JSONWrapper;
import io.javalin.Javalin;
import io.javalin.core.JavalinConfig;
import io.javalin.core.util.JavalinLogger;
import io.javalin.http.Context;
import io.javalin.websocket.WsContext;
import lombok.extern.slf4j.Slf4j;

import java.util.HashSet;

@Slf4j

public class Server {
    private final Javalin app;

    private final ObjectMapper jsonMapper = new ObjectMapper();

    private final Store store;

    private final HashSet<WsContext> activeContexts = new HashSet<>();

    public Server(Store store) {
        this.store = store;

        // TODO: Make this more targeted
        this.app = Javalin.create(JavalinConfig::enableCorsForAllOrigins);
    }

    public void init() {
        // Disable logging
        JavalinLogger.enabled = false;

        this.app.start(61932);

        log.info("Listening on http://localhost:61932");

        this.app.get("/", ctx -> {
            log.info("Received request");
            ctx.result("Hello world");
        });

//        this.app.ws("/api/", ws -> {
//            ws.onConnect(ctx -> {
//                log.info("Connected client");
//
//                activeContexts.add(ctx);
//            });
//
//            ws.onClose(ctx -> {
//                log.info("Disconnected client");
//
//                var didRemove = activeContexts.remove(ctx);
//
//                assert didRemove;
//            });
//        });
        this.app.get("/api/accounts", ctx -> {
            var accounts = this.store.getAccounts();
            ctx.json(new JSONWrapper(accounts));
        });

        this.app.get("/api/xp/{accountId}", ctx -> {
            var accountIdString = ctx.pathParam("accountId");

            long accountId = 0;

            try {
                accountId = Long.parseLong(accountIdString);
            } catch (NumberFormatException e) {
                errorResponse("Invalid account ID provided", ctx);
                return;
            }

            var events = this.store.getXPEvents(accountId);
            ctx.json(new JSONWrapper(events));
        });

        this.app.ws("/api/ws", ws -> {
            ws.onConnect(ctx -> {
                log.info("Connected client");

                this.activeContexts.add(ctx);
            });

            ws.onClose(ctx -> {
                log.info("Disconnected client");

                var didRemove = this.activeContexts.remove(ctx);

                assert didRemove;
            });
        });
    }

    private void emitWSMessage(String message) {
        this.activeContexts.forEach(ctx -> {
            ctx.send(message);
        });
    }

    private void errorResponse(String message, Context ctx) {
        ctx.status(400);

        ctx.json(new JSONError(message));
    }

    public void updatedXPData(XPDBEvent event) {
        // TODO: Check for filtering parameters
        try {
            var json = this.jsonMapper.writeValueAsString(event);

            this.emitWSMessage(json);
        } catch (JsonProcessingException e) {
            log.error(e.getMessage());
        }
    }
}
