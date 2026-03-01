You are the orchestrator for building new systems in Hearthfield, a 2D farming RPG built with TypeScript + Phaser 3.
The project lives at /home/claude/hearthfield-v2/

## CONTEXT
The game already has:
- types.ts: Full type contract with all interfaces, enums, events, helpers
- game.ts: Phaser boot config
- BootScene.ts: Placeholder texture generation
- MenuScene.ts: STUB (just jumps to PlayScene)
- PlayScene.ts (825 LOC): Player movement, farming (till/water/plant/harvest), tool use, NPC interaction, day/night cycle, inventory management, save/load, event system
- UIScene.ts (268 LOC): HUD (gold, stamina, day, time), hotbar, crafting panel, toasts, dialogue box
- registry.ts (225 LOC): 85 items (seeds, crops, fish, ores, food, tools, craftables, gifts)

## YOUR TASK

### Step 1: Read existing code
Run these commands:
```bash
cat /home/claude/hearthfield-v2/src/types.ts
cat /home/claude/hearthfield-v2/src/data/registry.ts
cat /home/claude/hearthfield-v2/src/scenes/PlayScene.ts
cat /home/claude/hearthfield-v2/src/scenes/UIScene.ts
cat /home/claude/hearthfield-v2/src/scenes/MenuScene.ts
```

### Step 2: Dispatch 4 workers in parallel

Run this bash script:

```bash
cd /home/claude/hearthfield-v2
export OPENAI_API_KEY="$OPENAI_API_KEY"

########################################
# WORKER 1: MenuScene
########################################
codex exec --dangerously-bypass-approvals-and-sandbox --skip-git-repo-check -C /home/claude/hearthfield-v2 \
"You are building the MenuScene for Hearthfield, a Phaser 3 TypeScript farming game.

First read the type contract and existing menu stub:
cat src/types.ts
cat src/scenes/MenuScene.ts

COMPLETELY REWRITE src/scenes/MenuScene.ts with a full title screen scene:

1. A pixel-art style title created with Phaser graphics/text (no external assets needed):
   - Game title 'HEARTHFIELD' in large pixel font using this.add.text with fontFamily monospace
   - Subtitle 'A farming adventure' below
   - Animated floating particles or stars in background using Phaser graphics
   - Gentle color cycling on the title text

2. Menu options as clickable text buttons (hover highlight):
   - 'New Game' -> prompts for player name using a simple text input (DOM element or Phaser text entry), then starts PlayScene
   - 'Continue' -> only visible if localStorage has a save, loads it and starts PlayScene with { loadSave: true }
   - 'Controls' -> shows a help overlay listing keyboard controls (WASD/arrows move, E interact, 1-9 hotbar, Space tool, Tab inventory, Esc pause, F fish)

3. Import from '../types' for Scenes, SAVE_KEY. Start PlayScene via this.scene.start(Scenes.PLAY, ...).

Write the complete file. Use only Phaser APIs and basic DOM for name input. No external dependencies." &

########################################
# WORKER 2: Fishing System
########################################
codex exec --dangerously-bypass-approvals-and-sandbox --skip-git-repo-check -C /home/claude/hearthfield-v2 \
"You are building the fishing minigame for Hearthfield, a Phaser 3 TypeScript farming game.

First read:
cat src/types.ts
cat src/data/registry.ts

CREATE a new file src/systems/fishing.ts with an exported class FishingMinigame:

1. Constructor takes a Phaser.Scene reference.

2. startFishing(playerX: number, playerY: number, season: Season, timeOfDay: TimeOfDay, mapId: MapId):
   - Determines which fish are available based on season, timeOfDay, mapId using the FISH array from registry
   - Shows a casting animation (a simple line extending from player using Phaser graphics)
   - After 1-3 second random wait, triggers the catch minigame

3. The catch minigame:
   - A vertical bar (200px tall) drawn with Phaser graphics
   - A green 'catch zone' (40-80px based on fish difficulty) that the player moves up/down by pressing Space
   - A fish icon that bounces randomly within the bar
   - A progress bar that fills when fish is in catch zone, drains when not
   - When progress reaches 100%: emit Events.FISH_CAUGHT with fishId and random quality
   - When progress reaches 0%: emit Events.FISH_ESCAPED
   - The whole minigame UI is a Phaser Container that gets destroyed on completion

4. Helper method getAvailableFish(season, timeOfDay, mapId) -> FishDef[]

Import Season, TimeOfDay, MapId, Quality, Events, FishDef, Difficulty from '../types' and FISH from '../data/registry'.
Use only Phaser APIs. Write the complete file." &

########################################
# WORKER 3: Mining System
########################################
codex exec --dangerously-bypass-approvals-and-sandbox --skip-git-repo-check -C /home/claude/hearthfield-v2 \
"You are building the mining system for Hearthfield, a Phaser 3 TypeScript farming game.

First read:
cat src/types.ts

CREATE a new file src/systems/mining.ts with an exported class MiningSystem:

1. Constructor takes a Phaser.Scene reference.

2. Interface MineFloorData:
   - floor: number
   - tiles: number[][] (2D grid, 20x15)
   - rocks: { x: number; y: number; oreId: string; hp: number; sprite?: Phaser.GameObjects.Sprite }[]
   - monsters: { x: number; y: number; type: string; hp: number; maxHp: number; damage: number; speed: number; sprite?: Phaser.GameObjects.Sprite }[]
   - ladderX: number, ladderY: number
   - hasElevator: boolean (every 5 floors)

3. generateFloor(floor: number) -> MineFloorData:
   - Procedural generation using seeded random (floor number as seed)
   - Place 8-15 rocks with ores (copper floors 1-39, iron 40-79, gold 80+, gems random)
   - Place 2-5 monsters (slimes floors 1-39, bats 40-79, golems 80+)
   - Monster stats scale with floor number
   - Place ladder at random position (not blocked)
   - Every 5th floor has an elevator

4. renderFloor(floorData: MineFloorData, container: Phaser.GameObjects.Container):
   - Draw floor tiles as dark rectangles with Phaser graphics
   - Place rock sprites and monster sprites
   - Place ladder sprite
   - Returns the container

5. hitRock(rock, toolLevel: number) -> { destroyed: boolean; drops: { itemId: string; qty: number }[] }:
   - Reduces rock HP based on tool level
   - When destroyed, returns ore/gem drops

6. updateMonsters(delta: number, playerX: number, playerY: number):
   - Simple chase AI: monsters move toward player
   - Returns collision data if monster touches player

7. attackMonster(monster, damage: number) -> { killed: boolean }

Import TILE_SIZE, SCALE, Events from '../types'. Use Phaser APIs only. Write the complete file." &

########################################
# WORKER 4: Shop System
########################################
codex exec --dangerously-bypass-approvals-and-sandbox --skip-git-repo-check -C /home/claude/hearthfield-v2 \
"You are building the shop system for Hearthfield, a Phaser 3 TypeScript farming game.

First read:
cat src/types.ts
cat src/data/registry.ts
cat src/scenes/UIScene.ts

CREATE a new file src/systems/shop.ts with an exported class ShopSystem:

1. Constructor takes a Phaser.Scene reference.

2. Interface ShopItem: { itemDef: ItemDef; buyPrice: number; stock: number }

3. getShopInventory(season: Season): ShopItem[]:
   - Returns seasonal seeds (buyPrice = sellPrice * 2) + always-available tools and food
   - Filter seeds by which ones grow in the current season

4. openShop(season: Season, playerGold: number, playerInventory: (InventorySlot | null)[]):
   - Creates a shop UI as a Phaser Container (centered, 500x400px)
   - Dark semi-transparent background panel
   - Title 'General Store' at top
   - Left panel: shop items list with name, price, and Buy button
   - Right panel: player items with Sell button (sell price = item sellPrice * quality multiplier)
   - Gold display at bottom
   - Close button (X) top right
   - Buy button: emits Events.SHOP_BUY with { itemId, qty: 1, cost }
   - Sell button: emits Events.SHOP_SELL with { itemId, qty: 1, revenue }
   - Updates display after each transaction
   - Scrollable lists using Phaser mask + drag or up/down buttons

5. closeShop(): destroys the container

6. refreshDisplay(gold: number, inventory: (InventorySlot | null)[]): updates after buy/sell

Import from '../types' and '../data/registry'. Use only Phaser APIs. Write the complete file." &

wait
echo "=== ALL 4 WORKERS DONE ==="
```

