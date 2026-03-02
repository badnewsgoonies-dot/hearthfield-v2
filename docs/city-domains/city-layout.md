# Worker: City Map Layout Data

## Scope
Create ONLY: src/data/cityLayout.ts
Do NOT modify any existing files.

## Required reading
- src/types.ts (TileType, CityInteractionKind, CityVenue)
- src/data/townData.ts (reference for format — match the pattern)

## Task
Create the city map layout as a data structure. The map is 40×30 tiles.

## Exports:
```typescript
import { TileType, CityInteractionKind, CityVenue } from '../types';

export interface CityBuilding {
  name: string;
  x: number;          // tile x of entrance
  y: number;          // tile y of entrance
  width: number;      // footprint in tiles
  height: number;     // footprint in tiles
  venue: CityVenue;
  interaction: CityInteractionKind;
  color: number;       // primary building color
  roofColor: number;   // roof color
  hasSign: boolean;
}

export interface CityDecoration {
  type: 'streetlight' | 'bench' | 'trash_can' | 'fire_hydrant' | 'newspaper_box' | 'parking_meter' | 'bus_sign' | 'fountain' | 'tree' | 'flower_planter' | 'mailbox' | 'phone_booth';
  x: number;
  y: number;
}

export interface CityMapLayout {
  buildings: CityBuilding[];
  decorations: CityDecoration[];
  mainStreetY: number;       // y coordinate of main horizontal street
  crossStreetX: number;      // x coordinate of main vertical street
  sidewalks: Array<{x: number; y: number}>; // PATH tiles
  parkArea: {x1: number; y1: number; x2: number; y2: number};
  communityGarden: {x: number; y: number; w: number; h: number};
}

export const CITY_LAYOUT: CityMapLayout;
```

## Map Layout (40×30 grid):
### Row 0-3: Skyline (decorative tall buildings, solid/non-walkable)
- Fill with STONE tiles, these are building facades

### Row 4-7: DOWNTOWN CORE
- Office Tower at (8, 4), 4×3 tiles, dark blue (0x2244aa), gray roof
- Café "Maya's Brew" at (16, 5), 3×2 tiles, warm brown (0x8B4513), cream roof
- Electronics Store at (24, 5), 3×2 tiles, dark gray (0x333344), blue roof
- Main Street: PATH tiles along y=6, full width (x 0-39)
- Streetlights every 4 tiles along main street

### Row 8-11: COMMERCIAL
- Restaurant "Sam's Kitchen" at (6, 8), 3×3 tiles, red (0xaa3333), dark roof
- Bar "The Night Owl" at (14, 9), 3×2 tiles, dark purple (0x442266), neon accent
- Clothing Shop at (22, 8), 3×2 tiles, pink (0xcc6688), white roof
- Small Park: grass area at (30, 8) to (37, 11) with benches, fountain at (33, 10)
- Cross street: PATH tiles along x=20, from y=4 to y=27

### Row 12-15: TRANSITION
- Bus Stop at (20, 13), 2×1 tiles — just a sign + bench
- Gym at (8, 13), 3×2 tiles, orange (0xcc6622), gray roof
- Bookstore at (28, 13), 3×2 tiles, green (0x446644), brown roof
- Laundromat at (35, 13), 2×2 tiles, light blue (0x6688aa), white roof
- Sidewalk: PATH tiles along y=12

### Row 16-19: RESIDENTIAL
- Player Apartment Building at (12, 16), 4×3 tiles, beige (0xccaa88), brown roof — MAIN building, interaction: APARTMENT_DOOR
- Neighbor Building at (24, 16), 3×3 tiles, gray (0x888888)
- Sidewalk: PATH tiles along y=17

### Row 20-23: MORE RESIDENTIAL
- Grocery Store at (6, 20), 3×2 tiles, green (0x44aa44), white roof
- Corner Café at (16, 21), 2×2 tiles, cream (0xddcc99), brown roof
- Community Garden at (28, 20), 3×3 tiles — plantable area (DIRT tiles)

### Row 24-27: CITY PARK
- Grass fill, scattered trees (6-8), pond at (18, 25) to (22, 27) — WATER tiles
- Benches at (10, 25), (15, 26), (30, 25)
- Fountain at (26, 25)
- Jogging path: PATH tiles in a loop

### Row 28-29: Edge
- STONE tiles (fence/wall border)

## Decorations (25+ total):
- 10 streetlights along main street and cross street
- 4 benches (park + bus stop + commercial area)
- 3 trash cans near shops
- 2 fire hydrants on street corners
- 1 fountain (park), 1 fountain (commercial)
- 2 flower planters near apartment
- 1 bus sign at bus stop
- 1 mailbox near apartment

## Validation
npx tsc --noEmit must pass.

## When done
Write completion report to status/city-workers/city-layout.md
