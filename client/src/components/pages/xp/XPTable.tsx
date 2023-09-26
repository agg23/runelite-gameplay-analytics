import { Badge, Popover, Table } from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { skillImageUrl } from "components/osrs/skills/shared";
import { SkillBadge } from "components/osrs/skills/SkillBadge";
import { useMemo } from "react";
import { ALL_SKILLS, Skill } from "src/osrs/types";
import {
  capitalizeFirstLetter,
  formatDatetimeNice,
  formatDurationSpecificMilliseconds,
  formatNumber,
} from "src/util/string";

import { ActivityWithXP } from "./hooks/useCombinedXPActivity";

import classes from "./XPTable.module.scss";

interface XPTableProps {
  activityAndXPData: ActivityWithXP[];
}

export const XPTable: React.FC<XPTableProps> = ({ activityAndXPData }) => {
  return (
    <Table>
      <thead>
        <tr>
          <th>Session Start</th>
          <th>Duration</th>
          <th>Total Gained</th>
          <th>Average Rate</th>
          <th>Affected Skills</th>
        </tr>
      </thead>
      <tbody>
        {/* {(query.data ?? []).map((event) => (
          <GEItemRow event={event} />
        ))} */}
        {[...activityAndXPData].reverse().map((activity) => (
          <XPTableRow key={activity.eventStartIndex} activity={activity} />
        ))}
      </tbody>
    </Table>
  );
};

interface XPTableRowProps {
  activity: ActivityWithXP;
}

const XPTableRow: React.FC<XPTableRowProps> = ({ activity }) => {
  const { sessionStart, durationText } = useMemo(
    () => ({
      sessionStart: formatDatetimeNice(
        new Date(activity.activity.startTimestamp)
      ),
      durationText: formatDurationSpecificMilliseconds(
        activity.activity.startTimestamp,
        activity.activity.endTimestamp
      ),
    }),
    [activity.activity.startTimestamp, activity.activity.endTimestamp]
  );

  const { totalGained, ratePerHour, changedSkills, duration } = useMemo(() => {
    if (activity.xpData.length < 1) {
      return {
        totalGained: 0,
        ratePerMinute: "",
        changedSkills: [],
        duration: 0,
      };
    }

    const firstEntry = activity.xpData[0];
    const lastEntry = activity.xpData[activity.xpData.length - 1];

    // Total gain
    const totalGainedCount = lastEntry.xpTotal - firstEntry.xpTotal;

    // Rate per hour
    const duration =
      activity.activity.endTimestamp - activity.activity.startTimestamp;
    const durationHours = duration / (60 * 60 * 1000);

    const ratePerHour = totalGainedCount / durationHours;

    // Changed skills
    const changedSkillsMaps = new Map<Skill, number>();

    for (const skill of ALL_SKILLS) {
      const difference = lastEntry[skill] - firstEntry[skill];

      if (difference !== 0) {
        changedSkillsMaps.set(skill, difference);
      }
    }

    const changedSkills = [...changedSkillsMaps.entries()]
      .map(([skill, diff]) => ({
        skill,
        diff,
      }))
      .sort(({ diff: aDiff }, { diff: bDiff }) => {
        return bDiff - aDiff;
      });

    return {
      totalGained: `${formatNumber(totalGainedCount)} XP`,
      ratePerHour: `${formatNumber(ratePerHour, true)} XP/hr`,
      changedSkills,
      duration,
    };
  }, [activity]);

  return (
    <tr>
      <td>{sessionStart}</td>
      <td>{durationText}</td>
      <td>{totalGained}</td>
      <td>{ratePerHour}</td>
      <td className={classes.badgeColumn}>
        <BadgeCollection changedSkills={changedSkills} duration={duration} />
      </td>
    </tr>
  );
};

interface BadgeCollectionProps {
  changedSkills: Array<{
    skill: Skill;
    diff: number;
  }>;

  duration: number;
}

const BadgeCollection: React.FC<BadgeCollectionProps> = ({
  changedSkills,
  duration,
}) => {
  const { hovered, ref } = useHover();

  const { limitedChangeSkills, hasOverflow } = useMemo(() => {
    if (changedSkills.length > 3) {
      return {
        limitedChangeSkills: changedSkills.slice(0, 3),
        hasOverflow: true,
      };
    }

    return { limitedChangeSkills: changedSkills, hasOverflow: false };
  }, [changedSkills]);

  return (
    <Popover opened={hovered}>
      <Popover.Target>
        <div ref={ref} className={classes.badgeCollection}>
          {limitedChangeSkills.map(({ skill }) => (
            <SkillBadge key={skill} skill={skill} />
          ))}
          {hasOverflow && <Badge>...</Badge>}
        </div>
      </Popover.Target>
      <Popover.Dropdown>
        <Table>
          <tbody>
            {changedSkills.map(({ skill, diff }) => {
              const durationHours = duration / (60 * 60 * 1000);
              const ratePerHour = Math.round(diff / durationHours);

              return (
                <tr key={skill} className={classes.dropdownRow}>
                  <td>
                    {/* eslint-disable-next-line jsx-a11y/alt-text */}
                    <img src={skillImageUrl(skill)} />
                  </td>
                  <td>{capitalizeFirstLetter(skill)}</td>
                  <td>{formatNumber(diff)} XP</td>
                  <td>{formatNumber(ratePerHour)} XP/hr</td>
                  {/* {capitalizeFirstLetter(skill)}: {formatNumber(diff)} XP (
                    {formatNumber(ratePerHour)} XP/hr) */}
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Popover.Dropdown>
    </Popover>
  );
};
