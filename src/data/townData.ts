export type TownObjectType =
  | 'shop' | 'blacksmith' | 'carpenter' | 'town_hall'
  | 'well' | 'lamppost' | 'bench' | 'market_stall' | 'flower_bed' | 'signpost';

export interface TownObject {
  type: TownObjectType;
  tileX: number;
  tileY: number;
  color?: number;       // for market stalls
  season?: string;      // for flower beds (unused if not seasonal)
  label?: string;       // text label to show above
}

export interface TownPath {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  width: number;        // 1 or 2 tiles wide
}

export interface TownLayoutData {
  buildings: TownObject[];
  decorations: TownObject[];
  paths: TownPath[];
  /** Tiles that should be grass in the town (town square, gardens) */
  grassAreas: Array<{ x1: number; y1: number; x2: number; y2: number }>;
  /** Tiles that should be stone/cobblestone */
  stoneAreas: Array<{ x1: number; y1: number; x2: number; y2: number }>;
}

export const TOWN_LAYOUT: TownLayoutData = {
  buildings: [
    { type: 'shop', tileX: 27, tileY: 22, label: 'General Store' },
    { type: 'blacksmith', tileX: 16, tileY: 21, label: "Owen's Forge" },
    { type: 'carpenter', tileX: 9, tileY: 22, label: "Finn's Workshop" },
    { type: 'town_hall', tileX: 19, tileY: 25, label: 'Town Hall' },
    { type: 'shop', tileX: 24, tileY: 25, label: 'Rusty Mug Inn' },
  ],
  decorations: [
    { type: 'well', tileX: 20, tileY: 23 },
    { type: 'lamppost', tileX: 14, tileY: 24 },
    { type: 'lamppost', tileX: 18, tileY: 24 },
    { type: 'lamppost', tileX: 22, tileY: 24 },
    { type: 'lamppost', tileX: 26, tileY: 24 },
    { type: 'bench', tileX: 16, tileY: 24 },
    { type: 'bench', tileX: 24, tileY: 24 },
    { type: 'market_stall', tileX: 13, tileY: 26, color: 0xcc3333, label: 'Market' },
    { type: 'market_stall', tileX: 15, tileY: 26, color: 0x33aa55, label: 'Market' },
    { type: 'flower_bed', tileX: 18, tileY: 26, season: 'spring' },
    { type: 'flower_bed', tileX: 22, tileY: 26, season: 'spring' },
    { type: 'signpost', tileX: 19, tileY: 21, label: '↑ Farm  ↓ Town  ← Pond  → Mine' },
  ],
  paths: [
    { fromX: 19, fromY: 20, toX: 19, toY: 28, width: 2 },
    { fromX: 8, fromY: 24, toX: 32, toY: 24, width: 1 },
    { fromX: 22, fromY: 23, toX: 27, toY: 23, width: 1 },
    { fromX: 10, fromY: 23, toX: 14, toY: 23, width: 1 },
  ],
  grassAreas: [
    { x1: 12, y1: 27, x2: 16, y2: 29 },
    { x1: 24, y1: 27, x2: 28, y2: 29 },
  ],
  stoneAreas: [
    { x1: 18, y1: 23, x2: 22, y2: 24 },
    { x1: 19, y1: 20, x2: 20, y2: 28 },
    { x1: 8, y1: 24, x2: 32, y2: 24 },
    { x1: 22, y1: 23, x2: 27, y2: 23 },
    { x1: 10, y1: 23, x2: 14, y2: 23 },
  ],
};
