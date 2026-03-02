# Worker: Foraging Expansion Data

## Scope
Create ONLY: src/data/forageExpansion.ts
Do NOT modify any existing files.

## Required reading
- src/data/forageData.ts (existing forage items)
- src/data/registry.ts (existing items — check which forage items already exist)
- src/types.ts (Season enum, ItemCategory)

## Task
Create expanded foraging data with more items per season and spawn location variety.

## Interface:
```typescript
import { Season } from '../types';

export interface ForageSpawnRule {
  itemId: string;       // must reference an existing item in registry.ts
  seasons: Season[];    // which seasons this spawns
  weight: number;       // spawn probability weight (1-10, higher = more common)
  zones: ('farm' | 'town' | 'pond' | 'mine_entrance' | 'forest_edge')[];
  maxPerDay: number;    // maximum spawns per day
  minDay: number;       // earliest day in season to appear (1-28)
  description: string;  // flavor text about where to find it
}

export const FORAGE_SPAWN_RULES: ForageSpawnRule[];

/** Get forageable items for a given season and zone */
export function getSeasonalForageables(season: Season, zone: string): ForageSpawnRule[];

/** Get a weighted random forageable for spawning */
export function rollForageable(season: Season, zone: string): string | null;
```

## Requirements:
- Use ONLY item IDs that already exist in registry.ts (mushroom, wild_berries, herbs, fiber, etc.)
- Each season must have at least 5 different forageable items
- Spring: wild_berries, herbs, fiber + spring-appropriate existing items
- Summer: wild_berries, herbs + summer-appropriate items  
- Fall: mushroom, wild_berries, herbs + fall items
- Winter: fiber + rare winter forageables (reduced variety, lower weights)
- Different zones should have different spawn tables (pond area = different from farm edge)
- rollForageable must use weighted random selection

## Validation
npx tsc --noEmit must pass.

## When done
Write completion report to status/workers/forage-expansion.md
