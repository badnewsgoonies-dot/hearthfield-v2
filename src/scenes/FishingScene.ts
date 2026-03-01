import Phaser from 'phaser';
import {
  Difficulty,
  Events,
  MapId,
  Quality,
  Season,
  TimeOfDay,
  FishDef,
} from '../types';
import { FISH } from '../data/registry';
import type { PlayScene } from './PlayScene';

type FishingInitData = {
  playScene: PlayScene;
  mapId: MapId;
  timeOfDay: TimeOfDay;
  season: Season;
};

type Phase = 'casting' | 'bite' | 'reeling' | 'resolved';

export class FishingScene extends Phaser.Scene {
  private initData!: FishingInitData;

  private phase: Phase = 'casting';
  private targetFish: FishDef | null = null;

  private spaceKey!: Phaser.Input.Keyboard.Key;
  private phaseTimer: Phaser.Time.TimerEvent | null = null;

  private biteWindowMs = 800;
  private biteStartAt = 0;
  private biteReactionMs = 800;

  private readonly catchGoalSeconds = 3;
  private inZoneSeconds = 0;
  private reelingElapsedSeconds = 0;

  private overlay!: Phaser.GameObjects.Rectangle;
  private messageText!: Phaser.GameObjects.Text;

  private bobber!: Phaser.GameObjects.Rectangle;
  private exclamationText!: Phaser.GameObjects.Text;

  private barX = 0;
  private barY = 0;
  private barWidth = 40;
  private barHeight = 260;

  private barOutline!: Phaser.GameObjects.Graphics;
  private catchProgressGfx!: Phaser.GameObjects.Graphics;

  private fishZone!: Phaser.GameObjects.Rectangle;
  private cursor!: Phaser.GameObjects.Rectangle;

  private fishZoneTop = 0;
  private fishZoneHeight = 80;
  private fishZoneVelocity = 130;

  private cursorCenterY = 0;
  private cursorVelocity = 0;

  constructor() {
    super('FishingScene');
  }

  init(data: FishingInitData): void {
    this.initData = data;
  }

  create(): void {
    this.phase = 'casting';
    this.inZoneSeconds = 0;
    this.reelingElapsedSeconds = 0;

    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.clearPhaseTimer, this);

    const camera = this.cameras.main;
    const cx = camera.centerX;
    const cy = camera.centerY;

    this.overlay = this.add.rectangle(cx, cy, camera.width, camera.height, 0x091018, 0.82);
    this.overlay.setScrollFactor(0);

