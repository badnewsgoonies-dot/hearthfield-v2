# Worker Completion: Shipping Bin Animation

**Status:** ✅ Done  
**File created:** `src/systems/shipBinEffect.ts`  
**Files modified:** none

## What was implemented

`ShipBinEffect` class with:

- `constructor(scene: Phaser.Scene)` — stores scene reference
- `playShipAnimation(x, y, itemName, revenue)`:
  - Item name text floats up 48px over 800ms, fading to alpha 0
  - Revenue text `+Xg` in gold (`0xffdd44`) floats up 600ms from just below the bin
  - 8–12 gold particles (`tint: 0xffd700`, `__DEFAULT` texture) burst radially outward
  - Brown rectangle lid (`0x8b5e3c`) tilts –30° then closes over 400ms (yoyo tween)
- `destroy()` — no-op (no persistent resources)

## Validation

`npx tsc --noEmit` exits 0 — no type errors.
