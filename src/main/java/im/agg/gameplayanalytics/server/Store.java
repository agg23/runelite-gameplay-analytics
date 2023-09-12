package im.agg.gameplayanalytics.server;

import im.agg.gameplayanalytics.server.dbmodels.*;
import im.agg.gameplayanalytics.server.dbmodels.retrieval.*;
import im.agg.gameplayanalytics.server.models.*;
import lombok.extern.slf4j.Slf4j;
import org.knowm.yank.Yank;
import org.knowm.yank.exceptions.YankSQLException;

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

        // XP

        this.createEventsTable("xp_event", false, String.format("""
                    type INTEGER NOT NULL,
                    %s
                    changed_skills INTEGER NOT NULL,
                """, skillColumns.toString()));

        // Map

        this.createEventsTable("map_event", false, """
                    region INTEGER NOT NULL,
                    tile_x INTEGER NOT NULL,
                    tile_y INTEGER NOT NULL,
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

        // Membership

        this.sqlExecute("""
                CREATE TABLE IF NOT EXISTS membership_status (
                    account_id INTEGER NOT NULL,
                    start_timestamp INTEGER NOT NULL,
                    expiration_timestamp INTEGER NOT NULL,
                    FOREIGN KEY (account_id) REFERENCES account (id)
                )
                """);

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
