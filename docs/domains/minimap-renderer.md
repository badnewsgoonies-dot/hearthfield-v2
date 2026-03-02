# Domain: Minimap Renderer

## Scope
src/systems/minimapRenderer.ts — ONE file only

## Overview
A small pixel-perfect minimap in the top-right corner showing the entire farm/town map, player position, NPC positions, and building locations. Drawn using a Phaser RenderTexture for efficiency.

## Required Exports

```typescript
export interface MinimapConfig {
  mapWidthTiles: number;    // 40
  mapHeightTiles: number;   // 30
  displaySize: number;      // 120 (pixels on screen)
  margin: number;           // 8 (pixels from screen edge)
}

export interface MinimapEntity {
  tileX: number;
  tileY: number;
  color: number;  // hex color for the dot
}

export class MinimapRenderer {
  constructor(scene: Phaser.Scene, config: MinimapConfig);

  /**
   * Draw the static terrain layer. Call once on scene create and when season changes.
   * @param tiles - flat array of tile objects with {x, y, type} where type is:
   *   0=GRASS, 1=DIRT, 2=WATER, 3=STONE, 4=SAND, 5=TILLED, 6=PATH, 7=BEACH
   */
  drawTerrain(tiles: Array<{ x: number; y: number; type: number }>): void;

  /**
   * Update dynamic elements each frame.
   * @param playerTileX - player tile X position
   * @param playerTileY - player tile Y position
   * @param entities - array of NPCs/animals to show as colored dots
   * @param timeOfDay - 0-1 for night darkening effect
   */
  update(playerTileX: number, playerTileY: number, entities: MinimapEntity[], timeOfDay: number): void;

  /** Toggle visibility (bound to M key in PlayScene) */
  toggle(): void;

  /** Check if visible */
  isVisible(): boolean;

  /** Clean up */
  destroy(): void;
}
```

## Visual Design

### Layout
- Position: top-right corner of camera (fixed to camera, scrollFactor 0)
- Size: 120×90 pixels (maintains 40:30 aspect ratio), each tile = 3×3 pixels
- Border: 1px solid 0x333333
- Background: 0x111111 at 0.6 alpha (semi-transparent)
- Depth: 9995 (above world, below tooltips)

### Terrain Colors (per TileType)
| Type | Color | Notes |
|------|-------|-------|
| GRASS (0) | 0x4a8c3f | Main green |
| DIRT (1) | 0x8b7355 | Brown |
| WATER (2) | 0x3366aa | Blue |
| STONE (3) | 0x888888 | Gray |
| SAND (4) | 0xd4b86a | Tan |
| TILLED (5) | 0x5a3f2c | Dark brown |
| PATH (6) | 0xaa9977 | Light brown |
| BEACH (7) | 0xd4c27a | Light tan |

### Dynamic Elements
| Element | Color | Size | Shape |
|---------|-------|------|-------|
| Player | 0xffffff | 3×3 px + 1px border | Blinking dot (toggle every 500ms) |
| NPCs | 0xff8844 | 2×2 px | Static dot |
| Animals | 0xffcc44 | 1×1 px | Tiny dot |
| Buildings | 0x666666 | matches footprint | Drawn with terrain |

### Building Footprints (drawn on terrain layer)
| Building | Tile Range | Color |
|----------|-----------|-------|
| House | (17-23, 4-8) | 0x8B6B4A |
| Coop | (27-29, 10-12) | 0x8B6B4A |
| Barn | (31-33, 10-12) | 0x8B6B4A |
| Shop | (27-29, 22-23) | 0x7a6a5a |
| Blacksmith | (16-18, 21-22) | 0x7a6a5a |
| Carpenter | (9-11, 22-23) | 0x7a6a5a |
| Town Hall | (19-22, 25-26) | 0x7a6a5a |

### Night Effect
When timeOfDay > 0.4 (evening) or < 0.1 (early morning):
- Overlay the entire minimap with 0x000033 at alpha 0.3
- Player dot becomes brighter (0xffff88) to remain visible

## Implementation Constraints

1. **Use Phaser.GameObjects.RenderTexture** for the terrain layer — draw once, don't redraw every frame.
2. **Dynamic overlay**: Use a separate Phaser.GameObjects.Graphics on top for player dot, NPC dots, night overlay. Clear and redraw this every frame.
3. **Both layers use setScrollFactor(0)** to stay fixed on screen.
4. **Pixel scale**: Each map tile = 3×3 pixels on the minimap. Total: 120×90 pixels.
5. **Container**: Use a Phaser.GameObjects.Container to group minimap elements for easy toggle.
6. **Default state**: visible (user can toggle with M key).
7. **File size: 150-250 LOC.**
8. **Performance**: Terrain drawn once. Only dynamic dots updated per frame. Target < 0.2ms per update.

## Does NOT Handle
- Fog of war / exploration reveal
- Click-to-move on minimap
- Second map support (only the main 40×30 map)
- Interior scenes (hide minimap when in interiors)

## Validation
- `npx tsc --noEmit` must pass
- Only import from 'phaser' (no project imports)
- File exports MinimapRenderer class and interfaces
