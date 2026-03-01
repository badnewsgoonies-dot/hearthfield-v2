import Phaser from 'phaser';
import { Events, Season } from '../types';

export interface StoryFlags {
  firstHarvest: boolean;
  firstShip: boolean;
  firstFish: boolean;
  reachedMineFloor10: boolean;
  reachedMineFloor25: boolean;
  reachedMineFloor50: boolean;
  firstAnimalPurchase: boolean;
  firstCraft: boolean;
  firstCook: boolean;
  metAllNPCs: boolean;
  firstFriendship: boolean; // any NPC at 4+ hearts
  firstDateNPC: boolean; // any NPC at DATING status
  completedFirstQuest: boolean;
  completed5Quests: boolean;
  survivedFirstWinter: boolean;
  earned10000Gold: boolean;
  earned50000Gold: boolean;
  upgradedHouse: boolean;
  upgradedTool: boolean;
  year2Reached: boolean;
}

const DEFAULT_FLAGS: StoryFlags = {
  firstHarvest: false,
  firstShip: false,
  firstFish: false,
  reachedMineFloor10: false,
  reachedMineFloor25: false,
  reachedMineFloor50: false,
  firstAnimalPurchase: false,
  firstCraft: false,
  firstCook: false,
  metAllNPCs: false,
  firstFriendship: false,
  firstDateNPC: false,
  completedFirstQuest: false,
  completed5Quests: false,
  survivedFirstWinter: false,
  earned10000Gold: false,
  earned50000Gold: false,
  upgradedHouse: false,
  upgradedTool: false,
  year2Reached: false,
};

export class StorySystem {
  private scene: Phaser.Scene;
  private flags: StoryFlags;
  private questsCompleted: number = 0;
  private npcsMet: Set<string> = new Set();
  private totalGoldEarned: number = 0;

  constructor(scene: Phaser.Scene, savedFlags?: StoryFlags) {
    this.scene = scene;
    this.flags = savedFlags ? { ...DEFAULT_FLAGS, ...savedFlags } : { ...DEFAULT_FLAGS };
    this.setupListeners();
  }

  private setupListeners() {
    this.scene.events.on(Events.CROP_HARVESTED, () => {
      this.setFlag('firstHarvest', '🌾 First harvest! You\'re a real farmer now.');
    });

    this.scene.events.on(Events.ITEM_SHIPPED, () => {
      this.setFlag('firstShip', '📦 First shipment! Check the gold tomorrow morning.');
    });

    this.scene.events.on(Events.FISH_CAUGHT, () => {
      this.setFlag('firstFish', '🐟 First catch! Try different spots for rare fish.');
    });

    this.scene.events.on(Events.CRAFT_ITEM, () => {
      this.setFlag('firstCraft', '🔨 First craft! Check the crafting bench for more recipes.');
    });

    this.scene.events.on(Events.QUEST_PROGRESS, (data: { questId: string; current: number; target: number }) => {
      if (data.current >= data.target) {
        this.questsCompleted++;
        if (!this.flags.completedFirstQuest) {
          this.setFlag('completedFirstQuest', '⭐ First quest complete! Visit the quest board to collect your reward.');
        }
        if (this.questsCompleted >= 5) {
          this.setFlag('completed5Quests', '🏆 5 quests completed! You\'re becoming a local legend.');
        }
      }
    });

    this.scene.events.on(Events.GOLD_CHANGE, (data: { amount?: number; newTotal?: number }) => {
      if (data.amount && data.amount > 0) {
        this.totalGoldEarned += data.amount;
        if (this.totalGoldEarned >= 10000 && !this.flags.earned10000Gold) {
          this.setFlag('earned10000Gold', '💰 10,000 gold earned! Your farm is thriving.');
        }
        if (this.totalGoldEarned >= 50000 && !this.flags.earned50000Gold) {
          this.setFlag('earned50000Gold', '💎 50,000 gold! You\'re the richest farmer in the valley.');
        }
      }
    });

    this.scene.events.on(Events.BUILDING_UPGRADE, () => {
      this.setFlag('upgradedHouse', '🏠 House upgraded! Check inside for new features.');
    });

    this.scene.events.on(Events.TOOL_UPGRADE, () => {
      this.setFlag('upgradedTool', '⚒️ Tool upgraded! It\'s more efficient now.');
    });

    this.scene.events.on(Events.SEASON_CHANGE, (data: { newSeason: Season; year: number }) => {
      if (data.newSeason === Season.SPRING && data.year >= 2) {
        this.setFlag('survivedFirstWinter', '❄️ You survived your first winter! Spring has come.');
        if (data.year >= 2) {
          this.setFlag('year2Reached', '📅 Year 2! The farm feels like home now.');
        }
      }
    });
  }

  private setFlag(flag: keyof StoryFlags, message: string) {
    if (this.flags[flag]) return; // already triggered
    this.flags[flag] = true;
    this.scene.events.emit(Events.TOAST, { message, color: '#ffcc00', duration: 4000 });
    this.scene.events.emit('story:flag', { flag, message });
  }

  getFlags(): StoryFlags {
    return { ...this.flags };
  }

  hasFlag(flag: keyof StoryFlags): boolean {
    return this.flags[flag];
  }

  getState(): { flags: StoryFlags; questsCompleted: number; totalGoldEarned: number } {
    return { flags: this.flags, questsCompleted: this.questsCompleted, totalGoldEarned: this.totalGoldEarned };
  }
}
