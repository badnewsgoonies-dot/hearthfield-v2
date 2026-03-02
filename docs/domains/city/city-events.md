# Worker: City Events System

## Scope
Create ONLY: src/systems/cityEvents.ts
Do NOT modify any existing files.

## Required reading
- src/systems/festivalEvents.ts (reference for festival scoring pattern)
- src/types.ts (Season enum)

## Task
Create a CityEventHandler class that manages city-specific events/festivals.

## Interface:
```typescript
export interface CityEvent {
  id: string;
  name: string;
  season: string;
  day: number;
  description: string;
  location: string;
}

export interface CityEventResult {
  eventId: string;
  participated: boolean;
  score: number;
  rank: 'gold' | 'silver' | 'bronze' | 'participant';
  rewards: Array<{ itemId: string; quantity: number }>;
  message: string;
}

export class CityEventHandler {
  static readonly CITY_EVENTS: CityEvent[];
  
  /** Get today's event if any */
  static getTodaysEvent(season: string, day: number): CityEvent | null;
  
  /** Calculate score for an event based on player data */
  static calculateScore(eventId: string, playerData: {
    gold: number;
    friendships: Record<string, number>;
    bestItemValue: number;
    venuesVisited: number;
    apartmentItems: number;
    mealsCooked: number;
    daysWorked: number;
  }): CityEventResult;
  
  /** Get NPC dialogue for city event */
  static getEventDialogue(eventId: string, npcId: string): string[];
}
```

## 8 City Events:
1. **food_festival** (Spring 15): Score = bestItemValue of food category. Gold >= 100, Silver >= 60, Bronze >= 30. Reward: sushi x3
2. **art_walk** (Spring 25): Score = total value of gifted art items that day. Gold >= 200, Silver >= 100, Bronze >= 50. Reward: art_print x2
3. **block_party** (Summer 12): Score = sum of all friendship values / 100. Gold >= 15, Silver >= 10, Bronze >= 5. Reward: concert_ticket x2
4. **rooftop_concert** (Summer 26): Score = highest single friendship value / 50. Gold >= 16, Silver >= 10, Bronze >= 5. Reward: vinyl_record x1
5. **harvest_market** (Fall 14): No competition, everyone participates. Score = 50. Reward: coffee x5
6. **pub_crawl** (Fall 27): Score = venuesVisited (cafe + restaurant + bar + bookstore). Gold = 4, Silver = 3, Bronze = 2. Reward: cocktail x3
7. **holiday_lights** (Winter 10): Score = apartmentItems count. Gold >= 8, Silver >= 5, Bronze >= 3. Reward: scented_candle x3
8. **new_years_gala** (Winter 28): Score = gold spent (up to 2000). Gold >= 1500, Silver >= 800, Bronze >= 300. Reward: chocolate_box x5

## NPC Dialogue:
Each NPC (alex, morgan, sam, jordan, casey, riley, taylor) needs 3 dialogue lines per event where they would logically appear. Not all NPCs attend all events. Minimum: each NPC has dialogue for 4+ events.

## Validation
npx tsc --noEmit must pass.

## When done
Write completion report to status/workers/city-events.md
