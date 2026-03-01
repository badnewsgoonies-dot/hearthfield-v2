# Worker 3C Status — Machines, Chests, Festivals

## Completed
- Implemented machine placement via SPACE/tool flow in `src/scenes/PlayScene.ts` after existing tool logic:
  - Checks selected hotbar slot item category for machine.
  - Places machine via `machineSystem.placeMachine(...)` on facing tile coordinates.
  - Removes one item from selected inventory slot.
  - Shows toast: `Placed [machine name]!`.
  - Creates machine sprite on `objectLayer` and tags it with machine interaction metadata.
- Replaced `InteractionKind.CHEST` stub with requested simple store behavior:
  - Stores current held stack into chest message and clears slot.
  - Emits inventory change.
  - Emits empty chest guidance toast when no item is held.
- Added festival day-start announcement check after festival system day-start logic:
  - Optional `getTodaysFestival?.(...)` call.
  - Emits toast: `🎉 Today: [festival name]! Visit the town square.`

## Validation
- Ran: `npx tsc --noEmit`
- Result: pass (no TypeScript errors)
