# Worker: Town Layout Data

## Scope
Create ONLY: `src/data/townData.ts`
Do NOT modify any existing files.

## Task
Define the town layout as a data structure. The current map is 40x30 tiles. The town occupies rows 21-29, columns 2-38.

## Interface (export exactly this):
```typescript
export type TownObjectType = 
  | 'shop' | 'blacksmith' | 'carpenter' | 'town_hall'
  | 'well' | 'lamppost' | 'bench' | 'market_stall' | 'flower_bed' | 'signpost';

export interface TownObject {
  type: TownObjectType;
  tileX: number;
  tileY: number;
  color?: number;       // for market stalls
  season?: string;      // for flower beds (unused if not seasonal)
  label?: string;       // text label to show above
}

export interface TownPath {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  width: number;        // 1 or 2 tiles wide
}

export interface TownLayoutData {
  buildings: TownObject[];
  decorations: TownObject[];
  paths: TownPath[];
  /** Tiles that should be grass in the town (town square, gardens) */
  grassAreas: Array<{ x1: number; y1: number; x2: number; y2: number }>;
  /** Tiles that should be stone/cobblestone */
  stoneAreas: Array<{ x1: number; y1: number; x2: number; y2: number }>;
}

export const TOWN_LAYOUT: TownLayoutData;
```

## Map context (CRITICAL - read carefully)
The 40x30 map currently has:
- Rows 0-9: North zone (house at 17-23,4-8; mine at 34-36,3-5; trees)
- Rows 10-20: Farm (fenced area 10-28, 10-20)
- Row 21: East-west stone connector path
- Rows 22-29: Town area (currently empty grass)
- Pond: tiles 4-8, 19-22 (water + sand shore)

Current interactable positions (DO NOT MOVE THESE, town builds around them):
- Shop: tile (28, 23) — door position
- Quest Board: tile (15, 23) — must stay accessible
- Blacksmith: tile (17, 22) — door position  
- Carpenter: tile (10, 23) — door position
- Central path: tiles 19-20 run north-south through the entire map

## Town layout requirements

### Buildings (use existing interactable positions as doors)
1. Shop building: 3x2 at (27, 22) — door at (28, 23) stays
2. Blacksmith building: 3x2 at (16, 21) — door at (17, 22) stays
3. Carpenter building: 3x2 at (9, 22) — door at (10, 23) stays
4. Town Hall: 4x2 at (19, 25) — new, centered on main path, large peaked roof
5. Inn/Tavern: 3x2 at (24, 25) — new, social gathering spot

### Paths (stone/cobblestone)
- Main north-south: x=19-20, y=20-28 (extends existing path into town)
- East-west through town: y=24, x=8-32 (crosses main path)
- Branch to shop: y=23, x=22-27
- Branch to carpenter: y=23, x=10-14
- Town square: rectangular area around (19-22, 23-24) — open stone plaza

### Decorations
- Well: (20, 23) — center of town square
- Lampposts: (14, 24), (18, 24), (22, 24), (26, 24) — along east-west path
- Benches: (16, 24), (24, 24) — between lampposts
- Market stalls: (13, 26) red awning, (15, 26) green awning — weekly market area
- Flower beds: (18, 26), (22, 26) — near town hall
- Signpost: (19, 21) — at farm/town boundary, "↑ Farm  ↓ Town  ← Pond  → Mine"

### Areas
- Stone areas: town square (18-22, 23-24), all path tiles
- Grass areas: residential green (12-16, 27-29), park area (24-28, 27-29)

## Validation
File must compile with: `npx tsc --noEmit`
Must export TOWN_LAYOUT constant and all interfaces.

## When done
Write completion report to status/workers/town-layout.md
