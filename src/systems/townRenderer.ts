import Phaser from 'phaser';
import { ySortDepth } from '../types';

export interface TownBuilding {
  objects: Phaser.GameObjects.GameObject[];
  solidTiles: Array<{ x: number; y: number }>;
}

export class TownRenderer {
  private static readonly WOOD_LIGHT = 0x8B6B4A;
  private static readonly WOOD_DARK = 0x6B4A2A;
  private static readonly STONE_LIGHT = 0x888888;
  private static readonly STONE_DARK = 0x666666;
  private static readonly ROOF_RED = 0xaa4444;
  private static readonly ROOF_BROWN = 0x6B4A2A;
  private static readonly ROOF_SLATE = 0x556677;
  private static readonly DOOR = 0x3a2a1a;
  private static readonly WINDOW = 0x88bbdd;
  private static readonly WINDOW_FRAME = 0x668899;
  private static readonly METAL = 0x555566;
  private static readonly GLOW = 0xffdd88;

  private static buildingSolid3x2(): Array<{ x: number; y: number }> {
    return [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 0, y: 1 },
      { x: 2, y: 1 },
    ];
  }

  private static setDepth(obj: Phaser.GameObjects.GameObject, worldY: number): void {
    if ('setDepth' in obj && typeof obj.setDepth === 'function') {
      obj.setDepth(ySortDepth(worldY));
    }
  }

  static drawShop(scene: Phaser.Scene, tileX: number, tileY: number, T: number): TownBuilding {
    const g = scene.add.graphics();
    const px = tileX * T;
    const py = tileY * T;
    const w = 3 * T;
    const h = 2 * T;
    const awningH = Math.floor(T * 0.32);

    g.fillStyle(0x000000, 0.1);
    g.fillRect(px + Math.floor(T * 0.16), py + h + Math.floor(T * 0.1), w, Math.floor(T * 0.22));

    g.fillStyle(this.WOOD_LIGHT, 1);
    g.fillRect(px, py + Math.floor(T * 0.52), w, Math.floor(T * 1.48));

    g.fillStyle(this.WOOD_DARK, 1);
    g.fillRect(px, py + Math.floor(T * 0.52), w, Math.floor(T * 0.12));
    g.fillRect(px, py + h - Math.floor(T * 0.12), w, Math.floor(T * 0.12));

    g.fillStyle(this.ROOF_RED, 1);
    g.fillTriangle(px - 2, py + Math.floor(T * 0.56), px + w + 2, py + Math.floor(T * 0.56), px + Math.floor(w / 2), py + Math.floor(T * 0.08));

    g.fillStyle(0xcc8844, 1);
    g.fillRect(px, py + Math.floor(T * 0.86), w, awningH);
    g.fillStyle(0xeecc88, 1);
    for (let i = 0; i < 6; i++) {
      if (i % 2 === 0) {
        const sx = px + Math.floor((w / 6) * i);
        g.fillRect(sx, py + Math.floor(T * 0.86), Math.ceil(w / 6), awningH);
      }
    }

    const doorW = Math.floor(T * 0.5);
    const doorH = Math.floor(T * 0.8);
    const doorX = px + Math.floor((w - doorW) / 2);
    const doorY = py + h - doorH;
    g.fillStyle(this.DOOR, 1);
    g.fillRect(doorX, doorY, doorW, doorH);

    const winW = Math.floor(T * 0.38);
    const winH = Math.floor(T * 0.32);
    g.fillStyle(this.WINDOW_FRAME, 1);
    g.fillRect(px + Math.floor(T * 0.45), py + Math.floor(T * 1.06), winW + 4, winH + 4);
    g.fillRect(px + w - Math.floor(T * 0.45) - winW - 4, py + Math.floor(T * 1.06), winW + 4, winH + 4);
    g.fillStyle(this.WINDOW, 1);
    g.fillRect(px + Math.floor(T * 0.45) + 2, py + Math.floor(T * 1.06) + 2, winW, winH);
    g.fillRect(px + w - Math.floor(T * 0.45) - winW - 2, py + Math.floor(T * 1.06) + 2, winW, winH);

    this.setDepth(g, py + h);

    return {
      objects: [g],
      solidTiles: this.buildingSolid3x2(),
    };
  }

  static drawBlacksmith(scene: Phaser.Scene, tileX: number, tileY: number, T: number): TownBuilding {
    const g = scene.add.graphics();
    const smoke = scene.add.graphics();
    const px = tileX * T;
    const py = tileY * T;
    const w = 3 * T;
    const h = 2 * T;

    g.fillStyle(0x000000, 0.1);
    g.fillRect(px + Math.floor(T * 0.16), py + h + Math.floor(T * 0.1), w, Math.floor(T * 0.22));

    g.fillStyle(this.STONE_LIGHT, 1);
    g.fillRect(px, py + Math.floor(T * 0.58), w, Math.floor(T * 1.42));

    g.fillStyle(this.STONE_DARK, 1);
    for (let ry = py + Math.floor(T * 0.64); ry < py + h - 4; ry += Math.floor(T * 0.26)) {
      g.fillRect(px + 2, ry, w - 4, 1);
    }

    g.fillStyle(this.ROOF_SLATE, 1);
    g.fillRect(px, py + Math.floor(T * 0.26), w, Math.floor(T * 0.4));

    const chimneyX = px + Math.floor(T * 0.28);
    const chimneyY = py + Math.floor(T * 0.04);
    g.fillStyle(this.STONE_DARK, 1);
    g.fillRect(chimneyX, chimneyY, Math.floor(T * 0.34), Math.floor(T * 0.66));

    g.fillStyle(this.DOOR, 1);
    g.fillRect(px + Math.floor(T * 1.26), py + Math.floor(T * 1.2), Math.floor(T * 0.5), Math.floor(T * 0.8));

    g.fillStyle(this.METAL, 1);
    g.fillRect(px + Math.floor(T * 2.1), py + Math.floor(T * 1.08), Math.floor(T * 0.42), Math.floor(T * 0.42));
    g.fillRect(px + Math.floor(T * 2.24), py + Math.floor(T * 0.96), Math.floor(T * 0.12), Math.floor(T * 0.66));

    smoke.fillStyle(0x999999, 0.35);
    smoke.fillCircle(chimneyX + Math.floor(T * 0.17), chimneyY - Math.floor(T * 0.08), Math.floor(T * 0.12));
    smoke.fillCircle(chimneyX + Math.floor(T * 0.28), chimneyY - Math.floor(T * 0.22), Math.floor(T * 0.1));
    smoke.fillCircle(chimneyX + Math.floor(T * 0.14), chimneyY - Math.floor(T * 0.34), Math.floor(T * 0.09));

    this.setDepth(smoke, py + Math.floor(T * 0.55));
    this.setDepth(g, py + h);

    return {
      objects: [smoke, g],
      solidTiles: this.buildingSolid3x2(),
    };
  }

  static drawCarpenter(scene: Phaser.Scene, tileX: number, tileY: number, T: number): TownBuilding {
    const g = scene.add.graphics();
    const px = tileX * T;
    const py = tileY * T;
    const w = 3 * T;
    const h = 2 * T;

    g.fillStyle(0x000000, 0.1);
    g.fillRect(px + Math.floor(T * 0.16), py + h + Math.floor(T * 0.1), w, Math.floor(T * 0.22));

    g.fillStyle(this.WOOD_LIGHT, 1);
    g.fillRect(px, py + Math.floor(T * 0.58), w, Math.floor(T * 1.42));

    g.fillStyle(this.WOOD_DARK, 1);
    const logH = Math.max(2, Math.floor(T * 0.18));
    for (let y = py + Math.floor(T * 0.62); y < py + h; y += logH + 1) {
      g.fillRect(px, y, w, logH);
    }
    g.fillRect(px, py + Math.floor(T * 0.58), Math.floor(T * 0.16), Math.floor(T * 1.42));
    g.fillRect(px + w - Math.floor(T * 0.16), py + Math.floor(T * 0.58), Math.floor(T * 0.16), Math.floor(T * 1.42));

    g.fillStyle(this.ROOF_BROWN, 1);
    g.fillTriangle(px - 2, py + Math.floor(T * 0.58), px + w + 2, py + Math.floor(T * 0.58), px + Math.floor(w / 2), py + Math.floor(T * 0.1));

    g.fillStyle(this.DOOR, 1);
    g.fillRect(px + Math.floor(T * 1.24), py + Math.floor(T * 1.2), Math.floor(T * 0.52), Math.floor(T * 0.8));

    g.fillStyle(this.WOOD_DARK, 1);
    g.fillRect(px + Math.floor(T * 0.42), py + Math.floor(T * 1.18), Math.floor(T * 0.52), Math.floor(T * 0.18));
    g.fillRect(px + Math.floor(T * 0.56), py + Math.floor(T * 1.02), Math.floor(T * 0.08), Math.floor(T * 0.34));
    g.fillRect(px + Math.floor(T * 2.06), py + Math.floor(T * 1.04), Math.floor(T * 0.14), Math.floor(T * 0.56));
    g.fillRect(px + Math.floor(T * 1.94), py + Math.floor(T * 1.24), Math.floor(T * 0.38), Math.floor(T * 0.14));

    this.setDepth(g, py + h);

    return {
      objects: [g],
      solidTiles: this.buildingSolid3x2(),
    };
  }

  static drawTownHall(scene: Phaser.Scene, tileX: number, tileY: number, T: number): TownBuilding {
    const g = scene.add.graphics();
    const px = tileX * T;
    const py = tileY * T;
    const w = 4 * T;
    const h = 2 * T;

    g.fillStyle(0x000000, 0.1);
    g.fillRect(px + Math.floor(T * 0.2), py + h + Math.floor(T * 0.12), w, Math.floor(T * 0.24));

    g.fillStyle(this.STONE_LIGHT, 1);
    g.fillRect(px, py + Math.floor(T * 0.56), w, Math.floor(T * 1.44));

    g.fillStyle(this.STONE_DARK, 1);
    g.fillRect(px, py + Math.floor(T * 0.56), w, Math.floor(T * 0.12));
    g.fillRect(px, py + h - Math.floor(T * 0.14), w, Math.floor(T * 0.14));

    g.fillStyle(this.ROOF_RED, 1);
    g.fillTriangle(px - 2, py + Math.floor(T * 0.58), px + w + 2, py + Math.floor(T * 0.58), px + Math.floor(w / 2), py + Math.floor(T * 0.02));

    g.fillStyle(this.DOOR, 1);
    const doorW = Math.floor(T * 0.56);
    const doorH = Math.floor(T * 0.9);
    g.fillRect(px + Math.floor(w / 2 - doorW / 2), py + h - doorH, doorW, doorH);

    g.fillStyle(this.WINDOW_FRAME, 1);
    const winW = Math.floor(T * 0.34);
    const winH = Math.floor(T * 0.34);
    const yWin = py + Math.floor(T * 1.02);
    const xOffsets = [Math.floor(T * 0.55), Math.floor(T * 1.35), Math.floor(T * 2.25), Math.floor(T * 3.05)];
    for (const off of xOffsets) {
      g.fillRect(px + off, yWin, winW + 4, winH + 4);
      g.fillStyle(this.WINDOW, 1);
      g.fillRect(px + off + 2, yWin + 2, winW, winH);
      g.fillStyle(this.WINDOW_FRAME, 1);
    }

    g.fillStyle(0xddcc77, 1);
    g.fillRect(px + Math.floor(w / 2 - T * 0.36), py + Math.floor(T * 0.34), Math.floor(T * 0.72), Math.floor(T * 0.16));

    this.setDepth(g, py + h);

    return {
      objects: [g],
      solidTiles: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 3, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
        { x: 3, y: 1 },
      ],
    };
  }

  static drawWell(scene: Phaser.Scene, tileX: number, tileY: number, T: number): TownBuilding {
    const g = scene.add.graphics();
    const cx = tileX * T + T / 2;
    const cy = tileY * T + T / 2;
    const rimR = T * 0.28;

    g.fillStyle(0x000000, 0.1);
    g.fillCircle(cx + T * 0.08, cy + T * 0.26, rimR);

    g.fillStyle(this.STONE_DARK, 1);
    g.fillCircle(cx, cy + T * 0.12, rimR + 2);
    g.fillStyle(this.STONE_LIGHT, 1);
    g.fillCircle(cx, cy + T * 0.1, rimR - 1);

    g.fillStyle(0x335577, 1);
    g.fillCircle(cx, cy + T * 0.1, rimR * 0.58);

    g.fillStyle(this.WOOD_DARK, 1);
    g.fillRect(cx - T * 0.22, cy - T * 0.22, Math.max(2, Math.floor(T * 0.08)), Math.floor(T * 0.28));
    g.fillRect(cx + T * 0.14, cy - T * 0.22, Math.max(2, Math.floor(T * 0.08)), Math.floor(T * 0.28));

    g.fillStyle(this.ROOF_BROWN, 1);
    g.fillTriangle(cx - T * 0.32, cy - T * 0.2, cx + T * 0.32, cy - T * 0.2, cx, cy - T * 0.42);

    this.setDepth(g, tileY * T + T);

    return {
      objects: [g],
      solidTiles: [{ x: 0, y: 0 }],
    };
  }

  static drawLamppost(scene: Phaser.Scene, tileX: number, tileY: number, T: number): TownBuilding {
    const glow = scene.add.graphics();
    const g = scene.add.graphics();
    const cx = tileX * T + T / 2;
    const baseY = tileY * T + T;

    glow.fillStyle(this.GLOW, 0.15);
    glow.fillCircle(cx, baseY - T * 0.62, T * 0.8);

    g.fillStyle(0x000000, 0.1);
    g.fillCircle(cx + T * 0.08, baseY - T * 0.06, T * 0.2);

    g.fillStyle(this.METAL, 1);
    g.fillRect(cx - T * 0.05, baseY - T * 0.72, Math.max(2, Math.floor(T * 0.1)), Math.floor(T * 0.62));
    g.fillRect(cx - T * 0.12, baseY - T * 0.8, Math.floor(T * 0.24), Math.floor(T * 0.08));

    g.fillStyle(this.GLOW, 1);
    g.fillRect(cx - T * 0.09, baseY - T * 0.72, Math.floor(T * 0.18), Math.floor(T * 0.14));

    this.setDepth(glow, baseY - T * 0.5);
    this.setDepth(g, baseY);

    return {
      objects: [glow, g],
      solidTiles: [{ x: 0, y: 0 }],
    };
  }

  static drawBench(scene: Phaser.Scene, tileX: number, tileY: number, T: number): TownBuilding {
    const g = scene.add.graphics();
    const px = tileX * T;
    const py = tileY * T;

    g.fillStyle(0x000000, 0.1);
    g.fillRect(px + Math.floor(T * 0.14), py + Math.floor(T * 0.74), Math.floor(T * 0.72), Math.floor(T * 0.16));

    g.fillStyle(this.WOOD_DARK, 1);
    g.fillRect(px + Math.floor(T * 0.22), py + Math.floor(T * 0.36), Math.floor(T * 0.56), Math.floor(T * 0.12));

    g.fillStyle(this.WOOD_LIGHT, 1);
    for (let i = 0; i < 3; i++) {
      g.fillRect(px + Math.floor(T * (0.2 + i * 0.2)), py + Math.floor(T * 0.56), Math.floor(T * 0.16), Math.floor(T * 0.1));
    }

    g.fillStyle(this.WOOD_DARK, 1);
    g.fillRect(px + Math.floor(T * 0.24), py + Math.floor(T * 0.66), Math.floor(T * 0.08), Math.floor(T * 0.16));
    g.fillRect(px + Math.floor(T * 0.68), py + Math.floor(T * 0.66), Math.floor(T * 0.08), Math.floor(T * 0.16));

    this.setDepth(g, py + T);

    return {
      objects: [g],
      solidTiles: [],
    };
  }

  static drawMarketStall(scene: Phaser.Scene, tileX: number, tileY: number, T: number, color: number): TownBuilding {
    const g = scene.add.graphics();
    const px = tileX * T;
    const py = tileY * T;
    const w = 2 * T;

    g.fillStyle(0x000000, 0.1);
    g.fillRect(px + Math.floor(T * 0.12), py + Math.floor(T * 0.84), w, Math.floor(T * 0.14));

    g.fillStyle(this.WOOD_DARK, 1);
    g.fillRect(px + Math.floor(T * 0.12), py + Math.floor(T * 0.38), Math.floor(T * 0.1), Math.floor(T * 0.5));
    g.fillRect(px + w - Math.floor(T * 0.22), py + Math.floor(T * 0.38), Math.floor(T * 0.1), Math.floor(T * 0.5));

    const awningY = py + Math.floor(T * 0.24);
    const awningH = Math.floor(T * 0.22);
    g.fillStyle(color, 1);
    g.fillRect(px, awningY, w, awningH);
    g.fillStyle(0xffffff, 0.75);
    for (let i = 0; i < 6; i++) {
      if (i % 2 === 0) {
        g.fillRect(px + Math.floor((w / 6) * i), awningY, Math.ceil(w / 6), awningH);
      }
    }

    g.fillStyle(this.WOOD_LIGHT, 1);
    g.fillRect(px + Math.floor(T * 0.2), py + Math.floor(T * 0.58), Math.floor(T * 1.6), Math.floor(T * 0.16));

    g.fillStyle(0xdd5533, 1);
    g.fillRect(px + Math.floor(T * 0.3), py + Math.floor(T * 0.6), Math.floor(T * 0.22), Math.floor(T * 0.1));
    g.fillStyle(0x77aa44, 1);
    g.fillRect(px + Math.floor(T * 0.62), py + Math.floor(T * 0.6), Math.floor(T * 0.22), Math.floor(T * 0.1));
    g.fillStyle(0xccaa55, 1);
    g.fillRect(px + Math.floor(T * 0.94), py + Math.floor(T * 0.6), Math.floor(T * 0.22), Math.floor(T * 0.1));

    this.setDepth(g, py + T);

    return {
      objects: [g],
      solidTiles: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
      ],
    };
  }

  static drawFlowerBed(scene: Phaser.Scene, tileX: number, tileY: number, T: number, season: string): TownBuilding {
    const g = scene.add.graphics();
    const px = tileX * T;
    const py = tileY * T;

    g.fillStyle(0x000000, 0.08);
    g.fillRect(px + Math.floor(T * 0.12), py + Math.floor(T * 0.74), Math.floor(T * 0.76), Math.floor(T * 0.14));

    g.fillStyle(0x7a5a3a, 1);
    g.fillRect(px + Math.floor(T * 0.14), py + Math.floor(T * 0.5), Math.floor(T * 0.72), Math.floor(T * 0.26));

    let flowerColors: number[];
    switch (season.toLowerCase()) {
      case 'summer':
        flowerColors = [0xffcc22, 0xff6633, 0xff66aa];
        break;
      case 'fall':
      case 'autumn':
        flowerColors = [0xdd8833, 0xbb4422, 0xccaa44];
        break;
      case 'winter':
        flowerColors = [0xddeeff, 0xaaccff, 0xffffff];
        break;
      case 'spring':
      default:
        flowerColors = [0xff88cc, 0xffdd55, 0xcc88ff];
        break;
    }

    const spots: Array<{ x: number; y: number }> = [
      { x: 0.24, y: 0.58 },
      { x: 0.38, y: 0.62 },
      { x: 0.52, y: 0.57 },
      { x: 0.67, y: 0.61 },
      { x: 0.78, y: 0.56 },
    ];

    for (let i = 0; i < spots.length; i++) {
      const p = spots[i];
      g.fillStyle(0x3f8a3f, 1);
      g.fillRect(px + Math.floor(T * p.x), py + Math.floor(T * (p.y + 0.07)), Math.max(1, Math.floor(T * 0.03)), Math.floor(T * 0.08));
      g.fillStyle(flowerColors[i % flowerColors.length], 1);
      g.fillCircle(px + Math.floor(T * p.x), py + Math.floor(T * p.y), Math.floor(T * 0.07));
    }

    this.setDepth(g, py + T);

    return {
      objects: [g],
      solidTiles: [],
    };
  }

  static drawSignpost(scene: Phaser.Scene, tileX: number, tileY: number, T: number): TownBuilding {
    const g = scene.add.graphics();
    const px = tileX * T;
    const py = tileY * T;

    g.fillStyle(0x000000, 0.1);
    g.fillRect(px + Math.floor(T * 0.34), py + Math.floor(T * 0.82), Math.floor(T * 0.32), Math.floor(T * 0.14));

    g.fillStyle(this.WOOD_DARK, 1);
    g.fillRect(px + Math.floor(T * 0.46), py + Math.floor(T * 0.3), Math.floor(T * 0.1), Math.floor(T * 0.56));

    g.fillStyle(this.WOOD_LIGHT, 1);
    g.fillRect(px + Math.floor(T * 0.28), py + Math.floor(T * 0.34), Math.floor(T * 0.42), Math.floor(T * 0.12));
    g.fillRect(px + Math.floor(T * 0.34), py + Math.floor(T * 0.5), Math.floor(T * 0.4), Math.floor(T * 0.12));

    g.fillStyle(this.WOOD_DARK, 1);
    g.fillTriangle(px + Math.floor(T * 0.7), py + Math.floor(T * 0.34), px + Math.floor(T * 0.84), py + Math.floor(T * 0.4), px + Math.floor(T * 0.7), py + Math.floor(T * 0.46));
    g.fillTriangle(px + Math.floor(T * 0.34), py + Math.floor(T * 0.5), px + Math.floor(T * 0.2), py + Math.floor(T * 0.56), px + Math.floor(T * 0.34), py + Math.floor(T * 0.62));

    this.setDepth(g, py + T);

    return {
      objects: [g],
      solidTiles: [{ x: 0, y: 0 }],
    };
  }
}
