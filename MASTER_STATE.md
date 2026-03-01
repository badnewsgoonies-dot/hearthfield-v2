# Hearthfield v2 — Master State Document
# Last updated: March 1, 2026
# PURPOSE: Preserve critical context across context losses

## Architecture
- TypeScript + Phaser 3.80.1 (CDN), esbuild bundler
- 7,120 LOC across 21 .ts files
- ALL textures procedurally generated in BootScene (no external assets)
- Single-file HTML output via esbuild → dist/game-inline.js + HTML wrapper
- GitHub: https://github.com/badnewsgoonies-dot/hearthfield-v2

## Build Commands
```bash
cd /home/claude/hearthfield-v2
npx tsc --noEmit                    # type check
npx esbuild src/game.ts --bundle --alias:phaser=./src/phaser-shim.ts --outfile=dist/game-inline.js --format=iife --target=es2020 --minify
# Then wrap in HTML with Phaser CDN script tag → /mnt/user-data/outputs/hearthfield-v2.html
```

## Scene Flow
Boot → Menu → Intro (typewriter story) → Play + UI (parallel) → [Shop/Mine/Fishing scenes launched from Play]

## Key Constants (types.ts)
- TILE_SIZE = 16 (native pixel size)
- SCALE = 3
- SCALED_TILE = 48 (TILE_SIZE × SCALE)
- FARM_WIDTH = 40, FARM_HEIGHT = 30
- DAY_LENGTH_MS = 720000 (12 real minutes)
- PLAYER_SPEED = 120

## CRITICAL BUG LIST (from screenshot analysis March 1)

### BUG 1: Player is a tiny arrow/triangle (HIGHEST PRIORITY)
- Root cause: BootScene generates 'player' as 16×16 4-frame spritesheet
- PlayScene line 85: `this.playerSprite.setScale(1)` — should be `setScale(SCALE)` i.e. 3
- BootScene has NO `anims.create()` calls — walk_down/walk_up/etc animations don't exist
- `this.playerSprite.play('idle_down')` silently fails → shows raw frame 0 at 16px
- FIX: Add animation creation in BootScene.create() AND fix scale in PlayScene

### BUG 2: 'house', 'tree', 'fence' textures don't exist
- PlayScene.createWorldObjects() references `'house'`, `'tree'`, `'fence'` textures
- Current BootScene only generates: player, terrain, crops, items, objects, npcs, portraits, ui_icons, tools, animals, monsters
- The OLD BootScene (pre-rewrite) had these composite textures but they were lost
- FIX: Add genHouse(), genTree(), genFence() methods to BootScene

### BUG 3: Inventory panel covers half the screen
- inventoryPanel.ts creates 6×6 grid with 44px slots = 264×264 + padding
- Panel opens at center but is too large relative to game view
- FIX: Reduce slot size or slot count, or scale panel

### BUG 4: Objects look like repetitive brown boxes
- Objects spritesheet frame 7 (house) is a tiny 16×16 tile drawn at 3× scale
- All objects render at same size regardless of what they represent
- FIX: House should use composite 'house' texture at larger scale; mine entrance should look like a cave

### BUG 5: Farm layout is confusing
- initNewGame creates tiles but the visual distinction between areas is weak
- Dirt/tilled/grass all look similar when scaled up
- Path layout not intuitive for navigation

## File Responsibilities

### src/scenes/BootScene.ts (271 LOC)
- Generates ALL textures procedurally
- Currently missing: animations, house/tree/fence composites

### src/scenes/PlayScene.ts (1150 LOC) — THE MAIN FILE
- Game state (player, calendar, farm tiles, relationships, etc.)
- Movement, tool use, interaction handling
- Event listeners for ALL game mechanics
- World object creation, NPC spawning
- Save/load to localStorage
- Tutorial system (inline, not using TutorialSystem class)

### src/scenes/UIScene.ts (570 LOC)
- HUD (gold, day, time, stamina)
- Hotbar (12 slots)
- Toast notifications
- Tutorial overlay
- Crafting panel
- Wires to PlayScene events

### src/scenes/IntroScene.ts (125 LOC)
- Typewriter text intro, 5 lines
- Fades to PlayScene

### src/scenes/MenuScene.ts (362 LOC)
- Animated starfield title screen
- New Game (name prompt), Continue, Controls

### src/systems/inventoryPanel.ts (198 LOC)
- 6×6 grid inventory overlay
- Click-to-swap mechanic

### src/systems/shopPanel.ts (358 LOC)
- Buy/sell tabs with scrolling
- Item list with prices

