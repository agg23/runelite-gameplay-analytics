package im.agg.gameplayanalytics.server.dbmodels;

import lombok.AllArgsConstructor;
import lombok.NonNull;
import org.jetbrains.annotations.NotNull;

import java.util.Date;

// Separate from the main model because we need to generate the columns for the DB
@AllArgsConstructor
@SuppressWarnings("SpellCheckingInspection")
public class XPDBEvent {
    @NonNull
    public Date timestamp;

    /**
     * 0 is a full update, 1 is a patch update
     */
    @NotNull
    public Integer type;

    // Skills

    @NonNull
    public Integer changedSkills;

    @NonNull
    public Integer attack;

    @NonNull
    public Integer strength;

    @NonNull
    public Integer defence;

    @NonNull
    public Integer ranged;

    @NonNull
    public Integer prayer;

    @NonNull
    public Integer magic;

    @NonNull
    public Integer runecraft;

    @NonNull
    public Integer hitpoints;

    @NonNull
    public Integer crafting;

    @NonNull
    public Integer mining;

    @NonNull
    public Integer smithing;

    @NonNull
    public Integer fishing;

    @NonNull
    public Integer cooking;

    @NonNull
    public Integer firemaking;

    @NonNull
    public Integer woodcutting;

    // Members

    @NonNull
    public Integer agility;

    @NonNull
    public Integer herblore;

    @NonNull
    public Integer thieving;

    @NonNull
    public Integer fletching;

    @NonNull
    public Integer slayer;

    @NonNull
    public Integer farming;

    @NonNull
    public Integer construction;

    @NonNull
    public Integer hunter;
}
