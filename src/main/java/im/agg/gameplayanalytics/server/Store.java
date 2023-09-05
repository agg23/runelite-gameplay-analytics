package im.agg.gameplayanalytics.server;

import im.agg.gameplayanalytics.server.dbmodels.XPDBEvent;
import im.agg.gameplayanalytics.server.models.ActivityEvent;
import im.agg.gameplayanalytics.server.models.MapEvent;
import lombok.extern.slf4j.Slf4j;
import org.knowm.yank.Yank;
import org.knowm.yank.exceptions.YankSQLException;

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
        var skills = new String[]{
                "attack",
                "strength",
                "defence",
                "ranged",
                "prayer",
                "magic",
                "runecraft",
                "hitpoints",
                "crafting",
                "mining",
                "smithing",
                "fishing",
                "cooking",
                "firemaking",
                "woodcutting",

                "agility",
                "herblore",
                "thieving",
                "fletching",
                "slayer",
                "farming",
                "construction",
                "hunter"
        };

        var skillColumns = new StringBuilder();

        for (var skill : skills) {
            skillColumns.append(String.format("%s INTEGER,\n", skill));
        }

        createTable(String.format("""
                CREATE TABLE IF NOT EXISTS xp_event (
                    timestamp INTEGER,
                    type INTEGER,
                    %s
                    changed_skills INTEGER
                )
                """, skillColumns.toString()));

        createTable("""
                CREATE TABLE IF NOT EXISTS map_event (
                    timestamp INTEGER,
                    region INTEGER,
                    tile_x INTEGER,
                    tile_y INTEGER
                )
                """);

        createTable("""
                CREATE TABLE IF NOT EXISTS activity_event (
                    timestamp INTEGER,
                    type INTEGER
                )
                """);
    }

    private void createTable(String query) {
        try {
            Yank.execute(query, new Object[]{});
        } catch (YankSQLException e) {
            log.info(e.getMessage());
        }
    }

    public void shutdown() {
        Yank.releaseDefaultConnectionPool();
    }

    public void writeXPEvent(XPDBEvent event) {
        var parameters = new Object[]{
                event.timestamp,
                event.type,

                event.attack,
                event.strength,
                event.defence,
                event.ranged,
                event.prayer,
                event.magic,
                event.runecraft,
                event.hitpoints,
                event.crafting,
                event.mining,
                event.smithing,
                event.fishing,
                event.cooking,
                event.firemaking,
                event.woodcutting,
                event.agility,
                event.herblore,
                event.thieving,
                event.fletching,
                event.slayer,
                event.farming,
                event.construction,
                event.hunter,

                event.changedSkills
        };

        Yank.execute("""
                INSERT INTO xp_event VALUES (?, ?,
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                ?)""", parameters);
    }

    public void writeMapEvent(MapEvent event) {
        var parameters = new Object[]{
                event.getTimestamp(),
                event.getRegion(),
                event.getX(),
                event.getY()
        };

        Yank.execute("""
                INSERT INTO map_event VALUES (?, ?, ?, ?)
                """, parameters);
    }

    public void writeActivityEvent(ActivityEvent event) {
        var parameters = new Object[]{
                event.getTimestamp(),
                event.getType().getState()
        };

        Yank.execute("""
                INSERT INTO activity_event VALUES (?, ?)
                """, parameters);
    }
}
