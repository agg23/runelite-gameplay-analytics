package im.agg.gameplayanalytics.server;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import im.agg.gameplayanalytics.server.dbmodels.XPDBEvent;
import im.agg.gameplayanalytics.server.models.JSONError;
import im.agg.gameplayanalytics.server.models.HTTPJSONWrapper;
import im.agg.gameplayanalytics.server.models.WSJSONWrapper;
import io.javalin.Javalin;
import io.javalin.core.util.JavalinLogger;
import io.javalin.http.ContentType;
import io.javalin.http.Context;
import io.javalin.http.util.RedirectToLowercasePathPlugin;
import io.javalin.websocket.WsContext;
import lombok.extern.slf4j.Slf4j;
import net.runelite.api.Client;
import net.runelite.client.util.ImageUtil;
import org.jetbrains.annotations.NotNull;

import javax.imageio.ImageIO;
import java.io.ByteArrayOutputStream;
import java.util.HashSet;
import java.util.concurrent.*;

@Slf4j

public class Server {
    private final Javalin app;

    private final ObjectMapper jsonMapper = new ObjectMapper();

    private final Store store;
    private final InternalMetadataServer internalMetadataServer;

    private final HashSet<WsContext> activeContexts = new HashSet<>();

    public Server(Store store, InternalMetadataServer internalMetadataServer) {
        this.store = store;
        this.internalMetadataServer = internalMetadataServer;

        this.app = Javalin.create(config -> {
            // TODO: Make this more targeted
            config.enableCorsForAllOrigins();

            config.registerPlugin(new RedirectToLowercasePathPlugin());
        });
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
            ctx.json(new HTTPJSONWrapper(accounts));
        });

        this.createAccountRoute("/api/activity/{accountId}",
                (ctx, accountId) -> {
                    var events = this.store.getActivity(accountId);
                    ctx.json(new HTTPJSONWrapper(events));
                });

        this.createAccountRoute("/api/loot/{accountId}", ((ctx, accountId) -> {
            var events = this.store.getLootEvents(accountId);
            ctx.json(new HTTPJSONWrapper(events));
        }));

        this.createAccountRoute("/api/map/{accountId}", ((ctx, accountId) -> {
            var events = this.store.getMapEvents(accountId);
            ctx.json(new HTTPJSONWrapper(events));
        }));

        this.createAccountRoute("/api/storage/{accountId}/{type}",
                (ctx, accountId) -> {
                    var typeParam = ctx.pathParam("type");

                    int type = 0;

                    try {
                        type = Integer.parseInt(typeParam);
                    } catch (NumberFormatException e) {
                        errorResponse("Invalid storage type provided", ctx);
                    }

                    var events = this.store.getStorageEvents(accountId, type);
                    ctx.json(new HTTPJSONWrapper(events));
                });

        this.createAccountRoute("/api/xp/{accountId}", ((ctx, accountId) -> {
            var events = this.store.getXPEvents(accountId);
            ctx.json(new HTTPJSONWrapper(events));
        }));

        this.app.get("/api/settings", ctx -> {
            var settings = this.store.getSettings();
            // Inject JSONWrapper around string. Can't use object because this isn't a string, but a serialized JSON object
            ctx.result(String.format("{\"type\": \"success\", \"data\": %s}",
                    settings));
            ctx.contentType(ContentType.JSON);
        });

        this.app.post("/api/settings", ctx -> {
            var body = ctx.body();

            if (body.isEmpty()) {
                errorResponse("Empty body", ctx);
                return;
            }

            this.store.writeSettings(ctx.body());

            ctx.json(new HTTPJSONWrapper(null));
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

        this.app.get("/assets/items/{itemId}.png", ctx -> {
            var itemIdString = ctx.pathParam("itemId");

            int itemId = 0;
            try {
                itemId = Integer.parseInt(itemIdString);
            } catch (NumberFormatException e) {
                ctx.result("Invalid itemID");
                return;
            }
            var future = this.internalMetadataServer.getItemImage(itemId);

            // TODO: This might be bad because it hits the main thread
            ctx.future(future.thenAccept(bytes -> ctx.result(bytes)
                    .contentType(ContentType.IMAGE_PNG)));
        });

        this.app.get("/assets/skillicons/{skill}.png", ctx -> {
            // TODO: This is extremely inefficient. Instead we should host a static directory from the resource URI
            var skillName = ctx.pathParam("skill").toLowerCase();

            var skillPath = "/skill_icons/" + skillName + ".png";

            var image = ImageUtil.loadImageResource(Client.class, skillPath);

            var outputStream = new ByteArrayOutputStream();
            ImageIO.write(image, "png", outputStream);
            ctx.result(outputStream.toByteArray());
            ctx.contentType(ContentType.IMAGE_PNG);
            // One year cache time
            ctx.header("Cache-Control", "public, max-age=30758400");
        });
    }

    interface AccountRouteHandler {
        void handle(@NotNull Context ctx, long accountId) throws Exception;
    }

    private void createAccountRoute(String route, AccountRouteHandler handler) {
        this.app.get(route, ctx -> {
            var accountIdString = ctx.pathParam("accountId");

            long accountId = 0;

            try {
                accountId = Long.parseLong(accountIdString);
            } catch (NumberFormatException e) {
                errorResponse("Invalid account ID provided", ctx);
                return;
            }

            handler.handle(ctx, accountId);
        });
    }

    private void emitWSMessage(String route, Object data) {
        var wrappedData = new WSJSONWrapper(route, data);

        try {
            var json = this.jsonMapper.writeValueAsString(wrappedData);

            this.activeContexts.forEach(ctx -> {
                ctx.send(json);
            });
        } catch (JsonProcessingException e) {
            log.error(e.getMessage());
        }
    }

    private void errorResponse(String message, Context ctx) {
        ctx.status(400);

        ctx.json(new JSONError(message));
    }

    public void updatedXPData(XPDBEvent event) {
        // TODO: Check for filtering parameters
        this.emitWSMessage("xp", event);
    }
}
