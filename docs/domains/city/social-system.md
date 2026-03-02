# Worker: Social System

## Scope
Create ONLY: src/city/systems/socialSystem.ts
Do NOT modify any existing files.

## Required reading
- docs/city-spec.md (social scene section)

## Task
Create the social/dating system managing venue activities, NPC hangouts, and weekend events.

## Interface:
```typescript
import Phaser from 'phaser';

export interface VenueDef {
  id: string;
  name: string;
  type: 'cafe' | 'bar' | 'restaurant' | 'bookstore' | 'gym' | 'park' | 'gallery' | 'club';
  openHour: number;
  closeHour: number;
  activities: VenueActivity[];
}

export interface VenueActivity {
  id: string;
  name: string;
  description: string;
  staminaCost: number;
  goldCost: number;
  friendshipReward: number;   // points gained with companion NPC
  duration: number;           // in-game hours
  requiredHearts: number;     // minimum friendship to unlock
}

export interface WeekendEvent {
  id: string;
  name: string;
  description: string;
  venue: string;
  dayOfWeek: number;     // 0=Mon, 6=Sun. Events on 5 (Sat) or 6 (Sun)
  season: string;
  activities: VenueActivity[];
  dialogue: string[];    // 5 flavor text lines
}

export interface DateResult {
  npcId: string;
  success: boolean;
  friendshipGain: number;
  message: string;
}

export class SocialSystem {
  constructor(scene: Phaser.Scene);
  
  /** Get all venues */
  getVenues(): VenueDef[];
  
  /** Get activities available at a venue right now */
  getAvailableActivities(venueId: string, currentHour: number, companionId?: string): VenueActivity[];
  
  /** Do an activity at a venue with an NPC */
  doActivity(activityId: string, venueId: string, npcId: string): {
    friendshipGain: number;
    staminaCost: number;
    goldCost: number;
    message: string;
  };
  
  /** Check if there's a weekend event today */
  getWeekendEvent(dayOfWeek: number, season: string): WeekendEvent | null;
  
  /** Ask NPC on a date (requires 5+ hearts) */
  askOnDate(npcId: string, venueId: string, hearts: number): DateResult;
  
  /** Get NPCs currently at a venue based on their schedule */
  getNPCsAtVenue(venueId: string, currentHour: number, npcSchedules: Record<string, any>): string[];
}
```

## Venues (8):
- Sunrise Cafe: "Have coffee" (5stam, 10g, +8 friend), "Share pastry" (3stam, 20g, +12, 2 hearts req)
- The Neon Lounge: "Grab drinks" (8stam, 30g, +10), "Dance" (15stam, 0g, +15, 3 hearts), "Karaoke" (10stam, 0g, +20, 4 hearts)
- Sakura Kitchen: "Dinner together" (5stam, 50g, +15), "Chef's tasting" (5stam, 100g, +25, 4 hearts)
- Priya's Books: "Browse together" (3stam, 0g, +8), "Book club" (5stam, 0g, +12, 2 hearts)
- Iron Forge Gym: "Workout" (20stam, 15g, +8), "Sparring" (25stam, 0g, +15, 3 hearts)
- Central Park: "Walk" (8stam, 0g, +10), "Picnic" (5stam, 20g, +18, 3 hearts)
- Mika's Gallery: "View exhibit" (3stam, 10g, +8), "Private tour" (5stam, 25g, +20, 4 hearts)
- Club Pulse: "Night out" (20stam, 40g, +12), "VIP booth" (15stam, 100g, +25, 5 hearts)

## Weekend Events (8, 1 per season × 2):
- Spring: "Gallery Opening" (gallery, Sat), "Park Yoga" (park, Sun)
- Summer: "Rooftop Party" (club, Sat), "Food Festival" (park, Sun)
- Fall: "Jazz Night" (bar, Sat), "Book Fair" (bookstore, Sun)
- Winter: "Holiday Market" (park, Sat), "NYE Party" (club, Sun)

Each event: 2 special activities + 5 dialogue lines.

## Dating:
- Requires 5+ hearts with dateable NPC (alex, sam, mika)
- Success chance: 60% base + 5% per heart above 5
- Success: +30 friendship, special dialogue
- Fail: +5 friendship, encouraging message
- Max 1 date per day

## Validation
npx tsc --noEmit must pass.

## When done
Write completion report to status/workers/social-system.md
