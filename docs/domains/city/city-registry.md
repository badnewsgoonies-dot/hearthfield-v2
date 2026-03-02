# Worker: City Registry Data

## Scope
Create ONLY: src/data/cityRegistry.ts
Do NOT modify any existing files.

## Required reading
- src/types.ts (ItemDef, ItemCategory, NPCDef, Season, BuffType, Quality)
- src/data/registry.ts (reference for structure — copy the pattern exactly)

## Task
Create city-specific items and NPCs following the exact same interfaces as the farm registry.

## Requirements

### CITY_ITEMS array — 35 items minimum, using ItemDef interface from types.ts:
Food & Drink (10): coffee, espresso, croissant, sandwich, pasta, steak_dinner, cocktail, smoothie, sushi, cake
Work & Office (7): briefcase, laptop, business_card, pen_set, desk_lamp, filing_cabinet, promotion_certificate
Social & Gifts (8): vinyl_record, art_print, book, flowers_bouquet, chocolate_box, concert_ticket, board_game, scented_candle
Apartment (8): throw_pillow, wall_art, rug, plant_pot, kitchen_set, curtains, bookshelf_item, coffee_table_item

Each item needs: id, name, category (use existing ItemCategory values — FOOD for edibles, MATERIAL for decor/office, GIFT for social items), sellPrice, spriteIndex (start from 64 to avoid farm collision), description, stackSize (99 for consumables, 1 for furniture).
Food items should have staminaRestore values (coffee: 15, espresso: 25, croissant: 20, sandwich: 35, pasta: 40, steak_dinner: 60, cocktail: 10, smoothie: 30, sushi: 45, cake: 35).

### CITY_NPCS array — 7 NPCs using NPCDef interface:
- alex: Barista, coffee_shop zone, lovedItems: [coffee, art_print, vinyl_record], likedItems: [smoothie, book, scented_candle], hatedItems: [briefcase, filing_cabinet], schedule: arrives 7AM leaves 8PM
- morgan: Office worker, office zone, lovedItems: [briefcase, laptop, pen_set], likedItems: [business_card, book, coffee], hatedItems: [vinyl_record, board_game]
- sam: Bartender, bar zone, lovedItems: [cocktail, vinyl_record, concert_ticket], likedItems: [board_game, chocolate_box], hatedItems: [business_card, desk_lamp]
- jordan: Park ranger, park zone, lovedItems: [plant_pot, flowers_bouquet, book], likedItems: [smoothie, scented_candle], hatedItems: [laptop, briefcase]
- casey: Chef, restaurant zone, lovedItems: [sushi, steak_dinner, pasta], likedItems: [cake, croissant, coffee], hatedItems: [business_card, filing_cabinet]
- riley: Bookstore owner, bookstore zone, lovedItems: [book, scented_candle, art_print], likedItems: [coffee, cake, throw_pillow], hatedItems: [laptop, cocktail]
- taylor: Neighbor, apartment zone, lovedItems: [throw_pillow, wall_art, chocolate_box], likedItems: [cake, flowers_bouquet, coffee_table_item], hatedItems: [business_card, filing_cabinet]

Each NPC needs: id, name, role, zone, x, y (placeholder 0,0), lovedItems, likedItems, hatedItems, dialogue (3 lines each: greeting, about_self, favorite_topic).

### Exports:
```typescript
export const CITY_ITEMS: ItemDef[];
export const CITY_NPCS: NPCDef[];
```

## Validation
npx tsc --noEmit must pass.

## When done
Write completion report to status/workers/city-registry.md
