/**
 * Hearthfield v2 — Data Registry
 * All game content definitions. Imported by all systems.
 */
import {
  ItemDef, CropDef, RecipeDef, FishDef, NPCDef,
  ItemCategory, Season, Difficulty, MapId, TimeOfDay, BuffType
} from '../types';

// ════════════════════════════════════════════════════════════
// ITEMS
// ════════════════════════════════════════════════════════════

export const ITEMS: ItemDef[] = [
  // Seeds
  { id: 'parsnip_seeds', name: 'Parsnip Seeds', category: ItemCategory.SEED, sellPrice: 10, description: 'Plant in spring.', spriteIndex: 0 },
  { id: 'potato_seeds', name: 'Potato Seeds', category: ItemCategory.SEED, sellPrice: 25, description: 'Plant in spring.', spriteIndex: 1 },
  { id: 'cauliflower_seeds', name: 'Cauliflower Seeds', category: ItemCategory.SEED, sellPrice: 40, description: 'Plant in spring.', spriteIndex: 2 },
  { id: 'melon_seeds', name: 'Melon Seeds', category: ItemCategory.SEED, sellPrice: 40, description: 'Plant in summer.', spriteIndex: 3 },
  { id: 'tomato_seeds', name: 'Tomato Seeds', category: ItemCategory.SEED, sellPrice: 25, description: 'Plant in summer. Regrows.', spriteIndex: 4 },
  { id: 'blueberry_seeds', name: 'Blueberry Seeds', category: ItemCategory.SEED, sellPrice: 40, description: 'Plant in summer. Regrows.', spriteIndex: 5 },
  { id: 'pumpkin_seeds', name: 'Pumpkin Seeds', category: ItemCategory.SEED, sellPrice: 50, description: 'Plant in fall.', spriteIndex: 6 },
  { id: 'cranberry_seeds', name: 'Cranberry Seeds', category: ItemCategory.SEED, sellPrice: 60, description: 'Plant in fall. Regrows.', spriteIndex: 7 },
  { id: 'corn_seeds', name: 'Corn Seeds', category: ItemCategory.SEED, sellPrice: 75, description: 'Plant in summer or fall.', spriteIndex: 8 },

  // Crops (harvest products)
  { id: 'parsnip', name: 'Parsnip', category: ItemCategory.CROP, sellPrice: 35, description: 'A tasty root vegetable.', spriteIndex: 10 },
  { id: 'potato', name: 'Potato', category: ItemCategory.CROP, sellPrice: 80, description: 'Versatile and filling.', spriteIndex: 11 },
  { id: 'cauliflower', name: 'Cauliflower', category: ItemCategory.CROP, sellPrice: 175, description: 'A prized spring crop.', spriteIndex: 12 },
  { id: 'melon', name: 'Melon', category: ItemCategory.CROP, sellPrice: 250, description: 'Sweet and refreshing.', spriteIndex: 13 },
  { id: 'tomato', name: 'Tomato', category: ItemCategory.CROP, sellPrice: 60, description: 'Juicy and versatile.', spriteIndex: 14 },
  { id: 'blueberry', name: 'Blueberry', category: ItemCategory.CROP, sellPrice: 50, description: 'Tiny but packed with flavor.', spriteIndex: 15 },
  { id: 'pumpkin', name: 'Pumpkin', category: ItemCategory.CROP, sellPrice: 320, description: 'The pride of fall.', spriteIndex: 16 },
  { id: 'cranberry', name: 'Cranberry', category: ItemCategory.CROP, sellPrice: 75, description: 'Tart and colorful.', spriteIndex: 17 },
  { id: 'corn', name: 'Corn', category: ItemCategory.CROP, sellPrice: 50, description: 'Golden and sweet.', spriteIndex: 18 },

  // Resources
  { id: 'wood', name: 'Wood', category: ItemCategory.RESOURCE, sellPrice: 2, description: 'Basic building material.', spriteIndex: 20 },
  { id: 'stone', name: 'Stone', category: ItemCategory.RESOURCE, sellPrice: 2, description: 'Hard and dependable.', spriteIndex: 21 },
  { id: 'fiber', name: 'Fiber', category: ItemCategory.RESOURCE, sellPrice: 1, description: 'Useful for crafting.', spriteIndex: 22 },
  { id: 'clay', name: 'Clay', category: ItemCategory.RESOURCE, sellPrice: 5, description: 'Found when tilling soil.', spriteIndex: 23 },
  { id: 'coal', name: 'Coal', category: ItemCategory.RESOURCE, sellPrice: 15, description: 'Burns hot.', spriteIndex: 24 },
  { id: 'sap', name: 'Sap', category: ItemCategory.RESOURCE, sellPrice: 2, description: 'Sticky tree sap.', spriteIndex: 25 },

  // Ores & Bars
  { id: 'copper_ore', name: 'Copper Ore', category: ItemCategory.ORE, sellPrice: 5, description: 'Common ore.', spriteIndex: 26 },
  { id: 'iron_ore', name: 'Iron Ore', category: ItemCategory.ORE, sellPrice: 10, description: 'Sturdy ore.', spriteIndex: 27 },
  { id: 'gold_ore', name: 'Gold Ore', category: ItemCategory.ORE, sellPrice: 25, description: 'Precious ore.', spriteIndex: 28 },
  { id: 'copper_bar', name: 'Copper Bar', category: ItemCategory.BAR, sellPrice: 60, description: 'Smelted copper.', spriteIndex: 29 },
  { id: 'iron_bar', name: 'Iron Bar', category: ItemCategory.BAR, sellPrice: 120, description: 'Smelted iron.', spriteIndex: 30 },
  { id: 'gold_bar', name: 'Gold Bar', category: ItemCategory.BAR, sellPrice: 250, description: 'Smelted gold.', spriteIndex: 31 },

  // Fish
  { id: 'sardine', name: 'Sardine', category: ItemCategory.FISH, sellPrice: 40, description: 'A common ocean fish.', spriteIndex: 32 },
  { id: 'trout', name: 'Trout', category: ItemCategory.FISH, sellPrice: 65, description: 'Freshwater beauty.', spriteIndex: 33 },
  { id: 'salmon', name: 'Salmon', category: ItemCategory.FISH, sellPrice: 75, description: 'A prized catch.', spriteIndex: 34 },
  { id: 'catfish', name: 'Catfish', category: ItemCategory.FISH, sellPrice: 200, description: 'Lurks in the deep.', spriteIndex: 35 },
  { id: 'tuna', name: 'Tuna', category: ItemCategory.FISH, sellPrice: 100, description: 'Fast and powerful.', spriteIndex: 36 },
  { id: 'legendary_fish', name: 'Legend', category: ItemCategory.FISH, sellPrice: 5000, description: 'The fish of legend.', spriteIndex: 37 },

  // Food (cooked / foraged)
  { id: 'wild_berries', name: 'Wild Berries', category: ItemCategory.FOOD, sellPrice: 20, description: 'Sweet and wild.', edible: true, staminaRestore: 15, spriteIndex: 40 },
  { id: 'mushroom', name: 'Mushroom', category: ItemCategory.FOOD, sellPrice: 40, description: 'An earthy fungus.', edible: true, staminaRestore: 20, spriteIndex: 41 },
  { id: 'baked_potato', name: 'Baked Potato', category: ItemCategory.FOOD, sellPrice: 120, description: 'Warm and filling.', edible: true, staminaRestore: 35, spriteIndex: 42 },
  { id: 'tomato_soup', name: 'Tomato Soup', category: ItemCategory.FOOD, sellPrice: 150, description: 'Comforting.', edible: true, staminaRestore: 40, spriteIndex: 43 },
  { id: 'fish_stew', name: 'Fish Stew', category: ItemCategory.FOOD, sellPrice: 200, description: 'Hearty and warming.', edible: true, staminaRestore: 50, buff: BuffType.FISHING, buffDuration: 120, spriteIndex: 44 },
  { id: 'farmers_lunch', name: "Farmer's Lunch", category: ItemCategory.FOOD, sellPrice: 180, description: 'Energizing!', edible: true, staminaRestore: 60, buff: BuffType.FARMING, buffDuration: 120, spriteIndex: 45 },
  { id: 'miners_treat', name: "Miner's Treat", category: ItemCategory.FOOD, sellPrice: 220, description: 'Sustaining.', edible: true, staminaRestore: 50, buff: BuffType.MINING, buffDuration: 180, spriteIndex: 46 },
  { id: 'lucky_charm', name: 'Lucky Charm', category: ItemCategory.FOOD, sellPrice: 300, description: 'Feels lucky!', edible: true, staminaRestore: 25, buff: BuffType.LUCK, buffDuration: 240, spriteIndex: 47 },

  // Gems
  { id: 'amethyst', name: 'Amethyst', category: ItemCategory.GEM, sellPrice: 100, description: 'A purple gem.', spriteIndex: 48 },
  { id: 'aquamarine', name: 'Aquamarine', category: ItemCategory.GEM, sellPrice: 180, description: 'A blue-green gem.', spriteIndex: 49 },
  { id: 'ruby', name: 'Ruby', category: ItemCategory.GEM, sellPrice: 250, description: 'A fiery red gem.', spriteIndex: 50 },
  { id: 'emerald', name: 'Emerald', category: ItemCategory.GEM, sellPrice: 250, description: 'Lush green.', spriteIndex: 51 },
  { id: 'diamond', name: 'Diamond', category: ItemCategory.GEM, sellPrice: 750, description: 'Flawless.', spriteIndex: 52 },

  // Craftables & Machines
  { id: 'chest', name: 'Chest', category: ItemCategory.CRAFTABLE, sellPrice: 0, description: 'Stores items.', spriteIndex: 53 },
  { id: 'sprinkler', name: 'Sprinkler', category: ItemCategory.MACHINE, sellPrice: 100, description: 'Waters adjacent tiles.', spriteIndex: 54 },
  { id: 'scarecrow', name: 'Scarecrow', category: ItemCategory.MACHINE, sellPrice: 50, description: 'Protects crops from crows.', spriteIndex: 55 },
  { id: 'furnace', name: 'Furnace', category: ItemCategory.MACHINE, sellPrice: 0, description: 'Smelts ore into bars.', spriteIndex: 56 },
  { id: 'bee_house', name: 'Bee House', category: ItemCategory.MACHINE, sellPrice: 100, description: 'Produces honey.', spriteIndex: 57 },
  { id: 'honey', name: 'Honey', category: ItemCategory.FOOD, sellPrice: 100, description: 'Golden sweetness.', edible: true, staminaRestore: 20, spriteIndex: 58 },

  // Gifts / Special
  { id: 'bouquet', name: 'Bouquet', category: ItemCategory.GIFT, sellPrice: 0, description: 'Express your feelings.', spriteIndex: 59 },
  { id: 'pendant', name: 'Mermaid Pendant', category: ItemCategory.SPECIAL, sellPrice: 0, description: 'A proposal item.', spriteIndex: 60 },
  { id: 'starfruit', name: 'Starfruit', category: ItemCategory.CROP, sellPrice: 750, description: 'An exotic fruit.', spriteIndex: 61 },

  // Tools (in inventory form)
  { id: 'tool_hoe', name: 'Hoe', category: ItemCategory.TOOL, sellPrice: 0, description: 'Tills soil.', spriteIndex: 62 },
  { id: 'tool_watering_can', name: 'Watering Can', category: ItemCategory.TOOL, sellPrice: 0, description: 'Waters crops.', spriteIndex: 63 },

  // More cooked food
  { id: 'omelet', name: 'Omelet', category: ItemCategory.FOOD, sellPrice: 125, description: 'Fluffy and delicious.', edible: true, staminaRestore: 40, spriteIndex: 74 },
  { id: 'pumpkin_soup', name: 'Pumpkin Soup', category: ItemCategory.FOOD, sellPrice: 300, description: 'Creamy and warming.', edible: true, staminaRestore: 60, spriteIndex: 77 },
  { id: 'blueberry_tart', name: 'Blueberry Tart', category: ItemCategory.FOOD, sellPrice: 150, description: 'Sweet and tangy.', edible: true, staminaRestore: 35, spriteIndex: 78 },
  { id: 'corn_chowder', name: 'Corn Chowder', category: ItemCategory.FOOD, sellPrice: 175, description: 'Rich and hearty.', edible: true, staminaRestore: 45, spriteIndex: 79 },
  // Machines
  { id: 'cheese_press', name: 'Cheese Press', category: ItemCategory.MACHINE, sellPrice: 150, description: 'Turns milk into cheese.', spriteIndex: 58 },
  { id: 'mayo_machine', name: 'Mayo Machine', category: ItemCategory.MACHINE, sellPrice: 100, description: 'Turns eggs into mayo.', spriteIndex: 59 },
  { id: 'quality_sprinkler', name: 'Quality Sprinkler', category: ItemCategory.MACHINE, sellPrice: 300, description: 'Waters 8 adjacent tiles.', spriteIndex: 60 },
  // Forage items
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
  // Animal products
  { id: 'egg', name: 'Egg', category: ItemCategory.ANIMAL_PRODUCT, sellPrice: 50, description: 'A fresh egg.', spriteIndex: 70 },
  { id: 'large_egg', name: 'Large Egg', category: ItemCategory.ANIMAL_PRODUCT, sellPrice: 95, description: 'A large, high-quality egg.', spriteIndex: 71 },
  { id: 'milk', name: 'Milk', category: ItemCategory.ANIMAL_PRODUCT, sellPrice: 125, description: 'Fresh cow milk.', spriteIndex: 72 },
  { id: 'large_milk', name: 'Large Milk', category: ItemCategory.ANIMAL_PRODUCT, sellPrice: 190, description: 'Rich, creamy milk.', spriteIndex: 73 },
  { id: 'wool', name: 'Wool', category: ItemCategory.ANIMAL_PRODUCT, sellPrice: 340, description: 'Soft and fluffy sheep wool.', spriteIndex: 80 },
  { id: 'cheese', name: 'Cheese', category: ItemCategory.ANIMAL_PRODUCT, sellPrice: 200, description: 'Made from fresh milk.', spriteIndex: 75 },
  { id: 'mayonnaise', name: 'Mayonnaise', category: ItemCategory.ANIMAL_PRODUCT, sellPrice: 190, description: 'Made from eggs.', spriteIndex: 76 },
  { id: 'bait', name: 'Bait', category: ItemCategory.RESOURCE, sellPrice: 1, description: 'Attracts fish.', spriteIndex: 108 },
];

