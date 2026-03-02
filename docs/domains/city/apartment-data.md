# Worker: Apartment Interior Data

## Scope
Create ONLY: src/city/data/apartmentData.ts
Do NOT modify any existing files.

## Required reading
- src/scenes/InteriorScene.ts (see BuildingLayout interface, TileKind enum)
- docs/city-spec.md (apartment section)

## Task
Create apartment layout data compatible with the existing InteriorScene system.

## Exports:
```typescript
export enum ApartmentTier {
  STUDIO = 'studio',
  ONE_BR = 'one_br', 
  LOFT = 'loft',
  PENTHOUSE = 'penthouse'
}

export interface ApartmentUpgrade {
  tier: ApartmentTier;
  name: string;
  cost: number;
  gridWidth: number;
  gridHeight: number;
  description: string;
}

export interface FurnitureSlot {
  x: number;
  y: number;
  furnitureId: string | null;  // null = empty slot
  required: boolean;           // true = always present (bed, kitchen counter)
}

export interface ApartmentLayout {
  tier: ApartmentTier;
  width: number;
  height: number;
  grid: number[][];  // TileKind values matching InteriorScene
  furnitureSlots: FurnitureSlot[];
  description: string;
}

export const APARTMENT_UPGRADES: ApartmentUpgrade[];
export const APARTMENT_LAYOUTS: Record<ApartmentTier, ApartmentLayout>;

export interface CityFurnitureDef {
  id: string;
  name: string;
  label: string;        // display label in interior
  width: number;        // tiles
  height: number;       // tiles  
  interactable: boolean;
  interactionKind?: string;  // 'sleep' | 'cook' | 'store' | 'decor'
  comfortBonus: number;  // adds to apartment comfort rating (0-5)
  description: string;
}

export const CITY_FURNITURE: CityFurnitureDef[];

/** Calculate apartment comfort rating from placed furniture */
export function getComfortRating(slots: FurnitureSlot[]): number;
```

## Apartment tiers:

### Studio (8×6, free — starting apartment)
- Tiny room with bed (required), kitchenette (required), 4 empty furniture slots
- Grid: walls around edges, floor in center, door at bottom center

### 1BR (10×8, 5000g)
- Separate bedroom area, living room, kitchen corner
- Bed (required), Kitchen (required), 6 empty slots
- Bathroom tile area (non-interactable)

### Loft (12×10, 15000g)  
- Open plan, high ceilings feel (larger tiles)
- Bed, Kitchen (required), 8 empty slots
- Balcony area (2 tiles, decorative)

### Penthouse (14×12, 40000g)
- Luxurious layout, multiple rooms
- Bed, Kitchen (required), 12 empty slots
- Bathroom, balcony, study nook areas

## Furniture (14 items):
bed (required, sleep, comfort 3), kitchen_counter (required, cook, comfort 1),
desk (decor, comfort 2), bookshelf (decor, comfort 2), couch (decor, comfort 3),
tv (decor, comfort 2), plant_pot (decor, comfort 1), rug (decor, comfort 1),
lamp (decor, comfort 1), painting (decor, comfort 2), coffee_table (decor, comfort 1),
mini_fridge (store, comfort 1), stereo (decor, comfort 2), wall_art (decor, comfort 1)

## Grid values (match InteriorScene TileKind):
0=FLOOR, 1=WALL, 2=DOOR_EXIT, 3=FURNITURE, 4=RUG, 5=BLOCKED

## Comfort rating:
Sum of all placed furniture comfortBonus values. Max meaningful = 20.
Comfort affects: stamina recovery rate when sleeping (1.0x at 0, up to 1.5x at 20)

## Validation
npx tsc --noEmit must pass.

## When done
Write completion report to status/workers/apartment-data.md
