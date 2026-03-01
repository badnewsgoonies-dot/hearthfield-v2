# Worker 1B - Registry Cleanup

## Completed
- Removed second duplicate occurrences of:
  - `honey`
  - `bouquet`
  - `pendant`
- Fixed `spriteIndex` collisions by reassigning:
  - `omelet` -> `74`
  - `pumpkin_soup` -> `77`
  - `blueberry_tart` -> `78`
  - `corn_chowder` -> `79`
- Added missing `wool` item in `ITEMS`:
  - `id: wool`
  - `category: ItemCategory.ANIMAL_PRODUCT`
  - `sellPrice: 340`
  - `spriteIndex: 80`

## Large Milk Check
- `large_milk` already existed in `ITEMS`, so no new duplicate was added.

## Validation
- Ran: `npx tsc --noEmit`
- Result: pass (exit code 0)
