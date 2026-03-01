# Worker 1A - BootScene Sprite Expansion

## Completed
- Verified highest `spriteIndex` in `src/data/registry.ts` is `108`.
- Updated `src/scenes/BootScene.ts` `genItems` spritesheet generation from `8x8` to `14x8` (`112` frames).
- Updated frame registration loop from `64` frames to all generated frames (`112`).
- Preserved tile size, procedural icon style, and base color generation logic.
- Added explicit color ranges for:
  - `70-76` animal products (warm browns/creams)
  - `90-104` forage items (greens/earth tones)
  - `105-108` special items (distinct colors)

## Validation
- Ran: `npx tsc --noEmit`
- Result: passed (exit code `0`)
