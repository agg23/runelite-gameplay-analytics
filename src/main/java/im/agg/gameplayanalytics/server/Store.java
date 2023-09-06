package im.agg.gameplayanalytics.server;

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

//        var result = Yank.queryBean("SELECT * FROM Foo", XPEvent.class, new Object[] {});
//
//        log.info(String.format("Output XP: %d", result.getCurrentXp(), result.timestamp));

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

        this.createEventsTable("xp_event", String.format("""
                    type INTEGER NOT NULL,
                    %s
                    changed_skills INTEGER NOT NULL,
                """, skillColumns.toString()));

        this.createEventsTable("map_event", """
                    region INTEGER NOT NULL,
                    tile_x INTEGER NOT NULL,
                    tile_y INTEGER NOT NULL,
                """);

        this.createEventsTable("activity_event", """
                    type INTEGER NOT NULL,
                """);
    }

    private void createEventsTable(String name, String fields) {
        this.sqlExecute(String.format("""
                CREATE TABLE IF NOT EXISTS %s (
                    player_id INTEGER NOT NULL,
                    timestamp INTEGER NOT NULL,
                    %s
                    FOREIGN KEY (player_id) REFERENCES player (id)
                )
                """, name, fields));

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

    /* Reading */

    public List<XPDBEvent> getXPEvents() {
        return Yank.queryBeanList("""
                SELECT * FROM xp_event
                """, XPDBEvent.class, new Object[]{});
    }
}
