# Worker: CityPlayScene

## Scope
Create ONLY: src/scenes/CityPlayScene.ts
Do NOT modify any existing files.

## Required reading (READ ALL BEFORE CODING)
- src/types.ts (all types, Scenes, constants, CityInteractionKind, CityVenue, JobState, etc.)
- src/scenes/PlayScene.ts (REFERENCE — mirror this structure for city. Copy patterns for: movement, interaction, day/night, HUD events, save/load)
- src/data/cityLayout.ts (CITY_LAYOUT — building positions, decorations, NPC spawns)
- src/data/cityRegistry.ts (CITY_ITEMS, CITY_NPCS)
- src/systems/cityRenderer.ts (CityRenderer — static draw methods)
- src/systems/officeJob.ts (OfficeJobSystem or similar)
- src/systems/cityEvents.ts (CityEventHandler)

## Task
Create a complete CityPlayScene that is the city equivalent of PlayScene. The player walks around a city map, interacts with buildings, works at an office, socializes, and manages apartment life.

## Structure — mirror PlayScene patterns:

### Properties (same pattern as PlayScene):
- player: { x, y, direction, gold, stamina, maxStamina, name, inventory }
- calendar: { day, season, year, timeOfDay }
- relationships: Record<string, { hearts, giftedToday }>
- jobState: JobState (from types.ts)
- cityTiles: array of tile data (grid positions + types)
- interactables: array of interaction objects
- sprites/graphics containers

### init(data):
- Accept { loadSave?: boolean, playerName?: string }
- If loadSave, load from CITY_SAVE_KEY
- Else initialize fresh city game state

### create():
1. Build city tile map (40x25 grid) — roads (STONE), sidewalks (PATH), park (GRASS), buildings (mark as solid)
2. Create player sprite at apartment entrance (18, 20) with WASD movement
3. Call CityRenderer.drawBuilding() for each building in CITY_LAYOUT
4. Place decorations from CITY_LAYOUT (street lamps, benches, etc.)
5. Spawn city NPCs at their CITY_LAYOUT positions
6. Set up camera following player
7. Build collision map (buildings are solid, roads/sidewalks walkable)
8. Set up event listeners (same Events enum: GOLD_CHANGE, TOAST, DAY_START, etc.)
9. Create proximity prompt text (hidden until near interactable)
10. Launch CITY_UI scene parallel (or reuse UI scene)

### update(time, delta):
- handleMovement(delta) — WASD, arrow keys, same speed as farm
- handleInteraction() — E key to interact with nearest interactable
- updateDayNight() — same day/night cycle visual overlay
- updateClock() — advance timeOfDay

### Interaction handlers:
- OFFICE_WORK: If 9AM-5PM, call officeJob.doWork(), show salary toast, emit GOLD_CHANGE
- APARTMENT_DOOR: transition to InteriorScene with apartment layout
- CAFE/BAR/RESTAURANT/BOOKSTORE: show shop-like interaction, buy food/drinks with gold
- NPC_TALK: show dialogue, gift giving (same as farm)
- PARK_BENCH: restore stamina (+10), show relaxation toast
- BUS_STOP: show "Coming soon — travel to farm!" toast

### Day cycle:
- Same timing as farm (DAY_LENGTH_MS)
- At midnight: auto-return to apartment, sleep, advance day
- On new day: reset workedToday, refresh NPCs, check for city events

### Save/Load:
- Save to CITY_SAVE_KEY (separate from farm save)
- Save: player state, calendar, relationships, jobState, inventory, apartment upgrades

### Key constants:
- CITY_WIDTH = 40, CITY_HEIGHT = 25 (same grid as farm)
- Use TILE_SIZE, SCALE, SCALED_TILE from types.ts
- Player starts with 500 gold, stamina 100

## IMPORTANT:
- Import gridToWorld, ySortDepth, facingTile, clamp from types.ts
- Import CityRenderer from systems/cityRenderer
- Import CITY_LAYOUT from data/cityLayout
- Import CITY_ITEMS, CITY_NPCS from data/cityRegistry
- Use Events enum for all event emission (same as PlayScene)
- Target: 600-1000 lines. This is a complete playable scene.

## Validation
npx tsc --noEmit must pass.

## When done
Write completion report to status/workers/city-scene.md
