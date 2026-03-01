/**
 * Achievement System — tracks and triggers achievements based on game events
 * NEW FILE — does not modify any existing files
 */
import Phaser from 'phaser';
import { Events, Quality, PlayStats } from '../types';
import { ACHIEVEMENTS } from '../data/achievementData';

export interface AchievementState {
  unlocked: string[];    // achievement IDs
  shippedItems: string[]; // track unique shipped items
  cookedRecipes: string[];
  caughtFish: string[];
  grownCrops: string[];
  totalGoldEarned: number;
  questsCompleted: number;
  giftedNpcs: string[];
}

export class AchievementSystem {
  private scene: Phaser.Scene;
  private state: AchievementState;

  constructor(scene: Phaser.Scene, savedState?: AchievementState) {
    this.scene = scene;
    this.state = savedState ?? {
      unlocked: [], shippedItems: [], cookedRecipes: [],
      caughtFish: [], grownCrops: [], totalGoldEarned: 0,
      questsCompleted: 0, giftedNpcs: [],
    };
    this.setupListeners();
  }

  private setupListeners() {
    this.scene.events.on(Events.CROP_HARVESTED, (data: { cropId: string; qty: number; quality: Quality }) => {
      if (!this.state.grownCrops.includes(data.cropId)) this.state.grownCrops.push(data.cropId);
      this.check('first_harvest');
      if (data.quality === Quality.GOLD) this.check('gold_crop');
    });

    this.scene.events.on(Events.FISH_CAUGHT, (data: { fishId: string }) => {
      if (!this.state.caughtFish.includes(data.fishId)) this.state.caughtFish.push(data.fishId);
      this.check('first_fish');
      if (data.fishId === 'legendary_fish') this.check('catch_legendary');
    });

    this.scene.events.on(Events.ITEM_SHIPPED, (data: { itemId: string }) => {
      if (!this.state.shippedItems.includes(data.itemId)) this.state.shippedItems.push(data.itemId);
    });

    this.scene.events.on(Events.CRAFT_ITEM, (data: { recipeId: string }) => {
      if (data.recipeId.startsWith('cook_')) {
        if (!this.state.cookedRecipes.includes(data.recipeId)) this.state.cookedRecipes.push(data.recipeId);
        this.check('first_cook');
      } else {
        this.check('first_craft');
      }
    });

    this.scene.events.on(Events.GIFT_GIVEN, (data: { npcId: string }) => {
      if (!this.state.giftedNpcs.includes(data.npcId)) this.state.giftedNpcs.push(data.npcId);
    });

    this.scene.events.on(Events.QUEST_COMPLETED, () => {
      this.state.questsCompleted++;
      if (this.state.questsCompleted >= 10) this.check('complete_quests_10');
    });

    this.scene.events.on(Events.GOLD_CHANGE, (data: { amount: number }) => {
      if (data.amount > 0) this.state.totalGoldEarned += data.amount;
      if (this.state.totalGoldEarned >= 10000) this.check('earn_10k');
      if (this.state.totalGoldEarned >= 100000) this.check('earn_100k');
      if (this.state.totalGoldEarned >= 1000000) this.check('earn_1m');
    });

    this.scene.events.on(Events.TOOL_UPGRADE, () => this.check('upgrade_tool'));
    this.scene.events.on(Events.BUILDING_UPGRADE, (data: { buildingType: string; newLevel: number }) => {
      if (data.buildingType === 'house') {
        this.check('upgrade_house');
        if (data.newLevel >= 3) this.check('max_house');
      }
    });

    this.scene.events.on(Events.ANIMAL_PURCHASE, () => this.check('first_animal'));
    this.scene.events.on(Events.RELATIONSHIP_UP, (data: { newHearts: number }) => {
      if (data.newHearts >= 5) this.check('first_friend');
      if (data.newHearts >= 8) this.check('best_friend');
    });

    this.scene.events.on(Events.ENTER_MINE, (data: { floor: number }) => {
      this.check('first_mine');
      if (data.floor >= 25) this.check('mine_floor_25');
      if (data.floor >= 50) this.check('mine_floor_50');
      if (data.floor >= 100) this.check('mine_floor_100');
    });
  }

  private check(achievementId: string) {
    if (this.state.unlocked.includes(achievementId)) return;
    const ach = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!ach) return;

    this.state.unlocked.push(achievementId);
    this.scene.events.emit(Events.ACHIEVEMENT, { achievementId, name: ach.name });
  }

  /** Check stat-based achievements (call periodically) */
  checkStats(stats: PlayStats) {
    if (stats.cropsHarvested >= 100) this.check('harvest_100');
    if (stats.cropsHarvested >= 500) this.check('harvest_500');
    if (stats.fishCaught >= 20) this.check('catch_20');
  }

  /** Check year-based achievements */
  checkYear(year: number) {
    if (year >= 2) this.check('year_1');
    if (year >= 4) this.check('year_3');
  }

  isUnlocked(id: string): boolean { return this.state.unlocked.includes(id); }
  getUnlocked(): string[] { return this.state.unlocked; }
  getState(): AchievementState { return this.state; }
}
