/**
 * apartmentData.ts — Apartment layout data for the City Life game mode.
 * Grid values match InteriorScene ITile enum: 0=FLOOR, 1=WALL, 2=DOOR_EXIT, 3=FURNITURE, 4=RUG, 5=BLOCKED
 */

export enum ApartmentTier {
  STUDIO = 'studio',
  ONE_BR = 'one_br',
  LOFT = 'loft',
  PENTHOUSE = 'penthouse',
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
  furnitureId: string | null; // null = empty slot
  required: boolean;          // true = always present (bed, kitchen counter)
}

export interface ApartmentLayout {
  tier: ApartmentTier;
  width: number;
  height: number;
  grid: number[][];  // TileKind values matching InteriorScene
  furnitureSlots: FurnitureSlot[];
  description: string;
}

export interface CityFurnitureDef {
  id: string;
  name: string;
  label: string;         // display label in interior
  width: number;         // tiles
  height: number;        // tiles
  interactable: boolean;
  interactionKind?: string; // 'sleep' | 'cook' | 'store' | 'decor'
  comfortBonus: number;  // adds to apartment comfort rating (0-5)
  description: string;
}

// ─── Upgrade definitions ────────────────────────────────────────────────────

export const APARTMENT_UPGRADES: ApartmentUpgrade[] = [
  {
    tier: ApartmentTier.STUDIO,
    name: 'Studio',
    cost: 0,
    gridWidth: 8,
    gridHeight: 6,
    description: 'A cozy studio apartment. Everything in one room.',
  },
  {
    tier: ApartmentTier.ONE_BR,
    name: '1-Bedroom',
    cost: 5000,
    gridWidth: 10,
    gridHeight: 8,
    description: 'Separate bedroom and living area with a proper kitchen corner.',
  },
  {
    tier: ApartmentTier.LOFT,
    name: 'Loft',
    cost: 15000,
    gridWidth: 12,
    gridHeight: 10,
    description: 'Open-plan loft with high ceilings and a private balcony.',
  },
  {
    tier: ApartmentTier.PENTHOUSE,
    name: 'Penthouse',
    cost: 40000,
    gridWidth: 14,
    gridHeight: 12,
    description: 'Luxurious penthouse with multiple rooms, balcony, and study nook.',
  },
];

// ─── Layouts ─────────────────────────────────────────────────────────────────

/**
 * Studio — 8×6
 * Tiny room: walls around edges, floor in center, door at bottom center.
 * Required: bed (top-left area), kitchenette (top-right area).
 * 4 empty furniture slots.
 */
const STUDIO_LAYOUT: ApartmentLayout = {
  tier: ApartmentTier.STUDIO,
  width: 8,
  height: 6,
  grid: [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 3, 0, 0, 0, 0, 3, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 2, 2, 1, 1, 1],
  ],
  furnitureSlots: [
    { x: 1, y: 1, furnitureId: 'bed',            required: true  },
    { x: 6, y: 1, furnitureId: 'kitchen_counter', required: true  },
    { x: 2, y: 3, furnitureId: null,             required: false },
    { x: 4, y: 3, furnitureId: null,             required: false },
    { x: 2, y: 4, furnitureId: null,             required: false },
    { x: 5, y: 4, furnitureId: null,             required: false },
  ],
  description: 'Compact studio with bed and kitchenette. Perfect for starting out.',
};

/**
 * 1BR — 10×8
 * Separate bedroom area (left), living room (center), kitchen corner (top-right).
 * Bathroom tile area (bottom-right, non-interactable, BLOCKED).
 * Required: bed, kitchen. 6 empty slots.
 */
const ONE_BR_LAYOUT: ApartmentLayout = {
  tier: ApartmentTier.ONE_BR,
  width: 10,
  height: 8,
  grid: [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 3, 0, 1, 0, 0, 0, 0, 3, 1],
    [1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 5, 5, 1],
    [1, 0, 0, 0, 0, 0, 0, 5, 5, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 2, 2, 1, 1, 1, 1],
  ],
  furnitureSlots: [
    { x: 1, y: 1, furnitureId: 'bed',            required: true  },
    { x: 8, y: 1, furnitureId: 'kitchen_counter', required: true  },
    { x: 1, y: 3, furnitureId: null,             required: false },
    { x: 4, y: 2, furnitureId: null,             required: false },
    { x: 6, y: 2, furnitureId: null,             required: false },
    { x: 4, y: 4, furnitureId: null,             required: false },
    { x: 5, y: 5, furnitureId: null,             required: false },
    { x: 2, y: 6, furnitureId: null,             required: false },
  ],
  description: 'One-bedroom with a proper bedroom, living area, kitchen, and bathroom.',
};

