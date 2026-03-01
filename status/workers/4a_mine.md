# Worker 4A: MineScene Polish

## Scope
- Modified only `src/scenes/MineScene.ts`.

## Completed
1. Loot drops from rocks
- Added post-break rock loot roll to match required distribution:
  - 60% `stone`
  - 30% ore pool (`copper_ore` always available, `iron_ore` from floor 20+, `gold_ore` from floor 40+)
  - 10% gem pool (`amethyst` 10+, `aquamarine` 20+, `emerald` 30+, `ruby` 40+, `diamond` 50+; falls back to `stone` if no gem is unlocked yet)
- Added yellow loot text flash at rock tile position: `+item_id!`.
- Reworked found loot storage to array format:
  - `foundItems: { itemId: string; qty: number }[]`
- Mine exit now transfers all found items to `PlayScene` inventory via:
  - `this.playScene.addToInventory(item.itemId, item.qty)`

2. Found loot HUD
- Updated HUD to render collected items dynamically as requested format:
  - `Found: stone x3, copper_ore x2`
- Keeps `(nothing yet)` when empty.

3. Floor scaling
- Monster stat scaling updated:
  - Slime: `hp = 15 + floor*3`, `attack = 5 + floor`
  - Bat: `hp = 10 + floor*2`, `attack = 8 + floor*2`
- Rock density updated:
  - `rockCount = 5 + floor` capped at 15
- Monster count updated:
  - `1 + Math.floor(floor / 5)` capped at 5

4. Ladder text
- When stepping onto ladder, toast now shows:
  - `Floor X cleared! Going deeper...`

## Validation
- Ran `npx tsc --noEmit` successfully (no errors).
