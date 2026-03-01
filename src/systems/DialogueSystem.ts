import Phaser from 'phaser';
import {
  Assets,
  CalendarState,
  Events,
  NPCDef,
  NPCRelation,
  RelationshipState,
  Season,
  clamp,
} from '../types';
import { NPCS } from '../data/registry';

type GiftReaction = 'love' | 'like' | 'neutral' | 'hate';
type RelationTier = 'STRANGER' | 'ACQUAINTANCE' | 'FRIEND' | 'CLOSE_FRIEND' | 'DATING' | 'MARRIED';

type ReactionStyle = {
  emoji: string;
  color: string;
  label: string;
};

type TierDialogue = Record<RelationTier, string[]>;

type SpecialDialogue = {
  firstMeeting: string[];
  birthday: string[];
  rainy: string[];
  festival: string[];
  lovedGift: string[];
  likedGift: string[];
  neutralGift: string[];
  dislikedGift: string[];
};

type NPCDialoguePack = {
  tiers: TierDialogue;
  special: SpecialDialogue;
};

type GiftOutcome = {
  reaction: GiftReaction;
  heartDelta: number;
  line: string;
};

type SceneContext = Phaser.Scene & {
  relationships?: RelationshipState;
  calendar?: CalendarState;
  currentWeather?: string;
  stats?: { giftsGiven?: number };
};

const FESTIVAL_DAYS: Array<{ season: Season; day: number }> = [
  { season: Season.SPRING, day: 13 },
  { season: Season.SUMMER, day: 11 },
  { season: Season.FALL, day: 16 },
  { season: Season.WINTER, day: 25 },
];

