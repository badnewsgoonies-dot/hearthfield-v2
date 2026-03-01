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

type Phase = 'casting' | 'waiting' | 'bite' | 'reeling' | 'result' | 'resolved';

const CAST_MAX_HOLD_MS = 2000;

export class FishingScene extends Phaser.Scene {
  private initData!: FishingInitData;

  private phase: Phase = 'casting';
  private targetFish: FishDef | null = null;
  private castDistance = 0;

  private spaceKey!: Phaser.Input.Keyboard.Key;
  private phaseTimer: Phaser.Time.TimerEvent | null = null;

  private castHolding = false;
  private castHoldStartedAt = 0;
  private castPowerRatio = 0;

  private biteStartAt = 0;
  private biteWindowMs = 700;
  private biteReactionMs = 700;

  private readonly catchGoalSeconds = 3.2;
  private catchProgress = 0;
  private reelingElapsedSeconds = 0;
  private inZoneSeconds = 0;

  private overlay!: Phaser.GameObjects.Rectangle;
  private messageText!: Phaser.GameObjects.Text;
  private hintText!: Phaser.GameObjects.Text;

  private waterRect!: Phaser.GameObjects.Rectangle;
  private bobber!: Phaser.GameObjects.Arc;
  private bobberShadow!: Phaser.GameObjects.Ellipse;
  private exclamationText!: Phaser.GameObjects.Text;

  private castBarBg!: Phaser.GameObjects.Rectangle;
  private castBarFill!: Phaser.GameObjects.Rectangle;
  private castPowerText!: Phaser.GameObjects.Text;

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
  private fishMovePattern: 'steady' | 'normal' | 'erratic' = 'normal';
  private fishErraticChangeTimer = 0;

  private cursorCenterY = 0;
  private cursorVelocity = 0;

  private rippleGraphics!: Phaser.GameObjects.Graphics;
  private ripples: { x: number; y: number; radius: number; alpha: number; speed: number }[] = [];

  constructor() {
    super('FishingScene');
  }

  init(data: FishingInitData): void {
    this.initData = data;
  }

  create(): void {
    this.phase = 'casting';
    this.catchProgress = 0;
    this.reelingElapsedSeconds = 0;
    this.inZoneSeconds = 0;
    this.castDistance = 0;
    this.castPowerRatio = 0;

    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.clearPhaseTimer, this);

    const camera = this.cameras.main;
    const cx = camera.centerX;
    const cy = camera.centerY;

    this.overlay = this.add.rectangle(cx, cy, camera.width, camera.height, 0x08131f, 0.82);
    this.overlay.setScrollFactor(0);

