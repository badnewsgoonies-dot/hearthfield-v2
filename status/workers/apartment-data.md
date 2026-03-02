# Worker Completion Report: Apartment Interior Data

## Status: ✅ DONE

## File Created
- `src/city/data/apartmentData.ts`

## What Was Implemented

### Enums & Interfaces
- `ApartmentTier` enum (STUDIO, ONE_BR, LOFT, PENTHOUSE)
- `ApartmentUpgrade` interface + `APARTMENT_UPGRADES` array (4 tiers, correct costs: 0g / 5000g / 15000g / 40000g)
- `FurnitureSlot` interface (x, y, furnitureId, required)
- `ApartmentLayout` interface + `APARTMENT_LAYOUTS` record (all 4 tiers)
- `CityFurnitureDef` interface + `CITY_FURNITURE` array (14 items)

### Layouts
| Tier       | Size  | Required Slots | Empty Slots |
|------------|-------|----------------|-------------|
| Studio     | 8×6   | bed, kitchen   | 4           |
| 1-Bedroom  | 10×8  | bed, kitchen   | 6           |
| Loft       | 12×10 | bed, kitchen   | 8           |
| Penthouse  | 14×12 | bed, kitchen   | 12          |

Grid values match InteriorScene ITile enum: 0=FLOOR, 1=WALL, 2=DOOR_EXIT, 3=FURNITURE, 4=RUG, 5=BLOCKED.

### Furniture (14 items)
bed (sleep, +3), kitchen_counter (cook, +1), desk (+2), bookshelf (+2), couch (+3), tv (+2), plant_pot (+1), rug (+1), lamp (+1), painting (+2), coffee_table (+1), mini_fridge (store, +1), stereo (+2), wall_art (+1)

### Utility Function
- `getComfortRating(slots)` — sums comfortBonus of all placed furniture; max meaningful = 20; affects stamina recovery 1.0x–1.5x

## Validation
`npx tsc --noEmit` — ✅ passes with exit code 0, no errors
