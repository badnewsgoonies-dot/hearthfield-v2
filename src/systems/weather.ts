import Phaser from 'phaser';
import { Season } from '../types';

export enum WeatherType {
  SUNNY = 'sunny',
  CLOUDY = 'cloudy',
  RAIN = 'rain',
  STORM = 'storm',
  SNOW = 'snow',
}

interface WeatherParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
}

export class WeatherSystem {
  private readonly scene: Phaser.Scene;

  private weatherGraphics: Phaser.GameObjects.Graphics | null = null;
  private tintOverlay: Phaser.GameObjects.Rectangle | null = null;
  private lightningOverlay: Phaser.GameObjects.Rectangle | null = null;
  private lightningTimer: Phaser.Time.TimerEvent | null = null;

  private activeWeather: WeatherType = WeatherType.SUNNY;
  private particles: WeatherParticle[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.scene.events.on('update', this.update, this);
  }

  rollDailyWeather(season: Season): WeatherType {
    const roll = Math.random();

    switch (season) {
      case Season.SPRING:
        if (roll < 0.5) return WeatherType.SUNNY;
        if (roll < 0.7) return WeatherType.CLOUDY;
        if (roll < 0.95) return WeatherType.RAIN;
        return WeatherType.STORM;

      case Season.SUMMER:
        if (roll < 0.6) return WeatherType.SUNNY;
        if (roll < 0.75) return WeatherType.CLOUDY;
        if (roll < 0.9) return WeatherType.RAIN;
        return WeatherType.STORM;

      case Season.FALL:
        if (roll < 0.35) return WeatherType.SUNNY;
        if (roll < 0.65) return WeatherType.CLOUDY;
        if (roll < 0.9) return WeatherType.RAIN;
        return WeatherType.STORM;

      case Season.WINTER:
        if (roll < 0.3) return WeatherType.SUNNY;
        if (roll < 0.55) return WeatherType.CLOUDY;
        if (roll < 0.75) return WeatherType.RAIN;
        return WeatherType.SNOW;

      default:
        return WeatherType.SUNNY;
    }
  }

  renderOverlay(weather: WeatherType): void {
    this.activeWeather = weather;
    this.clearOverlay();

    switch (weather) {
      case WeatherType.CLOUDY:
        this.createTintOverlay(0.15);
        break;

      case WeatherType.RAIN:
        this.createRainParticles(Phaser.Math.Between(40, 60), false);
        break;

      case WeatherType.STORM:
        this.createRainParticles(Phaser.Math.Between(40, 60), true);
        break;

      case WeatherType.SNOW:
        this.createSnowParticles(Phaser.Math.Between(40, 60));
        break;

      case WeatherType.SUNNY:
      default:
        break;
    }
  }

  getSpeedModifier(weather: WeatherType): number {
    switch (weather) {
      case WeatherType.RAIN:
        return 0.85;
      case WeatherType.STORM:
        return 0.7;
      case WeatherType.SNOW:
        return 0.8;
      default:
        return 1;
    }
  }

  getCropGrowthBonus(weather: WeatherType): boolean {
    return weather === WeatherType.RAIN || weather === WeatherType.STORM;
  }

  destroy(): void {
    this.clearOverlay();
    this.scene.events.off('update', this.update, this);
  }

  private update(_time: number, delta: number): void {
    if (!this.weatherGraphics || this.particles.length === 0) {
      return;
    }

    const camera = this.scene.cameras.main;
    const width = camera.width;
    const height = camera.height;
    const dt = delta / 1000;

    this.weatherGraphics.clear();

    if (this.activeWeather === WeatherType.RAIN || this.activeWeather === WeatherType.STORM) {
      this.weatherGraphics.lineStyle(2, 0x91b7e6, 0.7);

      for (const p of this.particles) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        if (p.y > height + 20 || p.x > width + 20) {
          p.x = Phaser.Math.FloatBetween(-20, width);
          p.y = Phaser.Math.FloatBetween(-80, -10);
        }

        this.weatherGraphics.beginPath();
        this.weatherGraphics.moveTo(p.x, p.y);
        this.weatherGraphics.lineTo(p.x + p.size, p.y + p.size * 1.8);
        this.weatherGraphics.strokePath();
      }

      return;
    }

    if (this.activeWeather === WeatherType.SNOW) {
      for (const p of this.particles) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        if (p.y > height + 10) {
          p.y = Phaser.Math.FloatBetween(-30, -6);
          p.x = Phaser.Math.FloatBetween(0, width);
        }

        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        this.weatherGraphics.fillStyle(0xffffff, p.alpha);
        this.weatherGraphics.fillCircle(p.x, p.y, p.size);
      }
    }
  }

  private clearOverlay(): void {
    if (this.lightningTimer) {
      this.lightningTimer.remove(false);
      this.lightningTimer = null;
    }

    if (this.weatherGraphics) {
      this.weatherGraphics.destroy();
      this.weatherGraphics = null;
    }

    if (this.tintOverlay) {
      this.tintOverlay.destroy();
      this.tintOverlay = null;
    }

    if (this.lightningOverlay) {
      this.lightningOverlay.destroy();
      this.lightningOverlay = null;
    }

    this.particles = [];
  }

  private createTintOverlay(alpha: number): void {
    const camera = this.scene.cameras.main;
    this.tintOverlay = this.scene.add
      .rectangle(0, 0, camera.width, camera.height, 0x000000, alpha)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(9999);
  }

  private createRainParticles(count: number, withLightning: boolean): void {
    const camera = this.scene.cameras.main;
    this.weatherGraphics = this.scene.add.graphics();
    this.weatherGraphics.setScrollFactor(0).setDepth(10000);

    this.particles = Array.from({ length: count }, () => ({
      x: Phaser.Math.FloatBetween(0, camera.width),
      y: Phaser.Math.FloatBetween(0, camera.height),
      vx: Phaser.Math.FloatBetween(90, 140),
      vy: Phaser.Math.FloatBetween(290, 410),
      size: Phaser.Math.FloatBetween(6, 12),
      alpha: Phaser.Math.FloatBetween(0.5, 0.9),
    }));

    if (!withLightning) {
      return;
    }

    this.lightningOverlay = this.scene.add
      .rectangle(0, 0, camera.width, camera.height, 0xffffff, 0)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(10001);

    this.lightningTimer = this.scene.time.addEvent({
      delay: 2200,
      loop: true,
      callback: () => {
        if (!this.lightningOverlay || Math.random() > 0.45) {
          return;
        }

        this.lightningOverlay.setAlpha(0.8);
        this.scene.tweens.add({
          targets: this.lightningOverlay,
          alpha: 0,
          duration: 120,
          ease: 'Quad.Out',
        });
      },
    });
  }

  private createSnowParticles(count: number): void {
    const camera = this.scene.cameras.main;
    this.weatherGraphics = this.scene.add.graphics();
    this.weatherGraphics.setScrollFactor(0).setDepth(10000);

    this.particles = Array.from({ length: count }, () => ({
      x: Phaser.Math.FloatBetween(0, camera.width),
      y: Phaser.Math.FloatBetween(0, camera.height),
      vx: Phaser.Math.FloatBetween(-20, 20),
      vy: Phaser.Math.FloatBetween(25, 60),
      size: Phaser.Math.FloatBetween(1.5, 3),
      alpha: Phaser.Math.FloatBetween(0.6, 0.95),
    }));
  }
}
