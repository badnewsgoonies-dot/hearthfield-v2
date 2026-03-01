# Worker 2A Completion Report: Map Wiring

## Files Modified
- `src/scenes/PlayScene.ts`

## Implemented
1. Added Sage spawn position in `npcPositions`:
- `sage: { x: 18, y: 22 }`

2. Added Blacksmith interactable placement:
- `this.createInteractable(10, 23, 'Owen\'s Forge', InteractionKind.BLACKSMITH);`

3. Added Carpenter interactable placement:
- `this.createInteractable(22, 23, 'Carpenter', InteractionKind.CARPENTER);`

4. Rewired `InteractionKind.BLACKSMITH` handler to start tool upgrades:
- Reads equipped slot (`activeSlot` fallback to `selectedSlot`)
- Resolves equipped tool from current inventory slot
- Checks next upgrade availability and gold requirement
- Deducts gold and emits `GOLD_CHANGE`
- Calls `upgradeSystem.startToolUpgrade(...)`
- Sets pending upgrade ready date based on upgrade days
- Shows success/error toasts

5. Rewired `InteractionKind.CARPENTER` handler to start house upgrades:
- Gets next house upgrade via `upgradeSystem.getNextHouseUpgrade(this.house.tier)`
- Checks gold requirement
- Deducts gold and emits `GOLD_CHANGE`
- Calls `upgradeSystem.startHouseUpgrade(...)`
- Sets pending house upgrade ready date
- Shows success/error toasts

6. Forageable rendering wired to map:
- Uses class property `foragingSprites: Phaser.GameObjects.Sprite[]`
- Renders forageables in `renderForageables()` from `foragingSystem.getState().items`
- Uses `gridToWorld(item.tileX, item.tileY)` and `items` spritesheet
- Uses item `spriteIndex` from `ITEMS` registry lookup
- Sets interaction data:
  - `{ kind: InteractionKind.FORAGEABLE, label: item.itemId, data: item, x, y }`
- Invoked after daily `foragingSystem.onDayStart(...)`

7. FORAGEABLE collection wiring verified/updated:
- Handler now collects using interaction coordinates (`data.x`, `data.y`)
- On collect: adds item to inventory, shows toast, re-renders forage sprites
- Re-render removes collected sprite from map and keeps foraging state synced

## Validation
- Ran: `npx tsc --noEmit`
- Result: success (exit code 0)
