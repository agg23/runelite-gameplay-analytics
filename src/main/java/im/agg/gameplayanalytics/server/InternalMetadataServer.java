package im.agg.gameplayanalytics.server;

import net.runelite.client.callback.ClientThread;
import net.runelite.client.game.ItemManager;
import net.runelite.client.game.NPCManager;

import javax.imageio.ImageIO;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.concurrent.CompletableFuture;

public class InternalMetadataServer {
    private ClientThread clientThread;

    private ItemManager itemManager;

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
