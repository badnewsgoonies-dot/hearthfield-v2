/**
 * InteriorScene — renders building interiors (house, coop, barn)
 * Launched from PlayScene when player enters a building door.
 * Dynamic tile sizing to fill viewport. Pixel-art furniture (no emoji).
 */
import Phaser from 'phaser';
import { Events, InteractionKind, Quality, Season, Tool } from '../types';
import { PlayScene } from './PlayScene';
import { ITEMS } from '../data/registry';
import { ANIMAL_DEFS } from '../data/animalData';

export type BuildingType = 'house' | 'coop' | 'barn';

interface InteriorInitData {
  playScene: PlayScene;
  building: BuildingType;
}

const enum ITile {
  FLOOR = 0, WALL = 1, DOOR_EXIT = 2, FURNITURE = 3,
  FLOOR_RUG = 4, FLOOR_HAY = 5, FLOOR_WOOD = 6,
}

interface BuildingLayout {
  width: number; height: number;
  grid: ITile[][];
  objects: Array<{ x: number; y: number; label: string; kind: InteractionKind; data?: any }>;
  animalBuilding?: 'coop' | 'barn';
  floorTint: number; wallTint: number; name: string;
}

const HOUSE_LAYOUT: BuildingLayout = {
  width: 10, height: 8, name: 'Home',
  floorTint: 0xc4956a, wallTint: 0x8b6914,
  grid: [
    [1,1,1,1,1,1,1,1,1,1],
    [1,0,3,0,4,4,4,0,3,1],
    [1,0,0,0,4,4,4,0,0,1],
    [1,3,0,0,0,0,0,0,3,1],
    [1,0,0,3,0,0,3,0,0,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,2,2,1,1,1,1],
  ],
  objects: [
    { x: 2, y: 1, label: 'Bed', kind: InteractionKind.BED },
    { x: 8, y: 1, label: 'Kitchen', kind: InteractionKind.KITCHEN },
    { x: 1, y: 3, label: 'Bookshelf', kind: InteractionKind.CHEST, data: { msg: "Your grandfather's old journals..." } },
    { x: 8, y: 3, label: 'Fireplace', kind: InteractionKind.CHEST, data: { msg: 'The fire crackles warmly.' } },
    { x: 3, y: 4, label: 'Table', kind: InteractionKind.CHEST, data: { msg: 'A sturdy wooden table.' } },
    { x: 6, y: 4, label: 'Plant', kind: InteractionKind.CHEST, data: { msg: 'A cheerful potted plant.' } },
  ],
};

const COOP_LAYOUT: BuildingLayout = {
  width: 8, height: 7, name: 'Chicken Coop',
  floorTint: 0xc4a84a, wallTint: 0x8b4513,
  animalBuilding: 'coop',
  grid: [
    [1,1,1,1,1,1,1,1],
    [1,5,5,5,5,5,5,1],
    [1,5,5,5,5,5,5,1],
    [1,5,5,5,5,5,5,1],
    [1,5,5,5,5,5,5,1],
    [1,5,5,5,5,5,5,1],
    [1,1,1,2,2,1,1,1],
  ],
  objects: [
    { x: 1, y: 1, label: 'Nesting Box', kind: InteractionKind.CHEST, data: { msg: 'Collect eggs here when chickens are happy.' } },
    { x: 6, y: 1, label: 'Feed Trough', kind: InteractionKind.CHEST, data: { msg: 'Chickens eat fiber. Keep them fed daily!' } },
    { x: 6, y: 4, label: 'Buy Chicken', kind: InteractionKind.CHEST, data: { buyAnimal: 'chicken' } },
  ],
};

const BARN_LAYOUT: BuildingLayout = {
  width: 9, height: 8, name: 'Barn',
  floorTint: 0x9e8b6e, wallTint: 0x6b3a2a,
  animalBuilding: 'barn',
  grid: [
    [1,1,1,1,1,1,1,1,1],
    [1,6,6,6,6,6,6,6,1],
    [1,6,6,6,6,6,6,6,1],
    [1,6,6,6,6,6,6,6,1],
    [1,6,6,6,6,6,6,6,1],
    [1,6,6,6,6,6,6,6,1],
    [1,6,6,6,6,6,6,6,1],
    [1,1,1,1,2,2,1,1,1],
  ],
  objects: [
    { x: 1, y: 1, label: 'Hay Bale', kind: InteractionKind.CHEST, data: { msg: 'Fresh hay for the animals.' } },
    { x: 7, y: 1, label: 'Feed Trough', kind: InteractionKind.CHEST, data: { msg: 'Cows eat fiber. Keep them fed daily!' } },
    { x: 1, y: 4, label: 'Milking Stn', kind: InteractionKind.CHEST, data: { msg: "Milk cows here when they're happy." } },
    { x: 7, y: 4, label: 'Buy Cow', kind: InteractionKind.CHEST, data: { buyAnimal: 'cow' } },
  ],
};

