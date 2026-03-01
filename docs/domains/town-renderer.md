# Worker: Town Renderer

## Scope
Create ONLY: `src/systems/townRenderer.ts`
Do NOT modify any existing files.

## Required reading
- src/types.ts (SCALED_TILE = 48, SCALE = 3, TILE_SIZE = 16)
- src/scenes/InteriorScene.ts (reference for procedural drawing style)

## Task
Create a TownRenderer class with static methods that draw procedural pixel-art buildings and town decorations using Phaser.GameObjects.Graphics. Each method takes a Phaser scene, pixel position, and returns the created game objects.

## Interface (export exactly this):
```typescript
import Phaser from 'phaser';

export interface TownBuilding {
  objects: Phaser.GameObjects.GameObject[];
  solidTiles: Array<{ x: number; y: number }>;  // tiles that should be solid
}

export class TownRenderer {
  /** General store / shop building — 3x2 tiles, wooden with awning */
  static drawShop(scene: Phaser.Scene, tileX: number, tileY: number, T: number): TownBuilding;
  
  /** Blacksmith — 3x2 tiles, stone with chimney smoke */
  static drawBlacksmith(scene: Phaser.Scene, tileX: number, tileY: number, T: number): TownBuilding;
  
  /** Carpenter workshop — 3x2 tiles, log cabin style */
  static drawCarpenter(scene: Phaser.Scene, tileX: number, tileY: number, T: number): TownBuilding;
  
  /** Town hall / community center — 4x2 tiles, larger, peaked roof */
  static drawTownHall(scene: Phaser.Scene, tileX: number, tileY: number, T: number): TownBuilding;
  
  /** Small well — 1x1 tile, stone circle with roof */
  static drawWell(scene: Phaser.Scene, tileX: number, tileY: number, T: number): TownBuilding;
  
  /** Lamppost — 1x1 tile, iron post with warm light circle */
  static drawLamppost(scene: Phaser.Scene, tileX: number, tileY: number, T: number): TownBuilding;
  
  /** Bench — 1x1 tile, wooden slats */
  static drawBench(scene: Phaser.Scene, tileX: number, tileY: number, T: number): TownBuilding;
  
  /** Market stall — 2x1 tile, striped awning with goods */
  static drawMarketStall(scene: Phaser.Scene, tileX: number, tileY: number, T: number, color: number): TownBuilding;
  
  /** Flower bed — 1x1 tile, seasonal flowers */
  static drawFlowerBed(scene: Phaser.Scene, tileX: number, tileY: number, T: number, season: string): TownBuilding;
  
  /** Signpost — 1x1 tile, wooden post with directional signs */
  static drawSignpost(scene: Phaser.Scene, tileX: number, tileY: number, T: number): TownBuilding;
}
```

## T parameter
T is SCALED_TILE (48). All dimensions are in pixels, calculated from T.
- A 3x2 building occupies 3*T wide, 2*T tall in pixels
- Position: pixel coords = (tileX * T + T/2, tileY * T + T/2) for center

## Drawing style (match InteriorScene)
Use Phaser.GameObjects.Graphics with fillStyle/fillRect/fillTriangle/fillCircle.
Pixel art aesthetic — no anti-aliasing, solid colors with minimal detail.
Each building should have:
- A colored base/walls (fillRect)
- A darker roof (fillTriangle for peaked, fillRect for flat)
- A door (dark rectangle at bottom center)
- One or two distinguishing details (chimney, awning, sign)
- A shadow on the ground (dark, 10% alpha, offset right and down)

## Color palette:
- Wood walls: 0x8B6B4A (light), 0x6B4A2A (dark/trim)
- Stone walls: 0x888888 (light), 0x666666 (dark)
- Roofs: 0xaa4444 (red), 0x6B4A2A (brown), 0x556677 (slate)
- Doors: 0x3a2a1a (dark wood)
- Windows: 0x88bbdd (day blue), with 0x668899 frame
- Awnings: use the `color` parameter for market stalls
- Iron/metal: 0x555566
- Light glow: 0xffdd88, alpha 0.15, radius T*0.8

## solidTiles return
Each method returns which tiles (relative to tileX, tileY) should be collision-solid.
- 3x2 building: solid at [(0,0), (1,0), (2,0), (0,1), (2,1)] — door tile open at (1,1)
- 1x1 objects (well, lamppost): solid at [(0,0)]
- Bench: NOT solid (player can walk through)
- Flower bed: NOT solid

## Depth
All graphics should use setDepth based on their y position for proper sorting.
Use: `ySortDepth(tileY * T + T)` pattern (import from types if needed, or just use tileY * 1000).

## Validation
File must compile with: `npx tsc --noEmit`
Must export TownRenderer class and TownBuilding interface.

## When done
Write completion report to status/workers/town-renderer.md
