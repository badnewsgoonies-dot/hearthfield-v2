# Worker 5B - Intro Scene Polish

## Scope
- Modified `src/scenes/IntroScene.ts` only for scene behavior updates.

## Completed
- Replaced intro copy with the requested narrative sequence:
  - "You've inherited your grandfather's old farm in the valley..."
  - "The fields are overgrown, but the soil is rich..."
  - "The townsfolk say the valley has magic for those who tend it..."
- Implemented centered story text styling:
  - Font size `20px`
  - Warm gold color `#ffdd88`
  - Dark background retained
- Added gentle per-panel fade behavior:
  - Fade in each panel
  - Panel remains visible about `3s`
  - Fade out before the next panel
- Added progression controls:
  - Any key advances to next panel
  - `ESC` skips intro immediately
  - Bottom helper text: "Press ESC to skip"
- Implemented final transition:
  - Last panel fades to black
  - Intro scene stops and starts `PlayScene`
  - Existing flow remains `Menu -> Intro -> Play`

## Validation
- Ran: `npx tsc --noEmit`
- Result: **PASS**
