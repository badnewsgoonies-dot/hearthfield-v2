import Phaser from 'phaser';
import {
  Season,
  TimeOfDay,
  MapId,
  Quality,
  Events,
  FishDef,
  Difficulty,
} from '../types';
import { FISH } from '../data/registry';

interface MinigameState {
  fish: FishDef;
  container: Phaser.GameObjects.Container;
  barGraphics: Phaser.GameObjects.Graphics;
  zoneGraphics: Phaser.GameObjects.Graphics;
  fishGraphics: Phaser.GameObjects.Graphics;
  progressBgGraphics: Phaser.GameObjects.Graphics;
  progressFillGraphics: Phaser.GameObjects.Graphics;
  barHeight: number;
  barWidth: number;
  zoneHeight: number;
  zoneY: number;
  zoneVelocity: number;
  fishY: number;
  fishVelocity: number;
  progress: number;
  fillRate: number;
  drainRate: number;
  fishSpeed: number;
}

export class FishingMinigame {
  private readonly scene: Phaser.Scene;

  private castGraphics: Phaser.GameObjects.Graphics | null = null;
  private biteTimer: Phaser.Time.TimerEvent | null = null;
  private minigameState: MinigameState | null = null;
  private spaceKey: Phaser.Input.Keyboard.Key | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  startFishing(
    playerX: number,
    playerY: number,
    season: Season,
    timeOfDay: TimeOfDay,
    mapId: MapId,
  ): void {
    this.cleanup();

    const availableFish = this.getAvailableFish(season, timeOfDay, mapId);
    if (availableFish.length === 0) {
      this.scene.events.emit(Events.FISH_ESCAPED);
      return;
    }

    const fish = Phaser.Utils.Array.GetRandom(availableFish) as FishDef;
    this.scene.events.emit(Events.CAST_LINE, { x: playerX, y: playerY });
    this.playCastingAnimation(playerX, playerY);

    const waitMs = Phaser.Math.Between(1000, 3000);
    this.biteTimer = this.scene.time.delayedCall(waitMs, () => {
      this.clearCastGraphics();
      this.startCatchMinigame(fish);
    });
  }

  getAvailableFish(season: Season, timeOfDay: TimeOfDay, mapId: MapId): FishDef[] {
    return FISH.filter((fish) => (
      fish.seasons.includes(season)
      && fish.timeOfDay.includes(timeOfDay)
      && fish.locations.includes(mapId)
    ));
  }

  private playCastingAnimation(playerX: number, playerY: number): void {
    const lineLength = 72;
    const endX = playerX + lineLength;
    const endY = playerY + 10;

    this.castGraphics = this.scene.add.graphics();
    this.castGraphics.setDepth(9998);

    const state = { t: 0 };

    this.scene.tweens.add({
      targets: state,
      t: 1,
      duration: 250,
      ease: 'Sine.Out',
      onUpdate: () => {
        if (!this.castGraphics) {
          return;
        }

        const currentX = Phaser.Math.Linear(playerX, endX, state.t);
        const currentY = Phaser.Math.Linear(playerY, endY, state.t);

        this.castGraphics.clear();
        this.castGraphics.lineStyle(2, 0xf2f2f2, 1);
        this.castGraphics.beginPath();
        this.castGraphics.moveTo(playerX, playerY);
        this.castGraphics.lineTo(currentX, currentY);
        this.castGraphics.strokePath();

        this.castGraphics.fillStyle(0xffcc66, 1);
        this.castGraphics.fillCircle(currentX, currentY, 3);
      },
    });
  }

