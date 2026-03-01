import Phaser from 'phaser';
import { Events } from '../types';

export interface TutorialStep {
  id: string;
  message: string;
  trigger: string;       // event name to listen for, or 'delay' for timed
  delayMs?: number;      // for delay triggers
  toolHint?: Tool;       // highlight this tool in hotbar
  posHint?: { x: number; y: number };  // world position to show arrow
  condition?: (data: any) => boolean;  // extra filter on event data
}

const STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    message: 'Welcome to Hearthfield! Use WASD or arrow keys to walk around your farm.',
    trigger: 'delay',
    delayMs: 2000,
  },
  {
    id: 'look_around',
    message: 'Your house is to the north. The farming plot is the dark soil area to the south-west.',
    trigger: 'delay',
    delayMs: 5000,
  },
  {
    id: 'till_soil',
    message: 'Your Hoe is selected (slot 1). Face a grass tile and press SPACE to till the soil.',
    trigger: Events.SOIL_TILLED,
  },
  {
    id: 'plant_seeds',
    message: 'Well done! Now press 3 to select your Parsnip Seeds, then press F on the tilled soil to plant.',
    trigger: Events.CROP_PLANTED,
  },
  {
    id: 'water_crops',
    message: 'Great! Press 2 to switch to your Watering Can, then SPACE on the planted tile to water it.',
    trigger: Events.CROP_WATERED,
  },
  {
    id: 'more_farming',
    message: 'Perfect! Crops grow overnight. Plant and water a few more while you have stamina.',
    trigger: 'delay',
    delayMs: 6000,
  },
  {
    id: 'explore_hint',
    message: 'Look around! The Shipping Bin (east) sells items overnight. The Shop sign lets you buy seeds. Talk to villagers with E.',
    trigger: 'delay',
    delayMs: 8000,
  },
  {
    id: 'bed_hint',
    message: 'When you\'re done, press E on your Bed to sleep and start a new day. Happy farming!',
    trigger: 'delay',
    delayMs: 6000,
  },
];

export class TutorialSystem {
  private scene: Phaser.Scene;
  private currentStep = 0;
  private active = true;
  private messageBox!: Phaser.GameObjects.Container;
  private msgText!: Phaser.GameObjects.Text;
  private msgBg!: Phaser.GameObjects.Rectangle;
  private arrow!: Phaser.GameObjects.Triangle;
  private pendingTimer?: Phaser.Time.TimerEvent;
  private pendingListener?: { event: string; fn: Function };

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.createUI();
    this.startStep(0);
  }

  private createUI() {
    const cam = this.scene.cameras.main;

    // Message box at top of screen
    this.msgBg = this.scene.add.rectangle(0, 0, 600, 50, 0x1a1a2e, 0.92)
      .setStrokeStyle(2, 0x88cc44)
      .setOrigin(0.5);

    this.msgText = this.scene.add.text(0, 0, '', {
      fontFamily: 'monospace', fontSize: '13px', color: '#e8d5a3',
      align: 'center', wordWrap: { width: 570 }, lineSpacing: 4,
    }).setOrigin(0.5);

    this.messageBox = this.scene.add.container(cam.width / 2, 50, [this.msgBg, this.msgText]);
    this.messageBox.setDepth(9999);
    this.messageBox.setScrollFactor(0);
    this.messageBox.setAlpha(0);

    // Directional arrow (reusable, hidden by default)
    this.arrow = this.scene.add.triangle(0, 0, 0, 0, 8, 16, 16, 0, 0x88cc44);
    this.arrow.setDepth(9998);
    this.arrow.setVisible(false);
  }

  private startStep(index: number) {
    if (index >= STEPS.length) {
      this.finish();
      return;
    }

    this.currentStep = index;
    const step = STEPS[index];

    // Show message
    this.showMessage(step.message);

    // Set up trigger
    if (step.trigger === 'delay') {
      this.pendingTimer = this.scene.time.delayedCall(step.delayMs || 5000, () => {
        this.advanceStep();
      });
    } else {
      // Listen for game event
      const fn = (data: any) => {
        if (step.condition && !step.condition(data)) return;
        this.scene.events.off(step.trigger, fn as any);
        this.pendingListener = undefined;
        // Small celebration delay
        this.scene.time.delayedCall(800, () => this.advanceStep());
      };
      this.pendingListener = { event: step.trigger, fn };
      this.scene.events.on(step.trigger, fn as any);
    }

    // Position arrow if needed
    if (step.posHint) {
      this.arrow.setPosition(step.posHint.x, step.posHint.y - 20);
      this.arrow.setVisible(true);
      this.scene.tweens.add({
        targets: this.arrow, y: step.posHint.y - 30,
        duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
      });
    } else {
      this.arrow.setVisible(false);
    }
  }

  private advanceStep() {
    this.hideMessage();
    this.arrow.setVisible(false);

    this.scene.time.delayedCall(400, () => {
      this.startStep(this.currentStep + 1);
    });
  }

  private showMessage(text: string) {
    this.msgText.setText(text);
    // Resize bg to text
    const h = Math.max(50, this.msgText.height + 20);
    this.msgBg.setSize(600, h);

    this.scene.tweens.add({
      targets: this.messageBox, alpha: 1,
      duration: 400, ease: 'Sine.easeIn'
    });
  }

  private hideMessage() {
    this.scene.tweens.add({
      targets: this.messageBox, alpha: 0,
      duration: 300, ease: 'Sine.easeOut'
    });
  }

  private finish() {
    this.active = false;
    this.hideMessage();
    this.arrow.setVisible(false);
  }

  destroy() {
    if (this.pendingTimer) this.pendingTimer.destroy();
    if (this.pendingListener) {
      this.scene.events.off(this.pendingListener.event, this.pendingListener.fn as any);
    }
    this.messageBox.destroy();
    this.arrow.destroy();
  }
}
