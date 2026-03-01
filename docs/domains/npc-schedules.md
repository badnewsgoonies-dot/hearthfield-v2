# Worker: NPC Schedule System

## Scope
Create ONLY: `src/systems/npcSchedules.ts`
Do NOT modify any existing files.

## Required reading
- src/types.ts (Season enum, NPC names, SCALED_TILE)

## Task
Create an NPCScheduleSystem that provides NPC positions based on time of day and season. Currently NPCs stand in fixed positions. This system will make them move around.

## Interface (export exactly this):
```typescript
import { Season } from '../types';

export interface NPCPosition {
  tileX: number;
  tileY: number;
  facing: 'left' | 'right' | 'up' | 'down';
  activity: string;  // e.g. "tending shop", "walking", "fishing", "reading"
}

export class NPCScheduleSystem {
  /** Get where an NPC should be at a given time */
  static getPosition(npcId: string, hour: number, minute: number, season: Season, dayOfWeek: number): NPCPosition;
  
  /** Get a brief status text for the NPC (shown in dialogue) */
  static getActivityText(npcId: string, hour: number, season: Season): string;
}
```

## NPC Schedules (7 NPCs)

### Elena (shop owner) - tile positions on 40x25 farm grid
- 6:00-8:59: Home area (35, 5), activity: "getting ready"
- 9:00-16:59: Shop (36, 14), facing right, activity: "tending shop"
- 17:00-19:59: Town square (25, 15), activity: "relaxing"
- 20:00+: Home (35, 5), activity: "resting"

### Owen (farmer friend)
- 6:00-7:59: His farm area (8, 18), activity: "feeding animals"
- 8:00-11:59: Near player farm entrance (15, 12), activity: "checking crops"
- 12:00-13:59: Town square (23, 15), activity: "having lunch"
- 14:00-17:59: Near pond (30, 20), activity: "fishing"
- 18:00+: His home (8, 18), activity: "resting"

### Lily (botanist)
- 6:00-8:59: Forest area (5, 5), activity: "collecting samples"
- 9:00-12:59: Near farm (12, 8), activity: "studying plants"
- 13:00-16:59: Library/town (28, 13), activity: "reading"
- 17:00-19:59: Pond (32, 20), activity: "sketching nature"
- 20:00+: Home (5, 5), activity: "resting"

### Marcus (blacksmith)
- 7:00-8:59: Mine entrance area (38, 8), activity: "preparing forge"
- 9:00-17:59: Blacksmith area (37, 10), activity: "working the forge"
- 18:00-20:59: Town square (26, 14), activity: "having a drink"
- 21:00+: Home (38, 5), activity: "resting"

### Rose (baker) - NEW NPC
- 6:00-7:59: Home (22, 4), activity: "baking bread"
- 8:00-15:59: Near shop (34, 14), activity: "selling baked goods"
- 16:00-18:59: Town square (24, 16), activity: "walking"
- 19:00+: Home (22, 4), activity: "resting"

### Sage (elder)
- 8:00-10:59: Town square bench (25, 14), activity: "contemplating"
- 11:00-14:59: Near quest board (20, 15), activity: "posting notices"
- 15:00-17:59: Forest edge (8, 6), activity: "meditating"
- 18:00+: Home (20, 4), activity: "resting"
- Before 8:00: Home (20, 4), activity: "sleeping"

### Finn (adventurer) - NEW NPC
- 6:00-8:59: Near mine (38, 9), activity: "preparing gear"
- 9:00-14:59: Wanders (use hour-based offset: tileX = 20 + (hour % 5) * 3, tileY = 10 + (hour % 3) * 4), activity: "exploring"
- 15:00-17:59: Pond area (30, 19), activity: "resting"
- 18:00+: Near campfire/town (27, 15), activity: "telling stories"

### Season variations
- Winter: all NPCs go home 2 hours earlier
- Festival days (not handled here): positions don't change (festival system overrides)

### dayOfWeek
- 0 = Sunday (some NPCs stay home all day — Owen, Lily)
- Use modulo on day number: dayOfWeek = day % 7

## Validation
File must compile with: `npx tsc --noEmit`
Must export NPCScheduleSystem class and NPCPosition interface.

## When done
Write completion report to status/workers/npc-schedules.md
