/**
 * Hearthfield v2 — Shared Type Contract
 * ═══════════════════════════════════════
 * ALL agents import from this file. DO NOT MODIFY without orchestrator approval.
 * Every event, interface, enum, and constant lives here.
 */

// ════════════════════════════════════════════════════════════
// CONSTANTS
// ════════════════════════════════════════════════════════════

export const TILE_SIZE = 16;
export const SCALE = 3;
export const SCALED_TILE = TILE_SIZE * SCALE;
export const FARM_WIDTH = 40;  // tiles
export const FARM_HEIGHT = 30; // tiles
export const TOWN_WIDTH = 32;
export const TOWN_HEIGHT = 24;

export const PLAYER_SPEED = 120; // pixels/sec
export const MAX_STAMINA = 100;
export const START_GOLD = 500;
export const INVENTORY_SIZE = 36;
export const HOTBAR_SIZE = 12;
export const DAY_LENGTH_MS = 720_000; // 12 minutes real = 1 game day (6am-2am)
export const DAYS_PER_SEASON = 28;
export const SEASONS_PER_YEAR = 4;

export const SAVE_KEY = 'hearthfield_save';

// ════════════════════════════════════════════════════════════
// ENUMS
// ════════════════════════════════════════════════════════════

export enum Season { SPRING = 'spring', SUMMER = 'summer', FALL = 'fall', WINTER = 'winter' }

export enum TimeOfDay { MORNING = 'morning', AFTERNOON = 'afternoon', EVENING = 'evening', NIGHT = 'night' }

export enum Tool { HOE = 'hoe', WATERING_CAN = 'watering_can', AXE = 'axe', PICKAXE = 'pickaxe', FISHING_ROD = 'fishing_rod', SCYTHE = 'scythe' }

export enum TileType { GRASS = 0, DIRT = 1, TILLED = 2, WATERED = 3, WATER = 4, STONE = 5, WOOD = 6, SAND = 7, PATH = 8 }

export enum ItemCategory {
  SEED = 'seed', CROP = 'crop', FISH = 'fish', ORE = 'ore', GEM = 'gem', BAR = 'bar',
  FORAGE = 'forage', ARTISAN = 'artisan', ANIMAL_PRODUCT = 'animal_product',
  FOOD = 'food', TOOL = 'tool', CRAFTABLE = 'craftable', MACHINE = 'machine',
  GIFT = 'gift', RESOURCE = 'resource', SPECIAL = 'special'
}

export enum Quality { NORMAL = 1, SILVER = 2, GOLD = 3 }

export enum Difficulty { EASY = 'easy', MEDIUM = 'medium', HARD = 'hard' }

export enum NPCRelation { STRANGER = 0, ACQUAINTANCE = 1, FRIEND = 2, CLOSE_FRIEND = 3, DATING = 4, MARRIED = 5 }

export enum Direction { UP = 'up', DOWN = 'down', LEFT = 'left', RIGHT = 'right' }

export enum MapId { FARM = 'farm', TOWN = 'town', BEACH = 'beach', FOREST = 'forest', MINE = 'mine' }

export enum InteractionKind {
  NPC = 'npc', SHIPPING_BIN = 'shipping_bin', CRAFTING_BENCH = 'crafting_bench',
  KITCHEN = 'kitchen', MACHINE = 'machine', CARPENTER = 'carpenter',
  BLACKSMITH = 'blacksmith', QUEST_BOARD = 'quest_board', CHEST = 'chest',
  BED = 'bed', SHOP = 'shop', CROP = 'crop', FORAGEABLE = 'forageable',
  ANIMAL = 'animal', DOOR = 'door'
}

// ════════════════════════════════════════════════════════════
// ITEM & CROP DEFINITIONS
// ════════════════════════════════════════════════════════════

export interface ItemDef {
  id: string;
  name: string;
  category: ItemCategory;
  sellPrice: number;
  buyPrice?: number;
  description: string;
  stackable?: boolean;
  stackSize?: number;
  edible?: boolean;
  staminaRestore?: number;
  buff?: BuffType;
  buffDuration?: number; // seconds
  spriteIndex: number;
}

