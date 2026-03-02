# Worker: Item Tooltip Renderer

## Scope
Create ONLY: src/systems/itemTooltip.ts
Do NOT modify any existing files.

## Required reading
- src/types.ts (ItemDef, BuffType, ItemCategory)
- src/data/registry.ts (ITEMS array structure)

## Task
Create an ItemTooltip class that renders a floating tooltip panel showing item details when hovering over inventory slots.

## Interface:
```typescript
import Phaser from 'phaser';
import { ItemDef } from '../types';

export class ItemTooltip {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  
  constructor(scene: Phaser.Scene);
  
  /** Show tooltip for an item at screen position */
  show(item: ItemDef, quantity: number, quality: number, screenX: number, screenY: number): void;
  
  /** Hide tooltip */
  hide(): void;
  
  /** Clean up */
  destroy(): void;
}
```

## Visual requirements:
- Background: dark rectangle (0x1a1a2e) with 1px border (0x4a4a6a), rounded corners via fillRoundedRect
- Width: 180px, height: auto based on content
- Layout top-to-bottom:
  - Item name (bold, 13px, color based on quality: white=normal, 0xaaaaff=silver, 0xffdd44=gold, 0xff88ff=iridium)
  - Category tag (10px, gray, e.g. "Crop", "Fish", "Food")
  - Horizontal divider line (0x4a4a6a)
  - Description text (11px, 0xcccccc, word-wrapped to 160px)
  - Sell price: "Sells: Xg" (11px, 0xffdd44)
  - If edible: "Restores X stamina" (11px, 0x44ff44)
  - If buff: "Buff: [type] ([duration]s)" (11px, 0x44aaff)
  - Quantity: "x[qty]" (11px, 0xaaaaaa)
- Position: tooltip appears above the cursor, clamped to screen bounds
- Depth: 9999 (above everything)
- Alpha fade in: 0 to 1 over 100ms

## Validation
npx tsc --noEmit must pass.

## When done
Write completion report to status/workers/item-tooltip.md
