# Worker: Map Decoration Renderer

## Scope
Create ONLY: src/systems/mapDecorations.ts
Do NOT modify any existing files.

## Required reading
- src/types.ts (Season enum)

## Task
Create a MapDecorations class that renders small environmental details like grass tufts, small rocks, flowers, and ground cover to make the map feel less flat.

## Interface:
```typescript
import Phaser from 'phaser';

export class MapDecorations {
  private scene: Phaser.Scene;
  private decorations: Phaser.GameObjects.Graphics[];
  
  constructor(scene: Phaser.Scene);
  
  /** Place decorations on grass tiles. Takes array of positions that are grass and not occupied */
  placeDecorations(grassPositions: Array<{x: number; y: number; worldX: number; worldY: number; tileSize: number}>, season: string): void;
  
  /** Update seasonal colors */
  updateSeason(season: string): void;
  
  destroy(): void;
}
```

## Decoration types (procedural graphics):
1. **Grass tuft** (most common, 40% of placements): 3-5 thin green lines fanning upward from base. Spring: bright green 0x44aa22. Summer: 0x55bb33. Fall: 0x998844. Winter: 0xaabbcc (frosted).
2. **Small rock** (20%): gray oval (0x888888) with lighter highlight (0xaaaaaa) on top-left.
3. **Wildflower** (20%): tiny stem + colored dot on top. Spring: pink/white. Summer: yellow/orange. Fall: none (skip). Winter: none (skip).
4. **Dirt patch** (10%): small dark oval (0x665544) for visual variety.
5. **Fallen leaf** (10%): only in fall — small orange/red triangle. Winter: replace with snow dot (white).

## Placement rules:
- Place on ~30% of eligible grass positions (use seeded random: (x * 73 + y * 137) % 100 < 30)
- Decorations are small (4-8px) and positioned randomly within the tile
- Depth: slightly above ground tile but below player (use worldY - 1)
- Do NOT place on tiles where buildings, paths, or water exist (only on positions provided)

## Validation
npx tsc --noEmit must pass.

## When done
Write completion report to status/workers/map-decorations.md
