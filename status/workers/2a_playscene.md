# Worker 2A - PlayScene Integration Fixes

## Scope
- Modified `src/scenes/PlayScene.ts` only for gameplay/integration fixes.

## Completed Fixes
1. Restored NPC daily relationship reset in `endDay()` (talked/gifted flags reset on authoritative `PlayScene.relationships`).
2. Updated Sage NPC spawn position in `spawnNPCs()` to `{ x: 8, y: 20 }`.
3. Added blacksmith interactable in world setup:
   - `this.createInteractable(15, 8, 'Blacksmith', InteractionKind.BLACKSMITH);`
4. Added carpenter interactable in world setup:
   - `this.createInteractable(22, 23, 'Carpenter', InteractionKind.CARPENTER);`
5. Replaced `InteractionKind.BLACKSMITH` handler to perform real tool upgrades:
   - Uses equipped/current tool, checks level and gold, deducts gold, increments `toolLevels`, emits toast and gold-change event.
   - Costs: 1->2 `2000g`, 2->3 `5000g`, 3->4 `10000g`, max level 4.
6. Replaced `InteractionKind.CARPENTER` handler to perform real house upgrades:
   - Checks house tier, affordability, deducts gold, increments `house.tier`, emits toast and gold-change/building-upgrade events.
   - Costs: 0->1 `10000g`, 1->2 `50000g`, max tier 2.
7. Implemented forageable rendering/integration:
   - Added render pass after systems initialization in `create()`.
   - Added `renderForageables()` helper that clears old forage sprites and recreates sprites from `foragingSystem.getItems()` on `objectLayer`.
   - For each forageable sprite, sets interaction data including:
     - `{ kind: InteractionKind.FORAGEABLE, data: item, x, y }`
   - Re-renders forageables in `endDay()` immediately after `foragingSystem.onDayStart()`.
   - Re-renders on forage collection so visuals stay in sync.

## Additional Implementation Note
- `createInteractable()` now accepts either frame number or label string to support the required blacksmith/carpenter call signatures while preserving existing interactable usage.

## Validation
- Ran: `npx tsc --noEmit`
- Result: PASS (exit code 0)
