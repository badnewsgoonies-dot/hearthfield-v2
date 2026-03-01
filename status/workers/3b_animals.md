# Worker 3B - Animal System Wiring

## Completed
- Added animal interactables in `createWorldObjects()`:
  - `this.createInteractable(28, 10, 'Coop', InteractionKind.ANIMAL);`
  - `this.createInteractable(32, 10, 'Barn', InteractionKind.ANIMAL);`
- Replaced `case InteractionKind.ANIMAL:` handler with functional logic to:
  - Buy a chicken when no animals exist (uses `animalSystem.purchaseAnimal('chicken', 'Hen', this.player.gold)` and deducts gold on success).
  - Feed, pet, and attempt product collection for all owned animals.
  - Add collected products to inventory with quality.
  - Emit toasts for purchase, collected products, or no-products-ready cases.

## Validation
- Ran: `npx tsc --noEmit`
- Result: **failed**, but due to pre-existing `PlayScene.ts` typing errors unrelated to this task:
  - `Property 'state' is private and only accessible within class 'RomanceSystem'.`
  - SaveData shape mismatches for `currentWeather`, `tutorialStep`, `tutorialActive`.
