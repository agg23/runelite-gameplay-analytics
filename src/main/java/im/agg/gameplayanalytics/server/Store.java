package im.agg.gameplayanalytics.server;

import im.agg.gameplayanalytics.server.dbmodels.*;
import im.agg.gameplayanalytics.server.dbmodels.retrieval.*;
import im.agg.gameplayanalytics.server.models.*;
import lombok.extern.slf4j.Slf4j;
import org.knowm.yank.Yank;
import org.knowm.yank.exceptions.YankSQLException;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Properties;
import java.util.stream.Collectors;

import static im.agg.gameplayanalytics.server.Util.groupSequentialList;

@SuppressWarnings("SpellCheckingInspection")
@Slf4j

public class Store {
    public void init() {
        Properties props = new Properties();
        props.setProperty("jdbcUrl", "jdbc:sqlite:analytics.db");

        Yank.setupDefaultConnectionPool(props);

        createTables();
    }

    private void createTables() {
        var skillColumns = new StringBuilder();

        for (var skill : Skill.getSkillNames()) {
            skillColumns.append(String.format("%s INTEGER NOT NULL,\n", skill));
        }

        this.sqlExecute("""
                CREATE TABLE IF NOT EXISTS account (
                    id INTEGER NOT NULL PRIMARY KEY,
                    username STRING NOT NULL
                )
                """);

        // Activity

        this.sqlExecute("""
                CREATE TABLE IF NOT EXISTS activity (
                    account_id INTEGER NOT NULL,
                    start_timestamp INTEGER NOT NULL,
                    last_update_timestamp INTEGER NOT NULL,
                    FOREIGN KEY (account_id) REFERENCES account (id)
                )
                """);

        // Grand Exchange

        this.createEventsTable("ge_event", false, """
                    item_id INTEGER NOT NULL,
                    completed_quantity INTEGER NOT NULL,
                    total_quantity INTEGER NOT NULL,
                    price_per_item INTEGER NOT NULL,
                    transferred_gp INTEGER NOT NULL,
                    is_buy INTEGER NOT NULL,
                    is_cancelled INTEGER NOT NULL,
                    slot INTEGER NOT NULL,
                    world_type INTEGER NOT NULL,
                """);

        // Map

        this.createEventsTable("map_event", false, """
                    region INTEGER NOT NULL,
                    tile_x INTEGER NOT NULL,
                    tile_y INTEGER NOT NULL,
                """);

        // Membership

        this.sqlExecute("""
                CREATE TABLE IF NOT EXISTS membership_status (
                    account_id INTEGER NOT NULL,
                    start_timestamp INTEGER NOT NULL,
                    expiration_timestamp INTEGER NOT NULL,
                    FOREIGN KEY (account_id) REFERENCES account (id)
                )
                """);

        // Monster loot

        this.createEventsTable("loot_event", true, """
                    type INTEGER NOT NULL,
                    npc_id INTEGER NOT NULL,
                    combat_level INTEGER NOT NULL,
                    region INTEGER NOT NULL,
                    tile_x INTEGER NOT NULL,
                    tile_y INTEGER NOT NULL,
                """);

        this.sqlExecute("""
                CREATE TABLE IF NOT EXISTS loot_entry (
                    loot_id INTEGER NOT NULL,
                    item_id INTEGER NOT NULL,
                    quantity INTEGER NOT NULL,
                    ge_per_item INTEGER NOT NULL,
                    FOREIGN KEY (loot_id) REFERENCES loot_event (id)
                )
                """);

        // Storage (Inventory, Bank)

        this.createEventsTable("storage_event", true, """
                    type INTEGER NOT NULL,
                """);

        this.sqlExecute("""
                CREATE TABLE IF NOT EXISTS storage_entry (
                    event_id INTEGER NOT NULL,
                    item_id INTEGER NOT NULL,
                    slot INTEGER NOT NULL,
                    quantity INTEGER NOT NULL,
                    ge_per_item INTEGER NOT NULL,
                    FOREIGN KEY (event_id) REFERENCES storage_event (id)
                )
                """);

        // XP

        this.createEventsTable("xp_event", false, String.format("""
                    type INTEGER NOT NULL,
                    %s
                    changed_skills INTEGER NOT NULL,
                """, skillColumns.toString()));

        // Settings

        this.sqlExecute("""
                CREATE TABLE IF NOT EXISTS setting (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    setting BLOB NOT NULL
                )
                """);
    }

