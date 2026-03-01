# Worker 6A: Animal + Furniture Sprites

## Scope
- Modified `src/scenes/BootScene.ts`.

## Changes
1. Improved `genAnimals(T)` with distinct 16x16 sprites:
- Frame 0: Chicken (white oval body, red comb, orange beak, dark eye, yellow feet)
- Frame 1: Cow (brown/white spotted, longer body, horns, dark nose, thin legs)
- Frame 2: Sheep (fluffy white rounded body, dark face, thin legs)
- Frame 3: Pig (pink body, snout, curly tail, floppy ears)
- Frame 4: Goat (gray body, horns, thin legs, small beard)

2. Added new texture generator:
- New method: `private genInterior(T: number)`
- New texture key: `interior`
- Frame count: 8 frames (`T x T` each)
  - 0: Wooden floor
  - 1: Stone wall
  - 2: Bed
  - 3: Table
  - 4: Bookshelf
  - 5: Fireplace
  - 6: Hay/straw
  - 7: Door mat

3. Wired interior generation into `generateAllTextures()`:
- Added call: `this.genInterior(T);`

## Validation
- Ran: `npx tsc --noEmit`
- Result: Passed (exit code 0)