### src/systems/DialogueSystem.ts (364 LOC) / dialogueBox.ts (163 LOC)
- NPC dialogue with typewriter, portraits

### src/systems/fishing.ts (351 LOC)
- Cast line → bite timer → catch minigame (zone tracking)

### src/systems/mining.ts (381 LOC)
- Floor generation, rocks, monsters, ladder progression

### src/systems/shop.ts (510 LOC)
- ShopSystem class with buy/sell/inventory management

### src/data/registry.ts (225 LOC)
- 60+ ITEMS, 9 CROPS, 10 RECIPES, 6 FISH, 5 NPCs (only 5 detailed, 10 in designs)

### src/types.ts (461 LOC)
- All enums, interfaces, constants, events, helper functions

## Texture Atlas Layout (all generated in BootScene)
- 'player': 64×16 (4 frames of 16×16, one per direction: down/right/up/left)
- 'terrain': 256×16 (16 frames: grass/dirt/tilled/watered/water/stone/wood/sand/path/+7 spare)
- 'crops': 96×240 (6 cols × 15 rows, col=growth stage, row=crop type)
- 'items': 128×128 (8×8 grid of 16×16 icons, 64 items)
- 'objects': 128×16 (8 frames: ship_bin/craft/bed/kitchen/shop/mine/quest/house)
- 'npcs': 160×16 (10 frames of 16×16)
- 'portraits': 480×48 (10 frames of 48×48)
- 'tools': 96×16 (6 frames: hoe/water/axe/pick/rod/scythe)
- 'animals': 80×16 (5 frames)
- 'monsters': 48×16 (3 frames: slime/bat/golem)
- 'ui_icons': 256×16 (16 frames)
- MISSING: 'house' (composite ~80×64), 'tree' (composite ~16×32), 'fence' (16×16)

## Game Controls
- WASD/Arrows: Move
- SPACE: Use tool / plant seed / eat food (smart dispatch)
- E: Interact with objects/NPCs
- F: Use held item (eat/plant)
- I: Inventory
- ESC: Pause
- 1-0: Hotbar select
- Mouse wheel: Hotbar scroll

## Event System (types.ts Events object)
All inter-scene communication via Phaser event emitter:
TOOL_USE, ITEM_USE, INTERACT, INVENTORY_CHANGE, CROP_PLANTED, CROP_WATERED,
CROP_HARVESTED, SOIL_TILLED, GOLD_CHANGE, ITEM_SHIPPED, SHOP_BUY, SHOP_SELL,
DAY_START, DAY_END, SEASON_CHANGE, TIME_TICK, DIALOGUE_START, DIALOGUE_END,
GIFT_GIVEN, RELATIONSHIP_UP, CRAFT_ITEM, OPEN_CRAFTING, CLOSE_CRAFTING,
CAST_LINE, FISH_CAUGHT, FISH_ESCAPED, ENTER_MINE, FLOOR_CLEAR, MONSTER_KILLED,
BUILDING_UPGRADE, TOOL_UPGRADE, ANIMAL_PURCHASE, ANIMAL_PRODUCT, MAP_TRANSITION,
TOAST, ACHIEVEMENT, OPEN_INVENTORY, OPEN_PAUSE, SAVE_GAME, LOAD_GAME,
QUEST_ACCEPTED, QUEST_COMPLETED, QUEST_PROGRESS, STAT_INCREMENT

## Implemented Features (all working backend)
✅ Movement, collision bounds
✅ Farming: till → plant → water → grow → harvest (with seasons)
✅ Day/night cycle with tinting
✅ Season/year progression
✅ Inventory (36 slots, hotbar, drag-swap)
✅ Crafting (10 recipes, cooking vs crafting)
✅ Shop (buy seeds/tools, sell items)
✅ NPC interaction (dialogue, gifts, relationship hearts)
✅ Shipping bin (overnight revenue)
✅ Fishing minigame (timing-based catch bar)
✅ Mining (floor generation, rocks, monsters, ores)
✅ Save/load (localStorage)
✅ Tutorial (event-driven steps)
✅ Intro sequence (typewriter)
✅ Labels on all interactables
✅ Proximity prompts ("Press E — X")
✅ NPC name labels

## What Needs Fixing (Priority Order)
1. Player sprite: scale + animations
2. Composite textures (house/tree/fence) 
3. Inventory panel sizing
4. Visual coherence pass (map layout, object distinctiveness)
5. Mobile/touch controls (stretch goal)
