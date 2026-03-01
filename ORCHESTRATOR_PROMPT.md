# Hearthfield v2 — UI Panel Orchestrator

You are an orchestrator. You will read the existing codebase, dispatch 4 parallel Codex workers, then verify the build.

## STEP 1: Read the codebase

Read these files to understand the architecture:
- /home/claude/hearthfield-v2/src/types.ts (type contract — ALL types, events, constants)
- /home/claude/hearthfield-v2/src/data/registry.ts (item/crop/recipe/NPC definitions)
- /home/claude/hearthfield-v2/src/scenes/PlayScene.ts (main game scene — has all state)
- /home/claude/hearthfield-v2/src/scenes/UIScene.ts (current UI overlay — you'll replace this)
- /home/claude/hearthfield-v2/src/systems/fishing.ts (existing system for reference)
- /home/claude/hearthfield-v2/src/systems/shop.ts (existing system for reference)
- /home/claude/hearthfield-v2/src/systems/mining.ts (existing system for reference)

## STEP 2: Dispatch 4 workers in parallel

Run all 4 of these commands simultaneously using & and wait:

### Worker A — Inventory Panel
```bash
codex exec --dangerously-bypass-approvals-and-sandbox "
Read /home/claude/hearthfield-v2/src/types.ts and /home/claude/hearthfield-v2/src/data/registry.ts

Create /home/claude/hearthfield-v2/src/systems/inventoryPanel.ts

Export class InventoryPanel:
- Constructor takes Phaser.Scene
- Creates a Phaser.GameObjects.Container at depth 300
- 36-slot grid (6 cols x 6 rows), slot size 44px, gap 4px
- Dark background (0x1a1a2e, 0.95 alpha) with 2px green (0x88cc44) stroke border
- Title 'Inventory' at top center, close button X top-right
- Each slot: rectangle bg, item sprite from 'items' texture using itemDef.spriteIndex, qty text bottom-right, quality-colored border (gold/silver/normal)
- Click logic: first click selects slot (yellow border), second click on different slot calls onSwap(indexA, indexB), second click on same slot deselects
- Method: open(inventory: (InventorySlot|null)[], onClose: ()=>void, onSwap: (a:number, b:number)=>void)
- Method: close() — hides container
- Property: isOpen: boolean
- Import from '../types': InventorySlot, Quality, INVENTORY_SIZE
- Import from '../data/registry': ITEMS
- Panel centered in scene. Must work as overlay in Phaser UIScene.
" &
```

### Worker B — Shop Panel
```bash
codex exec --dangerously-bypass-approvals-and-sandbox "
Read /home/claude/hearthfield-v2/src/types.ts and /home/claude/hearthfield-v2/src/data/registry.ts

Create /home/claude/hearthfield-v2/src/systems/shopPanel.ts

Export class ShopPanel:
- Constructor takes Phaser.Scene
- Container at depth 300
- Two tabs: 'Buy' and 'Sell' as clickable text toggles at top
- BUY tab: scrollable list of shop items. Each row shows item sprite, name, price, and a Buy button. Shop sells all seeds + saplings + tools. Use ITEMS from registry filtered by category SEED or TOOL.
- SELL tab: shows player inventory items that have sellPrice > 0. Each row shows sprite, name, sell price, Sell button.
- Buy button calls onBuy(itemId, qty=1). Sell button calls onSell(slotIndex, qty=1).
- Method: open(inventory: (InventorySlot|null)[], playerGold: number, onBuy: (itemId:string, qty:number)=>void, onSell: (slotIndex:number, qty:number)=>void, onClose: ()=>void)
- Method: close()
- Property: isOpen: boolean
- Import from '../types': InventorySlot, Quality, ItemCategory, Events
- Import from '../data/registry': ITEMS
- Dark panel bg 0x1a1a2e alpha 0.95, green border, close X button. Centered.
" &
```

### Worker C — Dialogue Box
```bash
codex exec --dangerously-bypass-approvals-and-sandbox "
Read /home/claude/hearthfield-v2/src/types.ts and /home/claude/hearthfield-v2/src/data/registry.ts

Create /home/claude/hearthfield-v2/src/systems/dialogueBox.ts

Export class DialogueBox:
- Constructor takes Phaser.Scene
- Container at depth 300, positioned at BOTTOM of screen (y = scene height - 100)
- Full-width dark box (width 700, height 120) with portrait on left side
- Portrait: 48x48 sprite from 'portraits' texture using npcDef.portraitIndex
- NPC name text in green (0x88cc44) above the dialogue text
- Dialogue text in white, word-wrapped at 550px width, font size 14px
- Typewriter effect: text appears character by character (30ms per char)
- Click anywhere or press SPACE/E to: if typewriter still running, show full text instantly. If text fully shown, call onAdvance.
- Method: show(npcName: string, portraitIndex: number, text: string, onAdvance: ()=>void)
- Method: hide()
- Property: isVisible: boolean
- Import from '../types': just what you need
- The box should look like a classic RPG dialogue box with rounded-ish feel (use rectangle with stroke).
" &
```

### Worker D — NEW UIScene (replaces current)
```bash
codex exec --dangerously-bypass-approvals-and-sandbox "
Read ALL of these files:
- /home/claude/hearthfield-v2/src/types.ts
- /home/claude/hearthfield-v2/src/data/registry.ts  
- /home/claude/hearthfield-v2/src/scenes/PlayScene.ts (understand its public fields: player, calendar, farmTiles, shippingBin, relationships, unlockedRecipes, dayPaused, npcSprites, fishingMinigame, and methods: addToInventory, removeFromSlot, removeItem, countItem, saveGame, loadGame)

Now create /home/claude/hearthfield-v2/src/scenes/UISceneNew.ts

This REPLACES the old UIScene. Export class UIScene (same name) that extends Phaser.Scene with key Scenes.UI.

It must import and instantiate these panel classes:
- import { InventoryPanel } from '../systems/inventoryPanel'
- import { ShopPanel } from '../systems/shopPanel'  
- import { DialogueBox } from '../systems/dialogueBox'

The UIScene must have:

1. HOTBAR — same as current: 12 slots at bottom, shows items with sprites/qty/quality, yellow selector follows selectedSlot. Number keys 1-0 and scroll to change slot.

2. HUD — top bar with gold text left, Season Day Year N center, time right. Stamina bar below gold.

3. TOAST system — centered text that fades after duration.

4. INVENTORY — when PlayScene emits Events.OPEN_INVENTORY, open InventoryPanel with current inventory. onSwap swaps the two slots in player.inventory array and emits Events.INVENTORY_CHANGE. onClose resumes game.

5. CRAFTING — when PlayScene emits Events.OPEN_CRAFTING, show crafting panel (reuse the crafting panel logic from the old UIScene — recipe list with clickable craft buttons that emit Events.CRAFT_ITEM).

6. SHOP — when PlayScene emits Events.INTERACT with kind SHOP (listen to this!), open ShopPanel. onBuy emits Events.SHOP_BUY. onSell emits Events.SHOP_SELL.

7. DIALOGUE — when PlayScene emits Events.DIALOGUE_START with {npcId, text, portraitIndex}, show DialogueBox. onAdvance hides it and emits Events.DIALOGUE_END.

8. PAUSE — Events.OPEN_PAUSE toggles dayPaused, shows PAUSED toast.

9. All panels: when any panel is open, set playScene.dayPaused = true. On close, set it false (unless another panel is still open).

Event listeners to wire (on playScene.events):
- Events.INVENTORY_CHANGE -> refreshHotbar()
- Events.GOLD_CHANGE -> refreshGold()  
- Events.TIME_TICK -> refreshTime()
- Events.DAY_START -> refreshDay()
- Events.TOAST -> showToast()
- Events.OPEN_CRAFTING -> openCrafting()
- Events.CLOSE_CRAFTING -> closeCrafting()
- Events.OPEN_PAUSE -> togglePause()
- Events.OPEN_INVENTORY -> openInventory()
- Events.DIALOGUE_START -> showDialogue()
- Events.INTERACT with kind==SHOP -> openShop()
- Events.ACHIEVEMENT -> show achievement toast with special gold color

Import { ITEMS, RECIPES, NPCS } from '../data/registry'

init(data: { playScene: PlayScene }) receives reference to PlayScene.
" &
```

Wait for all 4 workers to complete.

## STEP 3: Fix imports in PlayScene

After workers finish, update PlayScene.ts:
- Find where it emits Events.DIALOGUE_START and change it to include text and portraitIndex in the payload:
  - Find the npcDef line and the dialogue line nearby
  - The emit should be: `this.events.emit(Events.DIALOGUE_START, { npcId, text: line, portraitIndex: npcDef.portraitIndex })`
- Find the NPC INTERACT handler (InteractionKind.NPC case or handleNPCInteraction method) and make sure SHOP interaction (InteractionKind.SHOP case) emits an INTERACT event that UIScene can catch.

## STEP 4: Replace old UIScene

```bash
mv /home/claude/hearthfield-v2/src/scenes/UIScene.ts /home/claude/hearthfield-v2/src/scenes/UIScene.old.ts
mv /home/claude/hearthfield-v2/src/scenes/UISceneNew.ts /home/claude/hearthfield-v2/src/scenes/UIScene.ts
```

## STEP 5: Update game.ts import

Read /home/claude/hearthfield-v2/src/game.ts — if it imports from './scenes/UIScene', it should still work since we renamed the new file.

## STEP 6: Build and verify

```bash
cd /home/claude/hearthfield-v2
npx esbuild src/game.ts --bundle --outfile=public/game.js --format=esm --platform=browser --sourcemap --target=es2020 2>&1
```

If there are TypeScript/import errors, FIX THEM. Common issues:
- Missing imports — add them
- Type mismatches — cast or fix
- PlayScene fields that are private — they should be public (check and fix in PlayScene.ts)

Keep fixing until the build succeeds with zero errors.

## STEP 7: Report

Print a summary of:
- Which files were created/modified
- Total lines of code added
- Any issues fixed during integration
- BUILD STATUS: PASS or FAIL
