# Wave 3: First Five Minutes — Player Experience Overhaul

## Context
You are working on Hearthfield, a 2D pixel-art farming sim built with TypeScript + Phaser 3.
The game has solid backend systems but the PLAYER EXPERIENCE is broken:
- No intro or story setup
- No tutorial — player has no idea what to do
- Farm map is random noise (3% rocks/wood scattered everywhere)
- Objects are tiny scaled squares — no visual coherence
- NPCs lined up in a row
- No paths, fences, zones, or landmarks
- House exists as a composite texture but ISN'T PLACED in the world

## Your Mission
Fix the first 5 minutes of gameplay so a new player can:
1. See a title → click New Game → get a brief story intro
2. Wake up on a farm that LOOKS like a farm
3. Be guided through their first morning (tutorial)
4. Understand what every object is and how to interact with it

## Execution Plan

### Step 1: Read the codebase
Read these files to understand the current state:
- `src/types.ts` (all types, constants, events)
- `src/scenes/PlayScene.ts` (main game — 887 lines)
- `src/scenes/UIScene.ts` (HUD and panels — 517 lines)
- `src/scenes/MenuScene.ts` (title screen — 362 lines)
- `src/scenes/BootScene.ts` (asset generation — 271 lines)
- `src/data/registry.ts` (items, crops, NPCs — 225 lines)

### Step 2: Create IntroScene (NEW FILE)
Create `src/scenes/IntroScene.ts`:
- Black screen fade in
- Story text displayed line by line with typewriter effect:
  - "Dear [Farmer],"
  - "Your grandfather has left you his farm in Hearthfield Valley."
  - "It's been years since anyone worked the land..."
  - "But with some care, it could flourish again."
  - "Spring 1, Year 1 — Your new life begins."
- Click or SPACE to advance each line
- After final line, fade to black, then start PlayScene
- Total: ~80-120 lines

### Step 3: Redesign Farm Layout in PlayScene.initNewGame()
Replace the random tile generation with a DESIGNED farm layout.
The 40x30 grid should have clear zones:

```
Row 0-2:   Trees along top edge (WOOD tiles)
Row 3-5:   Open grass, mine entrance at (35,4), path tiles leading to it
Row 6-9:   HOUSE ZONE — house composite at (18,6), bed/kitchen INSIDE house footprint
           Shipping bin right of house door (25,8), crafting bench left (16,9)
Row 10-14: FARM PLOTS — clear dirt/grass area, 4 pre-tilled 3x3 patches to show "this is farmable"
Row 15-18: PATH running left-right at y=16 with STONE tiles
           Shop sign on path (30,16), Quest board near it (28,16)
Row 19-22: TOWN AREA — NPCs placed at interesting spots, not in a line
Row 23-25: More grass, pond (water) at (8,23) to (12,26)
Row 26-28: Trees/fences along bottom, beach hint
Row 29:    Edge trees
```

Key changes to `initNewGame()`:
- Replace the random rock/wood scatter with intentional placement
- Add PATH tiles connecting house → farm → town → pond
- Pre-till a small 3x3 area near the house to show "farm here"
- Place fence tiles around the farm plot area

### Step 4: Place House and Landmarks in createWorldObjects()
The BootScene already generates a 'house' texture (80x64). USE IT:
- Add the house sprite at grid (18,6), scaled appropriately
- Add fence sprites around the farm plot area
- Add tree sprites along edges
- Add a visible path (lighter colored tiles) from house to farm to town

Update `createWorldObjects()` to:
```typescript
// Place house (80x64 composite, not from objects spritesheet)
const housePos = gridToWorld(20, 7);
const houseSpr = this.add.sprite(housePos.x, housePos.y - 32, 'house');
houseSpr.setScale(SCALE * 0.8);
houseSpr.setDepth(ySortDepth(housePos.y) - 1);
this.objectLayer.add(houseSpr);

// Place trees along edges
for (let tx = 0; tx < FARM_WIDTH; tx += 3) {
  if (Math.random() < 0.7) {
    const treePos = gridToWorld(tx, 1);
    const treeSpr = this.add.sprite(treePos.x, treePos.y, 'tree');
    treeSpr.setScale(SCALE);
    treeSpr.setDepth(ySortDepth(treePos.y));
    this.objectLayer.add(treeSpr);
  }
}
// Similar for bottom edge

// Place fences around farm area
for (let fx = 10; fx <= 28; fx++) {
  for (const fy of [9, 15]) {
    const fencePos = gridToWorld(fx, fy);
    const fenceSpr = this.add.sprite(fencePos.x, fencePos.y, 'fence');
    fenceSpr.setScale(SCALE);
    fenceSpr.setDepth(ySortDepth(fencePos.y));
    this.objectLayer.add(fenceSpr);
  }
}
```