    private void createEventsTable(String name, boolean hasCustomPrimaryKey,
                                   String fields) {
        this.createEventsTable(name, hasCustomPrimaryKey, fields, "");
    }

    /**
     * Creates a new table for storing events
     *
     * @param name                Name of the table
     * @param hasCustomPrimaryKey Puts a custom `id` key as the first field, so Yank can grab it
     * @param fields              The fields to insert, with a trailing comma
     * @param foreignKeys         Foreign keys to apply
     */
    private void createEventsTable(String name, boolean hasCustomPrimaryKey,
                                   String fields, String foreignKeys) {
        this.sqlExecute(String.format("""
                        CREATE TABLE IF NOT EXISTS %s (
                            %s
                            account_id INTEGER NOT NULL,
                            timestamp INTEGER NOT NULL,
                            %s
                            %s
                            FOREIGN KEY (account_id) REFERENCES account (id)
                        )
                        """, name,
                hasCustomPrimaryKey ? "id INTEGER PRIMARY KEY AUTOINCREMENT," :
                        "", fields, foreignKeys));

        this.createTimestampIndex(name);
    }

    private void createTimestampIndex(String name) {
        this.sqlExecute(String.format("""
                CREATE INDEX IF NOT EXISTS %s_timestamp_idx ON %s (timestamp)
                """, name, name));
    }

    private void sqlExecute(String query) {
        try {
            Yank.execute(query, new Object[]{});
        } catch (YankSQLException e) {
            log.info(e.getMessage());
        }
    }

    public void shutdown() {
        Yank.releaseDefaultConnectionPool();
    }

    public void createOrUpdateAccount(Account account) {
        Yank.execute("""
                INSERT OR IGNORE INTO account (id, username) VALUES (?, ?);
                UPDATE account SET username = ? WHERE id = ?
                """, new Object[]{account.getId(), account.getUsername()});
    }

    public void createNewActivityEvent(ActivityEvent session) {
        var parameters = new Object[]{
                session.getAccountId(),
                session.getTimestamp(),
                // Start timestamp is used for the end of the duration as well
                session.getTimestamp()
        };

        Yank.execute("""
                INSERT INTO activity
                    (account_id, start_timestamp, last_update_timestamp)
                VALUES (?, ?, ?)
                """, parameters);
    }

