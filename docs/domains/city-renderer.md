# Worker: City Renderer

## Scope
Create ONLY: src/systems/cityRenderer.ts
Do NOT modify any existing files.

## Required reading
- src/systems/townRenderer.ts (reference for how farm town buildings are drawn)

## Task
Create a CityRenderer class with static methods that procedurally draw city buildings and decorations using Phaser Graphics. Each method draws a complete building at a given position.

## Interface:
```typescript
import Phaser from 'phaser';

export interface CityBuilding {
  id: string;
  name: string;
  x: number;          // grid x
  y: number;          // grid y
  width: number;      // tiles wide
  height: number;     // tiles tall
  type: 'office' | 'shop' | 'restaurant' | 'bar' | 'apartment' | 'gym' | 'gallery' | 'bookstore' | 'park' | 'cafe';
  interactable: boolean;
}

export class CityRenderer {
  /** Draw the Nexus Corp office tower — tall gray/blue glass building, 4 tiles wide × 5 tiles tall */
  static drawOffice(scene: Phaser.Scene, x: number, y: number, tileSize: number): Phaser.GameObjects.Container;

  /** Draw Daily Grind coffee shop — cozy brown storefront, 3×2 tiles, awning, "COFFEE" sign */
  static drawCoffeeShop(scene: Phaser.Scene, x: number, y: number, tileSize: number): Phaser.GameObjects.Container;

  /** Draw Rosemary's restaurant — warm red/orange facade, 3×2 tiles, window with warm light */
  static drawRestaurant(scene: Phaser.Scene, x: number, y: number, tileSize: number): Phaser.GameObjects.Container;

  /** Draw The Neon Tap bar — dark exterior, neon accent lines (purple/cyan), 3×2 tiles */
  static drawBar(scene: Phaser.Scene, x: number, y: number, tileSize: number): Phaser.GameObjects.Container;

  /** Draw player's apartment building — brick, 4×4 tiles, multiple windows, entrance door */
  static drawApartment(scene: Phaser.Scene, x: number, y: number, tileSize: number): Phaser.GameObjects.Container;

  /** Draw FitZone gym — modern facade, large windows, 3×2 tiles */
  static drawGym(scene: Phaser.Scene, x: number, y: number, tileSize: number): Phaser.GameObjects.Container;

  /** Draw art gallery — white/minimal exterior, 3×2 tiles, large display window */
  static drawGallery(scene: Phaser.Scene, x: number, y: number, tileSize: number): Phaser.GameObjects.Container;

  /** Draw Pages & Co bookstore — warm wood facade, book display window, 2×2 tiles */
  static drawBookstore(scene: Phaser.Scene, x: number, y: number, tileSize: number): Phaser.GameObjects.Container;

  /** Draw a street lamp post — tall pole with glowing light at top */
  static drawStreetLamp(scene: Phaser.Scene, x: number, y: number, tileSize: number): Phaser.GameObjects.Container;

  /** Draw a park bench */
  static drawBench(scene: Phaser.Scene, x: number, y: number, tileSize: number): Phaser.GameObjects.Container;

  /** Draw a fountain — circular base with water spray effect */
  static drawFountain(scene: Phaser.Scene, x: number, y: number, tileSize: number): Phaser.GameObjects.Container;

  /** Draw a bus stop sign with shelter */
  static drawBusStop(scene: Phaser.Scene, x: number, y: number, tileSize: number): Phaser.GameObjects.Container;

  /** Draw a fire hydrant */
  static drawHydrant(scene: Phaser.Scene, x: number, y: number, tileSize: number): Phaser.GameObjects.Container;

  /** Draw a mailbox */  
  static drawMailbox(scene: Phaser.Scene, x: number, y: number, tileSize: number): Phaser.GameObjects.Container;

  /** Draw a newspaper stand */
  static drawNewsstand(scene: Phaser.Scene, x: number, y: number, tileSize: number): Phaser.GameObjects.Container;
}
```

## Visual style:
- Use Phaser.GameObjects.Graphics for all drawing (no textures/sprites)
- Buildings should look like simplified pixel-art storefronts
- Color palette: modern/urban (grays, blues for office; warm browns/oranges for restaurants; dark purples for bar; brick reds for apartments)
- Each building gets a text label above it with the name
- Windows should be lighter rectangles with slight yellow tint (interior light)
- Doors should be darker rectangles at ground level
- Awnings use angled trapezoid shapes
- All sizes proportional to tileSize parameter

## Drawing detail level (aim for 20-40 graphics operations per building):
- Office: glass panels grid, entrance canopy, company logo text
- Coffee shop: striped awning, window display, steam wisps above
- Bar: dark walls, neon accent border (glowing effect via alpha), cocktail sign
- Apartment: regular window grid (3×4 windows), brick texture lines, doorstep

## Validation
npx tsc --noEmit must pass.

## When done
Write completion report to status/workers/city-renderer.md with method count and avg lines per method.
