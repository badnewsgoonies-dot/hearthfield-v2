# Worker 5A BootScene Visual Polish

## Scope
- Modified only `src/scenes/BootScene.ts`.

## Completed
- Updated terrain tile generation in `genTerrain` for:
  - `GRASS`: added non-uniform darker green speck variation.
  - `DIRT`: added brown tonal variation and light pebble dots.
  - `TILLED`: stronger dark horizontal furrow lines.
  - `WATERED`: darker tilled base with blue sheen highlights.
  - `WATER`: layered blues with wave-like light highlights.
  - `STONE`: full gray stone tile with crack line details.
  - `SAND`: warm beige palette with tiny shell-like 1px dots.
  - `PATH`: lighter tan/brown worn texture with scuffed bands.
- Updated house tile in `genObjects` (frame 7):
  - brown walls on lower half,
  - red/brown triangular roof,
  - centered bottom door,
  - two light-blue windows,
  - roof chimney on right side.
- Updated `genTreeComposite`:
  - rounder canopy in top ~60%,
  - centered narrow trunk in bottom ~40%,
  - left-side canopy shadow,
  - slight green tonal variation.
- Updated `genFenceComposite`:
  - center vertical wooden post,
  - top and middle horizontal rails,
  - lighter wood highlights.

## Validation
- Ran: `npx tsc --noEmit`
- Result: pass (exit code 0)
