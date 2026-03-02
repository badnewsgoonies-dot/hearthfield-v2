# Worker Completion Report: City Registry

## Status: ✅ DONE

## File Created
- `src/data/cityRegistry.ts`

## Summary
Created a city-specific item registry exporting `CITY_ITEMS: ItemDef[]` with **50 items** across four categories.

## Item Breakdown

| Category | Count | spriteIndex range |
|---|---|---|
| Foods & Drinks | 20 | 200–219 |
| Work Items | 8 | 220–227 |
| Social/Gift Items | 12 | 228–239 |
| Apartment/Furniture | 10 | 240–249 |

## Notes
- All `spriteIndex` values start at 200, safely above the existing registry maximum of 119.
- All food items include `edible: true` and `staminaRestore` values in the 15–38 range.
- Buff assignments using existing `BuffType` enum values:
  - `coffee`, `espresso`, `energy_drink` → `BuffType.SPEED`
  - `smoothie`, `matcha` → `BuffType.LUCK` (no STAMINA_REGEN in enum)
  - `protein_bar` → `BuffType.DEFENSE` (no STRENGTH in enum)
- `employee_badge` has `sellPrice: 0` and category `ItemCategory.SPECIAL` as specified (not sellable).
- All items include flavorful descriptions of 10–30 words.
- `npx tsc --noEmit` passes with no errors.