// ════════════════════════════════════════════════════════════
// CROPS
// ════════════════════════════════════════════════════════════

export const CROPS: CropDef[] = [
  { id: 'parsnip_crop', name: 'Parsnip', seedId: 'parsnip_seeds', harvestId: 'parsnip', seasons: [Season.SPRING], growthDays: 4, growthStages: 4, regrows: false, sellPrice: 35, spriteRow: 0 },
  { id: 'potato_crop', name: 'Potato', seedId: 'potato_seeds', harvestId: 'potato', seasons: [Season.SPRING], growthDays: 6, growthStages: 5, regrows: false, sellPrice: 80, spriteRow: 1 },
  { id: 'cauliflower_crop', name: 'Cauliflower', seedId: 'cauliflower_seeds', harvestId: 'cauliflower', seasons: [Season.SPRING], growthDays: 12, growthStages: 5, regrows: false, sellPrice: 175, spriteRow: 2 },
  { id: 'melon_crop', name: 'Melon', seedId: 'melon_seeds', harvestId: 'melon', seasons: [Season.SUMMER], growthDays: 12, growthStages: 5, regrows: false, sellPrice: 250, spriteRow: 3 },
  { id: 'tomato_crop', name: 'Tomato', seedId: 'tomato_seeds', harvestId: 'tomato', seasons: [Season.SUMMER], growthDays: 11, growthStages: 5, regrows: true, regrowDays: 4, sellPrice: 60, spriteRow: 4 },
  { id: 'blueberry_crop', name: 'Blueberry', seedId: 'blueberry_seeds', harvestId: 'blueberry', seasons: [Season.SUMMER], growthDays: 13, growthStages: 5, regrows: true, regrowDays: 4, sellPrice: 50, spriteRow: 5 },
  { id: 'pumpkin_crop', name: 'Pumpkin', seedId: 'pumpkin_seeds', harvestId: 'pumpkin', seasons: [Season.FALL], growthDays: 13, growthStages: 5, regrows: false, sellPrice: 320, spriteRow: 6 },
  { id: 'cranberry_crop', name: 'Cranberry', seedId: 'cranberry_seeds', harvestId: 'cranberry', seasons: [Season.FALL], growthDays: 7, growthStages: 5, regrows: true, regrowDays: 5, sellPrice: 75, spriteRow: 7 },
  { id: 'corn_crop', name: 'Corn', seedId: 'corn_seeds', harvestId: 'corn', seasons: [Season.SUMMER, Season.FALL], growthDays: 14, growthStages: 6, regrows: false, sellPrice: 50, spriteRow: 8 },
];