const LAYOUTS: Record<BuildingType, BuildingLayout> = {
  house: HOUSE_LAYOUT, coop: COOP_LAYOUT, barn: BARN_LAYOUT,
};

export class InteriorScene extends Phaser.Scene {
  private playScene!: PlayScene;
  private building!: BuildingType;
  private layout!: BuildingLayout;
  private T = 48;
  private offX = 0;
  private offY = 0;
  private player!: Phaser.GameObjects.Sprite;
  private solidTiles = new Set<string>();
  private exitTiles = new Set<string>();
  private interactables: Array<{ x: number; y: number; label: string; kind: InteractionKind; sprite: Phaser.GameObjects.Rectangle; data?: any }> = [];
  private keys!: { up: Phaser.Input.Keyboard.Key; down: Phaser.Input.Keyboard.Key; left: Phaser.Input.Keyboard.Key; right: Phaser.Input.Keyboard.Key; interact: Phaser.Input.Keyboard.Key; esc: Phaser.Input.Keyboard.Key };
  private promptText!: Phaser.GameObjects.Text;
  private canExit = false;

  constructor() { super('InteriorScene'); }

  init(data: InteriorInitData) {
    this.playScene = data.playScene;
    this.building = data.building;
    this.layout = LAYOUTS[data.building];
    this.interactables = [];
    this.canExit = false;
  }

