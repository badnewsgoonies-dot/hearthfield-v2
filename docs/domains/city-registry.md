# Worker: City Registry

## Scope
Create ONLY: src/data/cityRegistry.ts
Do NOT modify any existing files.

## Required reading
- src/types.ts (ItemDef interface, ItemCategory enum, BuffType enum, Quality)
- src/data/registry.ts (existing ITEMS array structure — match this format exactly)

## Task
Create a city-specific item registry with 50+ items across these categories.

## Interface:
```typescript
import { ItemDef, ItemCategory, BuffType } from '../types';

export const CITY_ITEMS: ItemDef[];
```

## Item requirements (use EXISTING ItemCategory values from types.ts — check what's available):

### Foods & Drinks (20 items minimum):
coffee (25g), espresso (40g), latte (35g), smoothie (30g), energy_drink (45g), 
pasta (60g), stir_fry (55g), sushi (80g), pizza (50g), sandwich (35g), 
salad (30g), protein_bar (25g), craft_beer (40g), wine (65g), bubble_tea (30g),
croissant (35g), ramen (55g), burrito (45g), acai_bowl (50g), matcha (40g)
- All food items should have stamina restore values (15-40 range)
- Some should have buffs: coffee/espresso → SPEED buff, protein_bar → STRENGTH buff, smoothie → STAMINA_REGEN buff

### Work Items (8 items):
laptop (500g), briefcase (200g), notebook (30g), pen (10g), 
employee_badge (0g — not sellable), report (25g), usb_drive (40g), business_card (5g)

### Social/Gift Items (12 items):
flowers (50g), vinyl_record (80g), book (45g), puzzle (35g), 
art_print (120g), sneakers (150g), tea_set (90g), cologne (70g),
board_game (55g), concert_ticket (100g), scented_candle (40g), chocolate_box (60g)

### Apartment/Furniture (10 items):
desk_lamp (150g), throw_pillow (80g), plant_pot (60g), wall_art (200g), 
rug (175g), coffee_table (300g), bookshelf (250g), tv_stand (350g),
kitchen_upgrade (500g), bathroom_set (400g)

## Rules:
- Each item needs: id (snake_case), name, category, sellPrice, spriteIndex (assign unique sequential starting at 100), description
- Food items need: staminaRestore value, optional buff + buffDuration
- Match the exact ItemDef interface from types.ts
- spriteIndex values must not conflict with existing registry (start at 100)
- Every item must have a description string (10-30 words, flavorful)

## Validation
npx tsc --noEmit must pass.

## When done
Write completion report to status/workers/city-registry.md
