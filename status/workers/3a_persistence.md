# Worker 3A - Persistence Fixes

## Files modified
- `src/scenes/PlayScene.ts`

## Fixes implemented

### FIX 1: Persist weather in save data
- Added to `saveGame()`:
  - `currentWeather: this.currentWeather`
- Added to `loadGame()`:
  - `if (data.currentWeather) this.currentWeather = data.currentWeather;`

### FIX 2: Persist tutorial state in save data
- Added to `saveGame()`:
  - `tutorialStep: this.tutorialStep`
  - `tutorialActive: this.tutorialActive`
- Added to `loadGame()`:
  - `if (data.tutorialStep !== undefined) this.tutorialStep = data.tutorialStep;`
  - `if (data.tutorialActive !== undefined) this.tutorialActive = data.tutorialActive;`

### FIX 3: Fix relationship initialization
- Updated NPC relationship initialization defaults in `initNewGame()`:
  - Replaced `relation: 0` with `relation: NPCRelation.STRANGER`
  - Kept full `RelationshipState`-compatible shape:
    - `hearts`, `maxHearts`, `talkedToday`, `giftedToday`, `giftsThisWeek`, `relation`

### FIX 4: Fix BUG-06 dual relationship state
- After romance system creation in `create()`, wired shared relationship object:
  - `this.romanceSystem.getState().relationships = this.relationships;`
- Note: Used `getState()` instead of direct `state` access because `state` is private in `RomanceSystem`.

## Type safety adjustments (in-scope)
- In `PlayScene.ts`, used a local intersection type for parsed/saved data to include optional fields:
  - `currentWeather?: WeatherType`
  - `tutorialStep?: number`
  - `tutorialActive?: boolean`

## Validation
Command run:
- `npx tsc --noEmit`

Result:
- **Failed** with 1 error:

```text
src/scenes/PlayScene.ts(755,76): error TS2367: This comparison appears to be unintentional because the types 'ItemCategory.SEED | ItemCategory.CROP | ItemCategory.FISH | ItemCategory.ORE | ItemCategory.GEM | ItemCategory.BAR | ... 8 more ... | ItemCategory.SPECIAL' and '"MACHINE"' have no overlap.
```

This remaining error appears unrelated to the persistence fixes above.
