package im.agg.gameplayanalytics.server;

import im.agg.gameplayanalytics.server.models.StorageEvent;
import net.runelite.client.callback.ClientThread;
import net.runelite.client.game.ItemManager;
import net.runelite.client.game.NPCManager;

import javax.imageio.ImageIO;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.concurrent.CompletableFuture;

public class InternalMetadataServer {
    private final Store store;
    private ClientThread clientThread;

    private ItemManager itemManager;

    public InternalMetadataServer(Store store) {
        this.store = store;
    }

    public void init(ClientThread clientThread, ItemManager itemManager
    ) {
        this.clientThread = clientThread;
        this.itemManager = itemManager;
    }

    public CompletableFuture<byte[]> getItemImage(int itemId) {
        var future = new CompletableFuture<byte[]>();

        this.clientThread.invoke(new Runnable() {
            @Override
            public void run() {
                var image = itemManager.getImage(itemId);
                ByteArrayOutputStream outputStream =
                        new ByteArrayOutputStream();
                try {
                    ImageIO.write(image, "png", outputStream);
                } catch (IOException e) {
                    throw new RuntimeException(e);
                }
                byte[] bytes = outputStream.toByteArray();

                future.complete(bytes);
            }
        });

        return future;
    }
}