### Step 5: Tutorial System
Add a tutorial state machine to PlayScene. Add these properties:
```typescript
private tutorialStep: number = 0;
private tutorialActive: boolean = true;
private tutorialText?: Phaser.GameObjects.Text;
private tutorialArrow?: Phaser.GameObjects.Text;
```

Tutorial steps triggered by game events:
1. **Step 0 (on create)**: Show "Welcome to your farm! Use WASD to walk around." + arrow pointing to farm area
2. **Step 1 (after player moves 200px)**: "Press 1-0 to select tools. Your Hoe is selected — face the dark soil and press SPACE to till it."
3. **Step 2 (after SOIL_TILLED event)**: "Great! Now select your Parsnip Seeds (slot 2) and press SPACE to plant."
4. **Step 3 (after CROP_PLANTED event)**: "Now switch to your Watering Can and press SPACE to water."
5. **Step 4 (after CROP_WATERED event)**: "Perfect! Your crop will grow overnight. Walk to the shipping bin (the brown box →) and press E to interact."
6. **Step 5 (after INTERACT with SHIPPING_BIN)**: "You can ship items here for gold. Walk to your bed and press E to sleep."
7. **Step 6 (after INTERACT with BED)**: "Tutorial complete! Explore the farm, talk to villagers, and make Hearthfield flourish!"
8. **Step 7**: `this.tutorialActive = false;` — hide tutorial UI

Implementation:
- Add a `private updateTutorial()` method called from `create()` after event setup
- Listen for relevant events to advance steps
- Display tutorial text as a semi-transparent box at top of screen
- Use an animated arrow (▼ bouncing) pointing toward the target
- Tutorial box: dark background, white text, positioned at top-center of screen
- This should be in the UI scene (not play scene) so it overlays correctly

Add tutorial event forwarding: PlayScene emits a custom 'TUTORIAL_ADVANCE' event, UIScene listens and updates the display.

### Step 6: Register IntroScene in game.ts
Update `src/game.ts` to:
1. Import IntroScene
2. Add it to the scene list
3. MenuScene's "New Game" should go to IntroScene instead of PlayScene

### Step 7: Better NPC Placement
In `spawnNPCs()`, replace the line formation with logical positions:
```typescript
const npcPositions: Record<string, {x: number, y: number}> = {
  'hazel': {x: 30, y: 17},    // near shop
  'elder_oak': {x: 28, y: 17}, // near quest board
  'river': {x: 10, y: 24},    // near pond
  'ember': {x: 16, y: 20},    // town area
  'luna': {x: 22, y: 20},     // town area
  'felix': {x: 35, y: 5},     // near mine
  'marina': {x: 12, y: 20},   // town area
  'jasper': {x: 26, y: 20},   // town area
  'rose': {x: 20, y: 22},     // town area
  'sage': {x: 8, y: 20},      // near pond path
};
```

### Step 8: Improve Visual Labels
Add floating text labels above key objects so players know what they are:
```typescript
private addLabel(x: number, y: number, text: string) {
  const pos = gridToWorld(x, y);
  const label = this.add.text(pos.x, pos.y - SCALED_TILE * 0.8, text, {
    fontSize: '10px', color: '#ffffff', fontFamily: 'monospace',
    backgroundColor: '#00000088', padding: { x: 3, y: 2 }
  }).setOrigin(0.5).setDepth(1000);
  this.objectLayer.add(label);
}
```
Call for: "Shipping Bin", "Crafting Bench", "Bed", "Kitchen", "Shop", "Mine", "Quest Board"

### Step 9: Build and verify
```bash
npx esbuild src/game.ts --bundle --outfile=public/game.js --platform=browser --format=iife --global-name=HearthfieldGame --alias:phaser=./src/phaser-shim.ts
```
Must compile with ZERO errors.

## SCOPE RULES
- You may CREATE new files: `src/scenes/IntroScene.ts`
- You may MODIFY: `src/scenes/PlayScene.ts`, `src/scenes/UIScene.ts`, `src/scenes/MenuScene.ts`, `src/game.ts`
- You may NOT delete or rewrite `src/types.ts`, `src/data/registry.ts`, or any file in `src/systems/`
- You may NOT change the type contract or event names
- You may NOT add new npm dependencies
- All farm layout changes go in `initNewGame()` — do NOT change `createFarmMap()` rendering logic
- Test build must pass: `npx esbuild src/game.ts --bundle --outfile=public/game.js --platform=browser --format=iife --global-name=HearthfieldGame --alias:phaser=./src/phaser-shim.ts`

## CRITICAL: Commit when done
```bash
git add -A && git commit -m "Wave 3: First 5 minutes — intro, tutorial, farm layout, labels"
```
