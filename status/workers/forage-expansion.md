# Worker Completion: Forage Expansion

**Status:** ✅ Complete  
**File created:** `src/data/forageExpansion.ts`  
**Modified files:** none

## Summary

Created `src/data/forageExpansion.ts` with the `ForageSpawnRule` interface, `FORAGE_SPAWN_RULES` array, `getSeasonalForageables()`, and `rollForageable()` as specified.

## Spawn rules by season

| Season | Items | Count |
|--------|-------|-------|
| Spring | wild_berries, daffodil, leek, wild_horseradish, dandelion, fiber, sap | 7 |
| Summer | wild_berries, grape, spice_berry, sweet_pea, fiber, honey, sap | 7 |
| Fall   | mushroom, common_mushroom, wild_berries, blackberry, hazelnut, wild_plum, fiber | 7 |
| Winter | fiber, winter_root, snow_yam, crocus, crystal_fruit, stone | 6 |

All item IDs reference existing items in `registry.ts`. Each season has ≥ 5 distinct forageables. Zone coverage spans all 5 zones (farm, town, pond, mine_entrance, forest_edge) with season-appropriate distribution. Winter has reduced variety and lower weights as required.

## Validation

`npx tsc --noEmit` — exit code 0, no errors.