### Step 3: Verify files exist and compile
```bash
cd /home/claude/hearthfield-v2
echo "=== Files created ==="
ls -la src/scenes/MenuScene.ts src/systems/fishing.ts src/systems/mining.ts src/systems/shop.ts
echo ""
echo "=== Compile check ==="
npx tsc --noEmit 2>&1 | head -30
```

### Step 4: Wire the new systems into PlayScene
After all workers finish, create a small integration patch. Edit PlayScene.ts to:

1. Add imports at the top:
```typescript
import { FishingMinigame } from '../systems/fishing';
import { MiningSystem } from '../systems/mining';
import { ShopSystem } from '../systems/shop';
```

2. Add properties to the PlayScene class:
```typescript
fishingMinigame!: FishingMinigame;
miningSystem!: MiningSystem;
shopSystem!: ShopSystem;
```

3. In the create() method, after existing setup, add:
```typescript
this.fishingMinigame = new FishingMinigame(this);
this.miningSystem = new MiningSystem(this);
this.shopSystem = new ShopSystem(this);
```

4. In setupEventListeners(), add handlers for:
- Events.FISH_CAUGHT: add fish to inventory, increment stats.fishCaught
- Events.SHOP_BUY: deduct gold, add item to inventory
- Events.SHOP_SELL: add gold, remove item from inventory

Use sed or direct file writes to make these minimal edits. Do NOT rewrite the whole file.

### Step 5: Rebuild and test
```bash
cd /home/claude/hearthfield-v2
npx esbuild src/game.ts --bundle --outfile=public/game.js --format=esm --platform=browser --sourcemap --target=es2020 2>&1
echo "BUILD STATUS: $?"
```

### Step 6: Report
List which workers succeeded/failed, total LOC added, any compile errors, and what the build output was.
