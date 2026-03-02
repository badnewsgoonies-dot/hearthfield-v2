# Worker: City Building Renderer

## Scope
Create ONLY: src/systems/cityRenderer.ts
Do NOT modify any existing files.

## Required reading
- src/systems/townRenderer.ts (reference — match this pattern for procedural buildings)
- src/types.ts (CityVenue)

## Task
Create procedural graphics renderers for city buildings and decorations.

## Exports:
```typescript
import Phaser from 'phaser';
import { CityVenue } from '../types';

export class CityRenderer {
  /** Draw a city building at world position. All buildings drawn with Phaser.Graphics */
  static drawBuilding(scene: Phaser.Scene, x: number, y: number, width: number, height: number, color: number, roofColor: number, name: string, tileSize: number): Phaser.GameObjects.Container;
  
  /** Draw the Office Tower — tall building with windows grid, revolving door */
  static drawOfficeTower(scene: Phaser.Scene, x: number, y: number, T: number): Phaser.GameObjects.Container;
  
  /** Draw a café/restaurant — warm colors, awning, tables outside */
  static drawCafe(scene: Phaser.Scene, x: number, y: number, T: number, name: string, color: number): Phaser.GameObjects.Container;
  
  /** Draw a shop — display window, sign */
  static drawShop(scene: Phaser.Scene, x: number, y: number, T: number, name: string, color: number): Phaser.GameObjects.Container;
  
  /** Draw the bar — dark exterior, neon sign accent */
  static drawBar(scene: Phaser.Scene, x: number, y: number, T: number): Phaser.GameObjects.Container;
  
  /** Draw apartment building — multi-story, many windows, entrance canopy */
  static drawApartment(scene: Phaser.Scene, x: number, y: number, T: number, isPlayer: boolean): Phaser.GameObjects.Container;
  
  /** Draw the gym — wide building, sporty colors */
  static drawGym(scene: Phaser.Scene, x: number, y: number, T: number): Phaser.GameObjects.Container;
  
  /** Draw city park elements — trees, fountain, benches */
  static drawParkElements(scene: Phaser.Scene, x: number, y: number, T: number): Phaser.GameObjects.Container;
  
  // Decorations
  static drawStreetlight(scene: Phaser.Scene, x: number, y: number, T: number): Phaser.GameObjects.Container;
  static drawBench(scene: Phaser.Scene, x: number, y: number, T: number): Phaser.GameObjects.Container;
  static drawTrashCan(scene: Phaser.Scene, x: number, y: number, T: number): Phaser.GameObjects.Container;
  static drawFireHydrant(scene: Phaser.Scene, x: number, y: number, T: number): Phaser.GameObjects.Container;
  static drawFountain(scene: Phaser.Scene, x: number, y: number, T: number): Phaser.GameObjects.Container;
  static drawBusStop(scene: Phaser.Scene, x: number, y: number, T: number): Phaser.GameObjects.Container;
}
```

## Visual style:
All buildings use Phaser.GameObjects.Graphics with fillRect, fillRoundedRect, lineBetween.
- Buildings: solid fill body + slightly darker roof rectangle on top
- Windows: small light-colored rectangles in a grid pattern (3-4 per floor)
- Doors: darker rectangle at bottom center
- Signs: small rectangle above door with venue name in text
- Office Tower: tallest building (3T tall), blue glass windows grid (4×6), gold text "HEARTHFIELD INC"
- Café: warm awning (striped effect using alternating rect colors), small round tables outside (circles)
- Bar: dark purple body, small neon-colored rectangles for "sign" effect, dim windows
- Apartment: 3 floors of windows (3×3 grid), front canopy over door, "APT" or address number
- Gym: wide (3T), orange accent stripe, dumbbell icon (two circles + rect) on sign area
- Streetlight: thin vertical line (pole) + small yellow filled circle (light) at top + glow circle (alpha 0.15)
- Bench: brown horizontal rect + two small vertical legs
- Fountain: circular base + small vertical lines for water spray + blue tint

## Size reference: T = tileSize (48px at default scale). Buildings are 2-4 tiles wide, 2-3 tiles tall.

## Validation
npx tsc --noEmit must pass.

## When done
Write completion report to status/city-workers/city-renderer.md
