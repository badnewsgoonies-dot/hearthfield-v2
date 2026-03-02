import Phaser from 'phaser';

export class ParticleEffects {
  /**
   * Green/yellow particles bursting upward when a crop is harvested.
   */
  static harvestBurst(scene: Phaser.Scene, x: number, y: number): void {
    const emitter = scene.add.particles(x, y, '__DEFAULT', {
      speed: { min: 60, max: 160 },
      angle: { min: 240, max: 300 },
      scale: { start: 0.6, end: 0 },
      lifespan: { min: 400, max: 700 },
      quantity: 18,
      tint: [0x44cc44, 0x88ee00, 0xffdd00],
      gravityY: 200,
      emitting: false,
    });

    emitter.explode(18, x, y);

    scene.time.delayedCall(800, () => {
      emitter.destroy();
    });
  }

  /**
   * Gold coin particles when earning money.
   */
  static goldSparkle(scene: Phaser.Scene, x: number, y: number, amount: number): void {
    const count = Math.min(5 + Math.floor(amount / 10), 30);

    const emitter = scene.add.particles(x, y, '__DEFAULT', {
      speed: { min: 40, max: 120 },
      angle: { min: 220, max: 320 },
      scale: { start: 0.5, end: 0 },
      lifespan: { min: 500, max: 900 },
      quantity: count,
      tint: [0xffd700, 0xffec4a, 0xffa500],
      gravityY: 150,
      emitting: false,
    });

    emitter.explode(count, x, y);

    scene.time.delayedCall(1000, () => {
      emitter.destroy();
    });
  }

  /**
   * Radial burst of white/blue particles for achievements.
   */
  static levelUp(scene: Phaser.Scene, x: number, y: number): void {
    const emitter = scene.add.particles(x, y, '__DEFAULT', {
      speed: { min: 80, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.7, end: 0 },
      lifespan: { min: 600, max: 1000 },
      quantity: 32,
      tint: [0xffffff, 0xaaddff, 0x4499ff],
      gravityY: 0,
      emitting: false,
    });

    emitter.explode(32, x, y);

    scene.time.delayedCall(1100, () => {
      emitter.destroy();
    });
  }

  /**
   * Small water droplets hitting the ground when it rains.
   */
  static rainSplash(scene: Phaser.Scene, x: number, y: number): void {
    const emitter = scene.add.particles(x, y, '__DEFAULT', {
      speed: { min: 20, max: 60 },
      angle: { min: 200, max: 340 },
      scale: { start: 0.3, end: 0 },
      lifespan: { min: 200, max: 400 },
      quantity: 6,
      tint: [0x88bbff, 0xaaccff, 0xddeeff],
      gravityY: 80,
      emitting: false,
    });

    emitter.explode(6, x, y);

    scene.time.delayedCall(450, () => {
      emitter.destroy();
    });
  }
}