// ════════════════════════════════════════════════════════════
// RECIPES
// ════════════════════════════════════════════════════════════

export const RECIPES: RecipeDef[] = [
  // Crafting (bench)
  { id: 'craft_chest', name: 'Chest', resultId: 'chest', resultQty: 1, ingredients: [{ itemId: 'wood', qty: 50 }], isCooking: false, spriteIndex: 53 },
  { id: 'craft_scarecrow', name: 'Scarecrow', resultId: 'scarecrow', resultQty: 1, ingredients: [{ itemId: 'wood', qty: 50 }, { itemId: 'coal', qty: 1 }, { itemId: 'fiber', qty: 20 }], isCooking: false, spriteIndex: 55 },
  { id: 'craft_sprinkler', name: 'Sprinkler', resultId: 'sprinkler', resultQty: 1, ingredients: [{ itemId: 'copper_bar', qty: 1 }, { itemId: 'iron_bar', qty: 1 }], isCooking: false, spriteIndex: 54 },
  { id: 'craft_furnace', name: 'Furnace', resultId: 'furnace', resultQty: 1, ingredients: [{ itemId: 'copper_ore', qty: 20 }, { itemId: 'stone', qty: 25 }], isCooking: false, spriteIndex: 56 },
  { id: 'craft_bee_house', name: 'Bee House', resultId: 'bee_house', resultQty: 1, ingredients: [{ itemId: 'wood', qty: 40 }, { itemId: 'coal', qty: 8 }, { itemId: 'iron_bar', qty: 1 }], isCooking: false, spriteIndex: 57 },

  // Cooking (kitchen)
  { id: 'cook_baked_potato', name: 'Baked Potato', resultId: 'baked_potato', resultQty: 1, ingredients: [{ itemId: 'potato', qty: 1 }], isCooking: true, spriteIndex: 42 },
  { id: 'cook_tomato_soup', name: 'Tomato Soup', resultId: 'tomato_soup', resultQty: 1, ingredients: [{ itemId: 'tomato', qty: 2 }], isCooking: true, spriteIndex: 43 },
  { id: 'cook_fish_stew', name: 'Fish Stew', resultId: 'fish_stew', resultQty: 1, ingredients: [{ itemId: 'trout', qty: 1 }, { itemId: 'tomato', qty: 1 }, { itemId: 'potato', qty: 1 }], isCooking: true, spriteIndex: 44 },
  { id: 'cook_farmers_lunch', name: "Farmer's Lunch", resultId: 'farmers_lunch', resultQty: 1, ingredients: [{ itemId: 'parsnip', qty: 1 }, { itemId: 'potato', qty: 1 }], isCooking: true, spriteIndex: 45 },
  { id: 'cook_miners_treat', name: "Miner's Treat", resultId: 'miners_treat', resultQty: 1, ingredients: [{ itemId: 'mushroom', qty: 2 }, { itemId: 'gold_bar', qty: 1 }], isCooking: true, spriteIndex: 46 },

  // Animal product recipes
  { id: 'cook_omelet', name: 'Omelet', resultId: 'omelet', resultQty: 1, ingredients: [{ itemId: 'egg', qty: 2 }, { itemId: 'milk', qty: 1 }], isCooking: true, spriteIndex: 46 },
  { id: 'craft_cheese_press', name: 'Cheese Press', resultId: 'cheese_press', resultQty: 1, ingredients: [{ itemId: 'wood', qty: 45 }, { itemId: 'stone', qty: 45 }, { itemId: 'copper_bar', qty: 1 }], isCooking: false, spriteIndex: 58 },
  { id: 'craft_mayo_machine', name: 'Mayo Machine', resultId: 'mayo_machine', resultQty: 1, ingredients: [{ itemId: 'wood', qty: 15 }, { itemId: 'stone', qty: 15 }, { itemId: 'copper_bar', qty: 1 }], isCooking: false, spriteIndex: 59 },
  { id: 'cook_pumpkin_soup', name: 'Pumpkin Soup', resultId: 'pumpkin_soup', resultQty: 1, ingredients: [{ itemId: 'pumpkin', qty: 1 }, { itemId: 'milk', qty: 1 }], isCooking: true, spriteIndex: 47 },
  { id: 'cook_blueberry_tart', name: 'Blueberry Tart', resultId: 'blueberry_tart', resultQty: 1, ingredients: [{ itemId: 'blueberry', qty: 3 }], isCooking: true, spriteIndex: 48 },
  { id: 'cook_corn_chowder', name: 'Corn Chowder', resultId: 'corn_chowder', resultQty: 1, ingredients: [{ itemId: 'corn', qty: 2 }, { itemId: 'milk', qty: 1 }], isCooking: true, spriteIndex: 49 },
  { id: 'craft_quality_sprinkler', name: 'Quality Sprinkler', resultId: 'quality_sprinkler', resultQty: 1, ingredients: [{ itemId: 'iron_bar', qty: 1 }, { itemId: 'gold_bar', qty: 1 }], isCooking: false, spriteIndex: 60 },
];

