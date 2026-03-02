# Worker Completion: Water Animation

## Status: ✅ DONE

## File Created
- `src/systems/waterAnimation.ts`

## Implementation Summary
- `WaterAnimation` class with `scene`, `graphics[]`, and `timer` private fields
- `setupWaterTiles()`: accepts tile array, creates two Phaser Graphics layers (base + wave/sparkle), stores per-tile phase offsets (`x * 0.7 + y * 1.3`) and randomized sparkle timers
- `update(delta)`: clears and redraws each frame:
  - Base water fill: `0x3388cc` at alpha `0.85`
  - Wave highlight: `0x55aadd` ripple strip using `sin(timer/2000 * 2π + phase)` — full cycle every 2000ms, alpha and height vary with wave value
  - Sparkle: white `0xffffff` 2×2 dots at alpha `0.3` triggered on per-tile random intervals (800–2000ms)
- `destroy()`: destroys all graphics objects and resets state

## Validation
`npx tsc --noEmit` → **exit 0** (no errors)
