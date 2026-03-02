# Worker: Apartment Interior Scene

## Scope
Create ONLY: src/scenes/ApartmentScene.ts
Do NOT modify any existing files.

## Required reading
- src/scenes/InteriorScene.ts (REFERENCE — copy the pattern exactly but for apartment)
- src/types.ts (ApartmentTier, ApartmentState, CityInteractionKind)
- src/data/cityRegistry.ts (CITY_ITEMS for furniture)

## Task
Create an ApartmentScene that renders the player's city apartment interior. Same architecture as InteriorScene (parameterized room, WASD movement, E interact, ESC exit) but with city apartment layouts.

## Interface:
```typescript
export class ApartmentScene extends Phaser.Scene {
  constructor() { super('ApartmentScene'); }
  create(data: { tier: string; furniture: string[]; onExit: () => void; }): void;
}
```

## Layouts by tier:

### STUDIO (8×6 grid):
- Bed at (1,1), Kitchen counter at (5,1), Desk at (1,4), TV at (5,4)
- Door exit at (3,5)
- Small, cozy, minimal furniture

### ONE_BR (10×8 grid):
- Bedroom area (left): Bed at (1,1), Nightstand at (3,1), Closet at (1,3)
- Kitchen area (right): Counter at (7,1), Stove at (9,1), Fridge at (9,3)
- Living area (bottom): Couch at (3,5), TV at (6,5), Coffee table at (4,6)
- Door exit at (5,7)

### TWO_BR (12×10 grid):
- Master bedroom (top-left): Bed at (1,1), Nightstand at (3,1), Dresser at (1,3)
- Second room (top-right): Desk at (9,1), Bookshelf at (11,1), Lamp at (9,3)
- Kitchen (bottom-left): Counter at (1,7), Stove at (3,7), Fridge at (1,9)
- Living room (bottom-right): Couch at (7,7), TV at (10,7), Rug at (8,8)
- Door exit at (6,9)

### PENTHOUSE (14×10 grid):
- All of TWO_BR plus: Balcony view at (12,1) with city skyline graphic, Bar area at (6,4), Plant at (0,5), Art wall at (7,1)

## Visual style (procedural graphics, same as InteriorScene):
- Floor: warm wood (0x8B6914) tiles with subtle grain lines
- Walls: cream/beige (0xF5E6C8) with darker baseboard (0x8B7355)
- Furniture drawn with Graphics primitives:
  - Bed: blue rectangle + white pillow oval
  - Kitchen counter: gray rectangle with darker top surface
  - Desk: brown rectangle with small monitor rectangle on top
  - TV: black rectangle with blue-tinted screen, stand below
  - Couch: dark blue wide rectangle with armrests
  - Coffee table: small brown rectangle
  - Fridge: tall white rectangle with handle line
  - Bookshelf: brown rectangle with colored horizontal book lines
  - Closet: tall dark rectangle with line down middle (doors)

## Interactions (E key):
- Bed: "You rest. Stamina fully restored!" (emit event)
- Kitchen/Stove: "You cook a meal." (emit event)  
- Desk: "You check your email." (flavor text)
- TV: "You watch the news." (flavor text)
- Closet: "Your wardrobe." (flavor text)
- Door: exit scene (call onExit callback)

## Player rendering:
- Same as InteriorScene: 16×16 sprite scaled to tile size
- WASD movement with collision against walls and furniture
- Tile size: dynamic based on viewport (copy InteriorScene formula)

## Target: 400-600 lines

## Validation
npx tsc --noEmit must pass.

## When done
Write report to status/workers/apartment-interior.md
