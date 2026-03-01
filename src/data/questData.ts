import { Season } from '../types';

export interface QuestDef {
  id: string;
  name: string;
  description: string;
  type: 'collect' | 'ship' | 'catch' | 'mine' | 'gift' | 'cook' | 'harvest';
  targetId: string;
  targetQty: number;
  rewardGold: number;
  rewardItemId?: string;
  rewardItemQty?: number;
  season?: Season;       // If set, only appears in this season
  minHearts?: number;     // Min relationship with any NPC to unlock
  repeatable: boolean;
  npcId?: string;         // NPC who gives this quest
}

export const QUESTS: QuestDef[] = [
  // Spring quests
  { id: 'q_spring_parsnips', name: 'Spring Harvest', description: 'Bring 5 parsnips to Owen.', type: 'collect', targetId: 'parsnip', targetQty: 5, rewardGold: 250, season: Season.SPRING, npcId: 'owen', repeatable: false },
  { id: 'q_spring_fishing', name: 'First Catch', description: 'Catch 3 fish of any kind.', type: 'catch', targetId: '*', targetQty: 3, rewardGold: 300, rewardItemId: 'bait', rewardItemQty: 10, season: Season.SPRING, repeatable: false },
  { id: 'q_spring_cauliflower', name: 'Prized Cauliflower', description: 'Ship a gold-quality cauliflower.', type: 'ship', targetId: 'cauliflower', targetQty: 1, rewardGold: 500, season: Season.SPRING, repeatable: false },

  // Summer quests
  { id: 'q_summer_melons', name: 'Melon Madness', description: 'Harvest 10 melons.', type: 'harvest', targetId: 'melon', targetQty: 10, rewardGold: 600, season: Season.SUMMER, repeatable: false },
  { id: 'q_summer_tuna', name: 'Deep Sea Challenge', description: 'Catch 2 tuna.', type: 'catch', targetId: 'tuna', targetQty: 2, rewardGold: 400, season: Season.SUMMER, repeatable: false },
  { id: 'q_summer_tomato_soup', name: 'Elena\'s Request', description: 'Cook tomato soup for Elena.', type: 'cook', targetId: 'tomato_soup', targetQty: 1, rewardGold: 350, npcId: 'elena', season: Season.SUMMER, repeatable: false },

  // Fall quests
  { id: 'q_fall_pumpkin', name: 'Pumpkin Festival Prep', description: 'Grow 5 pumpkins for the festival.', type: 'harvest', targetId: 'pumpkin', targetQty: 5, rewardGold: 800, season: Season.FALL, repeatable: false },
  { id: 'q_fall_mining', name: 'Iron Rush', description: 'Mine 20 iron ore.', type: 'mine', targetId: 'iron_ore', targetQty: 20, rewardGold: 500, season: Season.FALL, repeatable: false },
  { id: 'q_fall_cranberry', name: 'Cranberry Harvest', description: 'Ship 15 cranberries.', type: 'ship', targetId: 'cranberry', targetQty: 15, rewardGold: 450, season: Season.FALL, repeatable: false },

  // Winter quests
  { id: 'q_winter_cooking', name: 'Winter Warmth', description: 'Cook 3 different recipes.', type: 'cook', targetId: '*', targetQty: 3, rewardGold: 600, season: Season.WINTER, repeatable: false },
  { id: 'q_winter_gold_ore', name: 'Gold Fever', description: 'Mine 10 gold ore.', type: 'mine', targetId: 'gold_ore', targetQty: 10, rewardGold: 700, season: Season.WINTER, repeatable: false },

  // Year-round / repeatable
  { id: 'q_ship_crops', name: 'Bulk Shipment', description: 'Ship 50 crops total.', type: 'ship', targetId: '*', targetQty: 50, rewardGold: 1000, repeatable: true },
  { id: 'q_catch_legendary', name: 'The Legend', description: 'Catch the legendary fish.', type: 'catch', targetId: 'legendary_fish', targetQty: 1, rewardGold: 5000, repeatable: false },
  { id: 'q_gift_friend', name: 'Making Friends', description: 'Give gifts to 3 different NPCs.', type: 'gift', targetId: '*', targetQty: 3, rewardGold: 200, repeatable: false },
  { id: 'q_mine_deep', name: 'Deep Delver', description: 'Reach floor 50 of the mine.', type: 'mine', targetId: 'floor', targetQty: 50, rewardGold: 2000, repeatable: false },

  // NPC-specific
  { id: 'q_sage_herbs', name: 'Sage\'s Research', description: 'Bring Sage 10 fiber and 5 sap.', type: 'collect', targetId: 'fiber', targetQty: 10, rewardGold: 300, npcId: 'sage', repeatable: false },
  { id: 'q_lily_flowers', name: 'Lily\'s Bouquet', description: 'Bring Lily 3 different crops.', type: 'collect', targetId: '*', targetQty: 3, rewardGold: 250, npcId: 'lily', repeatable: false },
  { id: 'q_owen_upgrade', name: 'Owen\'s Commission', description: 'Bring 5 copper bars to Owen.', type: 'collect', targetId: 'copper_bar', targetQty: 5, rewardGold: 500, rewardItemId: 'iron_bar', rewardItemQty: 3, npcId: 'owen', repeatable: false },
];
