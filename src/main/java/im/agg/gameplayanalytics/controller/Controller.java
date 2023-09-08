package im.agg.gameplayanalytics.controller;

import im.agg.gameplayanalytics.server.Server;
import im.agg.gameplayanalytics.server.Store;
import im.agg.gameplayanalytics.server.models.Account;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import net.runelite.api.Client;

public abstract class Controller {
    protected Client client;
    protected Store store;
    protected Server server;

    protected Account account;

    public void init(Client client, Store store, Server server) {
        this.client = client;
        this.store = store;
        this.server = server;
    }

    public void shutdown() {

    }

    public void logout() {

    }

    /**
     * Signaled by first tick after login. User data should now be available on client
     */
    public void startDataFlow(Account account) {
        this.account = account;
    }
}
