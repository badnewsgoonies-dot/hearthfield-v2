export interface CityMapTile {
  type: 'sidewalk' | 'road' | 'grass' | 'water' | 'building_floor';
}

export interface CityDecoration {
  type: 'lamp' | 'bench' | 'mailbox' | 'trash' | 'crosswalk' | 'tree' | 'bus_stop' | 'fountain' | 'flower_box' | 'fire_hydrant';
  x: number;
  y: number;
}

export interface CityBuildingPlacement {
  id: string;
  name: string;
  x: number;           // tile position
  y: number;
  width: number;       // tiles
  height: number;      // tiles
  color: number;
  roofColor: number;
  style: 'office' | 'shop' | 'apartment' | 'venue' | 'park';
  interactionKind: string; // what happens when player enters
  label: string;
}

export const CITY_MAP_WIDTH = 40;
export const CITY_MAP_HEIGHT = 25;

export const CITY_BUILDINGS: CityBuildingPlacement[] = [
  // Downtown
  {
    id: 'meridian_corp', name: 'Meridian Corp',
    x: 16, y: 3, width: 4, height: 5,
    color: 0x445566, roofColor: 0x334455,
    style: 'office', interactionKind: 'office_job', label: 'Meridian Corp',
  },
  {
    id: 'sakura_kitchen', name: 'Sakura Kitchen',
    x: 6, y: 5, width: 3, height: 2,
    color: 0xcc4444, roofColor: 0xaa3333,
    style: 'shop', interactionKind: 'restaurant', label: 'Sakura Kitchen',
  },
  {
    id: 'urban_style', name: 'Urban Style',
    x: 10, y: 5, width: 3, height: 2,
    color: 0x4466aa, roofColor: 0x335599,
    style: 'shop', interactionKind: 'clothing_shop', label: 'Urban Style',
  },
  {
    id: 'mikas_gallery', name: "Mika's Gallery",
    x: 24, y: 3, width: 4, height: 3,
    color: 0xffffff, roofColor: 0xdddddd,
    style: 'venue', interactionKind: 'gallery', label: "Mika's Gallery",
  },
  {
    id: 'club_pulse', name: 'Club Pulse',
    x: 30, y: 4, width: 3, height: 3,
    color: 0x222233, roofColor: 0x111122,
    style: 'venue', interactionKind: 'nightclub', label: 'Club Pulse',
  },
  // Residential
  {
    id: 'player_apartment', name: 'Player Apartment Building',
    x: 8, y: 12, width: 5, height: 4,
    color: 0x884433, roofColor: 0x663322,
    style: 'apartment', interactionKind: 'apartment_enter', label: 'Home',
  },
  {
    id: 'sunrise_cafe', name: 'Sunrise Cafe',
    x: 16, y: 13, width: 3, height: 2,
    color: 0xddaa44, roofColor: 0xcc9933,
    style: 'shop', interactionKind: 'coffee_shop', label: 'Sunrise Cafe',
  },
  {
    id: 'priyas_books', name: "Priya's Books",
    x: 22, y: 13, width: 3, height: 2,
    color: 0x446633, roofColor: 0x335522,
    style: 'shop', interactionKind: 'bookstore', label: "Priya's Books",
  },
  {
    id: 'iron_forge_gym', name: 'Iron Forge Gym',
    x: 28, y: 13, width: 3, height: 2,
    color: 0x555555, roofColor: 0x444444,
    style: 'venue', interactionKind: 'gym', label: 'Iron Forge Gym',
  },
  {
    id: 'neon_lounge', name: 'The Neon Lounge',
    x: 34, y: 13, width: 3, height: 2,
    color: 0x8833aa, roofColor: 0x662288,
    style: 'venue', interactionKind: 'bar', label: 'The Neon Lounge',
  },
];

export const ROAD_ROWS: number[] = [10];

export const SIDEWALK_AREAS: Array<{ x: number; y: number; w: number; h: number }> = [
  { x: 0, y: 2, w: 40, h: 2 },   // Downtown sidewalks rows 2-3
  { x: 0, y: 8, w: 40, h: 1 },   // Downtown bottom sidewalk
  { x: 0, y: 9, w: 40, h: 1 },   // Main Street north sidewalk
  { x: 0, y: 11, w: 40, h: 1 },  // Main Street south sidewalk
  { x: 0, y: 12, w: 40, h: 1 },  // Residential top sidewalk
  { x: 0, y: 16, w: 40, h: 2 },  // Residential tree-lined sidewalks rows 16-17
  { x: 0, y: 24, w: 40, h: 1 },  // South edge sidewalk
];

function buildCityTiles(): CityMapTile[][] {
  const tiles: CityMapTile[][] = [];
  for (let y = 0; y < CITY_MAP_HEIGHT; y++) {
    const row: CityMapTile[] = [];
    for (let x = 0; x < CITY_MAP_WIDTH; x++) {
      row.push({ type: 'grass' });
    }
    tiles.push(row);
  }

  // Sidewalk rows
  for (const area of SIDEWALK_AREAS) {
    for (let dy = 0; dy < area.h; dy++) {
      for (let dx = 0; dx < area.w; dx++) {
        tiles[area.y + dy][area.x + dx] = { type: 'sidewalk' };
      }
    }
  }

  // Road rows
  for (const r of ROAD_ROWS) {
    for (let x = 0; x < CITY_MAP_WIDTH; x++) {
      tiles[r][x] = { type: 'road' };
    }
  }

  // Building footprints
  for (const b of CITY_BUILDINGS) {
    for (let dy = 0; dy < b.height; dy++) {
      for (let dx = 0; dx < b.width; dx++) {
        const ty = b.y + dy;
        const tx = b.x + dx;
        if (ty >= 0 && ty < CITY_MAP_HEIGHT && tx >= 0 && tx < CITY_MAP_WIDTH) {
          tiles[ty][tx] = { type: 'building_floor' };
        }
      }
    }
  }

  // Pond in park x:28-32, y:20-22
  for (let py = 20; py <= 22; py++) {
    for (let px = 28; px <= 32; px++) {
      tiles[py][px] = { type: 'water' };
    }
  }

  return tiles;
}

