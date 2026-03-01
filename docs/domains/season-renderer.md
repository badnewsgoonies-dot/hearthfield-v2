# Worker: Season Renderer

## Scope
Create ONLY: `src/systems/seasonRenderer.ts`
Do NOT modify any existing files.

## Required reading
- src/types.ts (Season enum, TILE_SIZE, SCALE, SCALED_TILE constants)

## Task
Create a self-contained SeasonRenderer class that provides seasonal visual data.

## Interface (export exactly this):
```typescript
export interface SeasonPalette {
  grassLight: number;    // primary grass color
  grassDark: number;     // alternate grass color (checkerboard)
  dirtLight: number;     // tilled soil
  dirtDark: number;      // watered soil
  treeTrunk: number;     // tree trunk tint
  treeLeaves: number;    // tree canopy color
  treeLeaves2: number;   // secondary canopy (variation)
  waterColor: number;    // pond/water tint
  ambient: number;       // ambient overlay color (applied at low alpha)
  ambientAlpha: number;  // 0-0.15 range
  particleColor: number; // falling particles (leaves, snow, petals)
  particleCount: number; // particles per frame (0 = none)
  skyTint: number;       // background color behind farm
}

export class SeasonRenderer {
  static getPalette(season: Season): SeasonPalette;
  static getRandomTree(season: Season, x: number, y: number): { leafColor: number; hasLeaves: boolean; hasFruit: boolean; fruitColor: number };
}
```

## Palette values (non-negotiable):

### Spring
- grassLight: 0x5a8c3a, grassDark: 0x4e7a32
- dirtLight: 0x8B6B4A, dirtDark: 0x6B4A2A
- treeLeaves: 0x44aa44, treeLeaves2: 0x66cc66
- waterColor: 0x4488cc, ambient: 0xffeedd, ambientAlpha: 0.03
- particleColor: 0xffaacc (cherry blossoms), particleCount: 2
- skyTint: 0x87CEEB

### Summer
- grassLight: 0x4a7a2a, grassDark: 0x3d6b22
- dirtLight: 0x9B7B5A, dirtDark: 0x7B5A3A
- treeLeaves: 0x338833, treeLeaves2: 0x44aa33
- waterColor: 0x3377bb, ambient: 0xffeeaa, ambientAlpha: 0.05
- particleColor: 0xffff88 (fireflies), particleCount: 1
- skyTint: 0x6BB5E0

### Fall
- grassLight: 0x8a7a3a, grassDark: 0x7a6a2a
- dirtLight: 0x8B6B4A, dirtDark: 0x6B4A2A
- treeLeaves: 0xcc7722, treeLeaves2: 0xdd4422
- waterColor: 0x557799, ambient: 0xddaa66, ambientAlpha: 0.06
- particleColor: 0xcc8833 (falling leaves), particleCount: 3
- skyTint: 0xC4956A

### Winter
- grassLight: 0xbbccbb, grassDark: 0xaabbaa
- dirtLight: 0x998877, dirtDark: 0x776655
- treeLeaves: 0x557755, treeLeaves2: 0x446644
- waterColor: 0x88aacc, ambient: 0xccddff, ambientAlpha: 0.08
- particleColor: 0xffffff (snow), particleCount: 5
- skyTint: 0xCCDDEE

### getRandomTree
Use (x * 7 + y * 13) as seed for deterministic variation.
- Spring: all have leaves, 20% have pink fruit (0xffaacc)
- Summer: all have leaves, 30% have fruit (0xff4444)
- Fall: 80% have leaves, 40% have fruit (0xffaa22)
- Winter: 30% have leaves (evergreen), 0% fruit

## Validation
File must compile with: `npx tsc --noEmit`
Must export SeasonPalette interface and SeasonRenderer class.

## When done
Write completion report to status/workers/season-renderer.md