    this.messageText = this.add.text(cx, cy - 170, 'Casting...', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#f2f2f2',
    }).setOrigin(0.5).setScrollFactor(0);

    this.bobber = this.add.rectangle(cx, cy - 40, 18, 18, 0xffb347, 1);
    this.bobber.setScrollFactor(0);

    this.exclamationText = this.add.text(cx, cy - 85, '!', {
      fontFamily: 'monospace',
      fontSize: '42px',
      color: '#ffd84d',
      fontStyle: 'bold',
    }).setOrigin(0.5).setScrollFactor(0).setVisible(false);

    this.barX = cx - 20;
    this.barY = cy - this.barHeight / 2;

    this.barOutline = this.add.graphics();
    this.barOutline.setScrollFactor(0);
    this.catchProgressGfx = this.add.graphics();
    this.catchProgressGfx.setScrollFactor(0);

    this.fishZone = this.add.rectangle(this.barX + this.barWidth / 2, this.barY + this.barHeight / 2, this.barWidth - 8, this.fishZoneHeight, 0x4ddf89, 0.75);
    this.fishZone.setScrollFactor(0).setVisible(false);

    this.cursor = this.add.rectangle(this.barX + this.barWidth / 2, this.barY + this.barHeight / 2, this.barWidth - 4, 10, 0x7ec9ff, 1);
    this.cursor.setScrollFactor(0).setVisible(false);

    this.renderBar();
    this.startCastingPhase();
  }

  update(_time: number, delta: number): void {
    if (this.phase === 'bite') {
      this.updateBitePhase();
      return;
    }

    if (this.phase === 'reeling') {
      this.updateReelingPhase(delta / 1000);
    }
  }

  private startCastingPhase(): void {
    this.messageText.setText('Casting...');
    this.targetFish = this.pickEligibleFish();

    this.tweens.add({
      targets: this.bobber,
      y: this.bobber.y + 10,
      duration: 450,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    });

    const waitMs = Phaser.Math.Between(1000, 4000);
    this.setPhaseTimer(waitMs, () => {
      this.startBitePhase();
    });
  }

  private startBitePhase(): void {
    this.phase = 'bite';
    this.messageText.setText('Bite! Press SPACE!');
    this.exclamationText.setVisible(true);
    this.biteStartAt = this.time.now;

    this.setPhaseTimer(this.biteWindowMs, () => {
      this.resolveEscape();
    });
  }

  private updateBitePhase(): void {
    if (!Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      return;
    }

    this.biteReactionMs = Math.max(0, this.time.now - this.biteStartAt);
    this.startReelingPhase();
  }

  private startReelingPhase(): void {
    this.phase = 'reeling';
    this.clearPhaseTimer();

    this.exclamationText.setVisible(false);
    this.messageText.setText('Reel it in! Hold SPACE to move up');

    this.tweens.killTweensOf(this.bobber);
    this.bobber.setVisible(false);

    const difficulty = this.targetFish?.difficulty ?? Difficulty.MEDIUM;
    this.fishZoneHeight = this.getFishZoneHeight(difficulty);
    this.fishZoneVelocity = this.getFishZoneSpeed(difficulty);

    this.fishZoneTop = (this.barHeight - this.fishZoneHeight) * 0.5;
    this.cursorCenterY = this.barHeight * 0.5;
    this.cursorVelocity = 0;

    this.fishZone.setSize(this.barWidth - 8, this.fishZoneHeight);
    this.fishZone.setVisible(true);
    this.cursor.setVisible(true);

    this.renderBar();
    this.renderCatchProgress();
    this.updateReelingUIPositions();
  }

  private updateReelingPhase(dt: number): void {
    this.reelingElapsedSeconds += dt;

    const holding = this.spaceKey.isDown;
    const upAccel = -640;
    const fallAccel = 720;
    const maxVel = 300;

    this.cursorVelocity += (holding ? upAccel : fallAccel) * dt;
    this.cursorVelocity = Phaser.Math.Clamp(this.cursorVelocity, -maxVel, maxVel);

    this.cursorCenterY += this.cursorVelocity * dt;
    this.cursorCenterY = Phaser.Math.Clamp(this.cursorCenterY, 0, this.barHeight);

    if (this.cursorCenterY <= 0 || this.cursorCenterY >= this.barHeight) {
      this.cursorVelocity = 0;
    }

    this.fishZoneTop += this.fishZoneVelocity * dt;
    if (this.fishZoneTop <= 0) {
      this.fishZoneTop = 0;
      this.fishZoneVelocity = Math.abs(this.fishZoneVelocity);
    }
    if (this.fishZoneTop >= this.barHeight - this.fishZoneHeight) {
      this.fishZoneTop = this.barHeight - this.fishZoneHeight;
      this.fishZoneVelocity = -Math.abs(this.fishZoneVelocity);
    }

    const zoneBottom = this.fishZoneTop + this.fishZoneHeight;
    const inZone = this.cursorCenterY >= this.fishZoneTop && this.cursorCenterY <= zoneBottom;

    if (inZone) {
      this.inZoneSeconds += dt;
    } else {
      this.inZoneSeconds = Math.max(0, this.inZoneSeconds - dt * 1.25);
    }

    this.updateReelingUIPositions();
    this.renderCatchProgress();

    if (this.inZoneSeconds >= this.catchGoalSeconds) {
      this.resolveCatch();
    }
  }

  private resolveCatch(): void {
    if (this.phase === 'resolved') {
      return;
    }

    this.phase = 'resolved';
    const fish = this.targetFish ?? this.pickEligibleFish();

    if (!fish) {
      this.resolveEscape();
      return;
    }

    const quality = this.calculateQuality();

    this.initData.playScene.events.emit(Events.FISH_CAUGHT, { fishId: fish.id, quality });
    this.initData.playScene.events.emit(Events.TOAST, {
      message: `Caught ${fish.name}!`,
      color: '#5ce6a2',
      duration: 1400,
    });

    this.closeAndReturn();
  }

  private resolveEscape(): void {
    if (this.phase === 'resolved') {
      return;
    }

    this.phase = 'resolved';
    this.initData.playScene.events.emit(Events.FISH_ESCAPED, {});
    this.initData.playScene.events.emit(Events.TOAST, {
      message: 'The fish got away...',
      color: '#ff8b8b',
      duration: 1500,
    });

    this.closeAndReturn();
  }

  private pickEligibleFish(): FishDef | null {
    const fish = FISH.filter((candidate) => (
      candidate.locations.includes(this.initData.mapId)
      && candidate.timeOfDay.includes(this.initData.timeOfDay)
      && candidate.seasons.includes(this.initData.season)
    ));

    if (fish.length === 0) {
      return null;
    }

    return Phaser.Utils.Array.GetRandom(fish) as FishDef;
  }

  private calculateQuality(): Quality {
    const biteScore = Phaser.Math.Clamp(1 - (this.biteReactionMs / this.biteWindowMs), 0, 1);
    const trackingScore = this.reelingElapsedSeconds > 0
      ? Phaser.Math.Clamp(this.inZoneSeconds / this.reelingElapsedSeconds, 0, 1)
      : 0;

    const score = (biteScore * 0.35) + (trackingScore * 0.65);

    if (score >= 0.82) {
      return Quality.GOLD;
    }
    if (score >= 0.55) {
      return Quality.SILVER;
    }
    return Quality.NORMAL;
  }

  private getFishZoneHeight(difficulty: Difficulty): number {
    switch (difficulty) {
      case Difficulty.EASY:
        return 110;
      case Difficulty.MEDIUM:
        return 78;
      case Difficulty.HARD:
        return 54;
    }
  }

  private getFishZoneSpeed(difficulty: Difficulty): number {
    switch (difficulty) {
      case Difficulty.EASY:
        return 95;
      case Difficulty.MEDIUM:
        return 150;
      case Difficulty.HARD:
        return 220;
    }
  }

  private renderBar(): void {
    this.barOutline.clear();
    this.barOutline.fillStyle(0x102033, 0.95);
    this.barOutline.fillRect(this.barX, this.barY, this.barWidth, this.barHeight);
    this.barOutline.lineStyle(2, 0xffffff, 0.9);
    this.barOutline.strokeRect(this.barX, this.barY, this.barWidth, this.barHeight);
  }

  private renderCatchProgress(): void {
    const progressX = this.barX + this.barWidth + 14;
    const progressW = 14;

    this.catchProgressGfx.clear();
    this.catchProgressGfx.fillStyle(0x0d141f, 0.98);
    this.catchProgressGfx.fillRect(progressX, this.barY, progressW, this.barHeight);
    this.catchProgressGfx.lineStyle(2, 0xffffff, 0.9);
    this.catchProgressGfx.strokeRect(progressX, this.barY, progressW, this.barHeight);

    const ratio = Phaser.Math.Clamp(this.inZoneSeconds / this.catchGoalSeconds, 0, 1);
    const fillH = ratio * this.barHeight;

    this.catchProgressGfx.fillStyle(0xffd447, 1);
    this.catchProgressGfx.fillRect(progressX + 2, this.barY + this.barHeight - fillH + 2, progressW - 4, Math.max(0, fillH - 4));
  }

  private updateReelingUIPositions(): void {
    this.fishZone.setPosition(this.barX + this.barWidth / 2, this.barY + this.fishZoneTop + this.fishZoneHeight / 2);
    this.cursor.setPosition(this.barX + this.barWidth / 2, this.barY + this.cursorCenterY);
  }

  private setPhaseTimer(delayMs: number, callback: () => void): void {
    this.clearPhaseTimer();
    this.phaseTimer = this.time.delayedCall(delayMs, callback);
  }

  private clearPhaseTimer(): void {
    if (this.phaseTimer) {
      this.phaseTimer.remove(false);
      this.phaseTimer = null;
    }
  }

  private closeAndReturn(): void {
    this.clearPhaseTimer();
    this.time.delayedCall(220, () => {
      this.scene.resume(this.initData.playScene.scene.key);
      this.scene.stop('FishingScene');
    });
  }
}
