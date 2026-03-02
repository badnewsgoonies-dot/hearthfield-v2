# Worker: Social Activity System

## Scope
Create ONLY: src/systems/socialSystem.ts
Do NOT modify any existing files.

## Required reading
- src/types.ts (Events enum, Season)

## Task
Create a SocialSystem class managing venue activities, dating, and weekend events.

## Interface:
```typescript
import Phaser from 'phaser';

export interface Venue {
  id: string;
  name: string;
  type: 'cafe' | 'bar' | 'restaurant' | 'park' | 'gym' | 'bookstore' | 'gallery';
  openHour: number;      // 0-23
  closeHour: number;     // 0-23
  activities: VenueActivity[];
}

export interface VenueActivity {
  id: string;
  name: string;
  description: string;
  staminaCost: number;
  goldCost: number;
  friendshipBonus: number;   // points gained when doing with NPC
  duration: number;          // in-game hours
  timeSlot: 'morning' | 'afternoon' | 'evening' | 'night';
}

export interface WeekendEvent {
  id: string;
  name: string;
  description: string;
  venue: string;             // venue id
  day: 'saturday' | 'sunday';
  season: string;            // 'spring' | 'summer' | 'fall' | 'winter' | 'any'
  hour: number;
  friendshipBonusAll: number; // bonus to all attending NPCs
  rewards: { itemId: string; qty: number }[];
}

export const CITY_VENUES: Venue[];
export const WEEKEND_EVENTS: WeekendEvent[];

export class SocialSystem {
  constructor(scene: Phaser.Scene);
  
  /** Get venues open at a given hour */
  getOpenVenues(hour: number): Venue[];
  
  /** Get activities available at a venue during a time slot */
  getActivities(venueId: string, timeSlot: 'morning' | 'afternoon' | 'evening' | 'night'): VenueActivity[];
  
  /** Calculate friendship gain for activity with NPC (base + compatibility bonus) */
  calculateFriendshipGain(activity: VenueActivity, npcId: string): number;
  
  /** Get this week's weekend event */
  getWeekendEvent(season: string, weekNumber: number): WeekendEvent | null;
  
  /** Get all NPCs who would attend a weekend event */
  getEventAttendees(eventId: string): string[];
  
  destroy(): void;
}
```

## Venues (7):
1. Daily Grind (cafe) — open 6-18. Activities: grab_coffee (morning, 5 stam, 15g, +8 friend), study_together (afternoon, 10 stam, 0g, +12 friend)
2. The Neon Tap (bar) — open 17-2. Activities: drinks (evening, 15 stam, 30g, +15 friend), karaoke (night, 20 stam, 10g, +20 friend), pool (evening, 10 stam, 5g, +10 friend)
3. Rosemary's (restaurant) — open 11-22. Activities: lunch_date (afternoon, 10 stam, 40g, +18 friend), dinner_date (evening, 15 stam, 60g, +25 friend)
4. Central Park (park) — open 6-22. Activities: morning_walk (morning, 5 stam, 0g, +10 friend), picnic (afternoon, 10 stam, 15g, +15 friend), sunset_watch (evening, 5 stam, 0g, +12 friend)
5. FitZone (gym) — open 6-21. Activities: workout (morning, 20 stam, 10g, +10 friend), yoga_class (afternoon, 15 stam, 15g, +12 friend)
6. Pages & Co (bookstore) — open 9-20. Activities: browse_books (morning, 5 stam, 0g, +8 friend), book_club (afternoon, 10 stam, 0g, +15 friend)
7. Frost Gallery (gallery) — open 10-18. Activities: gallery_tour (afternoon, 8 stam, 20g, +12 friend), art_class (afternoon, 15 stam, 25g, +18 friend)

## Weekend Events (8 rotating, 2 per season):
- Spring: block_party (sat, park, +5 all, reward: flowers x3), open_mic (sun, bar, +8 all, reward: coffee x2)
- Summer: rooftop_concert (sat, bar, +10 all, reward: vinyl_record x1), food_festival (sun, restaurant, +8 all, reward: pasta x2)
- Fall: art_show (sat, gallery, +8 all, reward: art_print x1), trivia_night (sun, bar, +10 all, reward: book x1)
- Winter: holiday_market (sat, park, +8 all, reward: scented_candle x2), new_years_party (sun, bar, +15 all, reward: craft_beer x3)

## NPC venue compatibility (for calculateFriendshipGain, add +5 bonus):
- alex: cafe, bookstore, park
- jordan: gym, restaurant
- sam: bar, bookstore, gallery
- maya: restaurant, park, cafe
- riley: gym, park
- casey: bookstore, cafe, gallery
- morgan: gallery, bar, park

## Validation
npx tsc --noEmit must pass.

## When done
Write completion report to status/workers/social-system.md
