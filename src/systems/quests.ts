/**
 * Quest System — manages quest board, active quests, progress tracking, completion
 * NEW FILE — does not modify any existing files
 */
import Phaser from 'phaser';
import { Events, Quality } from '../types';
import { QuestDef, QUESTS } from '../data/questData';

export interface ActiveQuest {
  questId: string;
  progress: number;
  completed: boolean;
  turnedIn: boolean;
}

export interface QuestSystemState {
  active: ActiveQuest[];
  completed: string[];  // quest IDs that have been turned in
}

export class QuestSystem {
  private scene: Phaser.Scene;
  private state: QuestSystemState;

  constructor(scene: Phaser.Scene, savedState?: QuestSystemState) {
    this.scene = scene;
    this.state = savedState ?? { active: [], completed: [] };
    this.setupListeners();
  }

  private setupListeners() {
    // Track crop harvests
    this.scene.events.on(Events.CROP_HARVESTED, (data: { cropId: string; qty: number; quality: Quality }) => {
      this.incrementProgress('harvest', data.cropId, data.qty);
    });

    // Track items shipped
    this.scene.events.on(Events.ITEM_SHIPPED, (data: { itemId: string; qty: number }) => {
      this.incrementProgress('ship', data.itemId, data.qty);
    });

    // Track fish caught
    this.scene.events.on(Events.FISH_CAUGHT, (data: { fishId: string }) => {
      this.incrementProgress('catch', data.fishId, 1);
    });

    // Track monster kills (proxy for mining)
    this.scene.events.on(Events.MONSTER_KILLED, () => {
      this.incrementProgress('mine', '*', 1);
    });

    // Track gifts given
    this.scene.events.on(Events.GIFT_GIVEN, (data: { npcId: string }) => {
      this.incrementProgress('gift', data.npcId, 1);
    });

    // Track crafting
    this.scene.events.on(Events.CRAFT_ITEM, (data: { recipeId: string }) => {
      // Extract result ID from recipe ID (e.g., 'cook_tomato_soup' -> 'tomato_soup')
      const resultId = data.recipeId.replace(/^(cook_|craft_)/, '');
      this.incrementProgress('cook', resultId, 1);
    });
  }

  private incrementProgress(type: string, targetId: string, amount: number) {
    for (const aq of this.state.active) {
      if (aq.completed || aq.turnedIn) continue;
      const def = QUESTS.find(q => q.id === aq.questId);
      if (!def || def.type !== type) continue;
      if (def.targetId !== '*' && def.targetId !== targetId) continue;

      aq.progress = Math.min(aq.progress + amount, def.targetQty);
      this.scene.events.emit(Events.QUEST_PROGRESS, {
        questId: aq.questId, current: aq.progress, target: def.targetQty
      });

      if (aq.progress >= def.targetQty) {
        aq.completed = true;
        this.scene.events.emit(Events.TOAST, {
          message: `Quest complete: ${def.name}!`, color: '#ffdd44'
        });
      }
    }
  }

  /** Get quests available at the quest board for current season */
  getAvailableQuests(season: string): QuestDef[] {
    return QUESTS.filter(q => {
      // Already active or completed (non-repeatable)
      if (this.state.active.some(a => a.questId === q.id && !a.turnedIn)) return false;
      if (!q.repeatable && this.state.completed.includes(q.id)) return false;
      // Season filter
      if (q.season && q.season !== season) return false;
      return true;
    });
  }

  /** Accept a quest from the board */
  acceptQuest(questId: string): boolean {
    if (this.state.active.some(a => a.questId === questId && !a.turnedIn)) return false;
    if (this.state.active.filter(a => !a.turnedIn).length >= 5) return false; // max 5 active

    this.state.active.push({ questId, progress: 0, completed: false, turnedIn: false });
    const def = QUESTS.find(q => q.id === questId);
    this.scene.events.emit(Events.QUEST_ACCEPTED, { questId });
    this.scene.events.emit(Events.TOAST, {
      message: `Accepted: ${def?.name ?? questId}`, color: '#44aaff'
    });
    return true;
  }

  /** Turn in a completed quest, returns reward info */
  turnInQuest(questId: string): { gold: number; itemId?: string; itemQty?: number } | null {
    const aq = this.state.active.find(a => a.questId === questId && a.completed && !a.turnedIn);
    if (!aq) return null;

    const def = QUESTS.find(q => q.id === questId);
    if (!def) return null;

    aq.turnedIn = true;
    this.state.completed.push(questId);
    this.scene.events.emit(Events.QUEST_COMPLETED, { questId });

    return {
      gold: def.rewardGold,
      itemId: def.rewardItemId,
      itemQty: def.rewardItemQty,
    };
  }

  /** Get currently active (not turned in) quests */
  getActiveQuests(): Array<{ def: QuestDef; progress: number; completed: boolean }> {
    return this.state.active
      .filter(a => !a.turnedIn)
      .map(a => {
        const def = QUESTS.find(q => q.id === a.questId)!;
        return { def, progress: a.progress, completed: a.completed };
      })
      .filter(x => x.def);
  }

  getState(): QuestSystemState { return this.state; }
}
