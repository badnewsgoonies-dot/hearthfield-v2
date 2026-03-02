import Phaser from 'phaser';

const BAR_W = 12;
const BAR_H = 80;
const HALF_H = BAR_H / 2;

function lerpColor(colorA: number, colorB: number, t: number): number {
  const ar = (colorA >> 16) & 0xff;
  const ag = (colorA >> 8) & 0xff;
  const ab = colorA & 0xff;
  const br = (colorB >> 16) & 0xff;
  const bg = (colorB >> 8) & 0xff;
  const bb = colorB & 0xff;
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const b = Math.round(ab + (bb - ab) * t);
  return (r << 16) | (g << 8) | b;
}

export class StaminaBar {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private bg: Phaser.GameObjects.Graphics;
  private fill: Phaser.GameObjects.Graphics;
  private label: Phaser.GameObjects.Text;
  private numberText: Phaser.GameObjects.Text;
  private warningTween: Phaser.Tweens.Tween | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.container = scene.add.container(x, y);

    // Background with border
    this.bg = scene.add.graphics();
    this.bg.fillStyle(0x1a1a2e, 1);
    this.bg.fillRect(0, 0, BAR_W, BAR_H);
    this.bg.lineStyle(1, 0x4a4a6a, 1);
    this.bg.strokeRect(0, 0, BAR_W, BAR_H);

    // Fill graphics redrawn each update
    this.fill = scene.add.graphics();

    // "E" label above bar (Energy)
    this.label = scene.add.text(BAR_W / 2, -12, 'E', {
      fontSize: '10px',
      color: '#ffffff',
    }).setOrigin(0.5, 0.5);

    // "X/Y" number display below bar
    this.numberText = scene.add.text(BAR_W / 2, BAR_H + 4, '0/0', {
      fontSize: '9px',
      color: '#ffffff',
    }).setOrigin(0.5, 0);

    this.container.add([this.bg, this.fill, this.label, this.numberText]);
    this.container.setScrollFactor(0).setDepth(9995);
  }

  /** Update the bar with current/max stamina values */
  update(current: number, max: number): void {
    this.drawFill(current, max);
    this.numberText.setText(`${Math.ceil(current)}/${max}`);

    if (max > 0 && current < max * 0.25) {
      this.startPulse();
    } else {
      this.stopPulse();
    }
  }

  /** Show low stamina warning pulse */
  showWarning(): void {
    this.startPulse();
  }

  destroy(): void {
    this.stopPulse();
    this.container.destroy(true);
  }

  private drawFill(current: number, max: number): void {
    this.fill.clear();

    const ratio = max > 0 ? Math.max(0, Math.min(1, current / max)) : 0;
    const fillHeight = ratio * BAR_H;
    if (fillHeight <= 0) return;

    // The bar fills from the bottom up; fillTop is the y where fill begins
    const fillTop = BAR_H - fillHeight;

    // Bottom segment [HALF_H, BAR_H]: gradient yellow -> red
    const botStart = Math.max(fillTop, HALF_H);
    if (botStart < BAR_H) {
      const segH = BAR_H - botStart;
      const t = (botStart - HALF_H) / HALF_H;
      const topColor = lerpColor(0xddcc00, 0xff4444, t);
      this.fill.fillGradientStyle(topColor, topColor, 0xff4444, 0xff4444, 1);
      this.fill.fillRect(0, botStart, BAR_W, segH);
    }

    // Top segment [0, HALF_H]: gradient green -> yellow
    if (fillTop < HALF_H) {
      const segStart = Math.max(fillTop, 0);
      const segH = HALF_H - segStart;
      const t = segStart / HALF_H;
      const topColor = lerpColor(0x44cc44, 0xddcc00, t);
      this.fill.fillGradientStyle(topColor, topColor, 0xddcc00, 0xddcc00, 1);
      this.fill.fillRect(0, segStart, BAR_W, segH);
    }
  }

  private startPulse(): void {
    if (this.warningTween) return;
    this.warningTween = this.scene.tweens.add({
      targets: this.fill,
      alpha: { from: 0.6, to: 1.0 },
      duration: 250, // 500ms full cycle with yoyo
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private stopPulse(): void {
    if (this.warningTween) {
      this.warningTween.stop();
      this.warningTween = null;
      this.fill.setAlpha(1);
    }
  }
}
