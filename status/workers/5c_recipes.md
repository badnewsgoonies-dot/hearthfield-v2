# Worker 5C - Recipes & Item Balance

## Files Modified
- `src/data/registry.ts`

## Completed Tasks

### 1) Added cooking recipes and result items
Implemented the requested cooking set in `RECIPES` and ensured corresponding food items exist in `ITEMS`:
- Pumpkin Soup (`pumpkin + milk -> pumpkin_soup`, 300)
- Berry Smoothie (`wild_berries + milk -> berry_smoothie`, 150)
- Fish Stew (`bass + potato -> fish_stew`, 250)
- Grilled Salmon (`salmon -> grilled_salmon`, 200)
- Corn Chowder (`corn + milk -> corn_chowder`, 280)
- Honey Cake (`honey + wheat_flour -> honey_cake`, 350)
- Fruit Salad (`melon + blueberry -> fruit_salad`, 200)
- Spicy Peppers (`tomato + garlic -> spicy_peppers`, 180)
- Cranberry Sauce (`cranberry -> cranberry_sauce`, 120)
- Fried Egg (`egg -> fried_egg`, 100)
- Cheese Omelet (`egg + cheese -> cheese_omelet`, 220)
- Blueberry Tart (`blueberry + wheat_flour -> blueberry_tart`, 280)

Notes:
- Existing recipes/items for `pumpkin_soup`, `fish_stew`, `corn_chowder`, and `blueberry_tart` were updated to match requested targets.
- Added new result items with unique sprite indexes above prior max (`108`): `109`-`119`.

### 2) Verified recipe ingredient existence
All recipe ingredients now exist in `ITEMS`.
To satisfy ingredient dependencies cleanly, added:
- `bass` (also added to `FISH`)
- `wheat_flour`
- `garlic`

### 3) Item price sanity pass for zero/missing prices
Updated all `ITEMS` entries that had `sellPrice: 0` to non-zero values:
- `chest`: 80
- `furnace`: 150
- `bouquet`: 120
- `pendant`: 500
- `tool_hoe`: 150
- `tool_watering_can`: 175

No missing `sellPrice` fields found.

## Validation
- Ran: `npx tsc --noEmit`
- Result: **PASS**

## Quick Integrity Checks
- Remaining `sellPrice: 0` in `ITEMS`: none
- Missing recipe ingredient IDs relative to defined item IDs: none
