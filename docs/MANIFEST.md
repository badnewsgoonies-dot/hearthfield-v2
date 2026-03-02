# Hearthfield V2 — MANIFEST

## Current Phase
Wave 3 — Polish & Feel (sound, ambience, minimap)

## Domain List
| Domain | Owner | Status |
|--------|-------|--------|
| sound-manager | worker-3a | dispatching |
| ambient-renderer | worker-3b | dispatching |
| minimap-renderer | worker-3c | dispatching |

## Architecture
- TypeScript / Phaser 3.80.1 browser game
- 40×30 tile map, TILE_SIZE=16, SCALE=3 (SCALED_TILE=48)
- BootScene generates all textures procedurally (no external assets)
- PlayScene is the main game scene (~2096 LOC)
- InteriorScene for buildings, MineScene for mining, FishingScene, ShopScene

## Key Constants
- FARM_WIDTH=40, FARM_HEIGHT=30, TILE_SIZE=16, SCALE=3
- 9 crops, 6 fish, 116 items, 16 recipes, 7 NPCs
- Calendar: 28 days/season, 4 seasons, timeOfDay 0-1 float

## State: 42 files, 13,871 LOC, 0 tsc errors
