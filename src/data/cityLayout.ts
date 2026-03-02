import { TileType, CityInteractionKind, CityVenue } from '../types';

export interface CityBuilding {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  venue: CityVenue;
  interaction: CityInteractionKind;
  color: number;
  roofColor: number;
  hasSign: boolean;
}

export interface CityDecoration {
  type: 'streetlight' | 'bench' | 'trash_can' | 'fire_hydrant' | 'newspaper_box' | 'parking_meter' | 'bus_sign' | 'fountain' | 'tree' | 'flower_planter' | 'mailbox' | 'phone_booth';
  x: number;
  y: number;
}

export interface CityMapLayout {
  buildings: CityBuilding[];
  decorations: CityDecoration[];
  mainStreetY: number;
  crossStreetX: number;
  sidewalks: Array<{x: number; y: number}>;
  parkArea: {x1: number; y1: number; x2: number; y2: number};
  communityGarden: {x: number; y: number; w: number; h: number};
}

// Silence unused import warning — TileType is part of the spec contract
const _tileTypeRef: typeof TileType = TileType;
void _tileTypeRef;

export const CITY_LAYOUT: CityMapLayout = {
  buildings: [
    // ── DOWNTOWN CORE (rows 4-7) ──
    {
      name: 'Office Tower',
      x: 8, y: 4, width: 4, height: 3,
      venue: CityVenue.OFFICE,
      interaction: CityInteractionKind.OFFICE_WORK,
      color: 0x2244aa,
      roofColor: 0x888888,
      hasSign: true,
    },
    {
      name: "Maya's Brew",
      x: 16, y: 5, width: 3, height: 2,
      venue: CityVenue.CAFE,
      interaction: CityInteractionKind.CAFE,
      color: 0x8B4513,
      roofColor: 0xf5f0dc,
      hasSign: true,
    },
    {
      name: 'Electronics Store',
      x: 24, y: 5, width: 3, height: 2,
      venue: CityVenue.ELECTRONICS,
      interaction: CityInteractionKind.SHOP_ELECTRONICS,
      color: 0x333344,
      roofColor: 0x3355cc,
      hasSign: true,
    },

    // ── COMMERCIAL (rows 8-11) ──
    {
      name: "Sam's Kitchen",
      x: 6, y: 8, width: 3, height: 3,
      venue: CityVenue.RESTAURANT,
      interaction: CityInteractionKind.RESTAURANT,
      color: 0xaa3333,
      roofColor: 0x222222,
      hasSign: true,
    },
    {
      name: 'The Night Owl',
      x: 14, y: 9, width: 3, height: 2,
      venue: CityVenue.BAR,
      interaction: CityInteractionKind.BAR,
      color: 0x442266,
      roofColor: 0xff44aa,
      hasSign: true,
    },
    {
      name: 'Clothing Shop',
      x: 22, y: 8, width: 3, height: 2,
      venue: CityVenue.CLOTHING,
      interaction: CityInteractionKind.SHOP_CLOTHING,
      color: 0xcc6688,
      roofColor: 0xffffff,
      hasSign: true,
    },

    // ── TRANSITION (rows 12-15) ──
    {
      name: 'Gym',
      x: 8, y: 13, width: 3, height: 2,
      venue: CityVenue.GYM,
      interaction: CityInteractionKind.GYM,
      color: 0xcc6622,
      roofColor: 0x888888,
      hasSign: true,
    },
    {
      name: 'Bookstore',
      x: 28, y: 13, width: 3, height: 2,
      venue: CityVenue.BOOKSTORE,
      interaction: CityInteractionKind.BOOKSTORE,
      color: 0x446644,
      roofColor: 0x8B4513,
      hasSign: true,
    },
    {
      name: 'Laundromat',
      x: 35, y: 13, width: 2, height: 2,
      venue: CityVenue.APARTMENT,
      interaction: CityInteractionKind.SHOP_GROCERY,
      color: 0x6688aa,
      roofColor: 0xffffff,
      hasSign: true,
    },

    // ── RESIDENTIAL (rows 16-19) ──
    {
      name: 'Player Apartment Building',
      x: 12, y: 16, width: 4, height: 3,
      venue: CityVenue.APARTMENT,
      interaction: CityInteractionKind.APARTMENT_DOOR,
      color: 0xccaa88,
      roofColor: 0x8B4513,
      hasSign: false,
    },
    {
      name: 'Neighbor Building',
      x: 24, y: 16, width: 3, height: 3,
      venue: CityVenue.APARTMENT,
      interaction: CityInteractionKind.APARTMENT_DOOR,
      color: 0x888888,
      roofColor: 0x666666,
      hasSign: false,
    },

    // ── MORE RESIDENTIAL (rows 20-23) ──
    {
      name: 'Grocery Store',
      x: 6, y: 20, width: 3, height: 2,
      venue: CityVenue.GROCERY,
      interaction: CityInteractionKind.SHOP_GROCERY,
      color: 0x44aa44,
      roofColor: 0xffffff,
      hasSign: true,
    },
    {
      name: 'Corner Café',
      x: 16, y: 21, width: 2, height: 2,
      venue: CityVenue.CAFE,
      interaction: CityInteractionKind.CAFE,
      color: 0xddcc99,
      roofColor: 0x8B4513,
      hasSign: true,
    },
  ],

  decorations: [
    // ── Streetlights along main street (y=6) every 4 tiles ──
    { type: 'streetlight', x: 0,  y: 6 },
    { type: 'streetlight', x: 4,  y: 6 },
    { type: 'streetlight', x: 8,  y: 6 },
    { type: 'streetlight', x: 12, y: 6 },
    { type: 'streetlight', x: 16, y: 6 },
    { type: 'streetlight', x: 24, y: 6 },
    { type: 'streetlight', x: 28, y: 6 },
    { type: 'streetlight', x: 32, y: 6 },
    // ── Streetlights along cross street (x=20) ──
    { type: 'streetlight', x: 20, y: 10 },
    { type: 'streetlight', x: 20, y: 18 },

    // ── Benches ──
    { type: 'bench', x: 33, y: 9 },   // small park bench
    { type: 'bench', x: 20, y: 13 },  // bus stop bench
    { type: 'bench', x: 10, y: 25 },  // city park bench
    { type: 'bench', x: 15, y: 26 },  // city park bench

    // ── Trash cans near shops ──
    { type: 'trash_can', x: 9,  y: 11 },
    { type: 'trash_can', x: 17, y: 10 },
    { type: 'trash_can', x: 25, y: 9  },

    // ── Fire hydrants on street corners ──
    { type: 'fire_hydrant', x: 5,  y: 6 },
    { type: 'fire_hydrant', x: 21, y: 12 },

    // ── Fountains ──
    { type: 'fountain', x: 33, y: 10 },  // commercial area / small park
    { type: 'fountain', x: 26, y: 25 },  // city park

    // ── Flower planters near apartment ──
    { type: 'flower_planter', x: 11, y: 17 },
    { type: 'flower_planter', x: 16, y: 17 },

    // ── Bus sign at bus stop ──
    { type: 'bus_sign', x: 20, y: 13 },

    // ── Mailbox near apartment ──
    { type: 'mailbox', x: 12, y: 19 },

    // ── Trees in city park (rows 24-27) ──
    { type: 'tree', x: 12, y: 24 },
    { type: 'tree', x: 16, y: 24 },
    { type: 'tree', x: 25, y: 24 },
    { type: 'tree', x: 28, y: 24 },
    { type: 'tree', x: 30, y: 26 },
    { type: 'tree', x: 34, y: 25 },
    { type: 'tree', x: 36, y: 27 },

    // ── Park bench in city park ──
    { type: 'bench', x: 30, y: 25 },
  ],

  mainStreetY: 6,
  crossStreetX: 20,

  // PATH tiles: main street y=6 (full width) + cross street x=20 (y=4 to y=27) + sidewalks
  sidewalks: [
    // Main street y=6, x=0..39
    ...Array.from({ length: 40 }, (_, i) => ({ x: i, y: 6 })),
    // Cross street x=20, y=4..27
    ...Array.from({ length: 24 }, (_, i) => ({ x: 20, y: 4 + i })),
    // Sidewalk y=12 (transition zone)
    ...Array.from({ length: 40 }, (_, i) => ({ x: i, y: 12 })),
    // Sidewalk y=17 (residential)
    ...Array.from({ length: 40 }, (_, i) => ({ x: i, y: 17 })),
    // Jogging path loop in park (rows 24-27)
    ...Array.from({ length: 30 }, (_, i) => ({ x: 5 + i, y: 24 })),
    ...Array.from({ length: 30 }, (_, i) => ({ x: 5 + i, y: 27 })),
    ...Array.from({ length: 3 }, (_, i) => ({ x: 5,  y: 24 + i })),
    ...Array.from({ length: 3 }, (_, i) => ({ x: 34, y: 24 + i })),
  ],

  parkArea: { x1: 0, y1: 24, x2: 39, y2: 27 },

  communityGarden: { x: 28, y: 20, w: 3, h: 3 },
};
