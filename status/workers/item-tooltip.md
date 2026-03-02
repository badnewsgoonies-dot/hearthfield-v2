# Worker Completion: Item Tooltip Renderer

**Status:** ✅ DONE  
**File created:** `src/systems/itemTooltip.ts`  
**TypeScript validation:** `npx tsc --noEmit` — exit code 0, no errors

## What was implemented

- `ItemTooltip` class with `show()`, `hide()`, `destroy()` methods
- Dark background (0x1a1a2e) with border (0x4a4a6a) using `fillRoundedRect`
- Fixed width 180px, auto height based on content
- Layout: item name (quality-colored bold 13px) → category tag (gray 10px) → divider line → description (wrapped 160px, 11px) → sell price (gold, 11px) → optional stamina restore (green) → optional buff (blue) → quantity (gray)
- Quality colors: normal=white, silver=0xaaaaff, gold=0xffdd44 (iridescent mapped to gold tier)
- Position above cursor, clamped to screen bounds
- Depth 9999
- Alpha fade-in 0→1 over 100ms via tween
