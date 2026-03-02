# Worker: City NPC Data

## Scope
Create ONLY: src/data/cityNPCData.ts
Do NOT modify any existing files.

## Required reading
- src/types.ts (NPCDef interface — check what fields are required)
- src/data/registry.ts (existing NPCS array for format reference)

## Task
Create 7 city NPCs with full personality data, dialogue, schedules, and gift preferences.

## Interface:
```typescript
import { NPCDef } from '../types';

export const CITY_NPCS: NPCDef[];

export interface CityNPCSchedule {
  npcId: string;
  weekday: Array<{ hour: number; x: number; y: number; activity: string }>;
  weekend: Array<{ hour: number; x: number; y: number; activity: string }>;
}

export const CITY_NPC_SCHEDULES: CityNPCSchedule[];

export interface CityNPCDialogue {
  npcId: string;
  greeting: string[];         // 5 random greetings
  workplace: string[];        // 3 lines when at their job
  casual: string[];           // 5 casual conversation lines
  heartLevel: Record<number, string[]>; // special dialogue at heart milestones (2, 4, 6, 8, 10)
  dateDialogue: string[];     // 3 lines for date activities
}

export const CITY_NPC_DIALOGUE: CityNPCDialogue[];
```

## NPC Definitions (7 NPCs):

1. **alex** — "Alex Chen" — Barista at Daily Grind coffee shop
   - Sprite: dark hair, green apron
   - Location: coffee shop area (~x:8, y:3)
   - Schedule: coffee shop 6AM-2PM weekdays, park weekends
   - Loves: coffee, espresso, book, art_print. Hates: energy_drink, laptop
   - Personality: creative, dreamy, wants to be a writer

2. **jordan** — "Jordan Park" — Coworker at Nexus Corp
   - Sprite: short hair, business casual
   - Location: office building (~x:15, y:3)  
   - Schedule: office 9AM-5PM weekdays, gym weekends
   - Loves: laptop, usb_drive, energy_drink. Hates: vinyl_record, scented_candle
   - Personality: ambitious, competitive, secretly insecure

3. **sam** — "Sam Rivera" — Bartender at The Neon Tap
   - Sprite: long hair, dark clothes
   - Location: bar (~x:30, y:3)
   - Schedule: bar 5PM-midnight, sleeps late, bookstore afternoon weekends
   - Loves: vinyl_record, craft_beer, book. Hates: energy_drink, protein_bar
   - Personality: philosophical, night owl, deep thinker

4. **maya** — "Maya Okafor" — Chef at Rosemary's
   - Sprite: headband, chef coat
   - Location: restaurant (~x:22, y:3)
   - Schedule: restaurant 10AM-8PM weekdays, farmers market Saturday, rest Sunday
   - Loves: pasta, stir_fry, flowers. Hates: energy_drink, usb_drive
   - Personality: passionate, warm, perfectionist about food

5. **riley** — "Riley Torres" — Gym trainer
   - Sprite: athletic wear, headband
   - Location: gym (~x:28, y:8)
   - Schedule: gym 6AM-6PM, park morning run weekends
   - Loves: protein_bar, smoothie, sneakers. Hates: craft_beer, pizza
   - Personality: energetic, motivational, health-obsessed

6. **casey** — "Casey Webb" — Bookstore owner
   - Sprite: glasses, sweater
   - Location: bookstore (~x:12, y:8)
   - Schedule: bookstore 9AM-7PM, home evenings, cafe mornings weekends
   - Loves: book, tea_set, puzzle. Hates: energy_drink, business_card
   - Personality: quiet, intellectual, dry humor

7. **morgan** — "Morgan Frost" — Gallery artist
   - Sprite: colorful hair, paint-stained clothes
   - Location: art gallery (~x:20, y:8)
   - Schedule: gallery 11AM-6PM, studio (home) mornings, bar late evenings
   - Loves: art_print, scented_candle, flowers. Hates: briefcase, report
   - Personality: eccentric, expressive, emotionally intense

## Dialogue requirements:
- Each NPC: 5 greetings, 3 workplace lines, 5 casual lines, 2 lines per heart milestone (2,4,6,8,10), 3 date lines
- Total: ~30 lines per NPC, 210+ lines total dialogue
- Dialogue must reflect personality (Casey is quiet/witty, Riley is energetic, Sam is philosophical)
- Heart milestone dialogue should show growing closeness

## Rules:
- Match NPCDef interface from types.ts EXACTLY
- lovedItems and hatedItems must use item IDs from the city registry (coffee, espresso, book, etc)
- likedItems: add 3-4 items per NPC
- Schedule positions should be on the city map grid (x: 0-39, y: 0-24)

## Validation
npx tsc --noEmit must pass.

## When done
Write completion report to status/workers/city-npcs.md with dialogue line counts per NPC.
