import Phaser from 'phaser';

export class HUDClock {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;

  private clockFace: Phaser.GameObjects.Graphics;
  private hourHand: Phaser.GameObjects.Graphics;
  private minuteHand: Phaser.GameObjects.Graphics;
  private centerDot: Phaser.GameObjects.Graphics;
  private ampmText: Phaser.GameObjects.Text;
  private weatherIcon: Phaser.GameObjects.Graphics;

  private lastWeather: string = '';

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.container = scene.add.container(x, y);

    // Clock face
    this.clockFace = scene.add.graphics();
    this.clockFace.lineStyle(2, 0xaabbcc, 1);
    this.clockFace.fillStyle(0x222244, 1);
    this.clockFace.fillCircle(0, 0, 28);
    this.clockFace.strokeCircle(0, 0, 28);

    // Hour hand
    this.hourHand = scene.add.graphics();

    // Minute hand
    this.minuteHand = scene.add.graphics();

    // Center dot
    this.centerDot = scene.add.graphics();
    this.centerDot.fillStyle(0xffffff, 1);
    this.centerDot.fillCircle(0, 0, 3);

    // AM/PM text
    this.ampmText = scene.add.text(0, 34, 'AM', {
      fontSize: '9px',
      color: '#ffffff',
    }).setOrigin(0.5, 0);

    // Weather icon
    this.weatherIcon = scene.add.graphics();

    this.container.add([
      this.clockFace,
      this.hourHand,
      this.minuteHand,
      this.centerDot,
      this.ampmText,
      this.weatherIcon,
    ]);

