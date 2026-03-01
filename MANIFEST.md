# Hearthfield V2 — Build Manifest

## Current Phase: Phase 6 Complete (Integration)

## Domain List
| Domain | Owner | Status | LOC |
|--------|-------|--------|-----|
| season-renderer | worker-1 | ✅ integrated | 79 |
| forage-renderer | worker-2 | ✅ integrated | 163 |
| achievement-panel | worker-3 | ✅ integrated | 166 |
| npc-schedules | worker-4 | ✅ integrated | 127 |

## Validation
- tsc: 0 errors
- Scope violations: 0/4 workers
- Total: 42 files, 13,301 LOC

## Key Constants
- Tile: 16px base, 3x scale = 48px overworld
- Canvas: 800x600
- Farm: 40x25 tiles
- Interior tile scaling: dynamic (capped at 75px)
- NPC schedule hours: timeOfDay * 24 (0-1 fraction)

## What Works
- Core farm loop (till/plant/water/harvest/ship)
- Shop, crafting, cooking, fishing, mining
- 7 NPCs with schedules (move by time of day)
- Procedural forage rendering (seasonal items)
- Achievement panel (T key)
- Seasonal tree tinting + ambient overlay
- Interiors (house/coop/barn) with pixel-art furniture
- Animals (purchase, feed, collect products)
- Quests, romance, upgrades, machines
- Save/load, weather, day/night cycle
- Tutorial, intro narrative, dialogue system

## Remaining Issues
- BUG-15: 10 orphan events (cosmetic)
- BUG-19: Quest wildcards (cosmetic)
