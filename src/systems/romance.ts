/**
 * Romance System — gift reactions, heart progression, dating, marriage
 * NEW FILE — does not modify any existing files
 */
import Phaser from 'phaser';
import { Events, NPCRelation, RelationshipData, RelationshipState } from '../types';
import { NPCS } from '../data/registry';

export interface RomanceState {
  relationships: RelationshipState;
  spouse?: string;
  weddingDay?: { day: number; season: string; year: number };
}

interface GiftPreference {
  loved: string[];
  liked: string[];
  disliked: string[];
  hated: string[];
}

// Gift preference table per NPC
const GIFT_PREFS: Record<string, GiftPreference> = {
  lily:  { loved: ['melon','pumpkin','cauliflower'], liked: ['tomato','blueberry','corn'], disliked: ['stone','coal'], hated: ['sap','clay'] },
  owen:  { loved: ['copper_bar','iron_bar','gold_bar'], liked: ['copper_ore','iron_ore','gold_ore'], disliked: ['fiber','sap'], hated: ['clay'] },
  elena: { loved: ['tomato_soup','fish_stew','farmers_lunch'], liked: ['baked_potato','tomato'], disliked: ['stone','coal'], hated: ['sap'] },
  sage:  { loved: ['legendary_fish','pumpkin'], liked: ['salmon','catfish','tuna'], disliked: ['coal','stone'], hated: ['clay'] },
  marcus: { loved: ['iron_bar','gold_bar','stone'], liked: ['copper_ore','iron_ore','coal'], disliked: ['daffodil','sweet_pea'], hated: ['dandelion'] },
};

export class RomanceSystem {
  private scene: Phaser.Scene;
  private state: RomanceState;

  constructor(scene: Phaser.Scene, savedState?: RomanceState) {
    this.scene = scene;
    this.state = savedState ?? { relationships: {} };
    this.initRelationships();
  }

  private initRelationships() {
    for (const npc of NPCS) {
      if (!this.state.relationships[npc.id]) {
        this.state.relationships[npc.id] = {
          hearts: 0,
          maxHearts: npc.marriageable ? 10 : 8,
          talkedToday: false,
          giftedToday: false,
          giftsThisWeek: 0,
          relation: NPCRelation.STRANGER,
        };
      }
    }
  }

  /** Process talking to NPC — +10 friendship points per day */
  onTalk(npcId: string) {
    const rel = this.state.relationships[npcId];
    if (!rel || rel.talkedToday) return;
    rel.talkedToday = true;
    this.addFriendship(npcId, 10);
  }

  /** Process gift — returns reaction type */
  onGift(npcId: string, itemId: string): 'loved' | 'liked' | 'neutral' | 'disliked' | 'hated' {
    const rel = this.state.relationships[npcId];
    if (!rel) return 'neutral';
    if (rel.giftedToday) return 'neutral';
    if (rel.giftsThisWeek >= 2) return 'neutral';

    rel.giftedToday = true;
    rel.giftsThisWeek++;

    const prefs = GIFT_PREFS[npcId];
    let reaction: 'loved' | 'liked' | 'neutral' | 'disliked' | 'hated' = 'neutral';
    let points = 20; // neutral

    if (prefs) {
      if (prefs.loved.includes(itemId)) { reaction = 'loved'; points = 80; }
      else if (prefs.liked.includes(itemId)) { reaction = 'liked'; points = 45; }
      else if (prefs.hated.includes(itemId)) { reaction = 'hated'; points = -40; }
      else if (prefs.disliked.includes(itemId)) { reaction = 'disliked'; points = -20; }
    }

    this.addFriendship(npcId, points);

    const messages: Record<string, string> = {
      loved: 'I love this! Thank you so much!',
      liked: 'Oh, this is nice! Thanks!',
      neutral: 'Thank you.',
      disliked: 'This isn\'t really my thing...',
      hated: 'Why would you give me this?!',
    };
    this.scene.events.emit(Events.TOAST, {
      message: messages[reaction], color: reaction === 'loved' ? '#ff44aa' : reaction === 'hated' ? '#ff4444' : '#ffffff'
    });

    return reaction;
  }

  private addFriendship(npcId: string, points: number) {
    const rel = this.state.relationships[npcId];
    if (!rel) return;

    const oldHearts = rel.hearts;
    rel.hearts = Math.max(0, Math.min(rel.maxHearts * 250, rel.hearts + points));
    const newHeartLevel = Math.floor(rel.hearts / 250);
    const oldHeartLevel = Math.floor(oldHearts / 250);

    if (newHeartLevel > oldHeartLevel) {
      this.scene.events.emit(Events.RELATIONSHIP_UP, { npcId, newHearts: newHeartLevel });
      this.scene.events.emit(Events.TOAST, {
        message: `♥ ${newHeartLevel} hearts with ${NPCS.find(n => n.id === npcId)?.name ?? npcId}`, color: '#ff88cc'
      });
    }

    // Update relation level
    if (newHeartLevel >= 8 && rel.relation < NPCRelation.CLOSE_FRIEND) {
      rel.relation = NPCRelation.CLOSE_FRIEND;
    } else if (newHeartLevel >= 5 && rel.relation < NPCRelation.FRIEND) {
      rel.relation = NPCRelation.FRIEND;
    } else if (newHeartLevel >= 2 && rel.relation < NPCRelation.ACQUAINTANCE) {
      rel.relation = NPCRelation.ACQUAINTANCE;
    }
  }

  /** Give bouquet to start dating (requires 8 hearts, NPC must be romanceable) */
  giveBouquet(npcId: string): boolean {
    const rel = this.state.relationships[npcId];
    const npc = NPCS.find(n => n.id === npcId);
    if (!rel || !npc?.marriageable) return false;
    if (Math.floor(rel.hearts / 250) < 8) return false;
    if (rel.relation >= NPCRelation.DATING) return false;

    rel.relation = NPCRelation.DATING;
    rel.maxHearts = 10;
    this.scene.events.emit(Events.TOAST, {
      message: `You are now dating ${npc.name}!`, color: '#ff44aa'
    });
    return true;
  }

  /** Propose with pendant (requires 10 hearts, dating) */
  propose(npcId: string): boolean {
    const rel = this.state.relationships[npcId];
    const npc = NPCS.find(n => n.id === npcId);
    if (!rel || !npc?.marriageable) return false;
    if (rel.relation !== NPCRelation.DATING) return false;
    if (Math.floor(rel.hearts / 250) < 10) return false;

    rel.relation = NPCRelation.MARRIED;
    this.state.spouse = npcId;
    this.scene.events.emit(Events.TOAST, {
      message: `${npc.name} said yes! Wedding in 3 days!`, color: '#ffdd44'
    });
    return true;
  }

  /** Reset daily flags — call at day start */
  onDayStart() {
    for (const rel of Object.values(this.state.relationships)) {
      rel.talkedToday = false;
      rel.giftedToday = false;
    }
  }

  /** Reset weekly gift count — call when day % 7 === 0 */
  onWeekStart() {
    for (const rel of Object.values(this.state.relationships)) {
      rel.giftsThisWeek = 0;
    }
  }

  getHeartLevel(npcId: string): number {
    const rel = this.state.relationships[npcId];
    return rel ? Math.floor(rel.hearts / 250) : 0;
  }

  getRelation(npcId: string): NPCRelation {
    return this.state.relationships[npcId]?.relation ?? NPCRelation.STRANGER;
  }

  getState(): RomanceState { return this.state; }
}
