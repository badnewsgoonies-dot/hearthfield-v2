# Worker: City Layout Data

## Scope
Create ONLY: src/data/cityLayout.ts
Do NOT modify any existing files.

## Required reading
- src/data/townLayout.ts (reference for data structure pattern)
- src/types.ts (TileType enum)

## Task
Create city map layout data defining building positions, decorations, and tile overrides for a 40x25 city grid.

## Interface:
```typescript
export interface CityLayoutData {
  buildings: Array<{
    id: string;
    name: string;
    gridX: number;
    gridY: number;
    gridW: number;
    gridH: number;
    type: string;
    interactionKind?: string;
  }>;
  decorations: Array<{
    id: string;
    type: string;
    gridX: number;
    gridY: number;
  }>;
  sidewalks: Array<{ x1: number; y1: number; x2: number; y2: number }>;
  roads: Array<{ x1: number; y1: number; x2: number; y2: number }>;
  parkTiles: Array<{ x: number; y: number }>;
  npcSpawns: Array<{ npcId: string; x: number; y: number; zone: string }>;
}

export const CITY_LAYOUT: CityLayoutData;
```

## Map Layout (40 wide × 25 tall):

### Row 0-3: SKYLINE / NORTH BUILDINGS
- Decorative tall buildings at back (not enterable, just visual backdrop)
- 2-3 buildings spanning the width as background

### Row 4-8: DOWNTOWN CORE
- Office Tower at (8, 4), 3×5 tiles — player workplace
- Bank at (14, 5), 3×3 tiles — decorative
- Department Store at (20, 5), 4×3 tiles — shopping
- Electronics Shop at (27, 5), 3×3 tiles — shopping

### Row 9-12: MAIN STREET
- Sidewalk: full row at y=9 and y=12 (PATH tiles)
- Road: rows 10-11 (STONE tiles, dark)
- Coffee Shop at (5, 9), 2×2 — Alex's workplace
- Restaurant at (12, 9), 3×2 — Casey's workplace
- Bar at (20, 9), 2×2 — Sam's workplace
- Bookstore at (27, 9), 2×2 — Riley's workplace

### Row 13-16: PARK
- Green GRASS tiles for entire zone
- Fountain at (20, 14) — central landmark
- Park benches at (15, 14), (25, 14), (18, 16), (22, 16)
- Trees at (13, 13), (27, 13), (13, 16), (27, 16)
- Food cart at (17, 13) — Jordan's area

### Row 17-20: RESIDENTIAL
- Player apartment at (18, 17), 4×4 tiles — player home
- Neighbor building at (8, 17), 3×3 — Taylor's area
- Neighbor building at (28, 17), 3×3 — decorative
- Mailbox at (22, 20)
- Street lamps at (10, 20), (16, 20), (24, 20), (30, 20)

### Row 21-24: TRANSIT ZONE
- Sidewalk row at y=21
- Bus stop at (20, 22) — future farm connection
- Parking lot: STONE tiles (5, 22) to (15, 24)
- Street lamps at (18, 23), (22, 23)
- Trash cans at (6, 22), (14, 22), (26, 22)

### Decoration placements:
- 6 street lamps total along main paths
- 4 trash cans near commercial areas  
- 2 mailboxes in residential
- 8 park benches
- 1 fountain
- Sidewalk (PATH) tiles connecting all buildings

### NPC spawn positions:
- alex: (6, 9) coffee_shop
- morgan: (9, 5) office
- sam: (21, 9) bar
- jordan: (17, 14) park
- casey: (13, 9) restaurant
- riley: (28, 9) bookstore
- taylor: (9, 18) apartment

## Validation
npx tsc --noEmit must pass.

## When done
Write completion report to status/workers/city-layout.md
