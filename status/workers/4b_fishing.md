# Worker 4B - FishingScene Polish

## Scope
- Modified `src/scenes/FishingScene.ts` only.

## Completed Tasks
1. Catch feedback
- Added centered Phaser popup text on successful catch using `this.add.text(...)` with large gold styling.
- Message format: `Caught: <Fish Name> (Silver/Gold)!` (quality suffix omitted for Normal).
- Popup auto-fades/destroys after 2 seconds.

2. Fish escape feedback
- Added centered red popup text: `The fish got away...` on escape/failure.
- Popup auto-fades/destroys after 2 seconds.

3. Varied fish difficulty by rarity
- Added fish-specific rarity mapping in `FishingScene`:
  - Common: `sardine`/`trout` (and `bass` fallback id) -> slow bar speed
  - Uncommon: `salmon`/`catfish` -> medium bar speed
  - Rare: `tuna`/`legendary_fish` -> fast speed + erratic direction/speed changes during reeling
- Implemented erratic movement behavior for rare fish via timed random velocity changes.

4. Cast distance indicator
- Added brief centered popup when casting: `Cast: Near|Medium|Far`.
- Displayed immediately after cast with short fade.

## Validation
- Ran: `npx tsc --noEmit`
- Result: Passed (no TypeScript errors).
