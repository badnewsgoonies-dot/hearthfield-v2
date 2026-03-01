import Phaser from 'phaser';
import { Scenes } from '../types';

export class IntroScene extends Phaser.Scene {
  private storyPanels: string[] = [];
  private panelIndex = 0;

  private panelText!: Phaser.GameObjects.Text;
  private skipText!: Phaser.GameObjects.Text;
  private autoAdvanceTimer?: Phaser.Time.TimerEvent;

  private transitioning = false;
  private sceneEnding = false;
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
      "You've inherited your grandfather's old farm in the valley...",
      'The fields are overgrown, but the soil is rich...',
      'The townsfolk say the valley has magic for those who tend it...',
    ];

    const bg = this.add.graphics({ fillStyle: { color: 0x050505 } });
    bg.fillGradientStyle(0x070707, 0x070707, 0x151515, 0x151515, 1);
    bg.fillRect(0, 0, width, height);

    this.panelText = this.add
      .text(width / 2, height / 2, this.storyPanels[0], {
        fontFamily: 'monospace',
        fontSize: '20px',
        align: 'center',
        color: '#ffdd88',
        wordWrap: { width: Math.min(width - 120, 760) },
        lineSpacing: 6,
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setShadow(0, 4, '#000000', 0.7, false, true);

    this.skipText = this.add
      .text(width / 2, height - 28, 'Press ESC to skip', {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#b8a46b',
      })
      .setOrigin(0.5)
      .setAlpha(0.9)
      .setShadow(0, 2, '#000000', 0.6, false, true);

    this.showPanel();
    this.input.keyboard?.on('keydown', this.handleKeyDown, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.autoAdvanceTimer?.remove(false);
      this.input.keyboard?.off('keydown', this.handleKeyDown, this);
    });
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (event.repeat) {
      return;
    }

    if (event.key === 'Escape') {
      this.skipToPlay();
      return;
    }

    this.advancePanel();
  }

  private showPanel(): void {
    if (this.sceneEnding) {
      return;
    }

    this.autoAdvanceTimer?.remove(false);
    this.panelText.setText(this.storyPanels[this.panelIndex]);
    this.panelText.setAlpha(0);

    this.tweens.add({
      targets: this.panelText,
      alpha: 1,
      duration: 550,
      ease: 'Sine.easeOut',
      onComplete: () => {
        this.autoAdvanceTimer = this.time.delayedCall(3000, () => this.advancePanel());
      },
    });
  }

  private advancePanel(): void {
    if (this.transitioning || this.sceneEnding) {
      return;
    }

    this.transitioning = true;
    this.autoAdvanceTimer?.remove(false);

    this.tweens.add({
      targets: this.panelText,
      alpha: 0,
      duration: 350,
      ease: 'Sine.easeIn',
      onComplete: () => {
        this.panelIndex += 1;
        this.transitioning = false;

        if (this.panelIndex >= this.storyPanels.length) {
          this.transitionToPlay();
          return;
        }

        this.showPanel();
      },
    });
  }

  private skipToPlay(): void {
    if (this.sceneEnding) {
      return;
    }

    this.autoAdvanceTimer?.remove(false);
    this.transitionToPlay();
  }

  private transitionToPlay(): void {
    if (this.sceneEnding) {
      return;
    }

    this.sceneEnding = true;
    this.transitioning = true;
    this.autoAdvanceTimer?.remove(false);

    this.cameras.main.fadeOut(900, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.stop(Scenes.INTRO);
      this.scene.start(Scenes.PLAY, { playerName: this.playerName });
    });
  }
}
