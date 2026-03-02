# Worker: City Item Registry

## Scope
Create ONLY: src/data/cityRegistry.ts
Do NOT modify any existing files.

## Required reading
- src/types.ts (ItemDef, ItemCategory, BuffType, Season, CityNPCDef, CityVenue, CityEvent)
- src/data/registry.ts (existing format — match this structure exactly)

## Task
Create the city item and NPC registry. Export arrays that parallel the farm registry.

## Exports:
```typescript
import { ItemDef, ItemCategory, BuffType, Season, CityNPCDef, CityVenue, CityEvent } from '../types';

export const CITY_ITEMS: ItemDef[];
export const CITY_NPCS: CityNPCDef[];
export const CITY_EVENTS: CityEvent[];
export const CITY_SHOP_STOCK: Record<string, string[]>; // venue → item IDs
```

## CITY_ITEMS — minimum 65 items, every item needs: id, name, category, sellPrice, spriteIndex, description

### FOOD items (12 minimum): 
coffee (15g), latte (25g), sandwich (30g), sushi (80g), pizza (40g), wine (60g), beer (20g), salad (35g), steak (120g), pastry (18g), smoothie (28g), ramen (45g)
- Edible foods should have staminaRestore values (10-40)
- Some should have buffs: coffee gives SPEED buff 30s, steak gives STRENGTH buff 60s

### FURNITURE items (12 minimum):
basic_bed (200g), desk (150g), couch (300g), tv (500g), bookshelf (250g), potted_plant (50g), rug (180g), floor_lamp (120g), wall_art (200g), kitchen_upgrade (800g), gaming_setup (1200g), vinyl_player (400g)
- Category: ItemCategory.CRAFTED or create furniture category if available, otherwise use CRAFTED

### CLOTHING items (6 minimum):
casual_outfit (100g), business_suit (500g), formal_wear (800g), sporty_gear (300g), trendy_jacket (450g), designer_shoes (600g)

### GIFT items (8 minimum):
bouquet (80g), chocolate_box (60g), novel (40g), gadget (200g), perfume (150g), vinyl_record (70g), scented_candle (45g), artisan_tea (55g)

### WORK items (5 minimum):
briefcase (300g), laptop (1500g), notebook (20g), fancy_pen (80g), coffee_mug (30g)

### GROCERY items (12 minimum):
flour (10g), sugar (8g), butter (12g), eggs_carton (15g), milk_carton (10g), rice (8g), pasta_box (12g), olive_oil (18g), tomato_sauce (10g), cheese (20g), chicken_breast (25g), salmon_fillet (40g)
- These should be cookable ingredients

### MISC items (5 minimum):
gym_pass (50g), bus_ticket (10g), magazine (15g), energy_drink (35g, staminaRestore: 25), multivitamin (25g, staminaRestore: 10)

## CITY_NPCS — exactly 7 NPCs:
Each needs: id, name, role, personality (2 sentences), defaultVenue, lovedItems (4+), likedItems (4+), hatedItems (3+), dialogue with keys "greeting", "work", "weather", "gift_loved", "gift_hated" (3 lines each)

1. alex — Coworker, friendly/ambitious, office, loves: laptop, coffee, briefcase, business_suit
2. maya — Barista, artistic/dreamy, cafe, loves: novel, vinyl_record, artisan_tea, wall_art  
3. jordan — Gym Trainer, energetic/motivational, gym, loves: smoothie, sporty_gear, energy_drink, gym_pass
4. sam — Chef, passionate/perfectionist, restaurant, loves: salmon_fillet, olive_oil, steak, cheese
5. lena — Bookstore Owner, intellectual/gentle, bookstore, loves: novel, fancy_pen, notebook, scented_candle
6. dev — Tech Entrepreneur, fast-talking/visionary, cafe, loves: laptop, gadget, coffee, energy_drink
7. rosa — Retired Neighbor, warm/wise, park, loves: bouquet, artisan_tea, scented_candle, chocolate_box

## CITY_EVENTS — exactly 4:
1. cherry_blossom: "Cherry Blossom Festival", spring, day 14, park
2. block_party: "Summer Block Party", summer, day 15, restaurant (street)
3. food_festival: "Fall Food Festival", fall, day 16, restaurant
4. holiday_market: "Holiday Market", winter, day 20, cafe (town square)

## CITY_SHOP_STOCK — what each shop sells (item IDs):
- grocery: all grocery items + eggs_carton, milk_carton
- electronics: tv, laptop, gaming_setup, gadget, vinyl_player
- clothing: all clothing items
- cafe: coffee, latte, pastry, smoothie, artisan_tea
- restaurant: sandwich, sushi, pizza, salad, steak, ramen
- bar: beer, wine, energy_drink

## Validation
npx tsc --noEmit must pass.

## When done
Write completion report to status/city-workers/city-registry.md
