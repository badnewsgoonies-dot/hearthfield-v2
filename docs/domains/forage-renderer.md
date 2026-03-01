# Worker: Forage Renderer

## Scope
Create ONLY: `src/systems/forageRenderer.ts`
Do NOT modify any existing files.

## Required reading
- src/types.ts (SCALED_TILE constant, Season enum)
- src/data/forageData.ts (ForageSpawnDef, FORAGE_SPAWNS)
- src/systems/foraging.ts (ForagingSystem, ForageItem interface)

## Task
Create a ForageRenderer class that draws forage items on the Phaser game world and handles collection interaction.

## Interface (export exactly this):
```typescript
import Phaser from 'phaser';
import { Season } from '../types';
import { ForageItem } from './foraging';

export class ForageRenderer {
  constructor(scene: Phaser.Scene);
  
  /** Call once per day after ForagingSystem spawns new items.
   *  Clears old sprites, creates new ones at item positions. */
  renderItems(items: ForageItem[], season: Season): void;
  
  /** Remove a single item sprite when collected. Returns the item's pixel position. */
  removeItem(itemId: string): { x: number; y: number } | null;
  
  /** Clear all rendered sprites (call on scene shutdown). */
  clear(): void;
  
  /** Get the forage item at a tile position, if any. */
  getItemAtTile(tileX: number, tileY: number): ForageItem | null;
}
```

## Rendering requirements
- Each forage item rendered as a small (SCALED_TILE * 0.6) sized procedural graphic:
  - Colored circle/shape based on item category
  - Wild horseradish: brown root shape
  - Daffodil/dandelion/sweet pea: flower shapes (yellow/white/pink circles with green stem)
  - Grape/berry: small cluster of circles (purple/blue/red)
  - Mushroom: cap + stem shape (brown/red/white)
  - Leek/root vegetables: elongated shape
  - Crystal fruit/snow yam (winter): sparkly blue/white
- Items should have a subtle bobbing animation (sine wave on y, ±2px, 2s period)
- Items rendered at depth 4 (above ground, below player)
- Each item stores its ForageItem data for retrieval

## Internal tracking
- Map<string, { sprite: Phaser.GameObjects.Graphics; item: ForageItem; tween: Phaser.Tweens.Tween }>
- Key is item.id

## Validation
File must compile with: `npx tsc --noEmit`
Must export ForageRenderer class with all 4 methods.

## When done
Write completion report to status/workers/forage-renderer.md