    this.container.setScrollFactor(0).setDepth(10002);
  }

  update(timeProgress: number, weather: string): void {
    // progress 0 = 6:00 AM, so add 0.25 offset to start at 6 AM on 12-hour clock
    // 0.25 = 12:00 PM, 0.5 = 6:00 PM, 0.75 = 12:00 AM

    // Convert progress to actual time hours (6 AM = 6, goes around 24h)
    const totalHours = 6 + timeProgress * 24;
    const hour12 = totalHours % 12; // 0-12

    const isAM = totalHours % 24 < 12;
    this.ampmText.setText(isAM ? 'AM' : 'PM');

    // Hour hand: rotates once per 12 in-game hours = twice per day
    // At 6AM (progress=0): totalHours=6, hour12=6, angle = 6/12 * 360 = 180°
    // At 12PM (progress=0.25): totalHours=12, hour12=0, angle = 0°
    // Full rotation: 360° per 12 hours of progress
    const hourAngle = (hour12 / 12) * Math.PI * 2 - Math.PI / 2;

    // Minute hand: rotates 12 times per day (once per in-game hour)
    // totalHours goes from 6 to 30, minutes within hour: (totalHours % 1) * 60
    const minuteFraction = totalHours % 1;
    const minuteAngle = minuteFraction * Math.PI * 2 - Math.PI / 2;

    // Draw hour hand
    this.hourHand.clear();
    this.hourHand.lineStyle(3, 0xffffff, 1);
    this.hourHand.beginPath();
    this.hourHand.moveTo(0, 0);
    this.hourHand.lineTo(Math.cos(hourAngle) * 16, Math.sin(hourAngle) * 16);
    this.hourHand.strokePath();

    // Draw minute hand
    this.minuteHand.clear();
    this.minuteHand.lineStyle(2, 0xaabbcc, 1);
    this.minuteHand.beginPath();
    this.minuteHand.moveTo(0, 0);
    this.minuteHand.lineTo(Math.cos(minuteAngle) * 22, Math.sin(minuteAngle) * 22);
    this.minuteHand.strokePath();

    // Only redraw weather icon if weather changed
    if (weather !== this.lastWeather) {
      this.lastWeather = weather;
      this.drawWeatherIcon(weather);
    }
  }

  private drawWeatherIcon(weather: string): void {
    const g = this.weatherIcon;
    g.clear();

    // Icons are drawn at ~(0, 68) — below the clock face (28r) + ampm text (~10px) + gap
    const ix = 0;
    const iy = 68;

    switch (weather) {
      case 'sunny':
        this.drawSunny(g, ix, iy);
        break;
      case 'cloudy':
        this.drawCloudy(g, ix, iy);
        break;
      case 'rain':
        this.drawRain(g, ix, iy);
        break;
      case 'storm':
        this.drawStorm(g, ix, iy);
        break;
      case 'snow':
        this.drawSnow(g, ix, iy);
        break;
      default:
        break;
    }
  }

  private drawSunny(g: Phaser.GameObjects.Graphics, x: number, y: number): void {
    g.fillStyle(0xffdd44, 1);
    g.fillCircle(x, y, 7);

    g.lineStyle(1.5, 0xffdd44, 1);
    const rayLen = 5;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const inner = 9;
      const outer = inner + rayLen;
      g.beginPath();
      g.moveTo(x + Math.cos(angle) * inner, y + Math.sin(angle) * inner);
      g.lineTo(x + Math.cos(angle) * outer, y + Math.sin(angle) * outer);
      g.strokePath();
    }
  }

  private drawCloudShape(g: Phaser.GameObjects.Graphics, x: number, y: number, color: number): void {
    g.fillStyle(color, 1);
    // Cloud: three overlapping rounded rectangles
    g.fillRoundedRect(x - 8, y - 2, 16, 7, 3);
    g.fillRoundedRect(x - 5, y - 6, 10, 7, 4);
    g.fillRoundedRect(x + 1, y - 4, 8, 6, 3);
  }

  private drawCloudy(g: Phaser.GameObjects.Graphics, x: number, y: number): void {
    this.drawCloudShape(g, x - 3, y, 0x999999);
    this.drawCloudShape(g, x + 3, y - 2, 0xbbbbbb);
  }

  private drawRain(g: Phaser.GameObjects.Graphics, x: number, y: number): void {
    this.drawCloudShape(g, x, y - 4, 0x999999);

    g.lineStyle(1.5, 0x5588cc, 1);
    const drops = [
      { dx: -5, dy: 5 },
      { dx: 0, dy: 7 },
      { dx: 5, dy: 5 },
    ];
    for (const d of drops) {
      g.beginPath();
      g.moveTo(x + d.dx, y + d.dy);
      g.lineTo(x + d.dx + 3, y + d.dy + 5);
      g.strokePath();
    }
  }

  private drawStorm(g: Phaser.GameObjects.Graphics, x: number, y: number): void {
    this.drawCloudShape(g, x, y - 4, 0x777777);

    // Lightning bolt zigzag
    g.fillStyle(0xffdd00, 1);
    g.beginPath();
    g.moveTo(x + 1, y + 1);
    g.lineTo(x - 2, y + 6);
    g.lineTo(x + 1, y + 6);
    g.lineTo(x - 2, y + 12);
    g.lineTo(x + 4, y + 5);
    g.lineTo(x + 1, y + 5);
    g.lineTo(x + 4, y);
    g.closePath();
    g.fillPath();

    // Rain lines
    g.lineStyle(1.5, 0x5588cc, 0.8);
    const drops = [
      { dx: -7, dy: 4 },
      { dx: -4, dy: 6 },
    ];
    for (const d of drops) {
      g.beginPath();
      g.moveTo(x + d.dx, y + d.dy);
      g.lineTo(x + d.dx + 3, y + d.dy + 5);
      g.strokePath();
    }
  }

  private drawSnow(g: Phaser.GameObjects.Graphics, x: number, y: number): void {
    this.drawCloudShape(g, x, y - 4, 0x999999);

    g.fillStyle(0xffffff, 1);
    const dots = [
      { dx: -5, dy: 7 },
      { dx: 0, dy: 9 },
      { dx: 5, dy: 7 },
    ];
    for (const d of dots) {
      g.fillCircle(x + d.dx, y + d.dy, 2);
    }
  }

  destroy(): void {
    this.container.destroy(true);
  }
}
