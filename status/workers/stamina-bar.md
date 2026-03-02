# Worker Completion: Stamina Bar Renderer

## Status: ✅ Complete

## File Created
- `src/systems/staminaBar.ts`

## Implementation Summary

### Class: `StaminaBar`
- **Constructor**: Creates a container at (x, y) with depth 9995, scroll-fixed to screen.
- **`update(current, max)`**: Redraws the fill gradient, updates the "X/Y" number text, and starts/stops the low-stamina pulse tween.
- **`showWarning()`**: Manually triggers the alpha pulse tween.
- **`destroy()`**: Stops any running tween and destroys the container.

### Visual Details
| Feature | Spec | Implemented |
|---|---|---|
| Bar size | 12×80px | ✅ |
| Background | 0x1a1a2e with 1px border 0x4a4a6a | ✅ |
| Fill gradient | green→yellow→red (top to bottom) | ✅ via `fillGradientStyle` in two segments |
| Fill direction | bottom-up, height = (current/max)×80 | ✅ |
| Low stamina pulse | <25% max → alpha 0.6↔1.0, 500ms sine | ✅ via Phaser tween (250ms yoyo) |
| "E" label | 10px white above bar | ✅ |
| Number display | "X/Y" 9px below bar | ✅ |
| Depth | 9995 | ✅ |

## Validation
- `npx tsc --noEmit` → **exit code 0** (no errors)