/**
 * Loft — 12×10
 * Open-plan layout with a balcony (2 decorative tiles, BLOCKED).
 * Required: bed, kitchen. 8 empty slots.
 */
const LOFT_LAYOUT: ApartmentLayout = {
  tier: ApartmentTier.LOFT,
  width: 12,
  height: 10,
  grid: [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 3, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1],
    [1, 0, 0, 0, 0, 4, 4, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 4, 4, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 1],
    [1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1],
  ],
  furnitureSlots: [
    { x: 1,  y: 1, furnitureId: 'bed',            required: true  },
    { x: 10, y: 1, furnitureId: 'kitchen_counter', required: true  },
    { x: 3,  y: 2, furnitureId: null,             required: false },
    { x: 8,  y: 2, furnitureId: null,             required: false },
    { x: 2,  y: 4, furnitureId: null,             required: false },
    { x: 6,  y: 4, furnitureId: null,             required: false },
    { x: 9,  y: 4, furnitureId: null,             required: false },
    { x: 2,  y: 6, furnitureId: null,             required: false },
    { x: 5,  y: 6, furnitureId: null,             required: false },
    { x: 8,  y: 6, furnitureId: null,             required: false },
  ],
  description: 'Airy open-plan loft with a rug area and private balcony.',
};

/**
 * Penthouse — 14×12
 * Multiple rooms: bedroom (left), living (center), kitchen (top-right),
 * bathroom (mid-right, BLOCKED), balcony (bottom-right, BLOCKED), study nook (bottom-left).
 * Required: bed, kitchen. 12 empty slots.
 */
const PENTHOUSE_LAYOUT: ApartmentLayout = {
  tier: ApartmentTier.PENTHOUSE,
  width: 14,
  height: 12,
  grid: [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 3, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 3, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 5, 5, 5, 0, 1],
    [1, 0, 0, 0, 0, 0, 4, 4, 0, 5, 5, 5, 0, 1],
    [1, 0, 0, 0, 0, 0, 4, 4, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1],
  ],
  furnitureSlots: [
    { x: 1,  y: 1,  furnitureId: 'bed',            required: true  },
    { x: 12, y: 1,  furnitureId: 'kitchen_counter', required: true  },
    { x: 2,  y: 3,  furnitureId: null,             required: false },
    { x: 6,  y: 2,  furnitureId: null,             required: false },
    { x: 9,  y: 2,  furnitureId: null,             required: false },
    { x: 11, y: 2,  furnitureId: null,             required: false },
    { x: 4,  y: 5,  furnitureId: null,             required: false },
    { x: 8,  y: 5,  furnitureId: null,             required: false },
    { x: 11, y: 5,  furnitureId: null,             required: false },
    { x: 2,  y: 7,  furnitureId: null,             required: false },
    { x: 6,  y: 7,  furnitureId: null,             required: false },
    { x: 1,  y: 9,  furnitureId: null,             required: false },
    { x: 3,  y: 9,  furnitureId: null,             required: false },
    { x: 7,  y: 9,  furnitureId: null,             required: false },
  ],
  description: 'Luxurious penthouse with bedroom, open living, kitchen, bathroom, balcony, and study nook.',
};

export const APARTMENT_LAYOUTS: Record<ApartmentTier, ApartmentLayout> = {
  [ApartmentTier.STUDIO]:    STUDIO_LAYOUT,
  [ApartmentTier.ONE_BR]:    ONE_BR_LAYOUT,
  [ApartmentTier.LOFT]:      LOFT_LAYOUT,
  [ApartmentTier.PENTHOUSE]: PENTHOUSE_LAYOUT,
};

// ─── Furniture definitions ────────────────────────────────────────────────────

