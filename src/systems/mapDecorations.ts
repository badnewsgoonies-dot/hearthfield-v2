import Phaser from 'phaser';

export class MapDecorations {
  private scene: Phaser.Scene;
  private decorations: Phaser.GameObjects.Graphics[];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.decorations = [];
  }

  placeDecorations(
    grassPositions: Array<{ x: number; y: number; worldX: number; worldY: number; tileSize: number }>,
    season: string
  ): void {
    // Clear existing decorations
    this.destroy();

    for (const pos of grassPositions) {
      const seed = (pos.x * 73 + pos.y * 137) % 100;
      if (seed >= 30) continue;

      // Determine decoration type using a secondary hash
      const typeSeed = (pos.x * 31 + pos.y * 53) % 100;
      const half = pos.tileSize / 2;

      // Random offset within tile (use deterministic pseudo-random)
      const offX = ((pos.x * 17 + pos.y * 41) % pos.tileSize) - half;
      const offY = ((pos.x * 29 + pos.y * 67) % pos.tileSize) - half;
      const cx = pos.worldX + offX;
      const cy = pos.worldY + offY;
      const depth = pos.worldY - 1;

      let gfx: Phaser.GameObjects.Graphics | null = null;

      if (typeSeed < 40) {
        // Grass tuft (40%)
        gfx = this.drawGrassTuft(cx, cy, season);
      } else if (typeSeed < 60) {
        // Small rock (20%)
        gfx = this.drawSmallRock(cx, cy);
      } else if (typeSeed < 80) {
        // Wildflower (20%) — skip in fall/winter
        if (season !== 'fall' && season !== 'winter') {
          gfx = this.drawWildflower(cx, cy, season);
        }
      } else if (typeSeed < 90) {
        // Dirt patch (10%)
        gfx = this.drawDirtPatch(cx, cy);
      } else {
        // Fallen leaf (10%) — fall only; winter: snow dot
        if (season === 'fall') {
          gfx = this.drawFallenLeaf(cx, cy);
        } else if (season === 'winter') {
          gfx = this.drawSnowDot(cx, cy);
        }
      }

      if (gfx) {
        gfx.setDepth(depth);
        this.decorations.push(gfx);
      }
    }
  }

  updateSeason(season: string): void {
    // Rebuild decorations is handled by caller re-invoking placeDecorations.
    // Update tint on existing grass tufts by re-colouring based on season.
    // Since graphics are procedural, destroy and let caller re-place.
    this.destroy();
  }

  destroy(): void {
    for (const gfx of this.decorations) {
      gfx.destroy();
    }
    this.decorations = [];
  }

  // ── Private drawing helpers ──────────────────────────────────

  private drawGrassTuft(x: number, y: number, season: string): Phaser.GameObjects.Graphics {
    const colors: Record<string, number> = {
      spring: 0x44aa22,
      summer: 0x55bb33,
      fall:   0x998844,
      winter: 0xaabbcc,
    };
    const color = colors[season] ?? 0x44aa22;
    const gfx = this.scene.add.graphics();
    gfx.lineStyle(1, color, 1);

    // 3-5 blades; use 4 for determinism
    const blades = 4;
    for (let i = 0; i < blades; i++) {
      const angle = -Math.PI / 2 + ((i - (blades - 1) / 2) * (Math.PI / 6));
      const len = 4 + (i % 2) * 2; // 4-6 px
      gfx.beginPath();
      gfx.moveTo(x, y);
      gfx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
      gfx.strokePath();
    }
    return gfx;
  }

  private drawSmallRock(x: number, y: number): Phaser.GameObjects.Graphics {
    const gfx = this.scene.add.graphics();
    // Gray oval body
    gfx.fillStyle(0x888888, 1);
    gfx.fillEllipse(x, y, 8, 5);
    // Lighter highlight top-left
    gfx.fillStyle(0xaaaaaa, 1);
    gfx.fillEllipse(x - 1, y - 1, 3, 2);
    return gfx;
  }

  private drawWildflower(x: number, y: number, season: string): Phaser.GameObjects.Graphics {
    const stemColor = 0x44aa22;
    const dotColor = season === 'summer'
      ? (((x + y) % 2 === 0) ? 0xffcc00 : 0xff8800)  // yellow/orange
      : (((x + y) % 2 === 0) ? 0xff88bb : 0xffffff);  // pink/white
    const gfx = this.scene.add.graphics();
    // Stem
    gfx.lineStyle(1, stemColor, 1);
    gfx.beginPath();
    gfx.moveTo(x, y);
    gfx.lineTo(x, y - 5);
    gfx.strokePath();
    // Flower dot
    gfx.fillStyle(dotColor, 1);
    gfx.fillCircle(x, y - 6, 2);
    return gfx;
  }

  private drawDirtPatch(x: number, y: number): Phaser.GameObjects.Graphics {
    const gfx = this.scene.add.graphics();
    gfx.fillStyle(0x665544, 1);
    gfx.fillEllipse(x, y, 7, 4);
    return gfx;
  }

  private drawFallenLeaf(x: number, y: number): Phaser.GameObjects.Graphics {
    const color = ((x + y) % 2 === 0) ? 0xff6600 : 0xcc2200;
    const gfx = this.scene.add.graphics();
    gfx.fillStyle(color, 1);
    gfx.fillTriangle(x, y - 4, x - 3, y + 2, x + 3, y + 2);
    return gfx;
  }

  private drawSnowDot(x: number, y: number): Phaser.GameObjects.Graphics {
    const gfx = this.scene.add.graphics();
    gfx.fillStyle(0xffffff, 0.85);
    gfx.fillCircle(x, y, 2);
    return gfx;
  }
}