  create() {
    const { width: gw, height: gh, grid, floorTint, wallTint, name } = this.layout;
    const camW = this.cameras.main.width;
    const camH = this.cameras.main.height;

    // Dynamic tile size — fill viewport with margin for title + prompt
    const marginTop = 28, marginBot = 24, marginSide = 16;
    this.T = Math.min(75, Math.floor(Math.min((camW - marginSide * 2) / gw, (camH - marginTop - marginBot) / gh)));
    const T = this.T;
    this.offX = Math.floor((camW - gw * T) / 2);
    this.offY = marginTop + Math.floor(((camH - marginTop - marginBot) - gh * T) / 2);

    this.cameras.main.setBackgroundColor('#0e0e1e');
    this.solidTiles.clear();
    this.exitTiles.clear();

    const gfx = this.add.graphics().setDepth(0);
    const detailGfx = this.add.graphics().setDepth(1);

    // ── Render tiles ──
    for (let y = 0; y < gh; y++) {
      for (let x = 0; x < gw; x++) {
        const tile = grid[y][x];
        const px = this.offX + x * T;
        const py = this.offY + y * T;

        if (tile === ITile.WALL) {
          this.solidTiles.add(`${x},${y}`);
          this.drawWall(gfx, px, py, T, x, y, wallTint);
          continue;
        }

        if (tile === ITile.DOOR_EXIT) {
          this.exitTiles.add(`${x},${y}`);
          this.drawDoormat(gfx, detailGfx, px, py, T);
          continue;
        }

        // Floor base
        let base = floorTint;
        if (tile === ITile.FLOOR_RUG) base = 0x884433;
        else if (tile === ITile.FLOOR_HAY) base = 0xc4a84a;
        else if (tile === ITile.FLOOR_WOOD) base = 0x9e7b5e;

        this.drawFloor(gfx, detailGfx, px, py, T, x, y, tile, base);
      }
    }

    // Wall shadows on floor tiles
    for (let y = 0; y < gh; y++) {
      for (let x = 0; x < gw; x++) {
        if (grid[y][x] === ITile.WALL || grid[y][x] === ITile.DOOR_EXIT) continue;
        const px = this.offX + x * T, py = this.offY + y * T;
        if (y > 0 && grid[y - 1][x] === ITile.WALL) {
          gfx.fillStyle(0x000000, 0.18);
          gfx.fillRect(px, py, T, Math.ceil(T * 0.15));
        }
        if (x > 0 && grid[y][x - 1] === ITile.WALL) {
          gfx.fillStyle(0x000000, 0.08);
          gfx.fillRect(px, py, Math.ceil(T * 0.06), T);
        }
      }
    }

    // Window light (house only)
    if (this.building === 'house') {
      const lg = this.add.graphics().setDepth(1).setAlpha(0.06);
      lg.fillStyle(0xffffcc, 1);
      lg.fillRect(this.offX + 3 * T, this.offY + T, T * 3, T * 4);
      lg.fillRect(this.offX + 8 * T, this.offY + T, T * 3, T * 4);
    }

    // ── Pixel-art furniture ──
    const furGfx = this.add.graphics().setDepth(3);
    for (const obj of this.layout.objects) {
      const px = this.offX + obj.x * T;
      const py = this.offY + obj.y * T;
      this.drawFurniture(furGfx, px, py, T, obj.label);

      // Label text
      const fontSize = Math.max(8, Math.floor(T * 0.17));
      this.add.text(px + T / 2, py - 1, obj.label, {
        fontSize: `${fontSize}px`, color: '#ddd8cc',
        fontFamily: 'monospace', stroke: '#000000', strokeThickness: 2,
      }).setOrigin(0.5, 1).setDepth(5);

      this.solidTiles.add(`${obj.x},${obj.y}`);
      const hitRect = this.add.rectangle(px + T / 2, py + T / 2, T, T, 0x000000, 0).setDepth(0);
      this.interactables.push({ x: obj.x, y: obj.y, label: obj.label, kind: obj.kind, sprite: hitRect, data: obj.data });
    }

    // Animals
    if (this.layout.animalBuilding) this.placeAnimals();

    // Player — spawn one row above door
    const firstExit = [...this.exitTiles][0];
    const [doorX, doorY] = firstExit.split(',').map(Number);
    const playerScale = (T / 16) * 0.75; // sprite is 16x16; scale to ~75% of tile
    this.player = this.add.sprite(
      this.offX + doorX * T + T / 2,
      this.offY + (doorY - 1) * T + T / 2,
      'player', 0
    ).setScale(playerScale).setDepth(10);

    // Building name title
    this.add.text(camW / 2, this.offY - 6, name, {
      fontSize: `${Math.max(13, Math.floor(T * 0.3))}px`, color: '#ffdd88',
      fontFamily: 'monospace', stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5, 1).setDepth(20);

    // Exit arrows on door tiles
    for (const key of this.exitTiles) {
      const [ex, ey] = key.split(',').map(Number);
      this.add.text(this.offX + ex * T + T / 2, this.offY + ey * T + T / 2, '▼', {
        fontSize: `${Math.floor(T * 0.35)}px`, color: '#ffdd88',
      }).setOrigin(0.5).setDepth(5);
    }

    // Prompt
    this.promptText = this.add.text(camW / 2, camH - 10, '', {
      fontSize: '11px', color: '#ffdd88', fontFamily: 'monospace',
      backgroundColor: '#000000cc', padding: { x: 8, y: 3 },
    }).setOrigin(0.5, 1).setDepth(20).setVisible(false);

    // Keys
    this.keys = {
      up: this.input.keyboard!.addKey('W'), down: this.input.keyboard!.addKey('S'),
      left: this.input.keyboard!.addKey('A'), right: this.input.keyboard!.addKey('D'),
      interact: this.input.keyboard!.addKey('E'), esc: this.input.keyboard!.addKey('ESC'),
    };

    this.cameras.main.fadeIn(300, 0, 0, 0);
    this.time.delayedCall(500, () => { this.canExit = true; });
  }

  // ── Tile renderers ──

  private drawWall(g: Phaser.GameObjects.Graphics, px: number, py: number, T: number, x: number, y: number, tint: number) {
    g.fillStyle(tint, 1);
    g.fillRect(px, py, T, T);
    // Brick mortar pattern
    const rowH = Math.floor(T / 3);
    g.fillStyle(0x000000, 0.1);
    for (let r = 0; r < 3; r++) {
      g.fillRect(px, py + r * rowH, T, 1); // horizontal mortar
      const brickOff = (r + y) % 2 === 0 ? Math.floor(T * 0.5) : 0;
      g.fillRect(px + brickOff, py + r * rowH, 1, rowH); // vertical mortar
      if (brickOff > 0) g.fillRect(px, py + r * rowH, 1, rowH);
    }
    // Highlight top / shadow bottom
    g.fillStyle(0xffffff, 0.06);
    g.fillRect(px, py, T, 2);
    g.fillStyle(0x000000, 0.12);
    g.fillRect(px, py + T - 2, T, 2);
  }

  private drawDoormat(g: Phaser.GameObjects.Graphics, dg: Phaser.GameObjects.Graphics, px: number, py: number, T: number) {
    g.fillStyle(0x3a2a18, 1);
    g.fillRect(px, py, T, T);
    g.fillStyle(0x554433, 1);
    g.fillRect(px + 3, py + 3, T - 6, T - 6);
    g.fillStyle(0x443322, 0.4);
    for (let ly = 6; ly < T - 6; ly += 3) g.fillRect(px + 5, py + ly, T - 10, 1);
  }

  private drawFloor(g: Phaser.GameObjects.Graphics, dg: Phaser.GameObjects.Graphics, px: number, py: number, T: number, x: number, y: number, tile: ITile, base: number) {
    g.fillStyle(base, 1);
    g.fillRect(px, py, T, T);

    // Checkerboard tint
    if ((x + y) % 2 === 0) {
      g.fillStyle(0x000000, 0.03);
      g.fillRect(px, py, T, T);
    }

    // Wood plank lines
    if (tile === ITile.FLOOR || tile === ITile.FLOOR_WOOD || tile === ITile.FURNITURE) {
      g.fillStyle(0x000000, 0.07);
      g.fillRect(px, py + Math.floor(T * 0.5), T, 1);
      const gx = ((x * 7 + y * 13) % 5) * Math.floor(T / 6) + 4;
      g.fillStyle(0x000000, 0.04);
      g.fillRect(px + gx, py, 1, T);
    }

    // Rug detail
    if (tile === ITile.FLOOR_RUG) {
      dg.lineStyle(2, 0xcc8855, 0.4);
      dg.strokeRect(px + 3, py + 3, T - 6, T - 6);
      dg.fillStyle(0xbb7744, 0.15);
      dg.fillRect(px + T / 2 - 3, py + T / 2 - 3, 6, 6);
    }

    // Hay straw
    if (tile === ITile.FLOOR_HAY) {
      const seed = x * 31 + y * 17;
      dg.fillStyle(0xddbb55, 0.25);
      for (let s = 0; s < 5; s++) {
        const sx = ((seed + s * 7) % (T - 8)) + 4;
        const sy = ((seed + s * 11) % (T - 8)) + 4;
        dg.fillRect(px + sx, py + sy, 5 + (seed + s) % 6, 1);
      }
    }
  }

  // ── Pixel-art furniture ──
  private drawFurniture(g: Phaser.GameObjects.Graphics, px: number, py: number, T: number, label: string) {
    const m = Math.floor(T * 0.08);

    if (label === 'Bed') {
      // Frame
      g.fillStyle(0x6b4226, 1);
      g.fillRect(px + m, py + m, T - m * 2, T - m * 2);
      // Headboard
      g.fillStyle(0x5a3218, 1);
      g.fillRect(px + m, py + m, T - m * 2, Math.floor(T * 0.12));
      // Mattress
      g.fillStyle(0x3b5998, 1);
      g.fillRect(px + m + 3, py + m + Math.floor(T * 0.12), T - m * 2 - 6, T - m * 2 - Math.floor(T * 0.12) - 3);
      // Pillow
      g.fillStyle(0xddeeff, 1);
      g.fillRect(px + m + 5, py + m + Math.floor(T * 0.14), Math.floor(T * 0.35), Math.floor(T * 0.2));
      // Blanket fold line
      g.fillStyle(0x2a4480, 1);
      g.fillRect(px + m + 3, py + Math.floor(T * 0.5), T - m * 2 - 6, 2);
      return;
    }

    if (label === 'Kitchen') {
      // Counter
      g.fillStyle(0x777777, 1);
      g.fillRect(px + m, py + m, T - m * 2, T - m * 2);
      // Stovetop surface
      g.fillStyle(0x333333, 1);
      g.fillRect(px + m + 3, py + m + 3, T - m * 2 - 6, T - m * 2 - 6);
      // 4 burners
      const s = Math.floor(T * 0.14);
      const positions = [[0.33, 0.33], [0.66, 0.33], [0.33, 0.66], [0.66, 0.66]];
      for (let i = 0; i < 4; i++) {
        const cx = px + T * positions[i][0];
        const cy = py + T * positions[i][1];
        g.fillStyle(0x555555, 1);
        g.fillCircle(cx, cy, s / 2);
        g.fillStyle(0x444444, 1);
        g.fillCircle(cx, cy, s / 2 - 2);
      }
      // One burner lit
      g.fillStyle(0xff5511, 0.35);
      g.fillCircle(px + T * 0.33, py + T * 0.33, s / 2);
      return;
    }

    if (label === 'Bookshelf') {
      // Frame
      g.fillStyle(0x5a3a1a, 1);
      g.fillRect(px + m, py + m, T - m * 2, T - m * 2);
      // Shelves
      const inner = T - m * 2;
      const shelfH = Math.floor(inner / 3);
      g.fillStyle(0x4a2a10, 1);
      for (let i = 1; i < 3; i++) g.fillRect(px + m, py + m + i * shelfH, inner, 2);
      // Books
      const colors = [0xcc3333, 0x3366cc, 0x33aa55, 0xddaa33, 0x9944aa, 0xcc6633, 0x33aaaa, 0xaa3366];
      const bw = Math.max(3, Math.floor(T * 0.08));
      for (let row = 0; row < 3; row++) {
        let bx = px + m + 2;
        const maxBx = px + T - m - 2;
        let bi = 0;
        while (bx + bw <= maxBx) {
          const h = shelfH - 5 - (bi % 3);
          g.fillStyle(colors[(row * 5 + bi) % colors.length], 1);
          g.fillRect(bx, py + m + row * shelfH + 3, bw, h);
          bx += bw + 1;
          bi++;
        }
      }
      return;
    }

    if (label === 'Fireplace') {
      // Stone surround
      g.fillStyle(0x666655, 1);
      g.fillRect(px + m, py + m, T - m * 2, T - m * 2);
      // Inner stones (darker border)
      g.fillStyle(0x555544, 1);
      g.fillRect(px + m + 2, py + m + 2, T - m * 2 - 4, T - m * 2 - 4);
      // Hearth opening
      const fw = Math.floor(T * 0.55), fh = Math.floor(T * 0.45);
      const hx = px + (T - fw) / 2, hy = py + T * 0.35;
      g.fillStyle(0x111111, 1);
      g.fillRect(hx, hy, fw, fh);
      // Fire layers
      const fcx = hx + fw / 2, fby = hy + fh;
      g.fillStyle(0xcc2200, 0.9);
      g.fillTriangle(fcx - fw * 0.35, fby, fcx + fw * 0.35, fby, fcx, fby - fh * 0.8);
      g.fillStyle(0xff6600, 0.8);
      g.fillTriangle(fcx - fw * 0.2, fby, fcx + fw * 0.2, fby, fcx - 1, fby - fh * 0.55);
      g.fillStyle(0xffcc00, 0.7);
      g.fillTriangle(fcx - fw * 0.1, fby, fcx + fw * 0.1, fby, fcx + 1, fby - fh * 0.3);
      // Mantle
      g.fillStyle(0x7a6644, 1);
      g.fillRect(px + m - 2, py + m, T - m * 2 + 4, Math.floor(T * 0.1));
      return;
    }

    if (label === 'Table') {
      // Tabletop
      g.fillStyle(0x8b6b3a, 1);
      g.fillRect(px + m + 2, py + m + Math.floor(T * 0.15), T - m * 2 - 4, T - m * 2 - Math.floor(T * 0.3));
      // Surface grain
      g.fillStyle(0x7a5a2a, 0.4);
      g.fillRect(px + m + 4, py + T * 0.5, T - m * 2 - 8, 1);
      // Legs (4 corners visible as shadows underneath)
      g.fillStyle(0x5a3a1a, 1);
      const leg = Math.max(3, Math.floor(T * 0.07));
      g.fillRect(px + m + 3, py + m + 3, leg, Math.floor(T * 0.12));
      g.fillRect(px + T - m - 3 - leg, py + m + 3, leg, Math.floor(T * 0.12));
      g.fillRect(px + m + 3, py + T - m - 3 - Math.floor(T * 0.12), leg, Math.floor(T * 0.12));
      g.fillRect(px + T - m - 3 - leg, py + T - m - 3 - Math.floor(T * 0.12), leg, Math.floor(T * 0.12));
      return;
    }

    if (label === 'Plant') {
      // Pot
      const potW = Math.floor(T * 0.4), potH = Math.floor(T * 0.32);
      const potX = px + (T - potW) / 2, potY = py + T - m - potH;
      g.fillStyle(0xbb6633, 1);
      g.fillRect(potX, potY, potW, potH);
      g.fillStyle(0xaa5522, 1);
      g.fillRect(potX, potY, potW, 3); // rim
      // Soil
      g.fillStyle(0x554422, 1);
      g.fillRect(potX + 2, potY + 3, potW - 4, 4);
      // Leaves
      const lcx = px + T / 2, lby = potY;
      g.fillStyle(0x339933, 1);
      g.fillTriangle(lcx - T * 0.22, lby, lcx + T * 0.22, lby, lcx, lby - T * 0.35);
      g.fillStyle(0x44aa44, 1);
      g.fillTriangle(lcx - T * 0.14, lby - T * 0.08, lcx + T * 0.18, lby - T * 0.08, lcx + 2, lby - T * 0.42);
      // Small flower
      g.fillStyle(0xff6688, 1);
      g.fillCircle(lcx + 1, lby - T * 0.35, 3);
      return;
    }

    if (label.includes('Nesting')) {
      // Box frame
      g.fillStyle(0x998866, 1);
      g.fillRect(px + m, py + T * 0.2, T - m * 2, T * 0.65);
      // Straw bed
      g.fillStyle(0xccbb88, 1);
      g.fillRect(px + m + 3, py + T * 0.3, T - m * 2 - 6, T * 0.45);
      // Eggs
      g.fillStyle(0xffeedd, 1);
      const eggR = Math.max(3, Math.floor(T * 0.06));
      g.fillEllipse(px + T * 0.35, py + T * 0.55, eggR, eggR * 1.3);
      g.fillEllipse(px + T * 0.5, py + T * 0.5, eggR, eggR * 1.3);
      g.fillEllipse(px + T * 0.65, py + T * 0.55, eggR, eggR * 1.3);
      return;
    }

    if (label.includes('Feed')) {
      // Trough body
      g.fillStyle(0x8b7355, 1);
      g.fillRect(px + m, py + T * 0.3, T - m * 2, T * 0.4);
      // Feed inside
      g.fillStyle(0xccbb77, 0.6);
      g.fillRect(px + m + 3, py + T * 0.38, T - m * 2 - 6, T * 0.22);
      // Rim
      g.fillStyle(0x6b5335, 1);
      g.fillRect(px + m, py + T * 0.28, T - m * 2, 3);
      // Legs
      g.fillStyle(0x5a4325, 1);
      g.fillRect(px + m + 2, py + T * 0.7, 3, T * 0.15);
      g.fillRect(px + T - m - 5, py + T * 0.7, 3, T * 0.15);
      return;
    }

    if (label.includes('Hay')) {
      // Bale body
      g.fillStyle(0xccaa44, 1);
      g.fillRect(px + m, py + m + 4, T - m * 2, T - m * 2 - 4);
      // Straw lines
      g.fillStyle(0xbbaa33, 0.6);
      for (let i = 0; i < 4; i++) g.fillRect(px + m, py + m + 4 + i * Math.floor(T / 5), T - m * 2, 1);
      // Binding twine
      g.fillStyle(0x886622, 1);
      g.fillRect(px + T / 2 - 1, py + m + 4, 3, T - m * 2 - 4);
      return;
    }

    if (label.includes('Milking')) {
      // Bucket
      const bw = Math.floor(T * 0.38), bh = Math.floor(T * 0.45);
      const bx = px + (T - bw) / 2, by = py + T - m - bh;
      g.fillStyle(0x8888aa, 1);
      g.fillRect(bx, by, bw, bh);
      // Milk surface
      g.fillStyle(0xeeeeff, 0.5);
      g.fillRect(bx + 2, by + 2, bw - 4, 5);
      // Handle
      g.fillStyle(0x777799, 1);
      g.fillRect(bx - 3, by - 3, bw + 6, 4);
      // Stool next to it
      g.fillStyle(0x6b5535, 1);
      g.fillRect(px + m + 2, py + m + 2, Math.floor(T * 0.25), Math.floor(T * 0.2));
      return;
    }

    if (label.includes('Buy')) {
      // Post
      g.fillStyle(0x5a3a1a, 1);
      g.fillRect(px + T / 2 - 2, py + T * 0.45, 4, T * 0.45);
      // Sign board
      const sw = T - m * 2 - 6, sh = Math.floor(T * 0.4);
      g.fillStyle(0x448844, 1);
      g.fillRect(px + m + 3, py + m + 2, sw, sh);
      g.fillStyle(0x336633, 1);
      g.strokeRect(px + m + 3, py + m + 2, sw, sh);
      // Gold coin
      g.fillStyle(0xffcc00, 1);
      const cr = Math.max(3, Math.floor(T * 0.1));
      g.fillCircle(px + T / 2, py + m + 2 + sh / 2, cr);
      g.fillStyle(0xddaa00, 1);
      g.fillCircle(px + T / 2, py + m + 2 + sh / 2, cr - 1);
      return;
    }

    // Fallback crate
    g.fillStyle(0x665544, 1);
    g.fillRect(px + m, py + m, T - m * 2, T - m * 2);
    g.lineStyle(1, 0x554433, 1);
    g.strokeRect(px + m + 2, py + m + 2, T - m * 2 - 4, T - m * 2 - 4);
  }

  // ── Animals ──
  private placeAnimals() {
    if (!this.playScene.animalSystem) return;
    const T = this.T;
    const animalState = this.playScene.animalSystem.getState();
    const bType = this.layout.animalBuilding!;
    const animals = animalState.animals.filter(a => {
      const def = ANIMAL_DEFS.find(d => d.id === a.type);
      return def?.building === bType;
    });

    const slots = this.getAnimalSlots();
    const aGfx = this.add.graphics().setDepth(8);

    for (let i = 0; i < Math.min(animals.length, slots.length); i++) {
      const animal = animals[i];
      const slot = slots[i];
      const apx = this.offX + slot.x * T + T / 2;
      const apy = this.offY + slot.y * T + T / 2;
      const def = ANIMAL_DEFS.find(d => d.id === animal.type);
      const isChicken = def?.type === 'chicken';

      if (isChicken) {
        // Body
        aGfx.fillStyle(0xffffff, 1);
        aGfx.fillEllipse(apx, apy + 2, T * 0.32, T * 0.25);
        // Head
        aGfx.fillCircle(apx, apy - T * 0.1, T * 0.1);
        // Beak
        aGfx.fillStyle(0xffaa00, 1);
        aGfx.fillTriangle(apx + T * 0.08, apy - T * 0.1, apx + T * 0.16, apy - T * 0.07, apx + T * 0.08, apy - T * 0.05);
        // Comb
        aGfx.fillStyle(0xdd3333, 1);
        aGfx.fillRect(apx - 2, apy - T * 0.19, 5, 4);
        // Eye
        aGfx.fillStyle(0x000000, 1);
        aGfx.fillCircle(apx + 2, apy - T * 0.12, 1);
      } else {
        // Cow body
        aGfx.fillStyle(0xccaa88, 1);
        aGfx.fillEllipse(apx, apy, T * 0.38, T * 0.28);
        // Head
        aGfx.fillCircle(apx - T * 0.18, apy - T * 0.04, T * 0.12);
        // Spots
        aGfx.fillStyle(0x332211, 0.35);
        aGfx.fillCircle(apx + T * 0.06, apy - T * 0.04, T * 0.07);
        aGfx.fillCircle(apx - T * 0.03, apy + T * 0.07, T * 0.05);
        // Horns
        aGfx.fillStyle(0xddccbb, 1);
        aGfx.fillRect(apx - T * 0.24, apy - T * 0.17, 2, 5);
        aGfx.fillRect(apx - T * 0.14, apy - T * 0.17, 2, 5);
        // Eye
        aGfx.fillStyle(0x000000, 1);
        aGfx.fillCircle(apx - T * 0.16, apy - T * 0.07, 1);
      }

      // Name
      this.add.text(apx, apy - T * 0.35, animal.name, {
        fontSize: `${Math.max(7, Math.floor(T * 0.13))}px`, color: '#ffeecc',
        fontFamily: 'monospace', stroke: '#000000', strokeThickness: 2,
      }).setOrigin(0.5).setDepth(9);

      // Happiness indicator
      const hp = animal.happiness;
      const heart = hp > 200 ? '♥' : hp > 100 ? '♡' : '·';
      const hColor = hp > 200 ? '#ff6688' : hp > 100 ? '#ffcc66' : '#888888';
      this.add.text(apx + T * 0.28, apy - T * 0.28, heart, {
        fontSize: '9px', color: hColor, fontFamily: 'monospace',
      }).setOrigin(0.5).setDepth(9);

      if (animal.productReady) {
        this.add.text(apx, apy + T * 0.3, '*', {
          fontSize: '10px', color: '#ffdd44', fontFamily: 'monospace', fontStyle: 'bold',
        }).setOrigin(0.5).setDepth(9);
      }

      const hitRect = this.add.rectangle(apx, apy, T, T, 0x000000, 0).setDepth(0);
      this.interactables.push({
        x: slot.x, y: slot.y, label: animal.name,
        kind: InteractionKind.ANIMAL, sprite: hitRect,
        data: { animalId: animal.id },
      });
    }

    // Capacity
    const capacity = bType === 'coop'
      ? Math.max(4, (animalState.coopLevel + 1) * 4)
      : Math.max(4, (animalState.barnLevel + 1) * 4);
    this.add.text(
      this.cameras.main.width / 2, this.cameras.main.height - 3,
      `${animals.length}/${capacity} ${bType === 'coop' ? 'chickens' : 'cows'}`,
      { fontSize: '10px', color: '#aaaaaa', fontFamily: 'monospace', stroke: '#000', strokeThickness: 1 }
    ).setOrigin(0.5, 1).setDepth(20);
  }

  private getAnimalSlots(): Array<{ x: number; y: number }> {
    const slots: Array<{ x: number; y: number }> = [];
    const { width, height, grid } = this.layout;
    const objPos = new Set(this.layout.objects.map(o => `${o.x},${o.y}`));
    for (let y = 2; y < height - 2; y++) {
      for (let x = 2; x < width - 2; x++) {
        if (grid[y][x] !== ITile.WALL && grid[y][x] !== ITile.DOOR_EXIT && !objPos.has(`${x},${y}`)) {
          slots.push({ x, y });
        }
      }
    }
    return slots;
  }

  // ── Movement + interaction ──
  update() {
    const speed = 120, dt = this.game.loop.delta / 1000;
    const T = this.T;
    let vx = 0, vy = 0;
    if (this.keys.left.isDown) vx = -speed;
    else if (this.keys.right.isDown) vx = speed;
    if (this.keys.up.isDown) vy = -speed;
    else if (this.keys.down.isDown) vy = speed;

    if (vx !== 0 || vy !== 0) {
      const halfBody = T * 0.3;
      const newX = this.player.x + vx * dt;
      const newY = this.player.y + vy * dt;
      const corners = (cx: number, cy: number): [number, number][] => [
        this.toGrid(cx - halfBody, cy - halfBody),
        this.toGrid(cx + halfBody, cy - halfBody),
        this.toGrid(cx - halfBody, cy + halfBody),
        this.toGrid(cx + halfBody, cy + halfBody),
      ];
      if (!corners(newX, this.player.y).some(([gx, gy]) => this.solidTiles.has(`${gx},${gy}`))) this.player.x = newX;
      if (!corners(this.player.x, newY).some(([gx, gy]) => this.solidTiles.has(`${gx},${gy}`))) this.player.y = newY;
    }

    // Exit check
    const [pgx, pgy] = this.toGrid(this.player.x, this.player.y);
    if (this.canExit && this.exitTiles.has(`${pgx},${pgy}`)) { this.exitBuilding(); return; }
    if (this.canExit && Phaser.Input.Keyboard.JustDown(this.keys.esc)) { this.exitBuilding(); return; }

    // Interaction prompt
    this.promptText.setVisible(false);
    let nearest: typeof this.interactables[0] | null = null;
    let bestDist = Infinity;
    for (const obj of this.interactables) {
      const ox = this.offX + obj.x * T + T / 2;
      const oy = this.offY + obj.y * T + T / 2;
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, ox, oy);
      if (d < T * 1.5 && d < bestDist) { bestDist = d; nearest = obj; }
    }
    if (nearest) {
      const prompt = nearest.kind === InteractionKind.ANIMAL
        ? `Press E — Pet/Feed ${nearest.label}`
        : `Press E — ${nearest.label}`;
      this.promptText.setText(prompt).setVisible(true);
      if (Phaser.Input.Keyboard.JustDown(this.keys.interact)) this.handleInteraction(nearest);
    }
  }

