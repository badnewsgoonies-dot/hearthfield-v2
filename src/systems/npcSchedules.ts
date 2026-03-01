/**
 * NPC Schedule System — provides NPC positions based on time/season
 * NEW FILE — does not modify any existing files
 */
import { Season } from '../types';

export interface NPCPosition {
  tileX: number;
  tileY: number;
  facing: 'left' | 'right' | 'up' | 'down';
  activity: string;
}

interface ScheduleEntry {
  startHour: number;
  tileX: number;
  tileY: number;
  facing: 'left' | 'right' | 'up' | 'down';
  activity: string;
}

type NPCSchedule = ScheduleEntry[];

const SCHEDULES: Record<string, NPCSchedule> = {
  elena: [
    { startHour: 0, tileX: 35, tileY: 5, facing: 'down', activity: 'resting' },
    { startHour: 6, tileX: 35, tileY: 5, facing: 'down', activity: 'getting ready' },
    { startHour: 9, tileX: 36, tileY: 14, facing: 'right', activity: 'tending shop' },
    { startHour: 17, tileX: 25, tileY: 15, facing: 'down', activity: 'relaxing' },
    { startHour: 20, tileX: 35, tileY: 5, facing: 'down', activity: 'resting' },
  ],
  owen: [
    { startHour: 0, tileX: 8, tileY: 18, facing: 'down', activity: 'resting' },
    { startHour: 6, tileX: 8, tileY: 18, facing: 'left', activity: 'feeding animals' },
    { startHour: 8, tileX: 15, tileY: 12, facing: 'down', activity: 'checking crops' },
    { startHour: 12, tileX: 23, tileY: 15, facing: 'right', activity: 'having lunch' },
    { startHour: 14, tileX: 30, tileY: 20, facing: 'down', activity: 'fishing' },
    { startHour: 18, tileX: 8, tileY: 18, facing: 'down', activity: 'resting' },
  ],
  lily: [
    { startHour: 0, tileX: 5, tileY: 5, facing: 'down', activity: 'resting' },
    { startHour: 6, tileX: 5, tileY: 5, facing: 'right', activity: 'collecting samples' },
    { startHour: 9, tileX: 12, tileY: 8, facing: 'down', activity: 'studying plants' },
    { startHour: 13, tileX: 28, tileY: 13, facing: 'left', activity: 'reading' },
    { startHour: 17, tileX: 32, tileY: 20, facing: 'down', activity: 'sketching nature' },
    { startHour: 20, tileX: 5, tileY: 5, facing: 'down', activity: 'resting' },
  ],
  marcus: [
    { startHour: 0, tileX: 38, tileY: 5, facing: 'down', activity: 'resting' },
    { startHour: 7, tileX: 38, tileY: 8, facing: 'down', activity: 'preparing forge' },
    { startHour: 9, tileX: 37, tileY: 10, facing: 'left', activity: 'working the forge' },
    { startHour: 18, tileX: 26, tileY: 14, facing: 'right', activity: 'having a drink' },
    { startHour: 21, tileX: 38, tileY: 5, facing: 'down', activity: 'resting' },
  ],
  rose: [
    { startHour: 0, tileX: 22, tileY: 4, facing: 'down', activity: 'resting' },
    { startHour: 6, tileX: 22, tileY: 4, facing: 'right', activity: 'baking bread' },
    { startHour: 8, tileX: 34, tileY: 14, facing: 'left', activity: 'selling baked goods' },
    { startHour: 16, tileX: 24, tileY: 16, facing: 'down', activity: 'walking' },
    { startHour: 19, tileX: 22, tileY: 4, facing: 'down', activity: 'resting' },
  ],
  sage: [
    { startHour: 0, tileX: 20, tileY: 4, facing: 'down', activity: 'sleeping' },
    { startHour: 8, tileX: 25, tileY: 14, facing: 'right', activity: 'contemplating' },
    { startHour: 11, tileX: 20, tileY: 15, facing: 'down', activity: 'posting notices' },
    { startHour: 15, tileX: 8, tileY: 6, facing: 'left', activity: 'meditating' },
    { startHour: 18, tileX: 20, tileY: 4, facing: 'down', activity: 'resting' },
  ],
  finn: [
    { startHour: 0, tileX: 27, tileY: 15, facing: 'down', activity: 'resting' },
    { startHour: 6, tileX: 38, tileY: 9, facing: 'up', activity: 'preparing gear' },
    { startHour: 9, tileX: 20, tileY: 10, facing: 'right', activity: 'exploring' },
    { startHour: 15, tileX: 30, tileY: 19, facing: 'down', activity: 'resting' },
    { startHour: 18, tileX: 27, tileY: 15, facing: 'left', activity: 'telling stories' },
  ],
};

// Sunday stay-home NPCs
const SUNDAY_HOME: Record<string, NPCPosition> = {
  owen: { tileX: 8, tileY: 18, facing: 'down', activity: 'day off — relaxing at home' },
  lily: { tileX: 5, tileY: 5, facing: 'right', activity: 'day off — reading at home' },
};

export class NPCScheduleSystem {
  static getPosition(npcId: string, hour: number, _minute: number, season: Season, dayOfWeek: number): NPCPosition {
    // Sunday override for some NPCs
    if (dayOfWeek === 0 && SUNDAY_HOME[npcId]) {
      return SUNDAY_HOME[npcId];
    }

    const schedule = SCHEDULES[npcId];
    if (!schedule) {
      return { tileX: 20, tileY: 15, facing: 'down', activity: 'wandering' };
    }

    // Winter: go home 2 hours earlier
    const effectiveHour = season === Season.WINTER ? hour + 2 : hour;

    // Find the schedule entry: last entry whose startHour <= effectiveHour
    let entry = schedule[0];
    for (const e of schedule) {
      if (e.startHour <= effectiveHour) entry = e;
    }

    // Finn's exploring phase uses hour-based offset
    if (npcId === 'finn' && entry.activity === 'exploring') {
      return {
        tileX: 20 + (hour % 5) * 3,
        tileY: 10 + (hour % 3) * 4,
        facing: 'right',
        activity: 'exploring',
      };
    }

    return {
      tileX: entry.tileX,
      tileY: entry.tileY,
      facing: entry.facing,
      activity: entry.activity,
    };
  }

  static getActivityText(npcId: string, hour: number, season: Season): string {
    const pos = NPCScheduleSystem.getPosition(npcId, hour, 0, season, 1);
    return pos.activity;
  }
}
