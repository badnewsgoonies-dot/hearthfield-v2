import Phaser from 'phaser';

export class ShipBinEffect {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  playShipAnimation(x: number, y: number, itemName: string, revenue: number): void {
    const scene = this.scene;

    // Item name text floats up and fades over 800ms
    const nameText = scene.add.text(x, y, itemName, {
      fontSize: '14px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5, 1);

    scene.tweens.add({
      targets: nameText,
      y: y - 48,
      alpha: 0,
      duration: 800,
      ease: 'Cubic.Out',
      onComplete: () => nameText.destroy(),
    });

    // Revenue text "+Xg" in gold floats up over 600ms, starting slightly below
    const revenueText = scene.add.text(x, y + 16, `+${revenue}g`, {
      fontSize: '13px',
      color: '#ffdd44',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5, 0);

    scene.tweens.add({
      targets: revenueText,
      y: y - 20,
      alpha: 0,
      duration: 600,
      ease: 'Cubic.Out',
      onComplete: () => revenueText.destroy(),
    });

    // 8-12 gold particles burst outward
    const count = Phaser.Math.Between(8, 12);
    const emitter = scene.add.particles(x, y, '__DEFAULT', {
      speed: { min: 50, max: 130 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.5, end: 0 },
      lifespan: { min: 400, max: 700 },
      quantity: count,
      tint: 0xffd700,
      gravityY: 120,
      emitting: false,
    });

    emitter.explode(count, x, y);

    scene.time.delayedCall(750, () => emitter.destroy());

    // Bin lid: small brown rectangle that tilts open 30° then closes over 400ms
    const lid = scene.add.rectangle(x, y - 8, 24, 6, 0x8b5e3c);
    lid.setOrigin(0, 0.5);

    scene.tweens.add({
      targets: lid,
      angle: -30,
      duration: 200,
      ease: 'Cubic.Out',
      yoyo: true,
      hold: 0,
      onComplete: () => lid.destroy(),
    });
  }

  destroy(): void {
    // No persistent resources to clean up
  }
}
