package im.agg.gameplayanalytics.server;

import im.agg.gameplayanalytics.server.dbmodels.XPDBEvent;
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
                event.getTimestamp(),
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

    /* Reading */

    public List<XPDBEvent> getXPEvents() {
        var skillColumns = String.join(", ", Skill.getSkillNames());

        return Yank.queryBeanList(String.format("""
                SELECT timestamp, type, changed_skills, %s FROM xp_event
                """, skillColumns), XPDBEvent.class, new Object[]{});
    }
}
