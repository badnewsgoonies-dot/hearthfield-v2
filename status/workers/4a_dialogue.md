# Worker 4A Report: NPC Dialogue Variety + Story Flags

## Files Modified
- `src/data/registry.ts`

## Changes Completed
- Expanded dialogue variety for all NPCs present in `NPCS`:
  - Elena
  - Marcus
  - Lily
  - Owen
  - Sage
- Kept all existing dialogue lines and added new lines per heart-level bracket.
- Ensured each NPC has significantly more random dialogue options and at least 6+ total entries.
- Added lines covering requested themes:
  - Seasonal references (e.g. spring planting)
  - Relationship progression hints (e.g. gift prompts)
  - Gameplay hints (e.g. mine danger past floor 20, tool upgrades, foraging/cooking tips)
  - Story flavor (e.g. beyond the mountains)

## NPC Presence Notes
- `Mayor`, `Carpenter`, and `Diego` are not present in the `NPCS` array in this file, so no edits were possible for them.
- `Sage` already has valid map placement data via `defaultMap: MapId.FOREST`.
- `NPCDef` does not define `schedule` or `location` fields in this codebase, so no schedule/location updates were applicable.

## Validation
- Command run: `npx tsc --noEmit`
- Result: Passed (exit code 0)