const NPC_DIALOGUE: Record<string, NPCDialoguePack> = {
  owen: {
    tiers: {
      STRANGER: [
        'If you need steel, be specific.',
        'Workshop is hot today. Keep clear of the anvil.',
        'I can talk after this quench cools.',
      ],
      ACQUAINTANCE: [
        'You are getting the hang of farm tools.',
        'Good ore makes honest work. Keep bringing quality.',
        'I tuned your blade edge in my head all morning.',
      ],
      FRIEND: [
        'Bring me copper and iron bars. I can do something custom.',
        'A clean ruby catches the forge light better than any lamp.',
        'If you ever find spare bars, I never say no.',
      ],
      CLOSE_FRIEND: [
        'I learned blacksmithing from my mother right in this shop.',
        'When business is quiet, I still hear old hammer rhythms.',
        'I pretend to be all work, but your visits steady me.',
      ],
      DATING: [
        'You and I fit together like a perfect gear train.',
        'I keep one polished ring blank aside just in case.',
        'When you walk in, the forge feels warmer for good reasons.',
      ],
      MARRIED: [
        'I saved breakfast for you before opening the shop.',
        'Our home sounds better than any hammer strike now.',
        'I finished early so we can spend the evening together.',
      ],
    },
    special: {
      firstMeeting: [
        'Name is Owen. I run the forge and keep tools alive.',
        'New face. I am Owen. If it is metal, I can fix it.',
      ],
      birthday: [
        'You remembered my birthday. That means more than you know.',
        'Birthday visits beat any fancy celebration.',
      ],
      rainy: [
        'Rain hisses on hot steel. Best sound in town.',
        'Storm days are good for tempering. The shop breathes easier.',
      ],
      festival: [
        'Festival crowds track mud everywhere, but spirits are high.',
        'Even on festival days, someone needs a repair.',
      ],
      lovedGift: [
        'This is perfect. You know my taste better than most.',
      ],
      likedGift: [
        'Solid pick. I appreciate it.',
      ],
      neutralGift: [
        'Thanks. I will put it to use.',
      ],
      dislikedGift: [
        'I appreciate the thought, but this is not for me.',
      ],
    },
  },
  elena: {
    tiers: {
      STRANGER: [
        'Oh, hello. I am in the middle of pruning.',
        'The town is quiet this hour. It suits me.',
        'We have not spoken much yet, have we?',
      ],
      ACQUAINTANCE: [
        'My herb rows finally settled in this week.',
        'I saw your fields from the road. Nice progress.',
        'If you mulch early, spring crops hold moisture better.',
      ],
      FRIEND: [
        'I am fond of fresh vegetables and simple soups.',
        'Parsnips and potatoes are humble, but they make warm meals.',
        'If you find cauliflower in good shape, I get excited.',
      ],
      CLOSE_FRIEND: [
        'I moved here for peace after city life burned me out.',
        'Gardening helped me rebuild my nerves one morning at a time.',
        'You make this town feel less lonely to me.',
      ],
      DATING: [
        'When we walk together, even chores feel romantic.',
        'I keep imagining us sharing soup after sunset.',
        'You are the person I look for first every day.',
      ],
      MARRIED: [
        'I packed your lunch with extra care today.',
        'Home is softer with you in it.',
        'After supper, let us sit by the garden lights together.',
      ],
    },
    special: {
      firstMeeting: [
        'Hi, I am Elena. I tend the community garden beds.',
        'Welcome. I am Elena. You can usually find me near flowers.',
      ],
      birthday: [
        'You made my birthday feel truly special.',
        'I was hoping to see you today. Best birthday wish granted.',
      ],
      rainy: [
        'Rain does half my watering job for me.',
        'I love rainy days. The garden smells alive.',
      ],
      festival: [
        'Festival lanterns are lovely, but I still watch the flowers.',
        'I baked treats for the festival table this morning.',
      ],
      lovedGift: [
        'This is wonderful. You absolutely made my day!',
      ],
      likedGift: [
        'Thank you. This is really thoughtful.',
      ],
      neutralGift: [
        'Thanks for thinking of me.',
      ],
      dislikedGift: [
        'Oh... thank you, but this is hard for me to use.',
      ],
    },
  },
  sage: {
    tiers: {
      STRANGER: [
        'The forest tests strangers before it welcomes them.',
        'Step lightly. The roots remember heavy feet.',
        'Listen first. Speak second.',
      ],
      ACQUAINTANCE: [
        'You have started hearing the wind patterns, have you not?',
        'Mushrooms rise fastest where fallen logs stay undisturbed.',
        'Patience is a better tool than any axe.',
      ],
      FRIEND: [
        'I value wild berries and forest charms.',
        'Emerald tones calm the spirit better than bright gold.',
        'If you find mushrooms after rain, treat them with care.',
      ],
      CLOSE_FRIEND: [
        'I was not always called Sage. I chose that name later.',
        'Years ago, I left town life and never looked back.',
        'You are one of few people I trust with old stories.',
      ],
      DATING: [
        'The moon feels closer when you are beside me.',
        'I tied a small charm for us both to carry.',
        'You are the quiet joy I did not expect to find.',
      ],
      MARRIED: [
        'I brewed tea for us before dawn.',
        'Our home hums with the same calm as the old woods.',
        'Tonight let us walk under the cedar line together.',
      ],
    },
    special: {
      firstMeeting: [
        'People call me Sage. The forest is my workshop.',
        'I am Sage. If you seek calm, start by listening.',
      ],
      birthday: [
        'You honored my birthday. I will remember this.',
        'A quiet birthday with you is exactly right.',
      ],
      rainy: [
        'Rain wakes the understory. Perfect for foraging.',
        'Storm scent carries old memories through these trees.',
      ],
      festival: [
        'Festivals are noisy, but joy is still a kind of ritual.',
        'I brought herbs for the festival fire.',
      ],
      lovedGift: [
        'This resonates with me deeply. Thank you.',
      ],
      likedGift: [
        'A kind offering. I appreciate it.',
      ],
      neutralGift: [
        'Thank you. I will keep it close for now.',
      ],
      dislikedGift: [
        'I cannot pretend this suits me, but your intent matters.',
      ],
    },
  },
  lily: {
    tiers: {
      STRANGER: [
        'Hi... sorry, I was watching the tide.',
        'The sea is loud today. Hard to think straight.',
        'We have seen each other around, right?',
      ],
      ACQUAINTANCE: [
        'I sketched the shoreline this morning.',
        'Sunset colors were unreal yesterday.',
        'Beach mornings are best before the gulls wake up.',
      ],
      FRIEND: [
        'I adore sweet fruit, especially melon and pumpkin dishes.',
        'Honey and berries make long painting sessions easier.',
        'If you ever find a perfect melon, show me first.',
      ],
      CLOSE_FRIEND: [
        'I used to freeze whenever people looked at my art.',
        'You are the reason I started showing my paintings again.',
        'When I panic, I count waves until my breathing slows.',
      ],
      DATING: [
        'Every sunset feels like it is painted for us.',
        'I keep doodling your smile in my sketchbook margins.',
        'I am happiest when our footsteps match on the sand.',
      ],
      MARRIED: [
        'I left a little seashell note for you at home.',
        'You, me, tea, and sea air tonight. Perfect plan.',
        'Being your spouse still feels like a dream I get to keep.',
      ],
    },
    special: {
      firstMeeting: [
        'I am Lily. I paint by the water when I can.',
        'Hey, I am Lily. Sorry, I get lost in the waves.',
      ],
      birthday: [
        'You came on my birthday. I am so happy right now.',
        'Best birthday gift is seeing you here, honestly.',
      ],
      rainy: [
        'Rain on the sea makes everything look like watercolor.',
        'I love rainy beach days. Fewer crowds, softer light.',
      ],
      festival: [
        'Festival music carries all the way to the docks.',
        'I brought painted shells for the festival stalls.',
      ],
      lovedGift: [
        'Oh wow, I love this so much!',
      ],
      likedGift: [
        'This is lovely. Thank you!',
      ],
      neutralGift: [
        'Thanks! That is really kind of you.',
      ],
      dislikedGift: [
        'I am grateful, but this one is not really my thing.',
      ],
    },
  },
  marcus: {
    tiers: {
      STRANGER: [
        'Mind your footing. Mines are unforgiving.',
        'If you hear cracks overhead, move fast.',
        'No sightseeing underground.',
      ],
      ACQUAINTANCE: [
        'You are learning rock patterns quicker than most.',
        'Stick to reinforced tunnels until your gear improves.',
        'I marked a safer route on the east shaft wall.',
      ],
      FRIEND: [
        'Ores and gemstones always catch my eye.',
        'A good copper haul can turn any bad day around.',
        'If you ever find clean bars, I can trade pointers.',
      ],
      CLOSE_FRIEND: [
        'My father taught me mining before I could read.',
        'I lost friends in a cave-in years back. I still carry that.',
        'You make the tunnels feel less heavy.',
      ],
      DATING: [
        'I trust you with my back underground and with my heart.',
        'I carved our initials on a practice stone by my bench.',
        'No gem I find shines brighter than you do.',
      ],
      MARRIED: [
        'I checked your boots and packed your lunch already.',
        'Coming home to you is the best part of every shift.',
        'After dinner, tell me about your day. I want all of it.',
      ],
    },
    special: {
      firstMeeting: [
        'Marcus. Miner. Keep your lamp high and your head low.',
        'I am Marcus. If you are heading underground, stay alert.',
      ],
      birthday: [
        'You remembered my birthday. That means a lot.',
        'Could not ask for better birthday company.',
      ],
      rainy: [
        'Rain means slick ladders. Double-check every step.',
        'Wet weather shifts tunnel air. Stay sharp today.',
      ],
      festival: [
        'Festival noise is a change from tunnel echoes.',
        'I only stay at festivals for the grilled food.',
      ],
      lovedGift: [
        'This is exactly my kind of gift. Outstanding.',
      ],
      likedGift: [
        'Good choice. I appreciate it.',
      ],
      neutralGift: [
        'Thanks. I can make use of this.',
      ],
      dislikedGift: [
        'I get what you meant, but this is not for me.',
      ],
    },
  },
};

