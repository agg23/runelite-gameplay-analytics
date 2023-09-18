package im.agg.gameplayanalytics.controller;

import im.agg.gameplayanalytics.server.models.GEEvent;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.runelite.api.GameState;
import net.runelite.api.GrandExchangeOfferState;
import net.runelite.api.WorldType;
import net.runelite.api.events.GrandExchangeOfferChanged;

import java.util.Date;

@Slf4j
public class GEController extends Controller {
    @AllArgsConstructor
    class GESlot {
        private final GEEvent event;
        private final GrandExchangeOfferState state;
    }

    GESlot[] savedOffers = new GESlot[8];

    public void onGrandExchangeOfferChanged(
            GrandExchangeOfferChanged event) {
        var offer = event.getOffer();
        var state = offer.getState();

        if (state == GrandExchangeOfferState.EMPTY &&
                this.client.getGameState() != GameState.LOGGED_IN) {
            // Trades are cleared by the client during LOGIN_SCREEN/HOPPING/LOGGING_IN, ignore those
            return;
        }

        var existingOffer = this.savedOffers[event.getSlot()];

        if (offer.getItemId() == 0 || state == GrandExchangeOfferState.EMPTY) {
            // Clear/emptied slot
            // We need the DB to know it's been cleared so that two identical transactions aren't joined
            // So we end up writing this
            this.savedOffers[event.getSlot()] = null;
        }

        var isBuy = state == GrandExchangeOfferState.BUYING ||
                state == GrandExchangeOfferState.CANCELLED_BUY ||
                state == GrandExchangeOfferState.BOUGHT;
        var isCancelled = state == GrandExchangeOfferState.CANCELLED_BUY ||
                state == GrandExchangeOfferState.SELLING ||
                state == GrandExchangeOfferState.SOLD;

        // This may be called before first game tick, so directly get accountId
        var geEvent =
                new GEEvent(new Date(), this.client.getAccountHash(),
                        offer.getItemId(),
                        offer.getQuantitySold(), offer.getTotalQuantity(),
                        offer.getPrice(), offer.getSpent(), isBuy, isCancelled,
                        event.getSlot(), worldType());

        if (existingOffer != null &&
                existingOffer.event.representsSameTransaction(geEvent) &&
                existingOffer.state == offer.getState()) {
            // Offers are the same
            return;
        }

        log.info(String.format("Trade: %d, $%d, %d/%d, Spent: %d, state: %s",
                offer.getItemId(), offer.getPrice(), offer.getQuantitySold(),
                offer.getTotalQuantity(), offer.getSpent(), state.name()));

        this.store.writeGEEvent(geEvent);

        this.savedOffers[event.getSlot()] =
                new GESlot(geEvent, offer.getState());
    }

    private int worldType() {
        var worldTypes = this.client.getWorldType();

        if (worldTypes.contains(WorldType.SEASONAL)) {
            return 1;
        } else if (worldTypes.contains(WorldType.TOURNAMENT_WORLD)) {
            return 2;
        } else if (worldTypes.contains(WorldType.DEADMAN)) {
            return 3;
        } else if (worldTypes.contains(WorldType.FRESH_START_WORLD)) {
            return 4;
        }

        return 0;
    }
}
