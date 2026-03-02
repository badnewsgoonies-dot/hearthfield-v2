# Worker: CityScene — Main City Gameplay Scene

## Scope
Create ONLY: src/scenes/CityScene.ts
Do NOT modify any existing files.

## Required reading (read ALL before coding)
- src/types.ts (all types including City* enums and interfaces at bottom)
- src/scenes/PlayScene.ts (REFERENCE ONLY — copy patterns for movement, day cycle, HUD, save/load, NPC interaction, but adapt for city)
- src/data/cityRegistry.ts (CITY_ITEMS, city NPCs)
- src/data/cityLayout.ts (CITY_LAYOUT — buildings, decorations, sidewalks, NPC spawns)
- src/systems/cityRenderer.ts (CityRenderer static draw methods)
- src/systems/officeJob.ts (OfficeJobSystem class)
- src/systems/cityEvents.ts (CityEventHandler)
- src/systems/particleEffects.ts (ParticleEffects)
- src/systems/hudClock.ts (HUDClock)

## Task
Create a complete, playable CityScene that mirrors PlayScene's structure but for city life. This is the main scene for the "City Life" game mode.

## Architecture (follow PlayScene patterns exactly):

### Class structure:
```typescript
export class CityScene extends Phaser.Scene {
  constructor() { super('CityScene'); }
  
  // Player state
  player: { x: number; y: number; gold: number; stamina: number; maxStamina: number; direction: Direction; name: string; }
  inventory: (InventorySlot | null)[]
  
  // Calendar (reuse same structure as PlayScene)
  calendar: { season: Season; day: number; year: number; timeOfDay: number; }
  
  // City-specific
  officeJob: OfficeJobSystem
  relationships: Record<string, { hearts: number; giftedToday: boolean; }>
  cityStats: { daysPlayed: number; goldEarned: number; mealsEaten: number; giftsGiven: number; venuesVisited: Set<string>; }
  apartment: ApartmentState
  
  // Rendering
  farmTiles: any[]  // reuse tile structure for city grid
  objectLayer: Phaser.GameObjects.Container
  hudTexts: Record<string, Phaser.GameObjects.Text>
}
```

### Constants (use from types.ts):
- TILE_SIZE = 16, SCALE = 3, SCALED_TILE = 48
- MAP_W = 40, MAP_H = 25 (city map size)
- DAY_LENGTH_MS = 720000 (same as farm)
- PLAYER_SPEED = 120

### create() method must:
1. Initialize player at apartment position from CITY_LAYOUT
2. Build city tile grid (40×25): default GRASS, apply CITY_LAYOUT.sidewalks as PATH, roads as STONE, parkTiles as GRASS
3. Render all tiles as colored rectangles (same as PlayScene pattern)
4. Call CityRenderer.drawBuilding() for each building in CITY_LAYOUT
5. Call CityRenderer decoration methods for each decoration
6. Spawn NPC sprites at CITY_LAYOUT.npcSpawns positions with name labels
7. Create interactables for each building (office=OFFICE_WORK, shops, cafe, bar, restaurant, bookstore, apartment=APARTMENT_DOOR)
8. Set up collision map (buildings are solid, roads/sidewalks walkable)
9. Create HUD: gold display, time display, day/season, job rank, stamina bar
10. Set up keyboard input (WASD/arrows move, E interact, I inventory, ESC pause)
11. Set up event listeners for all game events
12. Initialize OfficeJobSystem
13. Set up proximity prompt ("Press E — Work", "Press E — Enter", "Press E — Talk", etc.)
14. Initialize save/load from localStorage key 'hearthfield_city_save'

### update() method must:
1. Handle player movement with collision detection (same logic as PlayScene)
2. Advance time (timeOfDay += delta / DAY_LENGTH_MS)
3. Update HUD texts (time as "H:MM AM/PM", gold, day, season)
4. Check for day end (timeOfDay >= 1.0 → advance day, reset stamina, office newDay)
5. Apply day/night overlay tint (copy PlayScene's 6-phase color system)
6. Update proximity prompt for nearby interactions
7. Y-sort player sprite depth

### Interaction handlers (E key):
- OFFICE_WORK: call officeJob.doWork(), show toast with earnings, add gold
- APARTMENT_DOOR: launch InteriorScene with apartment layout (3 rooms: bedroom, kitchen, living)
- CAFE/RESTAURANT/BAR/BOOKSTORE: show toast "Visited {name}", mark venue visited, talk to NPC there
- NPC_TALK: show dialogue toast from city NPC data
- BUS_STOP: show toast "Coming soon: Travel to Hearthfield Farm!"
- SHOP_*: show toast "Browsing {shop}..." (placeholder for shop panel)

### Day/night cycle (copy from PlayScene):
- 6 phases: pre-dawn, dawn, day, golden hour, dusk, night
- Same color values and alpha curves
- Night overlay via fillRect

### NPC spawning:
- 7 NPCs from CITY_LAYOUT.npcSpawns
- Draw as colored circle (16px) with name label below
- Each has dialogue accessed via cityRegistry NPC data

### City events check (each new day):
- Call CityEventHandler.getTodaysEvent(season, day)
- If event: spawn festival zone in appropriate location, show event interaction

### Save/Load:
- Save key: 'hearthfield_city_save'
- Save: player state, calendar, inventory, officeJob.getState(), relationships, cityStats, apartment
- Load: restore all state, rebuild visuals
- Auto-save at end of each day

### HUD layout (top-left, same style as PlayScene):
- Gold: "💰 {gold}g" at (10, 10)
- Day: "Day {day}, {Season} Y{year}" at (10, 30)
- Time: "{H:MM} {AM/PM}" at (10, 50)
- Job: "{Rank}" at (10, 70)
- Stamina bar: use StaminaBar class if imported, else simple text

### Toasts:
- Reuse PlayScene toast pattern: text appears at top-center, floats up, fades over 2s
- Queue system: only show 1 toast at a time

## Target size: 800-1200 lines
## Export: `export class CityScene extends Phaser.Scene`

## Validation
npx tsc --noEmit must pass.

## When done
Write completion report to status/workers/city-scene.md with:
- Files created
- Line count
- All systems implemented
- tsc result
