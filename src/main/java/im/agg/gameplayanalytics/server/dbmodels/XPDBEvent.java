package im.agg.gameplayanalytics.server.dbmodels;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.AccessLevel;

import java.util.Date;

// Separate from the main model because we need to generate the columns for the DB
@AllArgsConstructor
// Used specifically for Yank
@NoArgsConstructor
@Data
@SuppressWarnings("SpellCheckingInspection")
public class XPDBEvent {
    Long timestamp;

    long accountId;

    /**
     * 0 is a full update, 1 is a patch update
     */
    Integer type;

    Integer changedSkills;

    // Skills

    Integer attack;
    Integer strength;
    Integer defence;
    Integer ranged;
    Integer prayer;
    Integer magic;
    Integer runecraft;
    Integer hitpoints;
    Integer crafting;
    Integer mining;
    Integer smithing;
    Integer fishing;
    Integer cooking;
    Integer firemaking;
    Integer woodcutting;

    // Members

    Integer agility;
    Integer herblore;
    Integer thieving;
    Integer fletching;
    Integer slayer;
    Integer farming;
    Integer construction;
    Integer hunter;

    @JsonProperty("xpTotal")
    public Integer xpTotal() {
        return this.attack +
                this.strength +
                this.defence +
                this.ranged +
                this.prayer +
                this.magic +
                this.runecraft +
                this.hitpoints +
                this.crafting +
                this.mining +
                this.smithing +
                this.fishing +
                this.cooking +
                this.firemaking +
                this.woodcutting +
                this.agility +
                this.herblore +
                this.thieving +
                this.fletching +
                this.slayer +
                this.farming +
                this.construction +
                this.hunter;
    }
}
