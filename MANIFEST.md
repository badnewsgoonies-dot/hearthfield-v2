# Hearthfield V2 — Build Manifest

## Current Phase: Phase 2 (Spec Writing)

## Domain List
| Domain | Owner | Status |
|--------|-------|--------|
| foraging-render | worker-1 | pending |
| season-visuals | worker-2 | pending |
| achievement-ui | worker-3 | pending |
| festival-events | worker-4 | pending |
| machine-placement | worker-5 | pending |
| integration | orchestrator | pending |

## Key Constants
- Tile: 16px base, 3x scale = 48px overworld
- Canvas: 800x600
- Farm: 40x25 tiles
- Seasons: spring/summer/fall/winter
- Total items: 116 in registry

## Architecture
- Monolithic PlayScene (1986 LOC) owns game state
- Workers create NEW files only, never edit PlayScene
- Integration phase wires new systems into PlayScene

## Blockers
- None currently