    public void writeGEEvent(GEEvent event) {
        var parameters = new Object[]{
                event.getAccountId(),
                event.getTimestamp(),
                event.getItemId(),
                event.getCompletedQuantity(),
                event.getTotalQuantity(),
                event.getPricePerItem(),
                event.getTransferredGp(),
                event.isBuy(),
                event.isCancelled(),
                event.getSlot(),
                event.getWorldType()
        };

        Yank.execute("""
                INSERT INTO ge_event
                    (account_id, timestamp, item_id, completed_quantity,
                    total_quantity, price_per_item, transferred_gp, is_buy,
                    is_cancelled, slot, world_type)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, parameters);
    }

    public void updateLastActivityEvent(ActivityEvent session) {
        var parameters = new Object[]{
                session.getTimestamp(),
                session.getAccountId()
        };

        // Update the last activity row for this account
        Yank.execute("""
                UPDATE activity SET last_update_timestamp = ?
                WHERE start_timestamp = (SELECT MAX(start_timestamp) FROM activity WHERE account_id = ?)
                """, parameters);
    }

    public void writeLootEvent(LootDBEvent event,
                               List<LootEntryDBEvent> entries) {
        var eventParams = new Object[]{
                event.getTimestamp(),
                event.getAccountId(),
                event.getType(),
                event.getNpcId(),
                event.getCombatLevel(),
                event.getRegion(),
                event.getTileX(),
                event.getTileY()
        };

        var id = Yank.insert("""
                INSERT INTO loot_event
                    (timestamp, account_id, type, npc_id, combat_level, region, tile_x, tile_y)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, eventParams);

        var entryParams = new Object[entries.size()][];

        for (var i = 0; i < entries.size(); i++) {
            var entry = entries.get(i);
            entryParams[i] = new Object[]{
                    id,
                    entry.getItemId(),
                    entry.getQuantity(),
                    entry.getGePerItem()
            };
        }

        Yank.executeBatch("""
                INSERT INTO loot_entry
                    (loot_id, item_id, quantity, ge_per_item)
                VALUES (?, ?, ?, ?)
                """, entryParams);
    }

    public void writeMapEvent(MapEvent event) {
        var parameters = new Object[]{
                event.getTimestamp(),
                event.getAccountId(),
                event.getRegion(),
                event.getX(),
                event.getY()
        };

        Yank.execute("""
                INSERT INTO map_event
                    (timestamp, account_id, region, tile_x, tile_y)
                VALUES (?, ?, ?, ?, ?)
                """, parameters);
    }

    public void createOrUpdateLastMembershipStatus(
            long accountId, Date startTimestamp, Date expirationTimestamp) {
        var selectParameters = new Object[]{
                accountId
        };

        var maxStartTimestamp = Yank.queryBean("""
                SELECT
                    account_id, MAX(start_timestamp) as start_timestamp, expiration_timestamp
                FROM membership_status WHERE account_id = ?
                """, MembershipStatusDBRetrieval.class, selectParameters);

        var isInRange = !maxStartTimestamp.isNull() &&
                maxStartTimestamp.getExpirationTimestamp() >
                        startTimestamp.getTime() &&
                maxStartTimestamp.getStartTimestamp() <
                        startTimestamp.getTime();


        if (maxStartTimestamp.isNull() || !isInRange) {
            // No entry, do insert
            var insertParams =
                    new Object[]{accountId, startTimestamp, expirationTimestamp};

            Yank.execute("""
                    INSERT INTO membership_status
                        (account_id, start_timestamp, expiration_timestamp)
                    VALUES (?, ?, ?)
                    """, insertParams);
        } else {
            // Entry, do update
            var updateParams =
                    new Object[]{expirationTimestamp, maxStartTimestamp.getStartTimestamp()};

            Yank.execute("""
                    UPDATE membership_status SET expiration_timestamp = ?
                    WHERE start_timestamp = ?
                    """, updateParams);
        }
    }

    public void writeStorageEvent(StorageDBEvent event,
                                  List<StorageEntryDBEvent> entries) {
        var eventParams = new Object[]{
                event.getTimestamp(),
                event.getAccountId(),
                event.getType()
        };

        var id = Yank.insert("""
                INSERT INTO storage_event
                    (timestamp, account_id, type)
                VALUES (?, ?, ?)
                """, eventParams);

        var entryParams = new Object[entries.size()][];

        for (var i = 0; i < entries.size(); i++) {
            var entry = entries.get(i);
            entryParams[i] = new Object[]{
                    id,
                    entry.getItemId(),
                    entry.getSlot(),
                    entry.getQuantity(),
                    entry.getGePerItem()
            };
        }

        Yank.executeBatch("""
                INSERT INTO storage_entry
                    (event_id, item_id, slot, quantity, ge_per_item)
                VALUES (?, ?, ?, ?, ?)
                """, entryParams);
    }

