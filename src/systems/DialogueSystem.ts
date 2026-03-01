import Phaser from 'phaser';
import { Assets, Events, NPCDef } from '../types';
import { NPCS } from '../data/registry';

type GiftReaction = 'love' | 'like' | 'neutral' | 'hate';

type ReactionStyle = {
  emoji: string;
  color: string;
  label: string;
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

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  showDialogue(npcId: string, npcDef: NPCDef, hearts: number): void {
    this.clearDialogue(true);

    const registryNpc = NPCS.find((npc) => npc.id === npcId);
    const sourceNpc = registryNpc ?? npcDef;
    const heartBracket = Math.min(Math.floor(hearts / 200), 4).toString();
    const pool =
      sourceNpc.dialoguePool[heartBracket] ??
      sourceNpc.dialoguePool['0'] ??
      npcDef.dialoguePool[heartBracket] ??
      npcDef.dialoguePool['0'] ??
      ['...'];
    const line = pool[Math.floor(Math.random() * pool.length)] ?? '...';

    const cam = this.scene.cameras.main;
    const w = cam.width;

    const container = this.scene.add.container(0, 0).setDepth(1000);

    const bg = this.scene.add.rectangle(w / 2, 400, w, 150, 0x101010, 0.86);
    bg.setStrokeStyle(2, 0x404040, 1);

    const portrait = this.scene.add
      .sprite(76, 400, Assets.PORTRAITS, sourceNpc.portraitIndex)
      .setDisplaySize(96, 96);

    const nameColor = Phaser.Display.Color.HSLToColor(
      ((sourceNpc.portraitIndex * 53) % 360) / 360,
      0.65,
      0.6,
    ).color;

    const nameText = this.scene.add
      .text(140, 344, sourceNpc.name, {
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
      .text(w - 14, 462, '[SPACE / CLICK]', {
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
    this.activeNpcId = npcId;
    this.dialogueInputEnabledAt = this.scene.time.now + 100;

    this.scene.events.emit(Events.DIALOGUE_START, { npcId });

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
    if (keyboard) {
      spaceHandler = () => advance();
      keyboard.on('keydown-SPACE', spaceHandler);
    }

    this.dialogueCleanupInput = () => {
      this.scene.input.off('pointerdown', pointerHandler);
      if (keyboard && spaceHandler) {
        keyboard.off('keydown-SPACE', spaceHandler);
      }
    };
  }

  showGiftReaction(npcName: string, reaction: GiftReaction): void {
    this.clearReaction();

    const styles: Record<GiftReaction, ReactionStyle> = {
      love: { emoji: '💖', color: '#ff69b4', label: 'loves this' },
      like: { emoji: '🙂', color: '#66cc66', label: 'likes this' },
      neutral: { emoji: '...', color: '#9a9a9a', label: 'feels neutral' },
      hate: { emoji: '😠', color: '#ff4444', label: 'hates this' },
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
    this.clearDialogue(true);
    this.clearReaction();
    this.clearChoice(-1);
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
