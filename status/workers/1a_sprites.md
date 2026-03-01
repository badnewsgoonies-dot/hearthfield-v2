# Worker 1A Report: Sprites + Registry Fix

## New spritesheet frame count
- `items` spritesheet now uses `16 x 8` frames.
- Total frames: `128`.

## spriteIndex reassignments made
- `omelet`: `74 -> 64`
- `pumpkin_soup`: `77 -> 65`
- `blueberry_tart`: `78 -> 66`
- `corn_chowder`: `79 -> 67`
- `cheese_press`: `58 -> 68`
- `mayo_machine`: `59 -> 69`
- `quality_sprinkler`: `60 -> 77`

Additional update required by task:
- `wool`: `80 -> 74`

## Items removed
- No removals were necessary in the current file state.
- `honey`, `bouquet`, and `pendant` duplicate entries at sprite indices `105`, `106`, `107` were already absent.

## Items added
- `wool` item fields were updated to include requested fields and index:
  - `buyPrice: 0`
  - `stackable: true`
  - `spriteIndex: 74`

## tsc result
- Command: `npx tsc --noEmit`
- Result: `PASS (0 errors)`
