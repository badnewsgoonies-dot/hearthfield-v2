# Worker: City NPC Schedules & Gift Preferences

## Scope
Create ONLY: src/data/cityNpcData.ts
Do NOT modify any existing files.

## Required reading
- src/types.ts (CityNPCDef, CityVenue, Season)
- src/data/npcGiftData.ts (reference format for gift preferences)
- src/systems/npcSchedules.ts (reference format for schedules)

## Task
Create NPC schedule data and expanded gift/dialogue data for city NPCs.

## Exports:
```typescript
import { CityVenue, Season } from '../types';

export interface CityNPCSchedule {
  /** Returns the venue where the NPC is at a given hour (0-23) */
  getVenue(hour: number, season: Season, dayOfWeek: number): CityVenue;
}

export interface CityGiftPreference {
  loved: string[];
  liked: string[];
  neutral: string[];
  disliked: string[];
  hated: string[];
}

export interface CityGiftDialogue {
  loved: string[];   // 4 lines each
  liked: string[];
  disliked: string[];
  hated: string[];
}

export const CITY_NPC_SCHEDULES: Record<string, CityNPCSchedule>;
export const CITY_GIFT_PREFERENCES: Record<string, CityGiftPreference>;
export const CITY_GIFT_DIALOGUE: Record<string, CityGiftDialogue>;
export const CITY_NPC_GREETINGS: Record<string, Record<string, string[]>>; // npcId → venue → greetings

export function getCityGiftReaction(npcId: string, itemId: string): 'loved' | 'liked' | 'neutral' | 'disliked' | 'hated';
```

## NPC Schedules (hour-based):
### Alex (Coworker):
- 6-8: apartment, 8-17: office, 17-19: gym, 19-22: bar, 22+: apartment
- Weekends (day % 7 == 0 or 6): skip office, cafe 9-12, park 12-17, bar 18-22

### Maya (Barista):
- 5-14: cafe (working), 14-16: bookstore, 16-19: park, 19-21: apartment
- Rainy days: bookstore all afternoon

### Jordan (Gym Trainer):
- 6-12: gym, 12-13: cafe, 13-18: gym, 18-20: park (jogging), 20+: apartment
- Winter: stays at gym instead of park

### Sam (Chef):
- 7-10: grocery (shopping), 10-14: restaurant (prep), 14-15: cafe, 15-23: restaurant (service)
- Mornings varies by season

### Lena (Bookstore Owner):
- 9-18: bookstore, 18-20: cafe, 20-22: apartment
- Weekends: park 10-14, then bookstore

### Dev (Tech Entrepreneur):
- 7-9: cafe (morning coffee + laptop), 9-17: electronics (his "office"), 17-19: gym, 19-22: bar or restaurant (alternating days)
- Always at cafe first thing

### Rosa (Retired Neighbor):
- 7-9: apartment, 9-12: community_garden, 12-13: cafe, 13-16: park, 16-18: grocery, 18+: apartment
- Rainy days: apartment or bookstore

## Gift preferences — use city item IDs from cityRegistry:
(Each NPC: 5+ loved, 5+ liked, 4+ disliked, 3+ hated)

### Alex: loves work/ambition items (laptop, briefcase, business_suit, coffee, fancy_pen). Hates lazy items (magazine, beer).
### Maya: loves artistic/cozy items (vinyl_record, novel, artisan_tea, scented_candle, wall_art). Hates tech/corporate (laptop, briefcase, gadget).
### Jordan: loves fitness/health items (smoothie, sporty_gear, energy_drink, gym_pass, multivitamin). Hates indulgent items (pastry, wine, chocolate_box).
### Sam: loves cooking/fine food items (salmon_fillet, olive_oil, cheese, steak, wine). Hates processed/cheap (energy_drink, magazine, bus_ticket).
### Lena: loves intellectual items (novel, fancy_pen, notebook, artisan_tea, scented_candle). Hates loud/flashy (gadget, gaming_setup, energy_drink).
### Dev: loves tech items (laptop, gadget, gaming_setup, coffee, energy_drink). Hates old-fashioned (vinyl_record, scented_candle, novel).
### Rosa: loves warm/garden items (bouquet, artisan_tea, chocolate_box, scented_candle, potted_plant). Hates modern tech (laptop, gadget, gaming_setup).

## Venue-specific greetings (3 per venue per NPC, personality-appropriate):
Each NPC needs greetings for their 2-3 most common venues. Minimum 6 greetings per NPC.

## Gift dialogue: 4 lines each for loved/liked/disliked/hated, personality-matched.

## Validation
npx tsc --noEmit must pass.

## When done
Write completion report to status/city-workers/city-npcs.md
