import Phaser from 'phaser';
import { Scenes } from '../types';

export class IntroScene extends Phaser.Scene {
  private storyPanels: string[] = [];
  private panelIndex = 0;

  private panelText!: Phaser.GameObjects.Text;
  private promptText!: Phaser.GameObjects.Text;
  private letterboxTop!: Phaser.GameObjects.Rectangle;
  private letterboxBottom!: Phaser.GameObjects.Rectangle;

  private transitioning = false;
  private playerName = 'Farmer';

  constructor() {
    super(Scenes.INTRO);
  }

  init(data?: { playerName?: string }): void {
    if (data?.playerName?.trim()) {
      this.playerName = data.playerName.trim();
    }
  }

  create(): void {
    const { width, height } = this.cameras.main;

    this.storyPanels = [
      "You've inherited your grandfather's farm...",
      'The fields are overgrown, the fences worn, and silence fills the old house.',
      `${this.playerName}, a new season begins in Hearthfield Valley.`,
    ];

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x070707, 0x070707, 0x151515, 0x151515, 1);
    bg.fillRect(0, 0, width, height);

    this.letterboxTop = this.add.rectangle(width / 2, 22, width, 44, 0x000000, 1).setAlpha(0);
    this.letterboxBottom = this.add
      .rectangle(width / 2, height - 22, width, 44, 0x000000, 1)
      .setAlpha(0);

    this.panelText = this.add
      .text(width / 2, height / 2, this.storyPanels[0], {
        fontFamily: 'monospace',
        fontSize: '34px',
        align: 'center',
        color: '#f5edd0',
        wordWrap: { width: 760 },
        lineSpacing: 8,
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setShadow(0, 4, '#000000', 0.7, false, true);

    this.promptText = this.add
      .text(width / 2, height - 74, 'Click or SPACE to continue', {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#cbc3aa',
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setShadow(0, 2, '#000000', 0.6, false, true);

    this.cameras.main.fadeIn(700, 0, 0, 0);

    this.tweens.add({
      targets: [this.letterboxTop, this.letterboxBottom],
      alpha: 1,
      duration: 450,
      ease: 'Sine.easeOut',
    });

    this.tweens.add({
      targets: this.panelText,
      alpha: 1,
      y: this.panelText.y - 8,
      duration: 850,
      ease: 'Cubic.easeOut',
    });

    this.tweens.add({
      targets: this.promptText,
      alpha: { from: 0.2, to: 0.9 },
      duration: 950,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.input.on('pointerdown', () => this.advancePanel());
    this.input.keyboard?.on('keydown-SPACE', () => this.advancePanel());
  }

  private advancePanel(): void {
    if (this.transitioning) {
      return;
    }

    this.transitioning = true;
    this.panelIndex += 1;

    if (this.panelIndex >= this.storyPanels.length) {
      this.cameras.main.fadeOut(900, 0, 0, 0);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        this.scene.start(Scenes.PLAY, { playerName: this.playerName });
      });
      return;
    }

    this.tweens.add({
      targets: this.panelText,
      alpha: 0,
      y: this.panelText.y + 8,
      duration: 360,
      ease: 'Sine.easeIn',
      onComplete: () => {
        this.panelText.setText(this.storyPanels[this.panelIndex]);
        this.panelText.setY(this.cameras.main.centerY + 8);

        this.tweens.add({
          targets: this.panelText,
          alpha: 1,
          y: this.cameras.main.centerY - 8,
          duration: 560,
          ease: 'Cubic.easeOut',
          onComplete: () => {
            this.transitioning = false;
          },
        });
      },
    });
  }
}
