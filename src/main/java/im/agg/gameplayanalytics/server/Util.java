package im.agg.gameplayanalytics.server;

import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.io.InputStream;

@Slf4j

public class Util {
    public static InputStream loadResourceStream(final Class<?> c, final String path) {
        try (InputStream in = c.getResourceAsStream(path))
        {
            return in;
        }
        catch (IllegalArgumentException e)
        {
            final String filePath;

            if (path.startsWith("/"))
            {
                filePath = path;
            }
            else
            {
                filePath = c.getPackage().getName().replace('.', '/') + "/" + path;
            }

            log.warn("Failed to load value from class: {}, path: {}", c.getName(), filePath);

            throw new IllegalArgumentException(path, e);
        }
        catch (IOException e)
        {
            throw new RuntimeException(path, e);
        }
    }
}