export interface CropDef {
  id: string;
  name: string;
  seedId: string;
  harvestId: string;
  seasons: Season[];
  growthDays: number;      // total days to mature
  growthStages: number;    // number of visual stages
  regrows: boolean;
  regrowDays?: number;
  sellPrice: number;
  spriteRow: number;       // row in crop spritesheet
}

export interface RecipeDef {
  id: string;
  name: string;
  resultId: string;
  resultQty: number;
  ingredients: { itemId: string; qty: number }[];
  isCooking: boolean;      // true = needs kitchen, false = crafting bench
  spriteIndex: number;
}

export interface FishDef {
  id: string;
  name: string;
  seasons: Season[];
  locations: MapId[];
  timeOfDay: TimeOfDay[];
  difficulty: Difficulty;
  sellPrice: number;
  spriteIndex: number;
}

export interface NPCDef {
  id: string;
  name: string;
  marriageable: boolean;
  birthday: { season: Season; day: number };
  lovedItems: string[];
  likedItems: string[];
  hatedItems: string[];
  defaultMap: MapId;
  portraitIndex: number;
  spriteIndex: number;
  dialoguePool: { [key: string]: string[] }; // keyed by heart level bracket
}

// ════════════════════════════════════════════════════════════
// RUNTIME STATE INTERFACES
// ════════════════════════════════════════════════════════════

export interface InventorySlot {
  itemId: string;
  qty: number;
  quality: Quality;
}

export interface PlayerState {
  name: string;
  x: number;  // world pixel position
  y: number;
  direction: Direction;
  currentTool: Tool;
  stamina: number;
  maxStamina: number;
  gold: number;
  selectedSlot: number; // 0-11 hotbar
  inventory: (InventorySlot | null)[];
  currentMap: MapId;
}

export interface CalendarState {
  day: number;       // 1-28
  season: Season;
  year: number;
  timeOfDay: number; // 0.0 (6am) to 1.0 (2am)
  isPaused: boolean;
}

export interface FarmTile {
  x: number;
  y: number;
  type: TileType;
  cropId?: string;
  cropStage?: number;
  growthDay?: number;
  watered: boolean;
  hasSprinkler?: boolean;
  hasScarecrow?: boolean;
}

export interface ShippingBinState {
  items: { itemId: string; qty: number; quality: Quality }[];
}

export interface RelationshipData {
  hearts: number;
  maxHearts: number;
  talkedToday: boolean;
  giftedToday: boolean;
  giftsThisWeek: number;
  relation: NPCRelation;
}

export type RelationshipState = Record<string, RelationshipData>;

export interface QuestState {
  activeQuests: Quest[];
  completedQuests: string[];
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  objective: { type: 'deliver' | 'catch' | 'harvest' | 'kill'; targetId: string; qty: number; current: number };
  rewardGold: number;
  rewardItem?: { itemId: string; qty: number };
}

export interface MineState {
  currentFloor: number;
  maxFloor: number;
  health: number;
  maxHealth: number;
  elevatorsUnlocked: number[];
}

export interface AnimalState {
  animals: Animal[];
  coopLevel: number;
  barnLevel: number;
}

export interface Animal {
  id: string;
  type: string;
  name: string;
  happiness: number;  // 0-255
  fed: boolean;
  petted: boolean;
  daysOwned: number;
  productReady: boolean;
}

export enum BuffType {
  SPEED = 'speed', MINING = 'mining', FISHING = 'fishing',
  FARMING = 'farming', DEFENSE = 'defense', LUCK = 'luck'
}

export interface ActiveBuff {
  type: BuffType;
  remaining: number; // seconds
}

export interface HouseState {
  tier: number; // 0=basic, 1=kitchen, 2=nursery
}

export interface PlayStats {
  cropsHarvested: number;
  fishCaught: number;
  itemsShipped: number;
  giftsGiven: number;
  recipesCooked: number;
  monstersKilled: number;
  goldEarned: number;
  daysPlayed: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
}