    this.messageText = this.add.text(cx, cy - 190, 'Hold SPACE to build cast power', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#f2f5ff',
    }).setOrigin(0.5).setScrollFactor(0);

    this.hintText = this.add.text(cx, cy + 190, 'Release SPACE to cast', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#bad6f2',
    }).setOrigin(0.5).setScrollFactor(0);

    this.waterRect = this.add.rectangle(cx, cy + 10, 360, 150, 0x1f4f8f, 0.36)
      .setStrokeStyle(2, 0x7cc2ff, 0.5)
      .setScrollFactor(0);

    this.rippleGraphics = this.add.graphics().setScrollFactor(0);

    this.bobberShadow = this.add.ellipse(cx, cy + 28, 20, 8, 0x001b30, 0.4)
      .setScrollFactor(0)
      .setVisible(false);

    this.bobber = this.add.circle(cx, cy + 18, 8, 0xffb347, 1)
      .setStrokeStyle(2, 0xffffff, 0.95)
      .setScrollFactor(0)
      .setVisible(false);

    this.exclamationText = this.add.text(cx, cy - 22, '!', {
      fontFamily: 'monospace',
      fontSize: '42px',
      color: '#ffd84d',
      fontStyle: 'bold',
    }).setOrigin(0.5).setScrollFactor(0).setVisible(false);

    this.castBarBg = this.add.rectangle(cx - 170, cy + 80, 20, 170, 0x0e1824, 0.95)
      .setOrigin(0.5, 1)
      .setStrokeStyle(2, 0xffffff, 0.85)
      .setScrollFactor(0);

    this.castBarFill = this.add.rectangle(cx - 170, cy + 78, 14, 0, 0xffc85a, 1)
      .setOrigin(0.5, 1)
      .setScrollFactor(0);

    this.castPowerText = this.add.text(cx - 170, cy + 98, '0%', {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#ffe7ad',
    }).setOrigin(0.5, 0).setScrollFactor(0);

    this.barX = cx + 120;
    this.barY = cy - this.barHeight / 2;

    this.barOutline = this.add.graphics().setScrollFactor(0).setVisible(false);
    this.catchProgressGfx = this.add.graphics().setScrollFactor(0).setVisible(false);

    this.fishZone = this.add.rectangle(this.barX + this.barWidth / 2, this.barY + this.barHeight / 2, this.barWidth - 8, this.fishZoneHeight, 0x58df99, 0.75)
      .setScrollFactor(0)
      .setVisible(false);

    this.cursor = this.add.rectangle(this.barX + this.barWidth / 2, this.barY + this.barHeight / 2, this.barWidth - 4, 12, 0x87ceff, 1)
      .setScrollFactor(0)
      .setVisible(false);

    this.startCastingPhase();
  }

  update(_time: number, delta: number): void {
    const dt = delta / 1000;

    this.updateRipples(dt);

    if (this.phase === 'casting') {
      this.updateCastingPhase();
      return;
    }

    if (this.phase === 'bite') {
      this.updateBitePhase();
      return;
    }

    if (this.phase === 'reeling') {
      this.updateReelingPhase(dt);
    }
  }

  private startCastingPhase(): void {
    this.phase = 'casting';
    this.targetFish = null;
    this.messageText.setText('Hold SPACE to build cast power');
    this.hintText.setText('Release SPACE to cast');

    this.castBarBg.setVisible(true);
    this.castBarFill.setVisible(true);
    this.castPowerText.setVisible(true);

    this.bobber.setVisible(false);
    this.bobberShadow.setVisible(false);
    this.exclamationText.setVisible(false);
    this.hideReelingUI();
  }

  private updateCastingPhase(): void {
    if (!this.castHolding && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.castHolding = true;
      this.castHoldStartedAt = this.time.now;
    }

    if (this.castHolding) {
      const heldMs = Phaser.Math.Clamp(this.time.now - this.castHoldStartedAt, 0, CAST_MAX_HOLD_MS);
      this.castPowerRatio = heldMs / CAST_MAX_HOLD_MS;
      this.renderCastPower();

      if (Phaser.Input.Keyboard.JustUp(this.spaceKey) || heldMs >= CAST_MAX_HOLD_MS) {
        this.castHolding = false;
        this.beginCast();
      }
    }
  }

  private beginCast(): void {
    this.castDistance = Math.floor(Phaser.Math.Linear(35, 170, this.castPowerRatio));
    this.targetFish = this.pickFishByDistance(this.castPowerRatio);

    this.messageText.setText(`Cast ${this.castDistance}m`);
    this.hintText.setText('Waiting for a bite...');
    this.showCastDistanceIndicator();

    this.castBarBg.setVisible(false);
    this.castBarFill.setVisible(false);
    this.castPowerText.setVisible(false);

    const bobberStartX = this.cameras.main.centerX - 30;
    const bobberStartY = this.cameras.main.centerY - 70;
    const bobberEndX = this.cameras.main.centerX + Phaser.Math.Linear(20, 120, this.castPowerRatio);
    const bobberEndY = this.cameras.main.centerY + Phaser.Math.Linear(-2, 56, this.castPowerRatio);

    this.bobber.setPosition(bobberStartX, bobberStartY).setVisible(true);
    this.bobberShadow.setPosition(bobberStartX, bobberStartY + 10).setVisible(true);

    this.tweens.add({
      targets: [this.bobber, this.bobberShadow],
      x: bobberEndX,
      y: bobberEndY,
      duration: 240,
      ease: 'Sine.Out',
      onComplete: () => this.startWaitingPhase(),
    });
  }

  private startWaitingPhase(): void {
    this.phase = 'waiting';

    this.tweens.add({
      targets: this.bobber,
      y: this.bobber.y + 6,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    });

    this.tweens.add({
      targets: this.bobberShadow,
      scaleX: 1.25,
      alpha: 0.22,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    });

    this.spawnRipple(this.bobber.x, this.bobber.y + 3);

    const wait = this.getBiteWaitMs(this.targetFish?.difficulty ?? Difficulty.EASY);
    this.setPhaseTimer(wait, () => {
      this.startBitePhase();
    });
  }

  private startBitePhase(): void {
    this.phase = 'bite';
    this.biteStartAt = this.time.now;
    this.biteWindowMs = this.getBiteWindowMs(this.targetFish?.difficulty ?? Difficulty.EASY);

    this.messageText.setText('Bite! Press SPACE now!');
    this.hintText.setText('React quickly for better quality');
    this.exclamationText.setPosition(this.bobber.x, this.bobber.y - 40).setVisible(true);

    this.tweens.killTweensOf(this.bobber);
    this.tweens.killTweensOf(this.bobberShadow);

    this.createSplash(this.bobber.x, this.bobber.y);

    this.tweens.add({
      targets: this.bobber,
      y: this.bobber.y + 14,
      duration: 120,
      yoyo: true,
      repeat: 1,
      ease: 'Quad.Out',
    });

    this.setPhaseTimer(this.biteWindowMs, () => {
      this.resolveEscape('Missed the bite...');
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
    this.messageText.setText('Reel in: hold SPACE to lift the cursor');
    this.hintText.setText('Keep the cursor inside the fish zone');

    const difficulty = this.targetFish?.difficulty ?? Difficulty.MEDIUM;
    this.fishZoneHeight = this.getFishZoneHeight(difficulty);
    this.fishZoneVelocity = this.getFishZoneSpeed(difficulty);
    this.fishMovePattern = this.getFishMovePattern();
    this.fishErraticChangeTimer = 0;

    this.fishZoneTop = (this.barHeight - this.fishZoneHeight) * 0.5;
    this.cursorCenterY = this.barHeight * 0.5;
    this.cursorVelocity = 0;
    this.catchProgress = 26;
    this.reelingElapsedSeconds = 0;
    this.inZoneSeconds = 0;

    this.renderBar();
    this.renderCatchProgress();
    this.updateReelingUIPositions();

    this.barOutline.setVisible(true);
    this.catchProgressGfx.setVisible(true);
    this.fishZone.setVisible(true);
    this.cursor.setVisible(true);
  }

  private updateReelingPhase(dt: number): void {
    this.reelingElapsedSeconds += dt;

    const holding = this.spaceKey.isDown;
    const upAccel = -700;
    const fallAccel = 760;
    const maxVel = 320;

    this.cursorVelocity += (holding ? upAccel : fallAccel) * dt;
    this.cursorVelocity = Phaser.Math.Clamp(this.cursorVelocity, -maxVel, maxVel);

    this.cursorCenterY += this.cursorVelocity * dt;
    this.cursorCenterY = Phaser.Math.Clamp(this.cursorCenterY, 0, this.barHeight);

    if (this.cursorCenterY <= 0 || this.cursorCenterY >= this.barHeight) {
      this.cursorVelocity *= 0.2;
    }

    this.updateFishZoneMotion(dt);
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
      this.catchProgress = Phaser.Math.Clamp(this.catchProgress + dt * 31, 0, 100);
    } else {
      this.catchProgress = Phaser.Math.Clamp(this.catchProgress - dt * 26, 0, 100);
    }

    this.updateReelingUIPositions();
    this.renderCatchProgress();

    if (this.catchProgress >= 100) {
      this.resolveCatch();
      return;
    }

    if (this.catchProgress <= 0) {
      this.resolveEscape('The fish broke free!');
    }
  }

  private resolveCatch(): void {
    if (this.phase === 'resolved') {
      return;
    }

    this.phase = 'result';

    const fish = this.targetFish ?? this.pickFishByDistance(this.castPowerRatio);
    if (!fish) {
      this.resolveEscape('No fish on the line...');
      return;
    }

    const quality = this.calculateQuality();
    const stars = this.getRarityStars(fish.difficulty);

    this.initData.playScene.events.emit(Events.FISH_CAUGHT, { fishId: fish.id, quality });
    this.initData.playScene.events.emit(Events.TOAST, {
      message: `Caught ${fish.name}!`,
      color: '#5ce6a2',
      duration: 1600,
    });

    this.showResultCard(
      `Caught ${fish.name}`,
      `${stars}  ${fish.sellPrice}g`,
      '#57e6a1',
    );
    this.showCatchText(fish.name, quality);

    this.createCelebrationParticles();
    this.phase = 'resolved';

    this.time.delayedCall(1650, () => {
      this.closeAndReturn();
    });
  }

  private resolveEscape(message = 'The fish got away...'): void {
    if (this.phase === 'resolved') {
      return;
    }

    this.phase = 'resolved';
    this.clearPhaseTimer();

    this.initData.playScene.events.emit(Events.FISH_ESCAPED, {});
    this.initData.playScene.events.emit(Events.TOAST, {
      message,
      color: '#ff8b8b',
      duration: 1400,
    });

    this.showResultCard('No catch', 'Try a longer cast or better timing', '#ff8b8b');
    this.showEscapeText();

    this.time.delayedCall(1200, () => {
      this.closeAndReturn();
    });
  }

  private showResultCard(title: string, subtitle: string, color: string): void {
    this.hideReelingUI();
    this.exclamationText.setVisible(false);

    this.messageText.setText(title).setColor(color);
    this.hintText.setText(subtitle).setColor('#f0f4ff');

    this.bobber.setVisible(true);
    this.bobberShadow.setVisible(true);
    this.tweens.killTweensOf(this.bobber);
    this.tweens.killTweensOf(this.bobberShadow);

    this.tweens.add({
      targets: this.bobber,
      scale: 1.2,
      duration: 150,
      yoyo: true,
      repeat: 1,
      ease: 'Sine.Out',
    });
  }

  private pickFishByDistance(powerRatio: number): FishDef | null {
    const available = FISH.filter((candidate) => (
      candidate.locations.includes(this.initData.mapId)
      && candidate.timeOfDay.includes(this.initData.timeOfDay)
      && candidate.seasons.includes(this.initData.season)
    ));

    if (available.length === 0) {
      return null;
    }

    const threshold = Phaser.Math.Clamp(powerRatio, 0, 1);
    const eligible = available.filter((fish) => {
      switch (fish.difficulty) {
        case Difficulty.EASY:
          return threshold >= 0.08;
        case Difficulty.MEDIUM:
          return threshold >= 0.38;
        case Difficulty.HARD:
          return threshold >= 0.68;
      }
    });

    const pool = eligible.length > 0 ? eligible : available.filter((fish) => fish.difficulty === Difficulty.EASY);
    const finalPool = pool.length > 0 ? pool : available;

    return Phaser.Utils.Array.GetRandom(finalPool) as FishDef;
  }

  private calculateQuality(): Quality {
    const biteScore = Phaser.Math.Clamp(1 - (this.biteReactionMs / this.biteWindowMs), 0, 1);
    const trackingScore = this.reelingElapsedSeconds > 0
      ? Phaser.Math.Clamp(this.inZoneSeconds / this.reelingElapsedSeconds, 0, 1)
      : 0;

    const difficultyBonus = this.targetFish?.difficulty === Difficulty.HARD ? 0.08 : this.targetFish?.difficulty === Difficulty.MEDIUM ? 0.04 : 0;
    const distanceBonus = this.castPowerRatio * 0.08;

    const score = (biteScore * 0.32) + (trackingScore * 0.60) + difficultyBonus + distanceBonus;

    if (score >= 0.82) {
      return Quality.GOLD;
    }
    if (score >= 0.56) {
      return Quality.SILVER;
    }
    return Quality.NORMAL;
  }

  private getFishZoneHeight(difficulty: Difficulty): number {
    switch (difficulty) {
      case Difficulty.EASY:
        return 112;
      case Difficulty.MEDIUM:
        return 78;
      case Difficulty.HARD:
        return 56;
    }
  }

  private getFishZoneSpeed(difficulty: Difficulty): number {
    const rarity = this.getTargetFishRarity();
    switch (rarity) {
      case 'common':
        return Phaser.Math.FloatBetween(80, 110);
      case 'uncommon':
        return Phaser.Math.FloatBetween(130, 175);
      case 'rare':
        return Phaser.Math.FloatBetween(220, 290);
      default:
        switch (difficulty) {
          case Difficulty.EASY:
            return Phaser.Math.FloatBetween(88, 118);
          case Difficulty.MEDIUM:
            return Phaser.Math.FloatBetween(145, 185);
          case Difficulty.HARD:
            return Phaser.Math.FloatBetween(220, 280);
        }
    }
  }

  private getBiteWaitMs(difficulty: Difficulty): number {
    switch (difficulty) {
      case Difficulty.EASY:
        return Phaser.Math.Between(850, 1700);
      case Difficulty.MEDIUM:
        return Phaser.Math.Between(1400, 2400);
      case Difficulty.HARD:
        return Phaser.Math.Between(1900, 3200);
    }
  }

  private getBiteWindowMs(difficulty: Difficulty): number {
    switch (difficulty) {
      case Difficulty.EASY:
        return 900;
      case Difficulty.MEDIUM:
        return 700;
      case Difficulty.HARD:
        return 520;
    }
  }

  private getRarityStars(difficulty: Difficulty): string {
    switch (difficulty) {
      case Difficulty.EASY:
        return '★';
      case Difficulty.MEDIUM:
        return '★★';
      case Difficulty.HARD:
        return '★★★';
    }
  }

  private getTargetFishRarity(): 'common' | 'uncommon' | 'rare' | 'unknown' {
    const fishId = this.targetFish?.id ?? '';
    if (fishId === 'sardine' || fishId === 'trout' || fishId === 'bass') {
      return 'common';
    }
    if (fishId === 'salmon' || fishId === 'catfish') {
      return 'uncommon';
    }
    if (fishId === 'tuna' || fishId === 'legendary_fish') {
      return 'rare';
    }
    return 'unknown';
  }

  private getFishMovePattern(): 'steady' | 'normal' | 'erratic' {
    const rarity = this.getTargetFishRarity();
    if (rarity === 'common') {
      return 'steady';
    }
    if (rarity === 'rare') {
      return 'erratic';
    }
    return 'normal';
  }

  private updateFishZoneMotion(dt: number): void {
    if (this.fishMovePattern !== 'erratic') {
      return;
    }

    this.fishErraticChangeTimer -= dt;
    if (this.fishErraticChangeTimer > 0) {
      return;
    }

    const direction = Phaser.Math.Between(0, 1) === 0 ? -1 : 1;
    const speed = Phaser.Math.FloatBetween(230, 320);
    this.fishZoneVelocity = direction * speed;
    this.fishErraticChangeTimer = Phaser.Math.FloatBetween(0.16, 0.42);
  }

  private showFloatingCenterText(
    text: string,
    color: string,
    sizePx: number,
    durationMs: number,
    yOffset = -6,
  ): void {
    const camera = this.cameras.main;
    const popup = this.add.text(camera.centerX, camera.centerY + yOffset, text, {
      fontFamily: 'monospace',
      fontSize: `${sizePx}px`,
      fontStyle: 'bold',
      color,
      stroke: '#08131f',
      strokeThickness: 6,
      align: 'center',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(2500);

    this.tweens.add({
      targets: popup,
      y: popup.y - 20,
      alpha: 0,
      duration: durationMs,
      ease: 'Sine.Out',
      onComplete: () => popup.destroy(),
    });
  }

  private showCatchText(fishName: string, quality: Quality): void {
    const qualityLabel = this.getQualityLabel(quality);
    const qualitySuffix = qualityLabel ? ` (${qualityLabel})` : '';
    this.showFloatingCenterText(`Caught: ${fishName}${qualitySuffix}!`, '#ffd447', 36, 2000, -16);
  }

  private showEscapeText(): void {
    this.showFloatingCenterText('The fish got away...', '#ff6464', 34, 2000);
  }

  private showCastDistanceIndicator(): void {
    const label = this.castPowerRatio >= 0.7 ? 'Far' : this.castPowerRatio >= 0.4 ? 'Medium' : 'Near';
    this.showFloatingCenterText(`Cast: ${label}`, '#9cd7ff', 30, 1200, -28);
  }

  private getQualityLabel(quality: Quality): string {
    switch (quality) {
      case Quality.SILVER:
        return 'Silver';
      case Quality.GOLD:
        return 'Gold';
      case Quality.NORMAL:
      default:
        return '';
    }
  }

  private renderCastPower(): void {
    const fillHeight = Phaser.Math.Clamp(this.castPowerRatio, 0, 1) * 164;
    this.castBarFill.setSize(14, fillHeight);
    this.castPowerText.setText(`${Math.round(this.castPowerRatio * 100)}%`);

    const color = this.castPowerRatio >= 0.72 ? 0xff6d6d : this.castPowerRatio >= 0.4 ? 0xffc85a : 0xb2e17d;
    this.castBarFill.setFillStyle(color, 1);
  }

  private renderBar(): void {
    this.barOutline.clear();
    this.barOutline.fillStyle(0x102033, 0.95);
    this.barOutline.fillRect(this.barX, this.barY, this.barWidth, this.barHeight);
    this.barOutline.lineStyle(2, 0xffffff, 0.9);
    this.barOutline.strokeRect(this.barX, this.barY, this.barWidth, this.barHeight);
  }

  private renderCatchProgress(): void {
    const progressX = this.barX + this.barWidth + 16;
    const progressW = 16;

    this.catchProgressGfx.clear();
    this.catchProgressGfx.fillStyle(0x0d141f, 0.98);
    this.catchProgressGfx.fillRect(progressX, this.barY, progressW, this.barHeight);
    this.catchProgressGfx.lineStyle(2, 0xffffff, 0.9);
    this.catchProgressGfx.strokeRect(progressX, this.barY, progressW, this.barHeight);

    const ratio = Phaser.Math.Clamp(this.catchProgress / 100, 0, 1);
    const fillH = ratio * this.barHeight;

    this.catchProgressGfx.fillStyle(0xffd447, 1);
    this.catchProgressGfx.fillRect(progressX + 2, this.barY + this.barHeight - fillH + 2, progressW - 4, Math.max(0, fillH - 4));
  }

  private hideReelingUI(): void {
    this.barOutline.setVisible(false);
    this.catchProgressGfx.setVisible(false);
    this.fishZone.setVisible(false);
    this.cursor.setVisible(false);
  }

  private updateReelingUIPositions(): void {
    this.fishZone.setPosition(this.barX + this.barWidth / 2, this.barY + this.fishZoneTop + this.fishZoneHeight / 2);
    this.cursor.setPosition(this.barX + this.barWidth / 2, this.barY + this.cursorCenterY);
  }

  private spawnRipple(x: number, y: number): void {
    this.ripples.push({
      x,
      y,
      radius: 6,
      alpha: 0.5,
      speed: Phaser.Math.FloatBetween(28, 42),
    });
  }

  private updateRipples(dt: number): void {
    if ((this.phase === 'waiting' || this.phase === 'bite') && this.bobber.visible && Phaser.Math.Between(0, 100) < 14) {
      this.spawnRipple(this.bobber.x, this.bobber.y + 3);
    }

    this.rippleGraphics.clear();

    this.ripples = this.ripples.filter((ripple) => {
      ripple.radius += ripple.speed * dt;
      ripple.alpha -= dt * 0.45;

      if (ripple.alpha <= 0) {
        return false;
      }

      this.rippleGraphics.lineStyle(2, 0x9be6ff, ripple.alpha);
      this.rippleGraphics.strokeCircle(ripple.x, ripple.y, ripple.radius);
      return true;
    });
  }

  private createSplash(x: number, y: number): void {
    for (let i = 0; i < 10; i += 1) {
      const drop = this.add.circle(x, y, Phaser.Math.Between(2, 4), 0xe7fbff, 0.9).setScrollFactor(0);
      const angle = Phaser.Math.FloatBetween(-Math.PI, 0);
      const speed = Phaser.Math.FloatBetween(80, 170);

      this.tweens.add({
        targets: drop,
        x: x + Math.cos(angle) * speed * 0.35,
        y: y + Math.sin(angle) * speed * 0.35,
        alpha: 0,
        scale: 0.45,
        duration: 340,
        ease: 'Quad.Out',
        onComplete: () => drop.destroy(),
      });
    }
  }

  private createCelebrationParticles(): void {
    const cx = this.cameras.main.centerX;
    const cy = this.cameras.main.centerY - 10;

    for (let i = 0; i < 18; i += 1) {
      const p = this.add.circle(cx, cy, Phaser.Math.Between(2, 4), Phaser.Utils.Array.GetRandom([0xffd447, 0x7dffbf, 0x9cd7ff]), 1)
        .setScrollFactor(0);

      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const dist = Phaser.Math.FloatBetween(50, 140);

      this.tweens.add({
        targets: p,
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        alpha: 0,
        scale: 0.3,
        duration: Phaser.Math.Between(420, 760),
        ease: 'Sine.Out',
        onComplete: () => p.destroy(),
      });
    }
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
