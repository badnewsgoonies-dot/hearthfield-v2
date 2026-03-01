import { Achievement } from '../types';

export const ACHIEVEMENTS: Achievement[] = [
  // Farming
  { id: 'first_harvest', name: 'Green Thumb', description: 'Harvest your first crop.', icon: '🌱' },
  { id: 'harvest_100', name: 'Master Farmer', description: 'Harvest 100 crops.', icon: '🌾' },
  { id: 'harvest_500', name: 'Agricultural Legend', description: 'Harvest 500 crops.', icon: '👑' },
  { id: 'all_crops', name: 'Crop Collector', description: 'Grow every type of crop.', icon: '🌿' },
  { id: 'gold_crop', name: 'Golden Harvest', description: 'Harvest a gold-quality crop.', icon: '⭐' },

  // Fishing
  { id: 'first_fish', name: 'Angler', description: 'Catch your first fish.', icon: '🐟' },
  { id: 'catch_20', name: 'Fisher', description: 'Catch 20 fish.', icon: '🎣' },
  { id: 'catch_legendary', name: 'Legendary Angler', description: 'Catch the legendary fish.', icon: '🏆' },
  { id: 'all_fish', name: 'Master Angler', description: 'Catch every type of fish.', icon: '🐠' },

  // Mining
  { id: 'first_mine', name: 'Spelunker', description: 'Enter the mine.', icon: '⛏️' },
  { id: 'mine_floor_25', name: 'Miner', description: 'Reach floor 25.', icon: '🪨' },
  { id: 'mine_floor_50', name: 'Deep Delver', description: 'Reach floor 50.', icon: '💎' },
  { id: 'mine_floor_100', name: 'Subterranean', description: 'Reach floor 100.', icon: '🔥' },

  // Social
  { id: 'first_friend', name: 'Friendly', description: 'Reach 5 hearts with someone.', icon: '💛' },
  { id: 'best_friend', name: 'Best Friends', description: 'Reach 8 hearts with someone.', icon: '💜' },
  { id: 'dating', name: 'Sweetheart', description: 'Start dating someone.', icon: '💕' },
  { id: 'married', name: 'Hitched', description: 'Get married.', icon: '💍' },
  { id: 'all_friends', name: 'Popular', description: 'Reach 5+ hearts with every NPC.', icon: '🌟' },

  // Money
  { id: 'earn_10k', name: 'Comfortable', description: 'Earn 10,000g total.', icon: '💰' },
  { id: 'earn_100k', name: 'Wealthy', description: 'Earn 100,000g total.', icon: '💎' },
  { id: 'earn_1m', name: 'Millionaire', description: 'Earn 1,000,000g total.', icon: '👑' },

  // Crafting
  { id: 'first_craft', name: 'Tinkerer', description: 'Craft your first item.', icon: '🔧' },
  { id: 'first_cook', name: 'Home Cook', description: 'Cook your first meal.', icon: '🍳' },
  { id: 'all_recipes', name: 'Master Chef', description: 'Cook every recipe.', icon: '👨‍🍳' },

  // Upgrades
  { id: 'upgrade_tool', name: 'Better Tools', description: 'Upgrade a tool.', icon: '⚒️' },
  { id: 'upgrade_house', name: 'Home Improvement', description: 'Upgrade your house.', icon: '🏠' },
  { id: 'max_house', name: 'Dream Home', description: 'Fully upgrade your house.', icon: '🏰' },

  // Animals
  { id: 'first_animal', name: 'Rancher', description: 'Purchase your first animal.', icon: '🐔' },
  { id: 'happy_animals', name: 'Animal Friend', description: 'Have 5 animals at max happiness.', icon: '🐄' },

  // Milestones
  { id: 'year_1', name: 'One Year', description: 'Complete your first year.', icon: '📅' },
  { id: 'year_3', name: 'Veteran Farmer', description: 'Complete three years.', icon: '🗓️' },
  { id: 'ship_everything', name: 'Full Shipment', description: 'Ship every item at least once.', icon: '📦' },
  { id: 'complete_quests_10', name: 'Helpful Neighbor', description: 'Complete 10 quests.', icon: '📋' },
];
