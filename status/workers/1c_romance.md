# Worker 1C - Romance System Cleanup

## Files changed
- `src/systems/romance.ts`

## Completed tasks
1. Removed duplicate gift preference definitions:
- Deleted `GiftPreference` interface.
- Deleted `GIFT_PREFS` constant.

2. Switched gift preference checks to registry NPC data:
- Reused existing `NPCS` import from `../data/registry`.
- In `onGift(npcId, itemId)`, replaced `GIFT_PREFS[npcId]` lookup with:
  - `const npc = NPCS.find((n) => n.id === npcId)`
  - `npc.lovedItems`, `npc.likedItems`, `npc.hatedItems`

3. Kept the rest of RomanceSystem behavior unchanged per instruction:
- Constructor/state relationship handling unchanged.
- Existing return type/messages preserved.

## Validation
- Ran: `npx tsc --noEmit`
- Result: pass (exit code 0)
