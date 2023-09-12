package im.agg.gameplayanalytics.server;

import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.io.InputStream;
import java.util.LinkedList;
import java.util.List;

@Slf4j

public class Util {
    public static InputStream loadResourceStream(final Class<?> c,
                                                 final String path) {
        try (InputStream in = c.getResourceAsStream(path)) {
            return in;
        } catch (IllegalArgumentException e) {
            final String filePath;

            if (path.startsWith("/")) {
                filePath = path;
            } else {
                filePath =
                        c.getPackage().getName().replace('.', '/') + "/" + path;
            }

            log.warn("Failed to load value from class: {}, path: {}",
                    c.getName(), filePath);

            throw new IllegalArgumentException(path, e);
        } catch (IOException e) {
            throw new RuntimeException(path, e);
        }
    }

    public interface GroupedListOperator<T> {
        public long op(T entry);
    }

    /**
     * Groups list items by id, with the assumption that all items in the group are contiguous
     * (i.e. from a JOIN)
     *
     * @param list     The list to group
     * @param operator A selector for the object's ID
     * @return A list of LinkedList groups
     */
    // Taken from https://stackoverflow.com/a/65061385
    public static <T> List<LinkedList<T>> groupSequentialList(List<T> list,
                                                              GroupedListOperator<T> operator) {
        return list.stream()
                .collect(LinkedList<LinkedList<T>>::new,
                        (listOfLists, object) -> {
                            if (listOfLists.isEmpty() ||
                                    operator.op(
                                            listOfLists.getLast().getLast()) !=
                                            operator.op(object)) {
                                // If we're starting out and the parent list is empty, or
                                // the last stored item is not in our group, create a new group
                                listOfLists.add(
                                        new LinkedList<>(List.of(object)));
                            } else {
                                // This has a matching key, add to group
                                listOfLists.getLast().add(object);
                            }
                        }, List::addAll);
    }
}
