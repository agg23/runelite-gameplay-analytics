package im.agg.gameplayanalytics.server;

import im.agg.gameplayanalytics.server.dbmodels.StorageDBEvent;
import im.agg.gameplayanalytics.server.dbmodels.StorageEntryDBEvent;
import im.agg.gameplayanalytics.server.dbmodels.XPDBEvent;
import im.agg.gameplayanalytics.server.models.Account;
import im.agg.gameplayanalytics.server.models.ActivityEvent;
import im.agg.gameplayanalytics.server.models.MapEvent;
import im.agg.gameplayanalytics.server.models.Skill;
import lombok.extern.slf4j.Slf4j;
import org.knowm.yank.Yank;
import org.knowm.yank.exceptions.YankSQLException;

import java.util.List;
import java.util.Properties;

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
                CREATE TABLE IF NOT EXISTS player (
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

        this.createEventsTable("activity_event", false, """
                    type INTEGER NOT NULL,
                """);

        // Storage (Inventory, bank)

        this.createEventsTable("storage_event", true, """
                    type INTEGER NOT NULL,
                """);

        this.sqlExecute("""
                CREATE TABLE IF NOT EXISTS storage_entry (
                    event_id INTEGER NOT NULL,
                    timestamp INTEGER NOT NULL,
                    item_id INTEGER NOT NULL,
                    slot INTEGER NOT NULL,
                    quantity INTEGER NOT NULL,
                    ge_per_item INTEGER NOT NULL,
                    FOREIGN KEY (event_id) REFERENCES storage_event (id)
                )
                """);

        this.createTimestampIndex("storage_entry");

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
                            player_id INTEGER NOT NULL,
                            timestamp INTEGER NOT NULL,
                            %s
                            %s
                            FOREIGN KEY (player_id) REFERENCES player (id)
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

    public void createOrUpdatePlayer(Account account) {
        Yank.execute("""
                INSERT OR IGNORE INTO player (id, username) VALUES (?, ?);
                UPDATE player SET username = ? WHERE id = ?
                """, new Object[]{account.getId(), account.getUsername()});
    }

    public void writeXPEvent(XPDBEvent event) {
        var parameters = new Object[]{
                event.getTimestamp(),
                event.getPlayerId(),
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
                INSERT INTO xp_event (timestamp, player_id, type,
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
                    (timestamp, player_id, region, tile_x, tile_y)
                VALUES (?, ?, ?, ?, ?)
                """, parameters);
    }

    public void writeActivityEvent(ActivityEvent event) {
        var parameters = new Object[]{
                event.getTimestamp(),
                event.getAccountId(),
                event.getType().getState()
        };

        Yank.execute("""
                INSERT INTO activity_event
                    (timestamp, player_id, type)
                VALUES (?, ?, ?)
                """, parameters);
    }

    public void writeStorageEvent(StorageDBEvent event,
                                  List<StorageEntryDBEvent> entries) {
        var parameters = new Object[]{
                event.getType(),
                event.getPlayerId(),
                event.getTimestamp()
        };

        var id = Yank.insert("""
                INSERT INTO storage_event
                    (type, player_id, timestamp)
                VALUES (?, ?, ?)
                """, parameters);

        var params = new Object[entries.size()][];

        for (var i = 0; i < entries.size(); i++) {
            var entry = entries.get(i);
            params[i] = new Object[]{
                    id,
                    entry.getTimestamp(),
                    entry.getItemId(),
                    entry.getSlot(),
                    entry.getQuantity(),
                    entry.getGePerItem()
            };
        }

        Yank.executeBatch("""
                INSERT INTO storage_entry
                    (event_id, timestamp, item_id, slot, quantity, ge_per_item)
                VALUES (?, ?, ?, ?, ?, ?)
                """, params);
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
                SELECT * FROM player
                """, Account.class, new Object[]{});
    }

    public List<XPDBEvent> getXPEvents(long accountId) {
        return Yank.queryBeanList("""
                SELECT * FROM xp_event WHERE player_id = ?
                """, XPDBEvent.class, new Object[]{accountId});
    }
}
