# Hearthfield v2 — Expansion Orchestrator

You are the orchestrator for expanding Hearthfield, a 2D farming sim built with TypeScript + Phaser 3.

The project is at `/home/claude/hearthfield-v2/`

## YOUR STEPS:

### Step 1: Read the type contract and registry
Run:
```bash
cat /home/claude/hearthfield-v2/src/types.ts
cat /home/claude/hearthfield-v2/src/data/registry.ts
```

### Step 2: Dispatch 4 workers in parallel

Run this exact bash script:

```bash
cd /home/claude/hearthfield-v2
export OPENAI_API_KEY="$OPENAI_API_KEY"

# Worker 1: Shop Scene
codex exec --dangerously-bypass-approvals-and-sandbox --skip-git-repo-check -C /home/claude/hearthfield-v2 \
  "You are building src/scenes/ShopScene.ts for Hearthfield, a Phaser 3 farming sim.

READ these files first:
- src/types.ts (the type contract - ALL types, events, constants)
- src/data/registry.ts (item/crop definitions)
- src/scenes/UIScene.ts (for UI patterns to follow)

CREATE src/scenes/ShopScene.ts that:

1. Extends Phaser.Scene with key 'ShopScene'
2. Takes init data: { playScene: PlayScene, shopType: 'seeds' | 'tools' | 'general' }
3. Shows a shop overlay (dark semi-transparent background, centered panel)
4. Lists items for sale based on shopType:
   - seeds: All seed items from ITEMS registry, price = item.sellPrice * 2
   - tools: Tool upgrades, price = 2000 * level
   - general: Mixed useful items
5. Each item row shows: icon (sprite from items sheet), name, price, [Buy] button
6. Buy button checks player gold, deducts gold, adds item to inventory
7. Uses playScene.events.emit for: Events.GOLD_CHANGE, Events.INVENTORY_CHANGE, Events.TOAST
8. Has a close button (X) and ESC key to close
9. Pauses the day timer when open
10. Exports the class

Import from '../types' and '../data/registry'. Use Phaser text objects and rectangles for UI (matching UIScene patterns). The scene runs as an overlay launched from PlayScene." &

# Worker 2: Fishing Minigame
codex exec --dangerously-bypass-approvals-and-sandbox --skip-git-repo-check -C /home/claude/hearthfield-v2 \
  "You are building src/scenes/FishingScene.ts for Hearthfield, a Phaser 3 farming sim.

READ these files first:
- src/types.ts (the type contract)
- src/data/registry.ts (fish definitions with difficulty)

CREATE src/scenes/FishingScene.ts that:

1. Extends Phaser.Scene with key 'FishingScene'
2. Takes init data: { playScene: PlayScene, mapId: MapId, timeOfDay: TimeOfDay, season: Season }
3. Implements a timing-based fishing minigame:
   - Phase 1 'casting': Show a bobber animation, wait 1-4 seconds randomly
   - Phase 2 'bite': Show exclamation mark, player must press SPACE within 0.8 seconds
   - Phase 3 'reeling': A progress bar where a 'fish zone' bounces up and down. Player holds SPACE to move a cursor up, releases to let it fall. Keep cursor in the fish zone for 3 seconds to catch.
   - The fish zone size and speed depends on fish difficulty (easy=large+slow, hard=small+fast)
4. On success: picks a random eligible fish based on mapId, timeOfDay, season from the FISH registry. Emits Events.FISH_CAUGHT with { fishId, quality }. Quality based on how well player performed.
5. On failure: Emits Events.FISH_ESCAPED. Shows 'The fish got away...' toast.
6. Uses Events.TOAST for feedback messages
7. After catch/escape, auto-closes and returns to PlayScene
8. Uses Phaser rectangles and graphics for the minigame UI (progress bar, cursor, fish zone)
9. Exports the class

Import from '../types' and '../data/registry'." &

# Worker 3: Mine Scene
codex exec --dangerously-bypass-approvals-and-sandbox --skip-git-repo-check -C /home/claude/hearthfield-v2 \
  "You are building src/scenes/MineScene.ts for Hearthfield, a Phaser 3 farming sim.

READ these files first:
- src/types.ts (the type contract - has MineState, Events, etc)
- src/data/registry.ts (item definitions)

CREATE src/scenes/MineScene.ts that:

1. Extends Phaser.Scene with key 'MineScene'
2. Takes init data: { playScene: PlayScene, floor: number }
3. Generates a procedural mine floor:
   - 15x11 grid of tiles
   - Randomly places: rocks (breakable for ore/gems), ladders (to next floor), monsters (slimes, bats)
   - Higher floors = more monsters, better ore
4. Player movement: Arrow keys / WASD, grid-based movement
5. Combat: When player moves into a monster tile:
   - Simple turn-based: player attacks (damage based on pickaxe level), monster attacks back
   - Player health shown as hearts at top
   - Monster health shown as bar above monster
   - On kill: drop random ore/gem, emit Events.MONSTER_KILLED
6. Rock breaking: Move into rock tile to break it (costs stamina)
   - Drops: stone, copper_ore, iron_ore, gold_ore based on floor depth
7. Ladder: Move onto ladder to go to next floor
   - Every 5 floors: elevator checkpoint (emit Events.TOAST)
8. HUD: Floor number, health bar, mini inventory of found items
9. ESC or reaching floor exit returns to PlayScene
10. Uses playScene to read/write: mine state, player stamina, inventory
11. Exports the class

Import from '../types' and '../data/registry'. Use colored rectangles for tiles (dark grays for walls, browns for rocks, etc). Keep it simple but playable." &

# Worker 4: Dialogue System
codex exec --dangerously-bypass-approvals-and-sandbox --skip-git-repo-check -C /home/claude/hearthfield-v2 \
  "You are building src/systems/DialogueSystem.ts for Hearthfield, a Phaser 3 farming sim.

READ these files first:
- src/types.ts (the type contract - has NPCDef, Events, RelationshipState)
- src/data/registry.ts (NPC definitions with dialogue pools)

CREATE src/systems/DialogueSystem.ts that:

1. Exports a class DialogueSystem (not a Scene - a helper class used by UIScene)
2. Constructor takes: scene: Phaser.Scene (the UIScene instance)
3. Methods:
   a. showDialogue(npcId: string, npcDef: NPCDef, hearts: number): void
      - Creates a dialogue box at bottom of screen (like RPG games)
      - Shows NPC portrait (from portraits spritesheet, frame = npcDef.portraitIndex)
      - Shows NPC name in colored text
      - Shows dialogue text with typewriter effect (characters appear one by one)
      - Picks dialogue from npcDef.dialoguePool based on heart bracket (hearts/200, max 4)
      - SPACE or click advances/skips typewriter, then closes dialogue
   b. showGiftReaction(npcName: string, reaction: 'love' | 'like' | 'neutral' | 'hate'): void
      - Shows a brief reaction popup with appropriate emoji and color
      - love: heart emoji, pink text
      - like: smile, green text
      - neutral: '...', gray text
      - hate: angry, red text
   c. showChoice(prompt: string, choices: string[]): Promise<number>
      - Shows a choice dialog with numbered options
      - Returns the index of the chosen option
      - Used for quest acceptance, shop browsing, etc
   d. destroy(): void - cleans up all created game objects
4. All UI elements use Phaser text, rectangles, and sprites
5. Typewriter effect: adds one character per 30ms, skippable
6. Dialogue box: dark semi-transparent rectangle at y=400, full width, 150px tall
7. Portrait: 48x48 scaled to 96x96, left side of dialogue box

Import from '../types' and '../data/registry'. Export the class as default and named." &

wait
echo "ALL WORKERS DONE"
```

### Step 3: Verify all files exist and compile
```bash
cd /home/claude/hearthfield-v2
ls -la src/scenes/ShopScene.ts src/scenes/FishingScene.ts src/scenes/MineScene.ts src/systems/DialogueSystem.ts
npx esbuild src/scenes/ShopScene.ts src/scenes/FishingScene.ts src/scenes/MineScene.ts src/systems/DialogueSystem.ts --bundle --outdir=/tmp/verify --format=esm --platform=browser --external:phaser 2>&1
echo "BUILD CHECK DONE"
```

### Step 4: Report
Tell me which workers succeeded, which failed, and paste any build errors.
