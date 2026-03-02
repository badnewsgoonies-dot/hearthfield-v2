# Worker Festival Events Report

## Files Modified
- `src/systems/festivalEvents.ts`

## Completed Work
- Implemented and exported `FestivalResult`, `FestivalActivity`, and `FestivalEventHandler` exactly as requested.
- Added `getActivities(festival)` coverage for all 8 festivals in `festivalData.ts`.
- Added `calculateScore(festival, playerData)` with rules, tiers, and rewards for:
  - Egg Festival
  - Flower Dance
  - Luau
  - Moonlight Jellies
  - Harvest Fair
  - Spirit's Eve
  - Ice Festival
  - Winter day 25 festival (`feast_winter`, handled with Night Market scoring logic)
- Added `getFestivalDialogue(festivalId, npcId)` with festival-specific dialogue for all 7 NPCs (`elena`, `owen`, `lily`, `marcus`, `rose`, `sage`, `finn`) across all festivals, with 3 lines per NPC/festival.
- Included normalization so `night_market` resolves to `feast_winter` behavior/dialogue.

## Validation
Command run:
- `npx tsc --noEmit`

Result:
- Passed (no TypeScript errors).

## Notes
- No existing files were modified.
