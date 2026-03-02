import Phaser from 'phaser';

interface WaterTileData {
  x: number;
  y: number;
  worldX: number;
  worldY: number;
  tileSize: number;
  phase: number;
  sparkleTimer: number;
  sparkleInterval: number;
}

export class WaterAnimation {
  private scene: Phaser.Scene;
  private graphics: Phaser.GameObjects.Graphics[];
  private timer: number;
  private tiles: WaterTileData[];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.graphics = [];
    this.timer = 0;
    this.tiles = [];
  }

  setupWaterTiles(tiles: Array<{ x: number; y: number; worldX: number; worldY: number; tileSize: number }>): void {
    // Destroy any existing graphics
    for (const g of this.graphics) {
      g.destroy();
    }
    this.graphics = [];

    // Create two graphics layers: base water and wave highlights + sparkles
    const baseGraphics = this.scene.add.graphics();
    const waveGraphics = this.scene.add.graphics();
    this.graphics.push(baseGraphics, waveGraphics);

    this.tiles = tiles.map(tile => ({
      ...tile,
      phase: tile.x * 0.7 + tile.y * 1.3,
      sparkleTimer: Math.random() * 1000,
      sparkleInterval: 800 + Math.random() * 1200,
    }));
  }

  update(delta: number): void {
    if (this.graphics.length < 2 || this.tiles.length === 0) return;

    this.timer += delta;

    const baseGraphics = this.graphics[0];
    const waveGraphics = this.graphics[1];

    baseGraphics.clear();
    waveGraphics.clear();

    const cycleFraction = this.timer / 2000; // complete cycle every 2000ms

    for (const tile of this.tiles) {
      const { worldX, worldY, tileSize, phase } = tile;

      // Base water fill
      baseGraphics.fillStyle(0x3388cc, 0.85);
      baseGraphics.fillRect(worldX, worldY, tileSize, tileSize);

      // Animated wave highlight using sin wave with per-tile phase offset
      const waveVal = Math.sin(cycleFraction * Math.PI * 2 + phase);
      const waveAlpha = 0.15 + 0.25 * ((waveVal + 1) / 2); // 0.15 to 0.40
      const waveH = Math.floor(tileSize * 0.3 + tileSize * 0.2 * ((waveVal + 1) / 2));
      const waveY = worldY + Math.floor((tileSize - waveH) / 2);

      waveGraphics.fillStyle(0x55aadd, waveAlpha);
      waveGraphics.fillRect(worldX + 1, waveY, tileSize - 2, waveH);

      // Sparkle effect
      tile.sparkleTimer += delta;
      if (tile.sparkleTimer >= tile.sparkleInterval) {
        tile.sparkleTimer = 0;
        tile.sparkleInterval = 800 + Math.random() * 1200;

        const sparkleX = worldX + 1 + Math.random() * (tileSize - 2);
        const sparkleY = worldY + 1 + Math.random() * (tileSize - 2);
        waveGraphics.fillStyle(0xffffff, 0.3);
        waveGraphics.fillRect(Math.floor(sparkleX), Math.floor(sparkleY), 2, 2);
      }
    }
  }

  destroy(): void {
    for (const g of this.graphics) {
      g.destroy();
    }
    this.graphics = [];
    this.tiles = [];
    this.timer = 0;
  }
}
