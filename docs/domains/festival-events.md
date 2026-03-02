# Worker: Festival Event Handler

## Scope
Create ONLY: `src/systems/festivalEvents.ts`
Do NOT modify any existing files.

## Required reading
- src/data/festivalData.ts (FestivalDef interface, FESTIVALS array)
- src/types.ts (Events, Season, ItemCategory)

## Task
Create a FestivalEventHandler class that manages interactive festival events. When a player attends a festival, this system determines the event, runs a scoring/reward mechanic, and returns results.

## Interface (export exactly this):
```typescript
import Phaser from 'phaser';
import { Season } from '../types';
import { FestivalDef } from '../data/festivalData';

export interface FestivalResult {
  festivalId: string;
  participated: boolean;
  score: number;        // 0-100
  rank: string;         // 'Gold', 'Silver', 'Bronze', or 'Participant'
  rewards: Array<{ itemId: string; qty: number }>;
  message: string;      // flavor text about what happened
}

export interface FestivalActivity {
  name: string;
  description: string;
  scoreFormula: string; // human-readable explanation
}

export class FestivalEventHandler {
  /**
   * Get the activities available at this festival
   */
  static getActivities(festival: FestivalDef): FestivalActivity[];

  /**
   * Calculate festival score based on player stats.
   * playerData: { gold: number; totalShipped: number; cropsHarvested: number; 
   *   fishCaught: number; monstersKilled: number; friendships: number;
   *   bestItem?: { name: string; sellPrice: number; quality: number } }
   */
  static calculateScore(festival: FestivalDef, playerData: Record<string, any>): FestivalResult;
  
  /**
   * Get NPC dialogue for this festival
   * Returns 3-5 lines of festival-specific dialogue per NPC
   */
  static getFestivalDialogue(festivalId: string, npcId: string): string[];
}
```

## Festival scoring rules:

### Egg Festival (spring 13) — competition
- Score = eggs found (random 3-8 based on luck = gold % 100)
- Gold: 6+, Silver: 4-5, Bronze: 2-3
- Rewards: Gold gets gold_ore x5, Silver gets iron_ore x5, Bronze gets copper_ore x5

### Flower Dance (spring 24) — social  
- Score = total friendship hearts across all NPCs (0-28 max, 7 NPCs × 4 hearts)
- Gold: 20+, Silver: 12-19, Bronze: 5-11
- Rewards: Gold gets melon_seeds x5, Silver gets blueberry_seeds x3

### Luau (summer 11) — social
- Score = best item sell price (0-5000 range)
- Gold: 1000+, Silver: 200-999, Bronze: 50-199
- Rewards: Gold gets gold_bar x1, Silver gets starfruit_seeds x1

### Moonlight Jellies (summer 28) — seasonal
- No competition, everyone gets Participant
- Score = 50 (flat)
- Rewards: none (the experience is the reward)
- Message varies by friendship level

### Harvest Fair (fall 16) — competition
- Score = best item sell price × quality multiplier (1/1.25/1.5/2 for normal/silver/gold/iridium)
- Gold: 2000+, Silver: 500-1999, Bronze: 100-499
- Rewards: Gold gets gold_bar x3, Silver gets iron_bar x5

### Spirit's Eve (fall 27) — seasonal
- Score = mine floors reached (from playerData.monstersKilled / 5, capped at 100)
- Gold: 80+, Silver: 40-79, Bronze: 10-39
- Rewards: Gold gets gold_ore x10

### Ice Festival (winter 8) — competition
- Score = fish caught total
- Gold: 30+, Silver: 15-29, Bronze: 5-14
- Rewards: Gold gets legendary bait (fiber x20), Silver gets trout x5

### Night Market (winter 25) — seasonal
- Score = gold spent at market (10% of current gold, up to 5000)
- Gold: 2000+, Silver: 500-1999
- Rewards: none (shopping IS the reward)

## Festival dialogue (3-5 lines per NPC per festival):
Cover all 7 NPCs (elena, owen, lily, marcus, rose, sage, finn).
Each NPC has personality-specific reactions. Elena talks about food/cooking, Owen about competition/strength, Lily about beauty/art, Marcus about nature/mining, Rose about community/mystery, Sage about spiritual meaning, Finn about fun/building.

## Validation
File must compile with: `npx tsc --noEmit`

## When done
Write completion report to status/workers/festival-events.md
