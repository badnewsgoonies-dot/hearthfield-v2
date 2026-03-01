# Worker 1B Save/Load Report

## System states now restored in `loadGame()`
- `questSystemState` -> `this.questSystem = new QuestSystem(this, data.questSystemState)`
- `romanceState` -> `this.romanceSystem = new RomanceSystem(this, data.romanceState)`
- `upgradeState` -> `this.upgradeSystem = new UpgradeSystem(this, data.upgradeState)`
- `machineState` -> `this.machineSystem = new MachineSystem(this, data.machineState)`
- `achievementState` (+ `achievements` merge) -> `this.achievementSystem = new AchievementSystem(this, achievementState)`
- `foragingState` -> `this.foragingSystem = new ForagingSystem(data.foragingState)`
- `festivalAttended` -> `this.festivalSystem = new FestivalSystem(this, data.festivalAttended)`

## Constructor signature compatibility notes
- `QuestSystem(scene, savedState?)`: compatible with direct saved-state pass.
- `RomanceSystem(scene, savedState?)`: compatible with direct saved-state pass.
- `UpgradeSystem(scene, savedState?)`: compatible with direct saved-state pass.
- `MachineSystem(scene, savedState?)`: compatible with direct saved-state pass.
- `AchievementSystem(scene, savedState?)`: compatible with state object pass; load logic now also handles legacy/current `data.achievements` array by merging/constructing `unlocked`.
- `ForagingSystem(savedState?)`: compatible with direct saved-state pass (no scene arg).
- `FestivalSystem(scene, attended?)`: compatible with attended-list pass.

## `tsc` result
- Command: `npx tsc --noEmit`
- Result: **failed** with 1 existing error outside this task scope:
  - `src/data/registry.ts(125,86): error TS2353: Object literal may only specify known properties, and 'buyPrice' does not exist in type 'ItemDef'.`