  private handleInteraction(obj: typeof this.interactables[0]) {
    switch (obj.kind) {
      case InteractionKind.BED: {
        this.cameras.main.fadeOut(600, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.playScene.endDay();
          this.playScene.player.stamina = 100;
          const c = this.playScene.calendar;
          this.playScene.events.emit(Events.TOAST, {
            message: `Day ${c.day}, ${c.season} — Year ${c.year}`,
            color: '#ffdd44', duration: 3000,
          });
          this.scene.resume('PlayScene');
          this.scene.stop();
        });
        break;
      }
      case InteractionKind.KITCHEN: {
        if (this.playScene.house.tier >= 1) {
          this.playScene.events.emit(Events.OPEN_CRAFTING, { cooking: true });
        } else {
          this.playScene.events.emit(Events.TOAST, { message: 'Upgrade your house first!', color: '#ff4444' });
        }
        break;
      }
      case InteractionKind.ANIMAL: {
        const animalId = obj.data?.animalId;
        if (!animalId || !this.playScene.animalSystem) break;
        const animals = this.playScene.animalSystem.getState().animals;
        const animal = animals.find(a => a.id === animalId);
        if (!animal) break;
        this.playScene.animalSystem.feedAnimal(animalId);
        this.playScene.animalSystem.petAnimal(animalId);
        const product = this.playScene.animalSystem.collectProduct(animalId);
        if (product) {
          this.playScene.addToInventory(product.itemId, 1);
          this.playScene.events.emit(Events.TOAST, {
            message: `Collected ${product.itemId} from ${animal.name}!`, color: '#ffaacc',
          });
        } else {
          const mood = animal.happiness > 200 ? 'very happy' : animal.happiness > 100 ? 'content' : 'needs attention';
          this.playScene.events.emit(Events.TOAST, {
            message: `${animal.name} is ${mood}. ` + (animal.fed ? 'Already fed.' : 'Needs food!'), color: '#aaddff',
          });
        }
        break;
      }
      case InteractionKind.CHEST: {
        if (obj.data?.buyAnimal) {
          const defId = obj.data.buyAnimal;
          const def = ANIMAL_DEFS.find(d => d.id === defId);
          if (!def || !this.playScene.animalSystem) break;
          const names = defId === 'chicken'
            ? ['Clucky', 'Peep', 'Nugget', 'Sunny', 'Daisy', 'Pepper', 'Coco', 'Maple']
            : ['Bessie', 'Daisy', 'Buttercup', 'Clover', 'Mocha', 'Patches', 'Belle', 'Rosie'];
          const existing = this.playScene.animalSystem.getState().animals;
          const usedNames = new Set(existing.map(a => a.name));
          const animalName = names.find(n => !usedNames.has(n)) || `${def.name} ${existing.length + 1}`;
          const result = this.playScene.animalSystem.purchaseAnimal(defId, animalName, this.playScene.player.gold);
          if (result) {
            this.playScene.player.gold -= result.cost;
            this.playScene.events.emit(Events.TOAST, {
              message: `Bought ${animalName} the ${def.name}! (-${result.cost}g)`, color: '#ffaacc',
            });
            this.time.delayedCall(800, () => {
              this.scene.restart({ playScene: this.playScene, building: this.building });
            });
          } else {
            if (this.playScene.player.gold < def.purchasePrice) {
              this.playScene.events.emit(Events.TOAST, { message: `Need ${def.purchasePrice}g!`, color: '#ff4444' });
            } else {
              this.playScene.events.emit(Events.TOAST, { message: `${this.layout.name} is full!`, color: '#ff4444' });
            }
          }
          break;
        }
        this.playScene.events.emit(Events.TOAST, { message: obj.data?.msg || 'Nothing here.', color: '#ccccaa' });
        break;
      }
    }
  }

  private exitBuilding() {
    this.canExit = false;
    this.cameras.main.fadeOut(200, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.resume('PlayScene');
      this.scene.stop();
    });
  }

  private toGrid(px: number, py: number): [number, number] {
    return [Math.floor((px - this.offX) / this.T), Math.floor((py - this.offY) / this.T)];
  }
}
