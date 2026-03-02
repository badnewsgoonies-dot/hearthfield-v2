# Worker: Water Animation

## Scope
Create ONLY: src/systems/waterAnimation.ts
Do NOT modify any existing files.

## Required reading
- src/types.ts (TileType enum, FarmTile interface)

## Task
Create a WaterAnimation class that provides animated water tile rendering using Phaser Graphics. The class should create a shimmering, animated water surface effect.

## Interface (export exactly this):
```typescript
import Phaser from 'phaser';

export class WaterAnimation {
  private scene: Phaser.Scene;
  private graphics: Phaser.GameObjects.Graphics[];
  private timer: number;
  
  constructor(scene: Phaser.Scene);
  
  /** Call once with all water tile positions to set up animation layers */
  setupWaterTiles(tiles: Array<{x: number; y: number; worldX: number; worldY: number; tileSize: number}>): void;
  
  /** Call every frame with delta to animate */
  update(delta: number): void;
  
  /** Clean up */
  destroy(): void;
}
```

## Visual requirements:
- Base water color: 0x3388cc with alpha 0.85
- Animated wave highlights: lighter blue (0x55aadd) ripples that move across tiles
- Use sin waves with different phases per tile to create organic movement
- Sparkle effect: occasional white (0xffffff alpha 0.3) dots that appear and fade
- Wave speed: complete cycle every 2000ms
- Each tile should have slightly different phase offset based on its grid position (x * 0.7 + y * 1.3)
- Depth should be set via a depthValue parameter or use y-sort

## Validation
npx tsc --noEmit must pass.

## When done
Write completion report to status/workers/water-animation.md