    public void writeXPEvent(XPDBEvent event) {
        var parameters = new Object[]{
                event.getTimestamp(),
                event.getAccountId(),
                event.getType(),

                event.getAttack(),
                event.getStrength(),
                event.getDefence(),
                event.getRanged(),
                event.getPrayer(),
                event.getMagic(),
                event.getRunecraft(),
                event.getHitpoints(),
                event.getCrafting(),
                event.getMining(),
                event.getSmithing(),
                event.getFishing(),
                event.getCooking(),
                event.getFiremaking(),
                event.getWoodcutting(),

                event.getAgility(),
                event.getHerblore(),
                event.getThieving(),
                event.getFletching(),
                event.getSlayer(),
                event.getFarming(),
                event.getConstruction(),
                event.getHunter(),

                event.getChangedSkills()
        };

        Yank.execute("""
                INSERT INTO xp_event (timestamp, account_id, type,
                    attack, strength, defence, ranged, prayer, magic, runecraft, hitpoints, crafting,
                    mining, smithing, fishing, cooking, firemaking, woodcutting, agility, herblore,
                    thieving, fletching, slayer, farming, construction, hunter,
                    changed_skills)
                VALUES (?, ?, ?,
                    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                ?)""", parameters);
    }

    public void writeSettings(String blob) {
        Yank.execute("""
                INSERT OR REPLACE INTO setting
                    (id, setting)
                VALUES (1, ?)
                """, new Object[]{blob});
    }

    /* Reading */

    public String getSettings() {
        return Yank.queryScalar("""
                SELECT setting FROM setting
                """, String.class, new Object[]{});
    }

    public List<Account> getAccounts() {
        return Yank.queryBeanList("""
                SELECT * FROM account
                """, Account.class, new Object[]{});
    }

    public List<ActivityDBRetrieval> getActivity(long accountId) {
        return Yank.queryBeanList("""
                SELECT * FROM activity WHERE account_id = ?
                """, ActivityDBRetrieval.class, new Object[]{accountId});
    }

    public List<CombinedGEEvent> getGEEvents(long accountId) {
        var events = Yank.queryBeanList("""
                SELECT
                    timestamp, account_id, item_id, completed_quantity, total_quantity,
                    price_per_item, transferred_gp, is_buy, is_cancelled, slot, world_type
                FROM ge_event WHERE account_id = ?
                """, GEDBRetrieval.class, new Object[]{accountId});

        var slots = new CombinedGEEvent[8];

        var outputEvents = new ArrayList<CombinedGEEvent>();

        for (var dbEvent : events) {
            var slot = dbEvent.getSlot();

            var existingEvent = slots[slot];

            if (dbEvent.isEmpty()) {
                // Keep slot empty
                if (existingEvent != null &&
                        existingEvent.getCompletedTimestamp() == null) {
                    // Mark this item completed, though we missed the removal event
                    existingEvent.setCompletedTimestamp(dbEvent.getTimestamp());
                }

                slots[slot] = null;
                continue;
            }

            if (existingEvent == null) {
                var newEvent = createGEEventObject(dbEvent);
                slots[slot] = newEvent;
                outputEvents.add(newEvent);
                continue;
            }

            if (existingEvent.equalsDBEvent(dbEvent)) {
                // Add to entries list if it's not a dupe
                if (dbEvent.getCompletedQuantity() == 0 &&
                        !dbEvent.getIsCancelled()) {
                    // This entry can't have new data
                    continue;
                }

                var length = existingEvent.getEntries().size();

                var possibleEntry = new CombinedGEEntry(dbEvent.getTimestamp(),
                        dbEvent.getCompletedQuantity(),
                        dbEvent.getTransferredGp(), dbEvent.getIsCancelled());

                CombinedGEEntry newEntry = null;

                if (length == 0) {
                    // No entries
                    newEntry = possibleEntry;
                } else {
                    var lastEntry = existingEvent.getEntries().get(length - 1);

                    if (!lastEntry.equals(possibleEntry)) {
                        newEntry = possibleEntry;
                    }
                }

                if (newEntry != null) {
                    // Insert
                    // Update event state to include any new information
                    if (newEntry.isCancelled() ||
                            newEntry.getCompletedQuantity() ==
                                    existingEvent.getTotalQuantity()) {
                        existingEvent.setCompletedTimestamp(
                                newEntry.getTimestamp());
                        existingEvent.setCancelled(newEntry.isCancelled());
                    }

                    existingEvent.addEntry(newEntry);
                }
            } else {
                // This represents a whole new transaction. Evict the existing slot event
                var newEvent = createGEEventObject(dbEvent);
                slots[slot] = newEvent;
                outputEvents.add(newEvent);
            }
        }

        return outputEvents;
    }

