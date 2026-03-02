# Worker: Shipping Bin Animation

## Scope
Create ONLY: src/systems/shipBinEffect.ts
Do NOT modify any existing files.

## Required reading
- src/types.ts (Events enum — look for ITEM_SHIPPED)

## Task
Create a ShipBinEffect class that shows animated visual feedback when items are placed in the shipping bin.

## Interface:
```typescript
import Phaser from 'phaser';

export class ShipBinEffect {
  constructor(scene: Phaser.Scene);
  
  /** Play the shipping animation at a world position. Shows item floating up and disappearing with gold sparkle */
  playShipAnimation(x: number, y: number, itemName: string, revenue: number): void;
  
  destroy(): void;
}
```

## Visual:
- Item name text floats upward from bin position over 800ms, fading out
- Revenue text "+Xg" in gold (0xffdd44) appears below, also floats up 600ms
- 8-12 small gold particles burst outward (use scene.add.particles with '__DEFAULT' texture, tint 0xffd700)
- Bin "lid" animation: draw a small brown rectangle that tilts open 30° then closes over 400ms

## Validation
npx tsc --noEmit must pass.

## When done
Write completion report to status/workers/ship-animation.md