// ════════════════════════════════════════════════════════════
// FULL SAVE DATA — Every piece of persistent state
// ════════════════════════════════════════════════════════════

export interface SaveData {
  version: number;
  player: PlayerState;
  calendar: CalendarState;
  farmTiles: FarmTile[];
  shippingBin: ShippingBinState;
  relationships: RelationshipState;
  quests: QuestState;
  mine: MineState;
  animalState: AnimalState;
  house: HouseState;
  stats: PlayStats;
  achievements: string[];          // unlocked achievement IDs
  unlockedRecipes: string[];
  chestContents: { [chestId: string]: (InventorySlot | null)[] };
  toolLevels: { [tool: string]: number };
  // New system states
  questSystemState?: any;
  romanceState?: any;
  upgradeState?: any;
  machineState?: any;
  achievementState?: any;
  foragingState?: any;
  festivalAttended?: string[];
}

// ════════════════════════════════════════════════════════════
// EVENT NAMES + PAYLOADS
// Every event has a sender AND a listener. No orphan events.
// ════════════════════════════════════════════════════════════

export const Events = {
  // ── Player Actions ──
  TOOL_USE:           'tool:use',           // { tool, tileX, tileY, direction }
  ITEM_USE:           'item:use',           // { itemId, slotIndex }
  INTERACT:           'interact',           // { kind: InteractionKind, targetId?, x, y }
  INVENTORY_CHANGE:   'inventory:change',   // { inventory }

  // ── Farming ──
  CROP_PLANTED:       'crop:planted',       // { x, y, cropId }
  CROP_WATERED:       'crop:watered',       // { x, y }
  CROP_HARVESTED:     'crop:harvested',     // { cropId, qty, quality }
  SOIL_TILLED:        'soil:tilled',        // { x, y }

  // ── Economy ──
  GOLD_CHANGE:        'gold:change',        // { amount, newTotal }
  ITEM_SHIPPED:       'item:shipped',       // { itemId, qty, quality }
  SHOP_BUY:           'shop:buy',           // { itemId, qty, cost }
  SHOP_SELL:          'shop:sell',           // { itemId, qty, revenue }

  // ── Calendar ──
  DAY_START:          'day:start',          // { day, season, year }
  DAY_END:            'day:end',            // { day, season, year }
  SEASON_CHANGE:      'season:change',      // { oldSeason, newSeason, year }
  TIME_TICK:          'time:tick',          // { timeOfDay: number }

  // ── NPC ──
  DIALOGUE_START:     'dialogue:start',     // { npcId }
  DIALOGUE_END:       'dialogue:end',       // { npcId }
  GIFT_GIVEN:         'gift:given',         // { npcId, itemId, reaction }
  RELATIONSHIP_UP:    'relationship:up',    // { npcId, newHearts }

  // ── Crafting ──
  CRAFT_ITEM:         'craft:item',         // { recipeId }
  OPEN_CRAFTING:      'crafting:open',      // { cooking: boolean }
  CLOSE_CRAFTING:     'crafting:close',     // {}

  // ── Fishing ──
  CAST_LINE:          'fish:cast',          // { x, y }
  FISH_CAUGHT:        'fish:caught',        // { fishId, quality }
  FISH_ESCAPED:       'fish:escaped',       // {}

  // ── Mining ──
  ENTER_MINE:         'mine:enter',         // { floor }
  FLOOR_CLEAR:        'mine:floor_clear',   // { floor }
  MONSTER_KILLED:     'mine:monster_killed', // { monsterId }

  // ── Building ──
  BUILDING_UPGRADE:   'building:upgrade',   // { buildingType, newLevel }
  TOOL_UPGRADE:       'tool:upgrade',       // { tool, newLevel }

  // ── Animals ──
  ANIMAL_PURCHASE:    'animal:purchase',    // { animalType, name }
  ANIMAL_PRODUCT:     'animal:product',     // { animalId, itemId }

  // ── Map ──
  MAP_TRANSITION:     'map:transition',     // { from: MapId, to: MapId, spawnX, spawnY }

  // ── UI ──
  TOAST:              'ui:toast',           // { message, duration?, color? }
  ACHIEVEMENT:        'ui:achievement',     // { achievementId, name }
  OPEN_INVENTORY:     'ui:inventory',       // {}
  OPEN_PAUSE:         'ui:pause',           // {}

  // ── Save ──
  SAVE_GAME:          'save:game',          // { slot }
  LOAD_GAME:          'load:game',          // { slot }

  // ── Quest ──
  QUEST_ACCEPTED:     'quest:accepted',     // { questId }
  QUEST_COMPLETED:    'quest:completed',    // { questId }
  QUEST_PROGRESS:     'quest:progress',     // { questId, current, target }

  // ── Stats ──
  STAT_INCREMENT:     'stat:increment',     // { stat: keyof PlayStats, amount }
} as const;