    private CombinedGEEvent createGEEventObject(GEDBRetrieval event) {
        return new CombinedGEEvent(event.getAccountId(), event.getTimestamp(),
                null, event.getItemId(), event.getTotalQuantity(),
                event.getPricePerItem(), event.getSlot(), event.getIsBuy(),
                event.getIsCancelled(),
                event.getWorldType(), new ArrayList<>());
    }

    public List<LootEvent> getLootEvents(long accountId) {
        var entries = Yank.queryBeanList("""
                SELECT
                    id, timestamp, account_id, type, npc_id, combat_level, item_id, quantity, ge_per_item, region, tile_x, tile_y
                FROM loot_event JOIN loot_entry
                ON loot_event.id == loot_entry.loot_id
                WHERE account_id = ?
                """, LootDBRetrival.class, new Object[]{accountId});

        return groupSequentialList(entries, LootDBRetrival::getId).stream()
                .map(group -> {
                    var groupedEntries = group.stream()
                            .map(entry -> new LootEntryEvent(
                                    entry.getItemId(), entry.getQuantity(),
                                    entry.getGePerItem()))
                            .collect(Collectors.toList());

                    var first = group.getFirst();

                    return new LootEvent(first.getId(), first.getTimestamp(),
                            first.getAccountId(), first.getType(),
                            first.getNpcId(), first.getCombatLevel(),
                            first.getRegion(), first.getTileX(),
                            first.getTileY(),
                            groupedEntries);
                }).collect(Collectors.toList());
    }

    public List<MapDBRetrival> getMapEvents(long accountId) {
        return Yank.queryBeanList("""
                SELECT account_id, timestamp, region, tile_x, tile_y
                FROM map_event WHERE account_id = ?
                """, MapDBRetrival.class, new Object[]{accountId});
    }

    public List<StorageEvent> getStorageEvents(long accountId, int type) {
        var entries = Yank.queryBeanList("""
                SELECT
                    id, timestamp, account_id, type, item_id, slot, quantity, ge_per_item
                FROM storage_event JOIN storage_entry
                ON storage_event.id == storage_entry.event_id
                WHERE account_id = ? AND type = ?
                """, StorageDBRetrieval.class, new Object[]{accountId, type});

        return groupSequentialList(entries, StorageDBRetrieval::getId).stream()
                .map(group -> {
                    var groupedEntries = group.stream()
                            .map(entry -> new StorageEntryEvent(
                                    entry.getItemId(), entry.getSlot(),
                                    entry.getQuantity(), entry.getGePerItem()))
                            .collect(Collectors.toList());

                    var first = group.getFirst();

                    return new StorageEvent(first.getId(), first.getTimestamp(),
                            first.getAccountId(), first.getType(),
                            groupedEntries);
                }).collect(Collectors.toList());
    }

    public List<XPDBEvent> getXPEvents(long accountId) {
        return Yank.queryBeanList("""
                SELECT * FROM xp_event WHERE account_id = ?
                """, XPDBEvent.class, new Object[]{accountId});
    }
}