  private startCatchMinigame(fish: FishDef): void {
    const camera = this.scene.cameras.main;
    const centerX = camera.centerX;
    const centerY = camera.centerY;

    const barHeight = 200;
    const barWidth = 24;
    const zoneHeight = this.getZoneHeight(fish.difficulty);

    const container = this.scene.add.container(centerX, centerY);
    container.setScrollFactor(0);
    container.setDepth(9999);

    const barGraphics = this.scene.add.graphics();
    const zoneGraphics = this.scene.add.graphics();
    const fishGraphics = this.scene.add.graphics();
    const progressBgGraphics = this.scene.add.graphics();
    const progressFillGraphics = this.scene.add.graphics();

    container.add([
      barGraphics,
      zoneGraphics,
      fishGraphics,
      progressBgGraphics,
      progressFillGraphics,
    ]);

    this.minigameState = {
      fish,
      container,
      barGraphics,
      zoneGraphics,
      fishGraphics,
      progressBgGraphics,
      progressFillGraphics,
      barHeight,
      barWidth,
      zoneHeight,
      zoneY: (barHeight - zoneHeight) * 0.5,
      zoneVelocity: 0,
      fishY: barHeight * 0.5,
      fishVelocity: 0,
      progress: 35,
      fillRate: this.getFillRate(fish.difficulty),
      drainRate: this.getDrainRate(fish.difficulty),
      fishSpeed: this.getFishSpeed(fish.difficulty),
    };

    if (this.scene.input.keyboard) {
      this.spaceKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    this.scene.events.on('update', this.updateCatchMinigame, this);
    this.renderCatchMinigame();
  }

  private updateCatchMinigame(_time: number, delta: number): void {
    if (!this.minigameState) {
      return;
    }

    const state = this.minigameState;
    const dt = delta / 1000;

    const pressing = !!this.spaceKey?.isDown;
    const upForce = 550;
    const gravity = 420;

    state.zoneVelocity += (pressing ? -upForce : gravity) * dt;
    state.zoneVelocity = Phaser.Math.Clamp(state.zoneVelocity, -220, 220);
    state.zoneY += state.zoneVelocity * dt;

    if (state.zoneY < 0) {
      state.zoneY = 0;
      state.zoneVelocity = 0;
    } else if (state.zoneY > state.barHeight - state.zoneHeight) {
      state.zoneY = state.barHeight - state.zoneHeight;
      state.zoneVelocity = 0;
    }

    const randomNudge = Phaser.Math.FloatBetween(-180, 180) * dt;
    state.fishVelocity += randomNudge;
    state.fishVelocity = Phaser.Math.Clamp(state.fishVelocity, -state.fishSpeed, state.fishSpeed);
    state.fishY += state.fishVelocity * dt;

    if (state.fishY < 0) {
      state.fishY = 0;
      state.fishVelocity = Math.abs(state.fishVelocity) * 0.85;
    } else if (state.fishY > state.barHeight) {
      state.fishY = state.barHeight;
      state.fishVelocity = -Math.abs(state.fishVelocity) * 0.85;
    }

    const fishInZone = state.fishY >= state.zoneY && state.fishY <= state.zoneY + state.zoneHeight;
    const progressDelta = (fishInZone ? state.fillRate : -state.drainRate) * dt;
    state.progress = Phaser.Math.Clamp(state.progress + progressDelta, 0, 100);

    this.renderCatchMinigame();

    if (state.progress >= 100) {
      const quality = this.rollQuality();
      this.scene.events.emit(Events.FISH_CAUGHT, { fishId: state.fish.id, quality });
      this.cleanupMinigame();
      return;
    }

    if (state.progress <= 0) {
      this.scene.events.emit(Events.FISH_ESCAPED);
      this.cleanupMinigame();
    }
  }

  private renderCatchMinigame(): void {
    if (!this.minigameState) {
      return;
    }

    const state = this.minigameState;
    const barX = -20;
    const barY = -state.barHeight / 2;
    const progressX = 18;

    state.barGraphics.clear();
    state.barGraphics.fillStyle(0x1c2432, 0.95);
    state.barGraphics.fillRect(barX, barY, state.barWidth, state.barHeight);
    state.barGraphics.lineStyle(2, 0xffffff, 0.9);
    state.barGraphics.strokeRect(barX, barY, state.barWidth, state.barHeight);

    state.zoneGraphics.clear();
    state.zoneGraphics.fillStyle(0x5ae08a, 0.8);
    state.zoneGraphics.fillRect(barX + 2, barY + state.zoneY, state.barWidth - 4, state.zoneHeight);

    state.fishGraphics.clear();
    state.fishGraphics.fillStyle(0x7fc8ff, 1);
    state.fishGraphics.fillCircle(barX + state.barWidth / 2, barY + state.fishY, 6);
    state.fishGraphics.lineStyle(1, 0xffffff, 0.8);
    state.fishGraphics.strokeCircle(barX + state.barWidth / 2, barY + state.fishY, 6);

    state.progressBgGraphics.clear();
    state.progressBgGraphics.fillStyle(0x0d1118, 0.95);
    state.progressBgGraphics.fillRect(progressX, barY, 12, state.barHeight);
    state.progressBgGraphics.lineStyle(2, 0xffffff, 0.9);
    state.progressBgGraphics.strokeRect(progressX, barY, 12, state.barHeight);

    const fillHeight = (state.progress / 100) * state.barHeight;
    state.progressFillGraphics.clear();
    state.progressFillGraphics.fillStyle(0xffd34d, 1);
    state.progressFillGraphics.fillRect(progressX + 2, barY + state.barHeight - fillHeight + 2, 8, Math.max(0, fillHeight - 4));
  }

  private getZoneHeight(difficulty: Difficulty): number {
    switch (difficulty) {
      case Difficulty.EASY:
        return 80;
      case Difficulty.MEDIUM:
        return 60;
      case Difficulty.HARD:
        return 40;
    }
  }

  private getFillRate(difficulty: Difficulty): number {
    switch (difficulty) {
      case Difficulty.EASY:
        return 36;
      case Difficulty.MEDIUM:
        return 30;
      case Difficulty.HARD:
        return 24;
    }
  }

  private getDrainRate(difficulty: Difficulty): number {
    switch (difficulty) {
      case Difficulty.EASY:
        return 20;
      case Difficulty.MEDIUM:
        return 26;
      case Difficulty.HARD:
        return 34;
    }
  }

  private getFishSpeed(difficulty: Difficulty): number {
    switch (difficulty) {
      case Difficulty.EASY:
        return 150;
      case Difficulty.MEDIUM:
        return 200;
      case Difficulty.HARD:
        return 260;
    }
  }

  private rollQuality(): Quality {
    const roll = Phaser.Math.FloatBetween(0, 1);
    if (roll < 0.1) {
      return Quality.GOLD;
    }
    if (roll < 0.35) {
      return Quality.SILVER;
    }
    return Quality.NORMAL;
  }

  private cleanupMinigame(): void {
    this.scene.events.off('update', this.updateCatchMinigame, this);

    if (this.minigameState) {
      this.minigameState.container.destroy(true);
      this.minigameState = null;
    }

    if (this.spaceKey) {
      this.spaceKey.destroy();
      this.spaceKey = null;
    }
  }

  private clearCastGraphics(): void {
    if (this.castGraphics) {
      this.castGraphics.destroy();
      this.castGraphics = null;
    }
  }

  private cleanup(): void {
    if (this.biteTimer) {
      this.biteTimer.remove(false);
      this.biteTimer = null;
    }

    this.clearCastGraphics();
    this.cleanupMinigame();
  }
}