export const CITY_FURNITURE: CityFurnitureDef[] = [
  {
    id: 'bed',
    name: 'Bed',
    label: 'Bed',
    width: 1, height: 1,
    interactable: true,
    interactionKind: 'sleep',
    comfortBonus: 3,
    description: 'A place to sleep and restore stamina.',
  },
  {
    id: 'kitchen_counter',
    name: 'Kitchen Counter',
    label: 'Kitchen',
    width: 1, height: 1,
    interactable: true,
    interactionKind: 'cook',
    comfortBonus: 1,
    description: 'Countertop with stove. Cook meals to restore energy.',
  },
  {
    id: 'desk',
    name: 'Desk',
    label: 'Desk',
    width: 1, height: 1,
    interactable: false,
    interactionKind: 'decor',
    comfortBonus: 2,
    description: 'A sturdy writing desk. Great for working from home.',
  },
  {
    id: 'bookshelf',
    name: 'Bookshelf',
    label: 'Bookshelf',
    width: 1, height: 1,
    interactable: false,
    interactionKind: 'decor',
    comfortBonus: 2,
    description: 'A shelf full of books. Makes any room feel smarter.',
  },
  {
    id: 'couch',
    name: 'Couch',
    label: 'Couch',
    width: 1, height: 1,
    interactable: false,
    interactionKind: 'decor',
    comfortBonus: 3,
    description: 'A plush couch perfect for relaxing after work.',
  },
  {
    id: 'tv',
    name: 'TV',
    label: 'TV',
    width: 1, height: 1,
    interactable: false,
    interactionKind: 'decor',
    comfortBonus: 2,
    description: 'Flat-screen TV. Endless entertainment at your fingertips.',
  },
  {
    id: 'plant_pot',
    name: 'Plant Pot',
    label: 'Plant',
    width: 1, height: 1,
    interactable: false,
    interactionKind: 'decor',
    comfortBonus: 1,
    description: 'A cheerful potted plant. Brings a bit of nature indoors.',
  },
  {
    id: 'rug',
    name: 'Rug',
    label: 'Rug',
    width: 1, height: 1,
    interactable: false,
    interactionKind: 'decor',
    comfortBonus: 1,
    description: 'A colourful rug that ties the room together.',
  },
  {
    id: 'lamp',
    name: 'Lamp',
    label: 'Lamp',
    width: 1, height: 1,
    interactable: false,
    interactionKind: 'decor',
    comfortBonus: 1,
    description: 'A warm floor lamp for cosy evening lighting.',
  },
  {
    id: 'painting',
    name: 'Painting',
    label: 'Painting',
    width: 1, height: 1,
    interactable: false,
    interactionKind: 'decor',
    comfortBonus: 2,
    description: 'A tasteful painting that adds character to your walls.',
  },
  {
    id: 'coffee_table',
    name: 'Coffee Table',
    label: 'Coffee Table',
    width: 1, height: 1,
    interactable: false,
    interactionKind: 'decor',
    comfortBonus: 1,
    description: 'A low coffee table — great for morning routines.',
  },
  {
    id: 'mini_fridge',
    name: 'Mini Fridge',
    label: 'Fridge',
    width: 1, height: 1,
    interactable: true,
    interactionKind: 'store',
    comfortBonus: 1,
    description: 'A compact fridge for storing snacks and drinks.',
  },
  {
    id: 'stereo',
    name: 'Stereo',
    label: 'Stereo',
    width: 1, height: 1,
    interactable: false,
    interactionKind: 'decor',
    comfortBonus: 2,
    description: 'A stereo system that fills the apartment with music.',
  },
  {
    id: 'wall_art',
    name: 'Wall Art',
    label: 'Wall Art',
    width: 1, height: 1,
    interactable: false,
    interactionKind: 'decor',
    comfortBonus: 1,
    description: 'Eclectic wall art that reflects your personal style.',
  },
];

// ─── Utility ─────────────────────────────────────────────────────────────────

/**
 * Calculate apartment comfort rating from placed furniture.
 * Sum of all placed (non-null) furniture comfortBonus values.
 * Max meaningful value is 20. Affects stamina recovery (1.0x–1.5x at 20).
 */
export function getComfortRating(slots: FurnitureSlot[]): number {
  return slots.reduce((total, slot) => {
    if (slot.furnitureId === null) return total;
    const def = CITY_FURNITURE.find(f => f.id === slot.furnitureId);
    return total + (def ? def.comfortBonus : 0);
  }, 0);
}