// ════════════════════════════════════════════════════════════
// FISH
// ════════════════════════════════════════════════════════════

export const FISH: FishDef[] = [
  { id: 'sardine', name: 'Sardine', seasons: [Season.SPRING, Season.SUMMER, Season.FALL, Season.WINTER], locations: [MapId.BEACH], timeOfDay: [TimeOfDay.MORNING, TimeOfDay.AFTERNOON], difficulty: Difficulty.EASY, sellPrice: 40, spriteIndex: 32 },
  { id: 'trout', name: 'Trout', seasons: [Season.SPRING, Season.SUMMER], locations: [MapId.FOREST, MapId.FARM], timeOfDay: [TimeOfDay.MORNING, TimeOfDay.EVENING], difficulty: Difficulty.EASY, sellPrice: 65, spriteIndex: 33 },
  { id: 'salmon', name: 'Salmon', seasons: [Season.FALL], locations: [MapId.FOREST], timeOfDay: [TimeOfDay.MORNING, TimeOfDay.AFTERNOON, TimeOfDay.EVENING], difficulty: Difficulty.MEDIUM, sellPrice: 75, spriteIndex: 34 },
  { id: 'catfish', name: 'Catfish', seasons: [Season.SPRING, Season.FALL], locations: [MapId.FOREST], timeOfDay: [TimeOfDay.EVENING, TimeOfDay.NIGHT], difficulty: Difficulty.HARD, sellPrice: 200, spriteIndex: 35 },
  { id: 'tuna', name: 'Tuna', seasons: [Season.SUMMER, Season.WINTER], locations: [MapId.BEACH], timeOfDay: [TimeOfDay.MORNING, TimeOfDay.AFTERNOON], difficulty: Difficulty.MEDIUM, sellPrice: 100, spriteIndex: 36 },
  { id: 'legendary_fish', name: 'Legend', seasons: [Season.SPRING], locations: [MapId.FOREST], timeOfDay: [TimeOfDay.MORNING], difficulty: Difficulty.HARD, sellPrice: 5000, spriteIndex: 37 },
];