export class DialogueSystem {
  private scene: Phaser.Scene;

  private dialogueContainer?: Phaser.GameObjects.Container;
  private dialogueText?: Phaser.GameObjects.Text;
  private typewriterEvent?: Phaser.Time.TimerEvent;
  private dialogueCleanupInput?: () => void;
  private fullDialogueText = '';
  private typedChars = 0;
  private isTyping = false;
  private activeNpcId?: string;
  private dialogueInputEnabledAt = 0;

  private reactionContainer?: Phaser.GameObjects.Container;
  private reactionTween?: Phaser.Tweens.Tween;

  private choiceContainer?: Phaser.GameObjects.Container;
  private choiceCleanupFns: Array<() => void> = [];
  private choiceResolver?: (value: number) => void;

  private metNpcIds = new Set<string>();
  private bouquetGivenNpcIds = new Set<string>();

  private readonly onGiftGiven = (data: { npcId: string; itemId: string }) => {
    this.handleGiftGiven(data.npcId, data.itemId);
  };

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.scene.events.on(Events.GIFT_GIVEN, this.onGiftGiven);
    this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroy());
  }

  showDialogue(npcId: string, npcDef: NPCDef, hearts: number): void {
    const registryNpc = NPCS.find((npc) => npc.id === npcId);
    const sourceNpc = registryNpc ?? npcDef;
    const relState = this.getRelationshipState(npcId);
    const points = relState?.hearts ?? hearts;

    if ((relState?.relation ?? NPCRelation.STRANGER) >= NPCRelation.DATING) {
      this.bouquetGivenNpcIds.add(npcId);
    }

    const line = this.selectDialogueLine(sourceNpc, points);
    this.renderDialogue(sourceNpc, line);
  }

  showGiftReaction(npcName: string, reaction: GiftReaction): void {
    this.clearReaction();

    const styles: Record<GiftReaction, ReactionStyle> = {
      love: { emoji: '💖', color: '#ff69b4', label: 'loves this' },
      like: { emoji: '🙂', color: '#66cc66', label: 'likes this' },
      neutral: { emoji: '...', color: '#9a9a9a', label: 'feels neutral' },
      hate: { emoji: '😞', color: '#ff4444', label: 'dislikes this' },
    };

    const style = styles[reaction];
    const cam = this.scene.cameras.main;

    const container = this.scene.add
      .container(cam.width / 2, 115)
      .setDepth(1200)
      .setAlpha(0);

    const bg = this.scene.add.rectangle(0, 0, 350, 54, 0x000000, 0.8);
    bg.setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(style.color).color, 1);

    const text = this.scene.add
      .text(0, 0, `${style.emoji} ${npcName} ${style.label}`, {
        fontSize: '20px',
        color: style.color,
      })
      .setOrigin(0.5);

    container.add([bg, text]);
    this.reactionContainer = container;

    this.reactionTween = this.scene.tweens.add({
      targets: container,
      alpha: 1,
      y: 95,
      duration: 180,
      yoyo: false,
      onComplete: () => {
        this.reactionTween = this.scene.tweens.add({
          targets: container,
          alpha: 0,
          y: 75,
          delay: 1000,
          duration: 250,
          onComplete: () => this.clearReaction(),
        });
      },
    });
  }

  showChoice(prompt: string, choices: string[]): Promise<number> {
    this.clearChoice(-1);

    return new Promise<number>((resolve) => {
      this.choiceResolver = resolve;

      const cam = this.scene.cameras.main;
      const maxVisibleChoices = Math.max(1, Math.min(9, choices.length));
      const width = Math.min(620, Math.max(380, cam.width - 80));
      const height = 130 + maxVisibleChoices * 38;

      const container = this.scene.add
        .container(cam.width / 2, cam.height / 2)
        .setDepth(1300);

      const bg = this.scene.add.rectangle(0, 0, width, height, 0x101010, 0.94);
      bg.setStrokeStyle(2, 0xb0b0b0, 1);

      const promptText = this.scene.add
        .text(-width / 2 + 20, -height / 2 + 16, prompt, {
          fontSize: '20px',
          color: '#f4f4f4',
          wordWrap: { width: width - 40 },
        })
        .setOrigin(0, 0);

      container.add([bg, promptText]);

      for (let i = 0; i < maxVisibleChoices; i += 1) {
        const optionText = this.scene.add
          .text(-width / 2 + 28, -height / 2 + 62 + i * 36, `${i + 1}. ${choices[i]}`, {
            fontSize: '19px',
            color: '#e0e0e0',
          })
          .setOrigin(0, 0)
          .setInteractive({ useHandCursor: true });

        const over = () => optionText.setColor('#ffd166');
        const out = () => optionText.setColor('#e0e0e0');
        const choose = () => this.resolveChoice(i);

        optionText.on('pointerover', over);
        optionText.on('pointerout', out);
        optionText.on('pointerdown', choose);

        this.choiceCleanupFns.push(() => {
          optionText.off('pointerover', over);
          optionText.off('pointerout', out);
          optionText.off('pointerdown', choose);
        });

        container.add(optionText);
      }

      const keyboard = this.scene.input.keyboard;
      if (keyboard) {
        const keyHandlers: Array<{ event: string; handler: () => void }> = [];
        for (let i = 0; i < maxVisibleChoices; i += 1) {
          const event = `keydown-${i + 1}`;
          const handler = () => this.resolveChoice(i);
          keyboard.on(event, handler);
          keyHandlers.push({ event, handler });
        }

        const escHandler = () => this.resolveChoice(-1);
        keyboard.on('keydown-ESC', escHandler);

        this.choiceCleanupFns.push(() => {
          for (const { event, handler } of keyHandlers) {
            keyboard.off(event, handler);
          }
          keyboard.off('keydown-ESC', escHandler);
        });
      }

      this.choiceContainer = container;
    });
  }

  destroy(): void {
    this.scene.events.off(Events.GIFT_GIVEN, this.onGiftGiven);
    this.clearDialogue(true);
    this.clearReaction();
    this.clearChoice(-1);
  }

  private handleGiftGiven(npcId: string, itemId: string): void {
    const npc = NPCS.find((entry) => entry.id === npcId);
    const relationship = this.getRelationshipState(npcId);
    if (!npc || !relationship) return;

    if (relationship.giftedToday) {
      this.scene.events.emit(Events.TOAST, { message: 'Already gave a gift today.', color: '#aaaaaa' });
      return;
    }

    if (itemId === 'bouquet') {
      this.bouquetGivenNpcIds.add(npcId);
    }

    const isBirthday = this.isNpcBirthday(npc);
    const outcome = this.resolveGiftOutcome(npc, itemId, isBirthday);
    relationship.hearts = clamp(relationship.hearts + outcome.heartDelta * 100, 0, 1000);
    relationship.giftedToday = true;
    relationship.relation = this.resolveRelation(npc, relationship.hearts, this.hasBouquetAccess(npcId, relationship));

    const sceneWithState = this.scene as SceneContext;
    if (sceneWithState.stats && typeof sceneWithState.stats.giftsGiven === 'number') {
      sceneWithState.stats.giftsGiven += 1;
    }

    this.showGiftReaction(npc.name, outcome.reaction);
    this.scene.events.emit(Events.RELATIONSHIP_UP, { npcId, newHearts: relationship.hearts });
    this.scene.events.emit(Events.TOAST, {
      message: `${npc.name}: ${outcome.line}`,
      color: outcome.reaction === 'hate' ? '#ff6b6b' : '#ff99cc',
      duration: 2200,
    });

    this.renderDialogue(npc, outcome.line);
  }

  private renderDialogue(npc: NPCDef, line: string): void {
    this.clearDialogue(true);

    const cam = this.scene.cameras.main;
    const w = cam.width;

    const container = this.scene.add.container(0, 0).setDepth(1000);

    const bg = this.scene.add.rectangle(w / 2, 400, w, 150, 0x101010, 0.86);
    bg.setStrokeStyle(2, 0x404040, 1);

    const portrait = this.scene.add
      .sprite(76, 400, Assets.PORTRAITS, npc.portraitIndex)
      .setDisplaySize(96, 96);

    const nameColor = Phaser.Display.Color.HSLToColor(
      ((npc.portraitIndex * 53) % 360) / 360,
      0.65,
      0.6,
    ).color;

    const nameText = this.scene.add
      .text(140, 344, npc.name, {
        fontSize: '22px',
        color: `#${nameColor.toString(16).padStart(6, '0')}`,
        fontStyle: 'bold',
      })
      .setOrigin(0, 0.5);

    const dialogueText = this.scene.add
      .text(140, 382, '', {
        fontSize: '20px',
        color: '#f2f2f2',
        wordWrap: { width: Math.max(220, w - 165) },
      })
      .setOrigin(0, 0);

    const hintText = this.scene.add
      .text(w - 14, 462, '[E / SPACE / CLICK]', {
        fontSize: '12px',
        color: '#aaaaaa',
      })
      .setOrigin(1, 0.5);

    container.add([bg, portrait, nameText, dialogueText, hintText]);

    this.dialogueContainer = container;
    this.dialogueText = dialogueText;
    this.fullDialogueText = line;
    this.typedChars = 0;
    this.isTyping = true;
    this.activeNpcId = npc.id;
    this.dialogueInputEnabledAt = this.scene.time.now + 100;

    this.scene.events.emit(Events.DIALOGUE_START, {
      npcId: npc.id,
      text: line,
      portraitIndex: npc.portraitIndex,
    });

    this.typewriterEvent = this.scene.time.addEvent({
      delay: 30,
      loop: true,
      callback: () => {
        if (!this.dialogueText) return;

        this.typedChars += 1;
        this.dialogueText.setText(this.fullDialogueText.slice(0, this.typedChars));

        if (this.typedChars >= this.fullDialogueText.length) {
          this.finishTypewriter();
        }
      },
    });

    const advance = () => {
      if (this.scene.time.now < this.dialogueInputEnabledAt) return;

      if (this.isTyping) {
        this.finishTypewriter();
        return;
      }

      this.clearDialogue(true);
    };

    const pointerHandler = () => advance();
    this.scene.input.on('pointerdown', pointerHandler);

    const keyboard = this.scene.input.keyboard;
    let spaceHandler: (() => void) | undefined;
    let eHandler: (() => void) | undefined;
    if (keyboard) {
      spaceHandler = () => advance();
      eHandler = () => advance();
      keyboard.on('keydown-SPACE', spaceHandler);
      keyboard.on('keydown-E', eHandler);
    }

    this.dialogueCleanupInput = () => {
      this.scene.input.off('pointerdown', pointerHandler);
      if (keyboard && spaceHandler) {
        keyboard.off('keydown-SPACE', spaceHandler);
      }
      if (keyboard && eHandler) {
        keyboard.off('keydown-E', eHandler);
      }
    };
  }

  private getRelationshipState(npcId: string): RelationshipState[string] | undefined {
    const sceneWithRelationships = this.scene as SceneContext;
    return sceneWithRelationships.relationships?.[npcId];
  }

  private resolveGiftOutcome(npc: NPCDef, itemId: string, isBirthday: boolean): GiftOutcome {
    const dialogue = this.getDialoguePack(npc.id);

    if (npc.lovedItems.includes(itemId)) {
      return {
        reaction: 'love',
        heartDelta: isBirthday ? 6 : 3,
        line: this.pick(dialogue.special.lovedGift),
      };
    }

    if (npc.likedItems.includes(itemId)) {
      return {
        reaction: 'like',
        heartDelta: isBirthday ? 2 : 1,
        line: this.pick(dialogue.special.likedGift),
      };
    }

    if (npc.hatedItems.includes(itemId)) {
      return {
        reaction: 'hate',
        heartDelta: -1,
        line: this.pick(dialogue.special.dislikedGift),
      };
    }

    return {
      reaction: 'neutral',
      heartDelta: 0,
      line: this.pick(dialogue.special.neutralGift),
    };
  }

  private selectDialogueLine(npc: NPCDef, hearts: number): string {
    const dialogue = this.getDialoguePack(npc.id);

    if (!this.metNpcIds.has(npc.id)) {
      this.metNpcIds.add(npc.id);
      return this.pick(dialogue.special.firstMeeting);
    }

    if (this.isNpcBirthday(npc)) {
      return this.pick(dialogue.special.birthday);
    }

    if (this.isFestivalDay()) {
      return this.pick(dialogue.special.festival);
    }

    if (this.isRainyDay()) {
      return this.pick(dialogue.special.rainy);
    }

    const relationship = this.getRelationshipState(npc.id);
    const bouquetAccess = this.hasBouquetAccess(npc.id, relationship);
    const relation = this.resolveRelation(npc, hearts, bouquetAccess);
    return this.pick(dialogue.tiers[this.relationToTier(relation)]);
  }

  private hasBouquetAccess(npcId: string, relationship?: RelationshipState[string]): boolean {
    return this.bouquetGivenNpcIds.has(npcId) || (relationship?.relation ?? NPCRelation.STRANGER) >= NPCRelation.DATING;
  }

  private resolveRelation(npc: NPCDef, heartPoints: number, hasBouquet: boolean): NPCRelation {
    const hearts = Phaser.Math.Clamp(Math.floor(heartPoints / 100), 0, 10);
    if (hearts >= 10) return NPCRelation.MARRIED;
    if (hearts >= 8 && npc.marriageable && hasBouquet) return NPCRelation.DATING;
    if (hearts >= 6) return NPCRelation.CLOSE_FRIEND;
    if (hearts >= 4) return NPCRelation.FRIEND;
    if (hearts >= 2) return NPCRelation.ACQUAINTANCE;
    return NPCRelation.STRANGER;
  }

  private relationToTier(relation: NPCRelation): RelationTier {
    switch (relation) {
      case NPCRelation.ACQUAINTANCE:
        return 'ACQUAINTANCE';
      case NPCRelation.FRIEND:
        return 'FRIEND';
      case NPCRelation.CLOSE_FRIEND:
        return 'CLOSE_FRIEND';
      case NPCRelation.DATING:
        return 'DATING';
      case NPCRelation.MARRIED:
        return 'MARRIED';
      case NPCRelation.STRANGER:
      default:
        return 'STRANGER';
    }
  }

  private isNpcBirthday(npc: NPCDef): boolean {
    const calendar = (this.scene as SceneContext).calendar;
    if (!calendar) return false;
    return calendar.season === npc.birthday.season && calendar.day === npc.birthday.day;
  }

  private isFestivalDay(): boolean {
    const calendar = (this.scene as SceneContext).calendar;
    if (!calendar) return false;
    return FESTIVAL_DAYS.some((festival) => festival.season === calendar.season && festival.day === calendar.day);
  }

  private isRainyDay(): boolean {
    const weather = (this.scene as SceneContext).currentWeather;
    if (!weather) return false;
    const normalized = weather.toLowerCase();
    return normalized.includes('rain') || normalized.includes('storm');
  }

  private getDialoguePack(npcId: string): NPCDialoguePack {
    return NPC_DIALOGUE[npcId] ?? NPC_DIALOGUE.elena;
  }

  private pick(pool: string[]): string {
    if (pool.length === 0) return '...';
    const index = Math.floor(Math.random() * pool.length);
    return pool[index] ?? '...';
  }

  private finishTypewriter(): void {
    if (!this.dialogueText) return;

    if (this.typewriterEvent) {
      this.typewriterEvent.remove(false);
      this.typewriterEvent = undefined;
    }

    this.isTyping = false;
    this.typedChars = this.fullDialogueText.length;
    this.dialogueText.setText(this.fullDialogueText);
  }

  private clearDialogue(emitEnd: boolean): void {
    if (this.typewriterEvent) {
      this.typewriterEvent.remove(false);
      this.typewriterEvent = undefined;
    }

    if (this.dialogueCleanupInput) {
      this.dialogueCleanupInput();
      this.dialogueCleanupInput = undefined;
    }

    if (this.dialogueContainer) {
      this.dialogueContainer.destroy(true);
      this.dialogueContainer = undefined;
    }

    this.dialogueText = undefined;
    this.fullDialogueText = '';
    this.typedChars = 0;
    this.isTyping = false;

    if (emitEnd && this.activeNpcId) {
      this.scene.events.emit(Events.DIALOGUE_END, { npcId: this.activeNpcId });
    }
    this.activeNpcId = undefined;
  }

  private clearReaction(): void {
    if (this.reactionTween) {
      this.reactionTween.stop();
      this.reactionTween = undefined;
    }

    if (this.reactionContainer) {
      this.reactionContainer.destroy(true);
      this.reactionContainer = undefined;
    }
  }

  private resolveChoice(index: number): void {
    if (!this.choiceResolver) return;

    const resolve = this.choiceResolver;
    this.choiceResolver = undefined;

    this.clearChoice();
    resolve(index);
  }

  private clearChoice(resolveIndex?: number): void {
    for (const cleanup of this.choiceCleanupFns) {
      cleanup();
    }
    this.choiceCleanupFns = [];

    if (this.choiceContainer) {
      this.choiceContainer.destroy(true);
      this.choiceContainer = undefined;
    }

    if (this.choiceResolver && resolveIndex !== undefined) {
      const resolve = this.choiceResolver;
      this.choiceResolver = undefined;
      resolve(resolveIndex);
    }
  }
}

export default DialogueSystem;