/** Tile type for each grid cell [y][x] */
export const CITY_TILES: CityMapTile[][] = buildCityTiles();

/** Street decorations */
export const CITY_DECORATIONS: CityDecoration[] = [
  // Lamps along downtown sidewalk row 2 (every 5 tiles)
  { type: 'lamp', x: 0, y: 2 },
  { type: 'lamp', x: 5, y: 2 },
  { type: 'lamp', x: 10, y: 2 },
  { type: 'lamp', x: 15, y: 2 },
  { type: 'lamp', x: 20, y: 2 },
  { type: 'lamp', x: 25, y: 2 },
  { type: 'lamp', x: 30, y: 2 },
  { type: 'lamp', x: 35, y: 2 },
  // Lamps along row 8 (south downtown sidewalk)
  { type: 'lamp', x: 5, y: 8 },
  { type: 'lamp', x: 15, y: 8 },
  { type: 'lamp', x: 25, y: 8 },
  { type: 'lamp', x: 35, y: 8 },
  // Lamps along row 9 (Main Street north sidewalk)
  { type: 'lamp', x: 5, y: 9 },
  { type: 'lamp', x: 15, y: 9 },
  { type: 'lamp', x: 25, y: 9 },
  // Lamps along row 11 (Main Street south sidewalk)
  { type: 'lamp', x: 5, y: 11 },
  { type: 'lamp', x: 15, y: 11 },
  { type: 'lamp', x: 25, y: 11 },
  { type: 'lamp', x: 35, y: 11 },
  // Lamps along row 12 (residential sidewalk)
  { type: 'lamp', x: 5, y: 12 },
  { type: 'lamp', x: 20, y: 12 },
  { type: 'lamp', x: 30, y: 12 },
  // Crosswalks at road intersections
  { type: 'crosswalk', x: 8, y: 10 },
  { type: 'crosswalk', x: 20, y: 10 },
  { type: 'crosswalk', x: 32, y: 10 },
  // Bus stop
  { type: 'bus_stop', x: 35, y: 11 },
  // Benches in downtown and park
  { type: 'bench', x: 2, y: 2 },
  { type: 'bench', x: 22, y: 2 },
  { type: 'bench', x: 14, y: 11 },
  { type: 'bench', x: 15, y: 19 },
  { type: 'bench', x: 25, y: 19 },
  { type: 'bench', x: 18, y: 21 },
  { type: 'bench', x: 22, y: 21 },
  // Fountain in park
  { type: 'fountain', x: 20, y: 20 },
  // Trees in residential row 16 (every 4 tiles)
  { type: 'tree', x: 0, y: 16 },
  { type: 'tree', x: 4, y: 16 },
  { type: 'tree', x: 16, y: 16 },
  { type: 'tree', x: 20, y: 16 },
  { type: 'tree', x: 24, y: 16 },
  { type: 'tree', x: 28, y: 16 },
  { type: 'tree', x: 32, y: 16 },
  { type: 'tree', x: 36, y: 16 },
  // Trees along residential top sidewalk row 12
  { type: 'tree', x: 0, y: 12 },
  { type: 'tree', x: 4, y: 12 },
  { type: 'tree', x: 18, y: 12 },
  { type: 'tree', x: 24, y: 12 },
  // Trees scattered in park (rows 18-23)
  { type: 'tree', x: 2, y: 18 },
  { type: 'tree', x: 6, y: 18 },
  { type: 'tree', x: 10, y: 18 },
  { type: 'tree', x: 36, y: 18 },
  { type: 'tree', x: 38, y: 18 },
  { type: 'tree', x: 15, y: 22 },
  { type: 'tree', x: 25, y: 22 },
  { type: 'tree', x: 30, y: 18 },
  { type: 'tree', x: 36, y: 21 },
  { type: 'tree', x: 2, y: 23 },
  { type: 'tree', x: 10, y: 23 },
  // Mailboxes near apartment and shops
  { type: 'mailbox', x: 9, y: 16 },
  { type: 'mailbox', x: 16, y: 12 },
  { type: 'mailbox', x: 22, y: 12 },
  // Flower boxes at park entrance and cafe front
  { type: 'flower_box', x: 14, y: 18 },
  { type: 'flower_box', x: 26, y: 18 },
  { type: 'flower_box', x: 16, y: 15 },
  { type: 'flower_box', x: 18, y: 15 },
  // Trash cans along sidewalks
  { type: 'trash', x: 7, y: 9 },
  { type: 'trash', x: 19, y: 9 },
  { type: 'trash', x: 33, y: 11 },
  // Fire hydrants
  { type: 'fire_hydrant', x: 13, y: 11 },
  { type: 'fire_hydrant', x: 27, y: 9 },
];