// ════════════════════════════════════════════════════════════
// NPCs
// ════════════════════════════════════════════════════════════

export const NPCS: NPCDef[] = [
  {
    id: 'elena', name: 'Elena', marriageable: true,
    birthday: { season: Season.SPRING, day: 14 },
    lovedItems: ['cauliflower', 'amethyst', 'tomato_soup'],
    likedItems: ['parsnip', 'potato', 'wild_berries'],
    hatedItems: ['coal', 'stone'],
    defaultMap: MapId.TOWN, portraitIndex: 0, spriteIndex: 0,
    dialoguePool: {
      '0': ['Oh, hello. I don\'t think we\'ve met.', 'New around here?'],
      '1': ['Nice to see you again!', 'How\'s the farm coming along?'],
      '2': ['I always enjoy our chats.', 'Want to see my garden sometime?'],
      '3': ['You\'re so sweet to visit me.', 'I made you something!'],
      '4': ['I can\'t imagine life without you.', 'Every day with you is an adventure.'],
    }
  },
  {
    id: 'marcus', name: 'Marcus', marriageable: true,
    birthday: { season: Season.SUMMER, day: 8 },
    lovedItems: ['diamond', 'gold_bar', 'miners_treat'],
    likedItems: ['copper_ore', 'iron_ore', 'amethyst'],
    hatedItems: ['wild_berries', 'fiber'],
    defaultMap: MapId.MINE, portraitIndex: 1, spriteIndex: 1,
    dialoguePool: {
      '0': ['Watch your step in the mines.', 'Hmph.'],
      '1': ['You handle yourself well down there.', 'Need any ore?'],
      '2': ['I respect your work ethic.', 'Here, found this while digging.'],
      '3': ['You\'re tougher than you look.', 'I saved the best vein for you.'],
      '4': ['You complete me... like a full ore deposit.', 'Mining with you is the best.'],
    }
  },
  {
    id: 'lily', name: 'Lily', marriageable: true,
    birthday: { season: Season.FALL, day: 21 },
    lovedItems: ['melon', 'pumpkin', 'bouquet'],
    likedItems: ['blueberry', 'cranberry', 'honey'],
    hatedItems: ['iron_ore', 'coal'],
    defaultMap: MapId.BEACH, portraitIndex: 2, spriteIndex: 2,
    dialoguePool: {
      '0': ['Oh! The waves are beautiful today.', 'Are you new here?'],
      '1': ['It\'s nice having someone to talk to!', 'Do you like the beach?'],
      '2': ['I painted something for you!', 'Let\'s watch the sunset!'],
      '3': ['You make every day brighter.', 'I dream about you sometimes.'],
      '4': ['I love you with all my heart.', 'Let\'s grow old by the sea.'],
    }
  },
  {
    id: 'owen', name: 'Owen', marriageable: false,
    birthday: { season: Season.WINTER, day: 5 },
    lovedItems: ['gold_bar', 'ruby'],
    likedItems: ['copper_bar', 'iron_bar'],
    hatedItems: ['parsnip'],
    defaultMap: MapId.TOWN, portraitIndex: 3, spriteIndex: 3,
    dialoguePool: {
      '0': ['Welcome to the blacksmith shop.', 'Need something upgraded?'],
      '1': ['Bring me ore and I\'ll make you something nice.', 'Business is good!'],
      '2': ['You\'re one of my best customers!', 'Here, take this.'],
      '3': ['I consider you a true friend.', 'This one\'s on the house.'],
      '4': ['You\'re like family to me.', 'Best friends forever!'],
    }
  },
  {
    id: 'sage', name: 'Sage', marriageable: false,
    birthday: { season: Season.SPRING, day: 27 },
    lovedItems: ['emerald', 'mushroom', 'lucky_charm'],
    likedItems: ['wild_berries', 'fiber', 'sap'],
    hatedItems: ['gold_bar', 'diamond'],
    defaultMap: MapId.FOREST, portraitIndex: 4, spriteIndex: 4,
    dialoguePool: {
      '0': ['The forest speaks to those who listen.', 'Hmm, you have potential.'],
      '1': ['Nature rewards patience.', 'The spirits favor you.'],
      '2': ['I sense great harmony in you.', 'Let me teach you something.'],
      '3': ['You understand the old ways.', 'The forest protects its friends.'],
      '4': ['You are a true guardian of nature.', 'I am honored to call you friend.'],
    }
  },

];
