import Phaser from 'phaser';
import { Scenes } from '../types';

export class IntroScene extends Phaser.Scene {
  private lines: string[] = [
    'Dear Farmer,',
    'Your grandfather has left you his farm in Hearthfield Valley.',
    "It's been years since anyone worked the land...",
    'But with some care, it could flourish again.',
    'Spring 1, Year 1 — Your new life begins.',
  ];
  private lineIndex = 0;
  private bodyText!: Phaser.GameObjects.Text;
  private promptText!: Phaser.GameObjects.Text;
  private currentTyped = '';
  private isTyping = false;
  private canAdvance = false;
  private typeTimer?: Phaser.Time.TimerEvent;
  private playerName = 'Farmer';

  constructor() { super(Scenes.INTRO); }

  init(data?: { playerName?: string }): void {
    if (data?.playerName?.trim()) {
      this.playerName = data.playerName.trim();
    }
  }

  create(): void {
    const { width, height } = this.cameras.main;

    this.lines[0] = `Dear ${this.playerName},`;

    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 1);

    this.bodyText = this.add.text(width / 2, height / 2 - 20, '', {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: '#f4f1d4',
      align: 'center',
      lineSpacing: 6,
      wordWrap: { width: 680 },
    }).setOrigin(0.5);

    this.promptText = this.add.text(width / 2, height - 70, 'Click or SPACE to continue', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#9e9e9e',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: this.promptText,
      alpha: { from: 0.15, to: 0.85 },
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.cameras.main.fadeIn(600, 0, 0, 0);
    this.typeLine(this.lines[this.lineIndex]);

    this.input.on('pointerdown', () => this.advance());
    this.input.keyboard?.on('keydown-SPACE', () => this.advance());

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.typeTimer?.remove(false);
    });
  }

  private typeLine(line: string): void {
    this.typeTimer?.remove(false);
    this.currentTyped = '';
    this.bodyText.setText('');
    this.isTyping = true;
    this.canAdvance = false;

    let i = 0;
    this.typeTimer = this.time.addEvent({
      delay: 30,
      repeat: Math.max(0, line.length - 1),
      callback: () => {
        this.currentTyped += line.charAt(i);
        i += 1;
        this.bodyText.setText(this.currentTyped);
      },
      callbackScope: this,
    });

    const doneAfterMs = Math.max(280, line.length * 30 + 120);
    this.time.delayedCall(doneAfterMs, () => {
      this.bodyText.setText(line);
      this.isTyping = false;
      this.canAdvance = true;
    });
  }

  private advance(): void {
    if (this.isTyping) {
      const line = this.lines[this.lineIndex];
      this.typeTimer?.remove(false);
      this.bodyText.setText(line);
      this.isTyping = false;
      this.canAdvance = true;
      return;
    }

    if (!this.canAdvance) {
      return;
    }

    this.canAdvance = false;
    this.lineIndex += 1;

    if (this.lineIndex >= this.lines.length) {
      this.cameras.main.fadeOut(900, 0, 0, 0);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        this.scene.start(Scenes.PLAY, { playerName: this.playerName });
      });
      return;
    }

    this.typeLine(this.lines[this.lineIndex]);
  }
}
