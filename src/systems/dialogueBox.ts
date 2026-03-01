import Phaser from 'phaser';
import { NPCS } from '../data/registry';

interface DialogueBoxOpenArgs {
  npcId: string;
  text: string;
  portraitIndex: number;
  onAdvance: () => void;
}

type UISceneLike = Phaser.Scene & {
  playScene?: {
    relationships?: {
      [npcId: string]: {
        hearts: number;
      };
    };
  };
};

export class DialogueBox {
  public isVisible = false;

  private readonly scene: Phaser.Scene;
  private readonly container: Phaser.GameObjects.Container;
  private readonly portrait: Phaser.GameObjects.Sprite;
  private readonly nameText: Phaser.GameObjects.Text;
  private readonly heartText: Phaser.GameObjects.Text;
  private readonly dialogueText: Phaser.GameObjects.Text;

  private typewriterEvent?: Phaser.Time.TimerEvent;
  private fullText = '';
  private charIndex = 0;
  private onAdvance?: () => void;

  private readonly handlePointerAdvance = () => {
    this.handleAdvanceInput();
  };

  private readonly handleSpaceAdvance = () => {
    this.handleAdvanceInput();
  };

  private readonly handleEAdvance = () => {
    this.handleAdvanceInput();
  };

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    const sceneWidth = this.scene.scale.width;
    const sceneHeight = this.scene.scale.height;
    const boxWidth = 700;
    const boxHeight = 120;

    this.container = this.scene.add
      .container(sceneWidth / 2, sceneHeight - 100)
      .setDepth(300)
      .setScrollFactor(0)
      .setVisible(false);

    const background = this.scene.add.rectangle(0, 0, boxWidth, boxHeight, 0x0f0f0f, 0.92);
    background.setStrokeStyle(3, 0x4a4a4a, 1);

    this.portrait = this.scene.add
      .sprite(-boxWidth / 2 + 62, 0, 'portraits', 0)
      .setDisplaySize(48, 48);

    this.nameText = this.scene.add.text(-boxWidth / 2 + 100, -34, '', {
      fontSize: '16px',
      color: '#88cc44',
      fontStyle: 'bold',
    });

    this.heartText = this.scene.add.text(-boxWidth / 2 + 230, -34, '', {
      fontSize: '14px',
      color: '#ff6f91',
      fontStyle: 'bold',
    });

    this.dialogueText = this.scene.add.text(-boxWidth / 2 + 100, -10, '', {
      fontSize: '14px',
      color: '#ffffff',
      wordWrap: { width: 550 },
      lineSpacing: 2,
    });

    this.container.add([background, this.portrait, this.nameText, this.heartText, this.dialogueText]);

    this.scene.input.on('pointerdown', this.handlePointerAdvance);
    const keyboard = this.scene.input.keyboard;
    if (keyboard) {
      keyboard.on('keydown-SPACE', this.handleSpaceAdvance);
      keyboard.on('keydown-E', this.handleEAdvance);
    }

    this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.destroy();
    });
  }

  show(npcId: string, portraitIndex: number, text: string, onAdvance: () => void): void {
    this.stopTypewriter();

    const npc = NPCS.find((entry) => entry.id === npcId);
    const npcIndex = NPCS.findIndex((entry) => entry.id === npcId);
    const resolvedPortrait = npc?.portraitIndex ?? (npcIndex >= 0 ? npcIndex : portraitIndex);
    const npcName = npc?.name ?? npcId;
    const hearts = this.resolveHeartCount(npcId);

    this.isVisible = true;
    this.onAdvance = onAdvance;
    this.fullText = text;
    this.charIndex = 0;

    this.portrait.setFrame(resolvedPortrait);
    this.nameText.setText(npcName);
    this.heartText.setText(this.formatHeartMeter(hearts));
    this.dialogueText.setText('');

    this.container.setVisible(true);

    if (text.length === 0) {
      return;
    }

    this.typewriterEvent = this.scene.time.addEvent({
      delay: 30,
      repeat: text.length - 1,
      callback: () => {
        this.charIndex += 1;
        this.dialogueText.setText(this.fullText.slice(0, this.charIndex));
        if (this.charIndex >= this.fullText.length) {
          this.stopTypewriter();
        }
      },
    });
  }

  hide(): void {
    this.stopTypewriter();
    this.isVisible = false;
    this.onAdvance = undefined;
    this.container.setVisible(false);
  }

  // Compatibility wrappers for current call sites.
  open(args: DialogueBoxOpenArgs): void {
    this.show(args.npcId, args.portraitIndex, args.text, args.onAdvance);
  }

  close(_triggerCallback = false): void {
    this.hide();
  }

  private resolveHeartCount(npcId: string): number {
    const sceneWithPlay = this.scene as UISceneLike;
    const heartPoints = sceneWithPlay.playScene?.relationships?.[npcId]?.hearts ?? 0;
    return Phaser.Math.Clamp(Math.floor(heartPoints / 100), 0, 10);
  }

  private formatHeartMeter(filledHearts: number): string {
    const full = '♥'.repeat(filledHearts);
    const empty = '♡'.repeat(10 - filledHearts);
    return `${full}${empty}`;
  }

  private handleAdvanceInput(): void {
    if (!this.isVisible) return;

    if (this.typewriterEvent) {
      this.stopTypewriter();
      this.charIndex = this.fullText.length;
      this.dialogueText.setText(this.fullText);
      return;
    }

    this.onAdvance?.();
  }

  private stopTypewriter(): void {
    if (this.typewriterEvent) {
      this.typewriterEvent.remove(false);
      this.typewriterEvent = undefined;
    }
  }

  private destroy(): void {
    this.stopTypewriter();
    this.scene.input.off('pointerdown', this.handlePointerAdvance);

    const keyboard = this.scene.input.keyboard;
    if (keyboard) {
      keyboard.off('keydown-SPACE', this.handleSpaceAdvance);
      keyboard.off('keydown-E', this.handleEAdvance);
    }

    this.container.destroy(true);
  }
}
