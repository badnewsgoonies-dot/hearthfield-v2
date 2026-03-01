import { Season, ItemCategory } from '../types';

export interface ForageSpawnDef {
  itemId: string;
  seasons: Season[];
  tileTypes: number[];  // TileType values where it can spawn
  rarity: number;       // 0-1, lower = rarer
}

export const FORAGE_SPAWNS: ForageSpawnDef[] = [
  { itemId: 'wild_horseradish', seasons: [Season.SPRING], tileTypes: [0], rarity: 0.5 },
  { itemId: 'daffodil', seasons: [Season.SPRING], tileTypes: [0], rarity: 0.6 },
  { itemId: 'leek', seasons: [Season.SPRING], tileTypes: [0], rarity: 0.4 },
  { itemId: 'dandelion', seasons: [Season.SPRING], tileTypes: [0], rarity: 0.7 },
  { itemId: 'grape', seasons: [Season.SUMMER], tileTypes: [0], rarity: 0.5 },
  { itemId: 'spice_berry', seasons: [Season.SUMMER], tileTypes: [0], rarity: 0.4 },
  { itemId: 'sweet_pea', seasons: [Season.SUMMER], tileTypes: [0], rarity: 0.5 },
  { itemId: 'common_mushroom', seasons: [Season.FALL], tileTypes: [0], rarity: 0.6 },
  { itemId: 'wild_plum', seasons: [Season.FALL], tileTypes: [0], rarity: 0.5 },
  { itemId: 'hazelnut', seasons: [Season.FALL], tileTypes: [0], rarity: 0.4 },
  { itemId: 'blackberry', seasons: [Season.FALL], tileTypes: [0], rarity: 0.7 },
  { itemId: 'crocus', seasons: [Season.WINTER], tileTypes: [0], rarity: 0.5 },
  { itemId: 'crystal_fruit', seasons: [Season.WINTER], tileTypes: [0], rarity: 0.2 },
  { itemId: 'snow_yam', seasons: [Season.WINTER], tileTypes: [0], rarity: 0.3 },
  { itemId: 'winter_root', seasons: [Season.WINTER], tileTypes: [0], rarity: 0.4 },
];

// These items need to be added to the registry
export const FORAGE_ITEMS = [
  { id: 'wild_horseradish', name: 'Wild Horseradish', category: ItemCategory.FORAGE, sellPrice: 50, description: 'A spicy spring root.', spriteIndex: 90 },
  { id: 'daffodil', name: 'Daffodil', category: ItemCategory.FORAGE, sellPrice: 30, description: 'A cheerful spring flower.', spriteIndex: 91 },
  { id: 'leek', name: 'Leek', category: ItemCategory.FORAGE, sellPrice: 60, description: 'A tasty spring onion.', spriteIndex: 92 },
  { id: 'dandelion', name: 'Dandelion', category: ItemCategory.FORAGE, sellPrice: 40, description: 'A common but useful flower.', spriteIndex: 93 },
  { id: 'grape', name: 'Grape', category: ItemCategory.FORAGE, sellPrice: 80, description: 'Sweet summer fruit.', spriteIndex: 94 },
  { id: 'spice_berry', name: 'Spice Berry', category: ItemCategory.FORAGE, sellPrice: 80, description: 'Has a fiery kick.', spriteIndex: 95 },
  { id: 'sweet_pea', name: 'Sweet Pea', category: ItemCategory.FORAGE, sellPrice: 50, description: 'A fragrant flower.', spriteIndex: 96 },
  { id: 'common_mushroom', name: 'Common Mushroom', category: ItemCategory.FORAGE, sellPrice: 40, description: 'Found in shady areas.', spriteIndex: 97 },
  { id: 'wild_plum', name: 'Wild Plum', category: ItemCategory.FORAGE, sellPrice: 80, description: 'Tart and delicious.', spriteIndex: 98 },
  { id: 'hazelnut', name: 'Hazelnut', category: ItemCategory.FORAGE, sellPrice: 90, description: 'A crunchy fall nut.', spriteIndex: 99 },
  { id: 'blackberry', name: 'Blackberry', category: ItemCategory.FORAGE, sellPrice: 20, description: 'Grows everywhere in fall.', spriteIndex: 100 },
  { id: 'crocus', name: 'Crocus', category: ItemCategory.FORAGE, sellPrice: 60, description: 'Brightens the snow.', spriteIndex: 101 },
  { id: 'crystal_fruit', name: 'Crystal Fruit', category: ItemCategory.FORAGE, sellPrice: 150, description: 'A rare winter find.', spriteIndex: 102 },
  { id: 'snow_yam', name: 'Snow Yam', category: ItemCategory.FORAGE, sellPrice: 100, description: 'Found buried in snow.', spriteIndex: 103 },
  { id: 'winter_root', name: 'Winter Root', category: ItemCategory.FORAGE, sellPrice: 70, description: 'A hardy tuber.', spriteIndex: 104 },
  { id: 'honey', name: 'Honey', category: ItemCategory.ARTISAN, sellPrice: 100, description: 'Sweet golden nectar.', spriteIndex: 105 },
  { id: 'bouquet', name: 'Bouquet', category: ItemCategory.GIFT, sellPrice: 0, description: 'Give to start dating (8+ hearts).', spriteIndex: 106 },
  { id: 'pendant', name: 'Mermaid Pendant', category: ItemCategory.GIFT, sellPrice: 0, description: 'Used to propose marriage.', spriteIndex: 107 },
  { id: 'bait', name: 'Bait', category: ItemCategory.RESOURCE, sellPrice: 1, description: 'Attracts fish.', spriteIndex: 108 },
];
