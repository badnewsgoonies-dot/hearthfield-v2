# Worker: NPC Gift Preferences

## Scope
Create ONLY: src/data/npcGiftData.ts
Do NOT modify any existing files.

## Required reading
- src/data/registry.ts (all item IDs)
- src/types.ts (NPCDef interface)

## Task
Create a gift preference database for all 7 NPCs. Each NPC has loved, liked, neutral, disliked, and hated item categories/specific items.

## Interface:
```typescript
export interface GiftPreference {
  loved: string[];    // +5 friendship points, special dialogue
  liked: string[];    // +3 friendship points
  neutral: string[];  // +1 friendship point  
  disliked: string[]; // -2 friendship points
  hated: string[];    // -5 friendship points, negative dialogue
}

export interface GiftDialogue {
  loved: string[];    // 3 random responses for loved gifts
  liked: string[];    // 3 random responses  
  disliked: string[]; // 3 random responses
  hated: string[];    // 3 random responses
}

export const NPC_GIFT_PREFERENCES: Record<string, GiftPreference>;
export const NPC_GIFT_DIALOGUE: Record<string, GiftDialogue>;

/** Returns the preference tier for a given NPC and item */
export function getGiftReaction(npcId: string, itemId: string): 'loved' | 'liked' | 'neutral' | 'disliked' | 'hated';
```

## NPC personalities (use these for gift preferences):
- **elena**: Baker/cook. Loves: crops, cooked food, eggs, milk. Hates: ore, bars, coal.
- **owen**: Blacksmith. Loves: ores, bars, gems. Hates: flowers, cooked food.
- **lily**: Artist. Loves: flowers, gems, honey, colorful items. Hates: fish, stone, coal.
- **marcus**: Miner/outdoorsman. Loves: minerals, fish, hearty food. Hates: flowers.
- **rose**: Elder/mystic. Loves: rare items (starfruit, legendary_fish, gold_bar). Hates: cheap items (fiber, stone).
- **sage**: Herbalist/nature. Loves: foraged items (mushroom, wild_berries, herbs, honey). Hates: processed/industrial (bars, coal).
- **finn**: Carpenter/builder. Loves: wood, stone, crafted items. Hates: raw fish, wild_berries.

## Requirements:
- Every NPC must have at least 4 loved, 4 liked, 3 disliked, 2 hated items
- Use ONLY item IDs that exist in registry.ts
- Gift dialogue must be personality-appropriate (12 lines per NPC minimum)
- getGiftReaction function must check specific items first, then return 'neutral' as default

## Validation
npx tsc --noEmit must pass.

## When done
Write completion report to status/workers/npc-gifts.md