// ════════════════════════════════════════════════════════════
// SCENE KEYS
// ════════════════════════════════════════════════════════════

export const Scenes = {
  BOOT:      'BootScene',
  MENU:      'MenuScene',
  INTRO:     'IntroScene',
  PLAY:      'PlayScene',
  UI:        'UIScene',        // runs parallel to PlayScene as overlay
} as const;

// ════════════════════════════════════════════════════════════
// ASSET KEYS
// ════════════════════════════════════════════════════════════

export const Assets = {
  // Spritesheets
  PLAYER:     'player',
  CROPS:      'crops',
  ITEMS:      'items',
  NPCS:       'npcs',
  ANIMALS:    'animals',
  OBJECTS:    'objects',
  MONSTERS:   'monsters',
  UI_ICONS:   'ui_icons',
  PORTRAITS:  'portraits',
  TOOLS:      'tools',

  // Tilemaps
  FARM_MAP:   'farm_map',
  TOWN_MAP:   'town_map',
  BEACH_MAP:  'beach_map',
  FOREST_MAP: 'forest_map',
  MINE_MAP:   'mine_map',

  // Tilesets
  TERRAIN:    'terrain',
  BUILDINGS:  'buildings',

  // Audio
  MUSIC_SPRING: 'music_spring',
  MUSIC_SUMMER: 'music_summer',
  MUSIC_FALL:   'music_fall',
  MUSIC_WINTER: 'music_winter',
  SFX_HOE:      'sfx_hoe',
  SFX_WATER:    'sfx_water',
  SFX_CHOP:     'sfx_chop',
  SFX_MINE:     'sfx_mine',
  SFX_PICKUP:   'sfx_pickup',
  SFX_SELL:     'sfx_sell',
  SFX_CRAFT:    'sfx_craft',

  // Fonts
  PIXEL_FONT: 'pixel_font',
} as const;

// ════════════════════════════════════════════════════════════
// HELPER FUNCTIONS (shared by all systems)
// ════════════════════════════════════════════════════════════

/** Convert grid tile position to world pixel center (accounting for scale) */
export function gridToWorld(tileX: number, tileY: number): { x: number; y: number } {
  return {
    x: tileX * SCALED_TILE + SCALED_TILE / 2,
    y: tileY * SCALED_TILE + SCALED_TILE / 2,
  };
}

/** Convert world pixel position to grid tile */
export function worldToGrid(worldX: number, worldY: number): { x: number; y: number } {
  return {
    x: Math.floor(worldX / SCALED_TILE),
    y: Math.floor(worldY / SCALED_TILE),
  };
}

/** Y-sort depth value for a world-space y position */
export function ySortDepth(worldY: number): number {
  return worldY * 0.001;
}

/** Get the tile the player is facing */
export function facingTile(playerX: number, playerY: number, dir: Direction): { x: number; y: number } {
  const grid = worldToGrid(playerX, playerY);
  switch (dir) {
    case Direction.UP:    return { x: grid.x, y: grid.y - 1 };
    case Direction.DOWN:  return { x: grid.x, y: grid.y + 1 };
    case Direction.LEFT:  return { x: grid.x - 1, y: grid.y };
    case Direction.RIGHT: return { x: grid.x + 1, y: grid.y };
  }
}

/** Clamp a number between min and max */
export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}
