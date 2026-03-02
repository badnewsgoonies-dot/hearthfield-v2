# Worker: City Renderer

## Scope
Create ONLY: src/systems/cityRenderer.ts
Do NOT modify any existing files.

## Required reading
- src/systems/townRenderer.ts (reference for procedural building rendering pattern)
- src/types.ts (TILE_SIZE, SCALE, SCALED_TILE constants)

## Task
Create a CityRenderer class with static methods that draw city buildings and objects using Phaser Graphics. Same pattern as TownRenderer but for urban structures.

## Interface:
```typescript
import Phaser from 'phaser';

export interface CityBuilding {
  id: string;
  name: string;
  gridX: number;
  gridY: number;
  gridW: number;
  gridH: number;
  color: number;
  type: 'office' | 'shop' | 'restaurant' | 'bar' | 'cafe' | 'bookstore' | 'apartment' | 'park_feature' | 'transit';
}

export class CityRenderer {
  static drawBuilding(scene: Phaser.Scene, building: CityBuilding, tileSize: number): Phaser.GameObjects.Container;
  static drawOffice(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, T: number): void;
  static drawApartment(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, T: number): void;
  static drawCafe(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, T: number): void;
  static drawRestaurant(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, T: number): void;
  static drawBar(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, T: number): void;
  static drawBookstore(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, T: number): void;
  static drawShop(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, T: number): void;
  static drawParkBench(g: Phaser.GameObjects.Graphics, x: number, y: number, T: number): void;
  static drawFountain(g: Phaser.GameObjects.Graphics, x: number, y: number, T: number): void;
  static drawStreetLamp(g: Phaser.GameObjects.Graphics, x: number, y: number, T: number): void;
  static drawBusStop(g: Phaser.GameObjects.Graphics, x: number, y: number, T: number): void;
  static drawMailbox(g: Phaser.GameObjects.Graphics, x: number, y: number, T: number): void;
  static drawTrashCan(g: Phaser.GameObjects.Graphics, x: number, y: number, T: number): void;
}
```

## Visual style (procedural pixel art via Graphics):
- **Office tower**: Tall rectangle (3×5 tiles), gray-blue (0x445566) with grid of lit yellow windows (0xffeeaa), darker roof, glass door at bottom center
- **Apartment**: Wide rectangle (4×4 tiles), warm brown (0x886644) with varied window colors (some lit, some dark), fire escape zigzag on side, awning over entrance
- **Cafe**: Small (2×2), warm colors (0xcc8844), striped awning (alternating 0xcc4444/0xffffff), small window with "OPEN" sign, coffee cup icon
- **Restaurant**: Medium (3×2), red brick (0x884422), large front window showing table silhouettes, decorative trim, name sign
- **Bar**: Medium (2×2), dark wood (0x553322), neon-style colored sign outline (0xff4488), small tinted windows
- **Bookstore**: Small (2×2), forest green (0x446644), large bay window, books visible, warm interior glow
- **Shop**: Medium (2×2), bright storefront (0x4488aa), display window, price tags
- **Park bench**: Brown slats on gray legs, simple side view
- **Fountain**: Circular basin (gray), water spray (blue lines), base pedestal
- **Street lamp**: Tall thin pole (0x444444), glowing circle at top (0xffddaa), light cone below
- **Bus stop**: Post with sign, small shelter roof
- **Mailbox**: Blue rectangle on post
- **Trash can**: Gray cylinder with lid

Each building method draws entirely with g.fillStyle/fillRect/fillRoundedRect/lineStyle/lineBetween. No external assets.

## Validation
npx tsc --noEmit must pass.

## When done
Write completion report to status/workers/city-renderer.md
