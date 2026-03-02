# Worker Completion: Map Decoration Renderer

## Status: ✅ Complete

## File Created
- `src/systems/mapDecorations.ts`

## What Was Implemented
- `MapDecorations` class with `scene` and `decorations` fields matching the spec interface exactly.
- `placeDecorations(grassPositions, season)` — iterates eligible grass positions, applies seeded random filter `(x*73 + y*137) % 100 < 30` (~30% placement), then dispatches to five decoration types:
  1. **Grass tuft** (40%) — 4 blades fanning upward; season-correct colors (spring 0x44aa22 / summer 0x55bb33 / fall 0x998844 / winter 0xaabbcc).
  2. **Small rock** (20%) — gray ellipse (0x888888) + lighter highlight (0xaaaaaa) top-left.
  3. **Wildflower** (20%) — stem + colored dot; spring: pink/white, summer: yellow/orange; skipped in fall/winter.
  4. **Dirt patch** (10%) — dark brown ellipse (0x665544).
  5. **Fallen leaf** (10%) — orange/red triangle in fall; white snow dot in winter; skipped otherwise.
- Each decoration is positioned with a deterministic pixel offset within the tile.
- Depth set to `worldY - 1` (above ground, below player).
- `updateSeason(season)` destroys all graphics (caller re-invokes `placeDecorations` to rebuild).
- `destroy()` tears down all `Phaser.GameObjects.Graphics` instances and clears the array.

## Validation
`npx tsc --noEmit` — **exit 0, no errors**.

## Constraints Respected
- No existing files modified.
- Only `src/systems/mapDecorations.ts` created.
