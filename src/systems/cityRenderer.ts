import Phaser from 'phaser';
import { CityVenue } from '../types';
// Expose CityVenue as part of the module's public API surface
void CityVenue;

export interface CityBuilding {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'office' | 'shop' | 'restaurant' | 'bar' | 'apartment' | 'gym' | 'gallery' | 'bookstore' | 'park' | 'cafe';
  interactable: boolean;
}

// Color constants
const GLASS_BLUE   = 0x6699cc;
const GLASS_LIGHT  = 0x99bbdd;
const CONCRETE     = 0x888899;
const CONCRETE_D   = 0x666677;
const BRICK_RED    = 0xaa5533;
const BRICK_DARK   = 0x883322;
const BROWN_LIGHT  = 0x8b6344;
const BROWN_DARK   = 0x6b4a2a;
const DOOR_DARK    = 0x2a1a0a;
const WIN_YELLOW   = 0xffeea0;
const WIN_FRAME    = 0x556677;
const WARM_ORANGE  = 0xcc6633;
const WARM_RED     = 0xaa3322;
const NEON_PURPLE  = 0xcc44ff;
const NEON_CYAN    = 0x00ffee;
const DARK_WALL    = 0x1a1a2a;
const METAL_GRAY   = 0x778899;
const WHITE_WALL   = 0xeeeef0;
const GREEN_PARK   = 0x558844;
const HYDRANT_RED  = 0xcc2222;
const MAILBOX_BLUE = 0x2255aa;

export class CityRenderer {

  private static label(scene: Phaser.Scene, container: Phaser.GameObjects.Container, text: string, cx: number, top: number): void {
    const t = scene.add.text(cx, top - 6, text, {
      fontSize: '8px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5, 1);
    container.add(t);
  }

  /** Draw the Nexus Corp office tower — tall gray/blue glass building, 4 tiles wide × 5 tiles tall */
  static drawOffice(scene: Phaser.Scene, x: number, y: number, tileSize: number): Phaser.GameObjects.Container {
    const T = tileSize;
    const px = x * T;
    const py = y * T;
    const w = 4 * T;
    const h = 5 * T;
    const container = scene.add.container(0, 0);
    const g = scene.add.graphics();

    // shadow
    g.fillStyle(0x000000, 0.15);
    g.fillRect(px + 4, py + h + 4, w, 12);

    // main facade
    g.fillStyle(CONCRETE, 1);
    g.fillRect(px, py, w, h);

    // glass panel grid
    const cols = 4;
    const rows = 7;
    const padX = Math.floor(T * 0.1);
    const padY = Math.floor(T * 0.1);
    const panelW = Math.floor((w - padX * (cols + 1)) / cols);
    const panelH = Math.floor((h * 0.82 - padY * (rows + 1)) / rows);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const wx = px + padX + c * (panelW + padX);
        const wy = py + padY + r * (panelH + padY);
        g.fillStyle(GLASS_BLUE, 1);
        g.fillRect(wx, wy, panelW, panelH);
        // reflection highlight
        g.fillStyle(GLASS_LIGHT, 0.5);
        g.fillRect(wx, wy, Math.floor(panelW * 0.35), panelH);
      }
    }

    // entrance canopy
    const canopyY = py + h - Math.floor(T * 0.7);
    g.fillStyle(CONCRETE_D, 1);
    g.fillRect(px + Math.floor(w * 0.3), canopyY - Math.floor(T * 0.15), Math.floor(w * 0.4), Math.floor(T * 0.15));

    // entrance columns
    g.fillStyle(METAL_GRAY, 1);
    g.fillRect(px + Math.floor(w * 0.31), canopyY - Math.floor(T * 0.35), Math.floor(T * 0.07), Math.floor(T * 0.35));
    g.fillRect(px + Math.floor(w * 0.62), canopyY - Math.floor(T * 0.35), Math.floor(T * 0.07), Math.floor(T * 0.35));

    // entrance door
    const doorW = Math.floor(T * 0.55);
    const doorH = Math.floor(T * 0.65);
    g.fillStyle(GLASS_BLUE, 0.9);
    g.fillRect(px + Math.floor((w - doorW) / 2), py + h - doorH, doorW, doorH);
    g.fillStyle(METAL_GRAY, 1);
    g.fillRect(px + Math.floor((w - doorW) / 2) + Math.floor(doorW * 0.45), py + h - Math.floor(doorH * 0.5), Math.floor(T * 0.04), Math.floor(T * 0.2));

    // rooftop details
    g.fillStyle(CONCRETE_D, 1);
    g.fillRect(px, py, w, Math.floor(T * 0.12));
    g.fillRect(px + Math.floor(w * 0.42), py - Math.floor(T * 0.18), Math.floor(w * 0.16), Math.floor(T * 0.18));

    container.add(g);
    this.label(scene, container, 'NEXUS CORP', px + w / 2, py);

    const logo = scene.add.text(px + Math.floor(w / 2), py + Math.floor(T * 0.08), 'N', {
      fontSize: '10px', color: '#aaddff', stroke: '#002244', strokeThickness: 2,
    }).setOrigin(0.5, 0);
    container.add(logo);

    return container;
  }

  /** Draw Daily Grind coffee shop — cozy brown storefront, 3×2 tiles, awning, "COFFEE" sign */
  static drawCoffeeShop(scene: Phaser.Scene, x: number, y: number, tileSize: number): Phaser.GameObjects.Container {
    const T = tileSize;
    const px = x * T;
    const py = y * T;
    const w = 3 * T;
    const h = 2 * T;
    const container = scene.add.container(0, 0);
    const g = scene.add.graphics();

    // shadow
    g.fillStyle(0x000000, 0.12);
    g.fillRect(px + 3, py + h + 3, w, 8);

    // walls
    g.fillStyle(BROWN_LIGHT, 1);
    g.fillRect(px, py + Math.floor(T * 0.3), w, Math.floor(T * 1.7));

    // dark trim
    g.fillStyle(BROWN_DARK, 1);
    g.fillRect(px, py + Math.floor(T * 0.3), w, Math.floor(T * 0.1));
    g.fillRect(px, py + h - Math.floor(T * 0.1), w, Math.floor(T * 0.1));

    // striped awning
    const awningY = py + Math.floor(T * 0.3);
    const awningH = Math.floor(T * 0.35);
    g.fillStyle(0xcc5522, 1);
    g.fillRect(px - 2, awningY, w + 4, awningH);
    g.fillStyle(0xeecc88, 0.9);
    for (let i = 0; i < 6; i++) {
      if (i % 2 === 0) {
        g.fillRect(px + Math.floor((w / 6) * i), awningY, Math.ceil(w / 6), awningH);
      }
    }
    // awning drip edge
    g.fillStyle(0xaa4411, 1);
    g.fillRect(px - 2, awningY + awningH - 3, w + 4, 3);

    // display window
    const winW = Math.floor(T * 0.9);
    const winH = Math.floor(T * 0.55);
    const winY = py + Math.floor(T * 0.78);
    g.fillStyle(WIN_FRAME, 1);
    g.fillRect(px + Math.floor(T * 0.12), winY, winW + 4, winH + 4);
    g.fillStyle(WIN_YELLOW, 0.85);
    g.fillRect(px + Math.floor(T * 0.12) + 2, winY + 2, winW, winH);
    // cup silhouette in window
    g.fillStyle(0xcc8833, 0.7);
    g.fillRect(px + Math.floor(T * 0.38), winY + Math.floor(winH * 0.3), Math.floor(T * 0.18), Math.floor(T * 0.3));

    // door
    const doorW = Math.floor(T * 0.38);
    const doorH = Math.floor(T * 0.72);
    g.fillStyle(DOOR_DARK, 1);
    g.fillRect(px + Math.floor(w - doorW - T * 0.15), py + h - doorH, doorW, doorH);
    g.fillStyle(GLASS_LIGHT, 0.5);
    g.fillRect(px + Math.floor(w - doorW - T * 0.15) + 3, py + h - doorH + 4, Math.floor(doorW * 0.5), Math.floor(doorH * 0.55));

    // steam wisps
    const sw = scene.add.graphics();
    sw.fillStyle(0xffffff, 0.18);
    sw.fillCircle(px + Math.floor(T * 0.38), py + Math.floor(T * 0.2), Math.floor(T * 0.06));
    sw.fillCircle(px + Math.floor(T * 0.46), py + Math.floor(T * 0.12), Math.floor(T * 0.05));
    sw.fillCircle(px + Math.floor(T * 0.55), py + Math.floor(T * 0.06), Math.floor(T * 0.04));

    container.add(g);
    container.add(sw);
    this.label(scene, container, 'DAILY GRIND', px + w / 2, py + Math.floor(T * 0.3));

    const sign = scene.add.text(px + Math.floor(T * 1.65), py + Math.floor(T * 0.95), 'COFFEE', {
      fontSize: '5px', color: '#ffeeaa', stroke: '#663300', strokeThickness: 1,
    }).setOrigin(0.5, 0.5);
    container.add(sign);

    return container;
  }

  /** Draw Rosemary's restaurant — warm red/orange facade, 3×2 tiles, window with warm light */
  static drawRestaurant(scene: Phaser.Scene, x: number, y: number, tileSize: number): Phaser.GameObjects.Container {
    const T = tileSize;
    const px = x * T;
    const py = y * T;
    const w = 3 * T;
    const h = 2 * T;
    const container = scene.add.container(0, 0);
    const g = scene.add.graphics();

    // shadow
    g.fillStyle(0x000000, 0.12);
    g.fillRect(px + 3, py + h + 3, w, 8);

    // warm facade
    g.fillStyle(WARM_RED, 1);
    g.fillRect(px, py + Math.floor(T * 0.28), w, Math.floor(T * 1.72));

    // accent trim
    g.fillStyle(WARM_ORANGE, 1);
    g.fillRect(px, py + Math.floor(T * 0.28), w, Math.floor(T * 0.1));
    g.fillRect(px, py + Math.floor(T * 0.96), w, Math.floor(T * 0.06));

    // roof gable
    g.fillStyle(0x7a2211, 1);
    g.fillTriangle(px - 2, py + Math.floor(T * 0.3), px + w + 2, py + Math.floor(T * 0.3), px + Math.floor(w / 2), py + Math.floor(T * 0.02));

    // large window with warm interior glow
    const winW = Math.floor(T * 0.78);
    const winH = Math.floor(T * 0.52);
    const winY = py + Math.floor(T * 0.48);
    g.fillStyle(WIN_FRAME, 1);
    g.fillRect(px + Math.floor(T * 0.18), winY, winW + 4, winH + 4);
    g.fillStyle(WIN_YELLOW, 0.9);
    g.fillRect(px + Math.floor(T * 0.18) + 2, winY + 2, winW, winH);
    // window dividers
    g.fillStyle(WIN_FRAME, 1);
    g.fillRect(px + Math.floor(T * 0.18) + Math.floor(winW / 2), winY, 2, winH + 4);
    g.fillRect(px + Math.floor(T * 0.18), winY + Math.floor(winH / 2), winW + 4, 2);
    // candle silhouette
    g.fillStyle(0xffdd55, 0.8);
    g.fillRect(px + Math.floor(T * 0.45), winY + Math.floor(winH * 0.15), 2, Math.floor(winH * 0.5));
    g.fillCircle(px + Math.floor(T * 0.46), winY + Math.floor(winH * 0.15), 3);

    // second small window
    const win2W = Math.floor(T * 0.3);
    const win2Y = py + Math.floor(T * 0.48);
    g.fillStyle(WIN_FRAME, 1);
    g.fillRect(px + Math.floor(T * 2.1), win2Y, win2W + 4, winH + 4);
    g.fillStyle(WIN_YELLOW, 0.9);
    g.fillRect(px + Math.floor(T * 2.1) + 2, win2Y + 2, win2W, winH);

    // door with arch
    const doorW = Math.floor(T * 0.42);
    const doorH = Math.floor(T * 0.76);
    const doorX = px + Math.floor(w - doorW - T * 0.14);
    g.fillStyle(DOOR_DARK, 1);
    g.fillRect(doorX, py + h - doorH, doorW, doorH);
    g.fillStyle(0x662211, 1);
    g.fillCircle(doorX + Math.floor(doorW / 2), py + h - doorH, Math.floor(doorW / 2));

    // door handle
    g.fillStyle(0xddbb44, 1);
    g.fillCircle(doorX + Math.floor(doorW * 0.7), py + h - Math.floor(doorH * 0.45), 2);

    // flower boxes below windows
    g.fillStyle(BROWN_DARK, 1);
    g.fillRect(px + Math.floor(T * 0.18), winY + winH + 6, winW + 4, Math.floor(T * 0.1));
    g.fillStyle(0x44aa44, 1);
    for (let i = 0; i < 5; i++) {
      g.fillCircle(px + Math.floor(T * 0.26) + i * Math.floor(T * 0.16), winY + winH + 4, Math.floor(T * 0.06));
    }

    container.add(g);
    this.label(scene, container, "ROSEMARY'S", px + w / 2, py + Math.floor(T * 0.28));

    return container;
  }

  /** Draw The Neon Tap bar — dark exterior, neon accent lines (purple/cyan), 3×2 tiles */
  static drawBar(scene: Phaser.Scene, x: number, y: number, tileSize: number): Phaser.GameObjects.Container {
    const T = tileSize;
    const px = x * T;
    const py = y * T;
    const w = 3 * T;
    const h = 2 * T;
    const container = scene.add.container(0, 0);
    const g = scene.add.graphics();
    const glow = scene.add.graphics();

    // neon glow halo (behind building)
    glow.fillStyle(NEON_PURPLE, 0.07);
    glow.fillRect(px - 6, py + Math.floor(T * 0.2), w + 12, h);

    // shadow
    g.fillStyle(0x000000, 0.2);
    g.fillRect(px + 3, py + h + 3, w, 8);

    // dark walls
    g.fillStyle(DARK_WALL, 1);
    g.fillRect(px, py + Math.floor(T * 0.22), w, Math.floor(T * 1.78));

    // roof flat
    g.fillStyle(0x111120, 1);
    g.fillRect(px, py + Math.floor(T * 0.14), w, Math.floor(T * 0.16));

    // neon border lines (purple top, cyan bottom)
    g.fillStyle(NEON_PURPLE, 0.9);
    g.fillRect(px, py + Math.floor(T * 0.22), w, 3);
    g.fillRect(px, py + Math.floor(T * 0.22), 3, Math.floor(T * 1.78));
    g.fillRect(px + w - 3, py + Math.floor(T * 0.22), 3, Math.floor(T * 1.78));
    g.fillStyle(NEON_CYAN, 0.9);
    g.fillRect(px, py + h - 3, w, 3);

    // secondary glow lines
    glow.fillStyle(NEON_PURPLE, 0.12);
    glow.fillRect(px - 2, py + Math.floor(T * 0.22), w + 4, 6);
    glow.fillStyle(NEON_CYAN, 0.12);
    glow.fillRect(px - 2, py + h - 5, w + 4, 6);

    // frosted window
    const winW = Math.floor(T * 0.72);
    const winH = Math.floor(T * 0.44);
    const winY = py + Math.floor(T * 0.56);
    g.fillStyle(0x224455, 1);
    g.fillRect(px + Math.floor(T * 0.22), winY, winW + 4, winH + 4);
    g.fillStyle(0x335566, 0.7);
    g.fillRect(px + Math.floor(T * 0.22) + 2, winY + 2, winW, winH);
    // neon reflection in window
    g.fillStyle(NEON_PURPLE, 0.3);
    g.fillRect(px + Math.floor(T * 0.22) + 2, winY + 2, Math.floor(winW * 0.2), winH);
    g.fillStyle(NEON_CYAN, 0.25);
    g.fillRect(px + Math.floor(T * 0.22) + 2 + Math.floor(winW * 0.75), winY + 2, Math.floor(winW * 0.2), winH);

    // door
    const doorW = Math.floor(T * 0.44);
    const doorH = Math.floor(T * 0.78);
    g.fillStyle(0x110d1a, 1);
    g.fillRect(px + Math.floor(w - doorW - T * 0.12), py + h - doorH, doorW, doorH);
    // door neon frame
    g.fillStyle(NEON_PURPLE, 0.7);
    g.fillRect(px + Math.floor(w - doorW - T * 0.12) - 2, py + h - doorH, 2, doorH);
    g.fillRect(px + Math.floor(w - doorW - T * 0.12) + doorW, py + h - doorH, 2, doorH);

    // cocktail glass neon sign
    g.fillStyle(NEON_CYAN, 0.85);
    const sx = px + Math.floor(T * 2.1);
    const sy = py + Math.floor(T * 0.44);
    g.fillTriangle(sx, sy, sx + Math.floor(T * 0.24), sy, sx + Math.floor(T * 0.12), sy + Math.floor(T * 0.24));
    g.fillRect(sx + Math.floor(T * 0.1), sy + Math.floor(T * 0.24), Math.floor(T * 0.04), Math.floor(T * 0.16));
    g.fillRect(sx + Math.floor(T * 0.04), sy + Math.floor(T * 0.4), Math.floor(T * 0.16), Math.floor(T * 0.04));

    container.add(glow);
    container.add(g);
    this.label(scene, container, 'THE NEON TAP', px + w / 2, py + Math.floor(T * 0.14));

    return container;
  }

  /** Draw player's apartment building — brick, 4×4 tiles, multiple windows, entrance door */
  static drawApartment(scene: Phaser.Scene, x: number, y: number, tileSize: number, isPlayer: boolean = false): Phaser.GameObjects.Container {
    const T = tileSize;
    const px = x * T;
    const py = y * T;
    const w = 4 * T;
    const h = 4 * T;
    const container = scene.add.container(0, 0);
    const g = scene.add.graphics();

    // shadow
    g.fillStyle(0x000000, 0.15);
    g.fillRect(px + 4, py + h + 4, w, 12);

    // brick facade
    g.fillStyle(BRICK_RED, 1);
    g.fillRect(px, py, w, h);

    // brick texture lines (horizontal mortar)
    g.fillStyle(BRICK_DARK, 1);
    const brickH = Math.floor(T * 0.22);
    for (let by = py + brickH; by < py + h; by += brickH + 2) {
      g.fillRect(px, by, w, 2);
    }
    // vertical mortar (offset every other row)
    let rowIdx = 0;
    for (let by = py; by < py + h; by += brickH + 2) {
      const offset = (rowIdx % 2 === 0) ? 0 : Math.floor(T * 0.44);
      for (let bx = px + offset; bx < px + w; bx += Math.floor(T * 0.88)) {
        g.fillRect(bx, by, 2, brickH);
      }
      rowIdx++;
    }

    // window grid 3×4
    const cols = 3;
    const rows = 4;
    const winW = Math.floor(T * 0.42);
    const winH = Math.floor(T * 0.32);
    const winPadX = Math.floor((w - cols * winW) / (cols + 1));
    const winPadY = Math.floor(T * 0.25);
    const winStartY = py + Math.floor(T * 0.3);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const wx = px + winPadX + c * (winW + winPadX);
        const wy = winStartY + r * (winH + winPadY);
        // frame
        g.fillStyle(WIN_FRAME, 1);
        g.fillRect(wx - 2, wy - 2, winW + 4, winH + 4);
        // glass
        g.fillStyle(WIN_YELLOW, 0.9);
        g.fillRect(wx, wy, winW, winH);
        // cross divider
        g.fillStyle(WIN_FRAME, 1);
        g.fillRect(wx + Math.floor(winW / 2) - 1, wy, 2, winH);
        g.fillRect(wx, wy + Math.floor(winH / 2) - 1, winW, 2);
        // occasional dark window (unlit)
        if ((r === 1 && c === 2) || (r === 3 && c === 0)) {
          g.fillStyle(0x223344, 1);
          g.fillRect(wx, wy, winW, winH);
        }
      }
    }

    // cornice
    g.fillStyle(BRICK_DARK, 1);
    g.fillRect(px, py, w, Math.floor(T * 0.12));

    // entrance step
    g.fillStyle(CONCRETE, 1);
    g.fillRect(px + Math.floor(w / 2 - T * 0.55), py + h, Math.floor(T * 1.1), Math.floor(T * 0.1));

    // entrance door
    const doorW = Math.floor(T * 0.52);
    const doorH = Math.floor(T * 0.82);
    const doorX = px + Math.floor((w - doorW) / 2);
    g.fillStyle(DOOR_DARK, 1);
    g.fillRect(doorX, py + h - doorH, doorW, doorH);
    // door panels
    g.fillStyle(0x3a2a1a, 1);
    g.fillRect(doorX + 4, py + h - doorH + 4, Math.floor(doorW / 2) - 6, Math.floor(doorH / 2) - 6);
    g.fillRect(doorX + Math.floor(doorW / 2) + 2, py + h - doorH + 4, Math.floor(doorW / 2) - 6, Math.floor(doorH / 2) - 6);
    g.fillRect(doorX + 4, py + h - Math.floor(doorH / 2) + 2, Math.floor(doorW / 2) - 6, Math.floor(doorH / 2) - 10);
    g.fillRect(doorX + Math.floor(doorW / 2) + 2, py + h - Math.floor(doorH / 2) + 2, Math.floor(doorW / 2) - 6, Math.floor(doorH / 2) - 10);
    // door handle
    g.fillStyle(0xddbb44, 1);
    g.fillCircle(doorX + Math.floor(doorW * 0.72), py + h - Math.floor(doorH * 0.42), 2);

    // building number
    const numText = scene.add.text(px + Math.floor(w / 2), py + h - doorH - 4, '42', {
      fontSize: '7px', color: '#ccaa66', stroke: '#220000', strokeThickness: 1,
    }).setOrigin(0.5, 1);
    container.add(g);
    container.add(numText);
    this.label(scene, container, 'APARTMENTS', px + w / 2, py);

    return container;
  }

  /** Draw FitZone gym — modern facade, large windows, 3×2 tiles */
  static drawGym(scene: Phaser.Scene, x: number, y: number, tileSize: number): Phaser.GameObjects.Container {
    const T = tileSize;
    const px = x * T;
    const py = y * T;
    const w = 3 * T;
    const h = 2 * T;
    const container = scene.add.container(0, 0);
    const g = scene.add.graphics();

    // shadow
    g.fillStyle(0x000000, 0.12);
    g.fillRect(px + 3, py + h + 3, w, 8);

    // modern concrete facade
    g.fillStyle(0xd0d0d8, 1);
    g.fillRect(px, py + Math.floor(T * 0.24), w, Math.floor(T * 1.76));

    // accent stripe (orange/red)
    g.fillStyle(0xdd4422, 1);
    g.fillRect(px, py + Math.floor(T * 0.24), w, Math.floor(T * 0.12));
    g.fillRect(px, py + Math.floor(T * 0.9), w, Math.floor(T * 0.08));

    // flat roof
    g.fillStyle(0xb0b0b8, 1);
    g.fillRect(px, py + Math.floor(T * 0.16), w, Math.floor(T * 0.14));

    // large display windows
    const winW = Math.floor(T * 1.0);
    const winH = Math.floor(T * 0.52);
    const winY = py + Math.floor(T * 1.06);
    g.fillStyle(WIN_FRAME, 1);
    g.fillRect(px + Math.floor(T * 0.12), winY, winW + 4, winH + 4);
    g.fillStyle(GLASS_LIGHT, 0.8);
    g.fillRect(px + Math.floor(T * 0.12) + 2, winY + 2, winW, winH);
    // equipment silhouettes
    g.fillStyle(0x888899, 0.6);
    g.fillRect(px + Math.floor(T * 0.22), winY + Math.floor(winH * 0.5), Math.floor(T * 0.18), Math.floor(winH * 0.4));
    g.fillRect(px + Math.floor(T * 0.5), winY + Math.floor(winH * 0.35), Math.floor(T * 0.28), Math.floor(T * 0.08));

    // second window
    const win2W = Math.floor(T * 0.58);
    g.fillStyle(WIN_FRAME, 1);
    g.fillRect(px + Math.floor(T * 1.72), winY, win2W + 4, winH + 4);
    g.fillStyle(GLASS_LIGHT, 0.8);
    g.fillRect(px + Math.floor(T * 1.72) + 2, winY + 2, win2W, winH);

    // door
    const doorW = Math.floor(T * 0.42);
    const doorH = Math.floor(T * 0.68);
    g.fillStyle(0xaab0b8, 1);
    g.fillRect(px + Math.floor(T * 1.14), py + h - doorH, doorW, doorH);
    g.fillStyle(GLASS_LIGHT, 0.7);
    g.fillRect(px + Math.floor(T * 1.14) + 3, py + h - doorH + 3, doorW - 6, doorH - 6);

    // dumbbell icon
    g.fillStyle(0xdd4422, 0.8);
    const dbx = px + Math.floor(T * 0.4);
    const dby = py + Math.floor(T * 0.44);
    g.fillRect(dbx, dby + 3, Math.floor(T * 0.36), 4);
    g.fillRect(dbx, dby, 6, 10);
    g.fillRect(dbx + Math.floor(T * 0.3), dby, 6, 10);

    container.add(g);
    this.label(scene, container, 'FITZONE', px + w / 2, py + Math.floor(T * 0.16));

    return container;
  }

  /** Draw art gallery — white/minimal exterior, 3×2 tiles, large display window */
  static drawGallery(scene: Phaser.Scene, x: number, y: number, tileSize: number): Phaser.GameObjects.Container {
    const T = tileSize;
    const px = x * T;
    const py = y * T;
    const w = 3 * T;
    const h = 2 * T;
    const container = scene.add.container(0, 0);
    const g = scene.add.graphics();

    // shadow
    g.fillStyle(0x000000, 0.1);
    g.fillRect(px + 3, py + h + 3, w, 8);

    // white minimal facade
    g.fillStyle(WHITE_WALL, 1);
    g.fillRect(px, py + Math.floor(T * 0.2), w, Math.floor(T * 1.8));

    // thin black border top
    g.fillStyle(0x222222, 1);
    g.fillRect(px, py + Math.floor(T * 0.2), w, 3);
    g.fillRect(px, py + h - 3, w, 3);
    g.fillRect(px, py + Math.floor(T * 0.2), 3, Math.floor(T * 1.8));
    g.fillRect(px + w - 3, py + Math.floor(T * 0.2), 3, Math.floor(T * 1.8));

    // flat roof
    g.fillStyle(0xdddddd, 1);
    g.fillRect(px, py + Math.floor(T * 0.1), w, Math.floor(T * 0.14));

    // large display window
    const winW = Math.floor(T * 1.4);
    const winH = Math.floor(T * 0.88);
    const winX = px + Math.floor((w - winW) / 2);
    const winY = py + Math.floor(T * 0.36);
    g.fillStyle(0x111111, 1);
    g.fillRect(winX - 3, winY - 3, winW + 6, winH + 6);
    g.fillStyle(GLASS_LIGHT, 0.85);
    g.fillRect(winX, winY, winW, winH);
    // artwork display inside
    g.fillStyle(0xff8866, 0.7);
    g.fillRect(winX + Math.floor(winW * 0.1), winY + Math.floor(winH * 0.15), Math.floor(winW * 0.25), Math.floor(winH * 0.6));
    g.fillStyle(0x6688cc, 0.7);
    g.fillRect(winX + Math.floor(winW * 0.42), winY + Math.floor(winH * 0.1), Math.floor(winW * 0.2), Math.floor(winH * 0.7));
    g.fillStyle(0xddcc44, 0.65);
    g.fillRect(winX + Math.floor(winW * 0.68), winY + Math.floor(winH * 0.2), Math.floor(winW * 0.22), Math.floor(winH * 0.55));

    // door
    const doorW = Math.floor(T * 0.36);
    const doorH = Math.floor(T * 0.6);
    g.fillStyle(0x222222, 1);
    g.fillRect(px + Math.floor((w - doorW) / 2), py + h - doorH, doorW, doorH);
    g.fillStyle(GLASS_LIGHT, 0.6);
    g.fillRect(px + Math.floor((w - doorW) / 2) + 3, py + h - doorH + 3, doorW - 6, doorH - 6);

    // gold handle
    g.fillStyle(0xddaa33, 1);
    g.fillRect(px + Math.floor((w - doorW) / 2) + Math.floor(doorW * 0.6), py + h - Math.floor(doorH * 0.5), 2, Math.floor(T * 0.16));

    container.add(g);
    this.label(scene, container, 'GALLERY', px + w / 2, py + Math.floor(T * 0.1));

    return container;
  }

  /** Draw Pages & Co bookstore — warm wood facade, book display window, 2×2 tiles */
  static drawBookstore(scene: Phaser.Scene, x: number, y: number, tileSize: number): Phaser.GameObjects.Container {
    const T = tileSize;
    const px = x * T;
    const py = y * T;
    const w = 2 * T;
    const h = 2 * T;
    const container = scene.add.container(0, 0);
    const g = scene.add.graphics();

    // shadow
    g.fillStyle(0x000000, 0.12);
    g.fillRect(px + 3, py + h + 3, w, 8);

    // warm wood facade
    g.fillStyle(BROWN_LIGHT, 1);
    g.fillRect(px, py + Math.floor(T * 0.26), w, Math.floor(T * 1.74));

    // wood plank lines
    g.fillStyle(BROWN_DARK, 1);
    const plankH = Math.floor(T * 0.28);
    for (let ry = py + Math.floor(T * 0.38); ry < py + h; ry += plankH) {
      g.fillRect(px + 2, ry, w - 4, 2);
    }

    // gable
    g.fillStyle(BROWN_DARK, 1);
    g.fillTriangle(px - 2, py + Math.floor(T * 0.28), px + w + 2, py + Math.floor(T * 0.28), px + Math.floor(w / 2), py + Math.floor(T * 0.02));

    // book display window
    const winW = Math.floor(T * 0.86);
    const winH = Math.floor(T * 0.56);
    const winY = py + Math.floor(T * 0.5);
    g.fillStyle(WIN_FRAME, 1);
    g.fillRect(px + Math.floor((w - winW) / 2) - 2, winY, winW + 4, winH + 4);
    g.fillStyle(WIN_YELLOW, 0.88);
    g.fillRect(px + Math.floor((w - winW) / 2), winY + 2, winW, winH);
    // books on sill
    const bookColors = [0xcc4433, 0x3366aa, 0x44aa44, 0xddbb22, 0xaa44cc];
    for (let i = 0; i < 5; i++) {
      g.fillStyle(bookColors[i], 1);
      g.fillRect(
        px + Math.floor((w - winW) / 2) + 3 + i * Math.floor(winW / 5),
        winY + Math.floor(winH * 0.3),
        Math.floor(winW / 5) - 2,
        Math.floor(winH * 0.55)
      );
    }

    // door
    const doorW = Math.floor(T * 0.38);
    const doorH = Math.floor(T * 0.72);
    g.fillStyle(DOOR_DARK, 1);
    g.fillRect(px + Math.floor((w - doorW) / 2), py + h - doorH, doorW, doorH);
    // door window
    g.fillStyle(WIN_YELLOW, 0.5);
    g.fillRect(px + Math.floor((w - doorW) / 2) + 4, py + h - doorH + 4, doorW - 8, Math.floor(doorH * 0.45));

    // hanging sign
    g.fillStyle(BROWN_DARK, 1);
    g.fillRect(px + Math.floor(T * 0.28), py + Math.floor(T * 1.38), Math.floor(T * 0.08), Math.floor(T * 0.16));
    g.fillRect(px + Math.floor(T * 0.28), py + Math.floor(T * 1.36), Math.floor(T * 0.52), Math.floor(T * 0.28));

    container.add(g);
    this.label(scene, container, 'PAGES & CO', px + w / 2, py + Math.floor(T * 0.02));

    const hangSign = scene.add.text(px + Math.floor(T * 0.54), py + Math.floor(T * 1.5), '📚', {
      fontSize: '7px',
    }).setOrigin(0.5, 0.5);
    container.add(hangSign);

    return container;
  }

  /** Draw a street lamp post — tall pole with glowing light at top */
  static drawStreetLamp(scene: Phaser.Scene, x: number, y: number, tileSize: number): Phaser.GameObjects.Container {
    const T = tileSize;
    const cx = x * T + Math.floor(T / 2);
    const baseY = y * T + T;
    const container = scene.add.container(0, 0);
    const glow = scene.add.graphics();
    const g = scene.add.graphics();

    // glow halo
    glow.fillStyle(0xffee99, 0.14);
    glow.fillCircle(cx, baseY - Math.floor(T * 0.78), Math.floor(T * 0.65));

    // shadow
    g.fillStyle(0x000000, 0.1);
    g.fillCircle(cx + 4, baseY, Math.floor(T * 0.18));

    // base plate
    g.fillStyle(METAL_GRAY, 1);
    g.fillRect(cx - Math.floor(T * 0.14), baseY - Math.floor(T * 0.1), Math.floor(T * 0.28), Math.floor(T * 0.1));

    // pole
    g.fillStyle(0x4a5566, 1);
    g.fillRect(cx - Math.floor(T * 0.06), baseY - Math.floor(T * 0.92), Math.floor(T * 0.12), Math.floor(T * 0.92));

    // arm
    g.fillRect(cx - Math.floor(T * 0.06), baseY - Math.floor(T * 0.9), Math.floor(T * 0.22), Math.floor(T * 0.06));

    // lamp housing
    g.fillStyle(METAL_GRAY, 1);
    g.fillRect(cx + Math.floor(T * 0.1), baseY - Math.floor(T * 0.96), Math.floor(T * 0.22), Math.floor(T * 0.12));

    // light bulb
    g.fillStyle(0xffee88, 1);
    g.fillRect(cx + Math.floor(T * 0.12), baseY - Math.floor(T * 0.94), Math.floor(T * 0.18), Math.floor(T * 0.08));

    container.add(glow);
    container.add(g);

    return container;
  }

  /** Draw a park bench */
  static drawBench(scene: Phaser.Scene, x: number, y: number, tileSize: number): Phaser.GameObjects.Container {
    const T = tileSize;
    const px = x * T;
    const py = y * T;
    const container = scene.add.container(0, 0);
    const g = scene.add.graphics();

    // shadow
    g.fillStyle(0x000000, 0.1);
    g.fillRect(px + Math.floor(T * 0.14), py + Math.floor(T * 0.74), Math.floor(T * 0.72), Math.floor(T * 0.14));

    // backrest
    g.fillStyle(BROWN_DARK, 1);
    g.fillRect(px + Math.floor(T * 0.18), py + Math.floor(T * 0.32), Math.floor(T * 0.64), Math.floor(T * 0.1));
    g.fillRect(px + Math.floor(T * 0.18), py + Math.floor(T * 0.44), Math.floor(T * 0.64), Math.floor(T * 0.08));

    // seat planks
    g.fillStyle(BROWN_LIGHT, 1);
    for (let i = 0; i < 3; i++) {
      g.fillRect(px + Math.floor(T * 0.18), py + Math.floor(T * (0.56 + i * 0.06)), Math.floor(T * 0.64), Math.floor(T * 0.04));
    }
    g.fillRect(px + Math.floor(T * 0.18), py + Math.floor(T * 0.55), Math.floor(T * 0.64), Math.floor(T * 0.12));

    // legs
    g.fillStyle(METAL_GRAY, 1);
    g.fillRect(px + Math.floor(T * 0.22), py + Math.floor(T * 0.62), Math.floor(T * 0.08), Math.floor(T * 0.18));
    g.fillRect(px + Math.floor(T * 0.7), py + Math.floor(T * 0.62), Math.floor(T * 0.08), Math.floor(T * 0.18));
    // armrests
    g.fillRect(px + Math.floor(T * 0.18), py + Math.floor(T * 0.44), Math.floor(T * 0.08), Math.floor(T * 0.18));
    g.fillRect(px + Math.floor(T * 0.74), py + Math.floor(T * 0.44), Math.floor(T * 0.08), Math.floor(T * 0.18));

    container.add(g);

    return container;
  }

  /** Draw a fountain — circular base with water spray effect */
  static drawFountain(scene: Phaser.Scene, x: number, y: number, tileSize: number): Phaser.GameObjects.Container {
    const T = tileSize;
    const cx = x * T + T;
    const cy = y * T + T;
    const container = scene.add.container(0, 0);
    const g = scene.add.graphics();
    const water = scene.add.graphics();

    // shadow
    g.fillStyle(0x000000, 0.12);
    g.fillCircle(cx + 4, cy + 6, Math.floor(T * 0.62));

    // outer basin
    g.fillStyle(CONCRETE, 1);
    g.fillCircle(cx, cy, Math.floor(T * 0.66));

    // basin interior
    g.fillStyle(0x336688, 1);
    g.fillCircle(cx, cy, Math.floor(T * 0.54));

    // water surface
    water.fillStyle(0x55aacc, 0.85);
    water.fillCircle(cx, cy, Math.floor(T * 0.5));

    // water shimmer
    water.fillStyle(0x88ccee, 0.5);
    water.fillCircle(cx - Math.floor(T * 0.18), cy - Math.floor(T * 0.1), Math.floor(T * 0.12));
    water.fillCircle(cx + Math.floor(T * 0.22), cy + Math.floor(T * 0.14), Math.floor(T * 0.1));

    // center column
    g.fillStyle(CONCRETE_D, 1);
    g.fillCircle(cx, cy, Math.floor(T * 0.14));

    // spray jets (white arcs)
    water.fillStyle(0xddeeff, 0.7);
    water.fillRect(cx - 1, cy - Math.floor(T * 0.44), 2, Math.floor(T * 0.3));
    water.fillRect(cx - Math.floor(T * 0.32), cy - Math.floor(T * 0.28), Math.floor(T * 0.18), 2);
    water.fillRect(cx + Math.floor(T * 0.14), cy - Math.floor(T * 0.28), Math.floor(T * 0.18), 2);
    // spray droplets
    water.fillStyle(0xbbddf0, 0.6);
    water.fillCircle(cx, cy - Math.floor(T * 0.46), 3);
    water.fillCircle(cx - Math.floor(T * 0.3), cy - Math.floor(T * 0.3), 2);
    water.fillCircle(cx + Math.floor(T * 0.3), cy - Math.floor(T * 0.3), 2);

    container.add(g);
    container.add(water);

    return container;
  }

  /** Draw a bus stop sign with shelter */
  static drawBusStop(scene: Phaser.Scene, x: number, y: number, tileSize: number): Phaser.GameObjects.Container {
    const T = tileSize;
    const px = x * T;
    const py = y * T;
    const container = scene.add.container(0, 0);
    const g = scene.add.graphics();

    // shadow
    g.fillStyle(0x000000, 0.1);
    g.fillRect(px + 2, py + Math.floor(T * 0.96), Math.floor(T * 1.1), 8);

    // shelter roof
    g.fillStyle(0x3366aa, 1);
    g.fillRect(px + Math.floor(T * 0.04), py + Math.floor(T * 0.14), Math.floor(T * 0.96), Math.floor(T * 0.1));
    // roof overhang
    g.fillRect(px, py + Math.floor(T * 0.12), Math.floor(T * 1.04), Math.floor(T * 0.06));

    // shelter back wall (glass)
    g.fillStyle(0x88aabb, 0.5);
    g.fillRect(px + Math.floor(T * 0.84), py + Math.floor(T * 0.2), Math.floor(T * 0.18), Math.floor(T * 0.76));

    // shelter side panels
    g.fillStyle(METAL_GRAY, 1);
    g.fillRect(px + Math.floor(T * 0.84), py + Math.floor(T * 0.2), Math.floor(T * 0.04), Math.floor(T * 0.76));
    g.fillRect(px + Math.floor(T * 0.04), py + Math.floor(T * 0.2), Math.floor(T * 0.04), Math.floor(T * 0.76));

    // bench inside shelter
    g.fillStyle(BROWN_DARK, 1);
    g.fillRect(px + Math.floor(T * 0.1), py + Math.floor(T * 0.62), Math.floor(T * 0.7), Math.floor(T * 0.08));
    g.fillRect(px + Math.floor(T * 0.14), py + Math.floor(T * 0.7), Math.floor(T * 0.08), Math.floor(T * 0.16));
    g.fillRect(px + Math.floor(T * 0.66), py + Math.floor(T * 0.7), Math.floor(T * 0.08), Math.floor(T * 0.16));

    // bus sign pole
    g.fillStyle(METAL_GRAY, 1);
    g.fillRect(px + Math.floor(T * 0.44), py + Math.floor(T * 0.14), Math.floor(T * 0.08), Math.floor(T * 0.82));

    // bus sign
    g.fillStyle(0x2244bb, 1);
    g.fillRect(px + Math.floor(T * 0.28), py + Math.floor(T * 0.14), Math.floor(T * 0.4), Math.floor(T * 0.24));

    container.add(g);

    const busLabel = scene.add.text(px + Math.floor(T * 0.48), py + Math.floor(T * 0.26), 'BUS', {
      fontSize: '6px', color: '#ffffff', stroke: '#001133', strokeThickness: 1,
    }).setOrigin(0.5, 0.5);
    container.add(busLabel);

    return container;
  }

  /** Draw a fire hydrant */
  static drawHydrant(scene: Phaser.Scene, x: number, y: number, tileSize: number): Phaser.GameObjects.Container {
    const T = tileSize;
    const cx = x * T + Math.floor(T / 2);
    const baseY = y * T + Math.floor(T * 0.82);
    const container = scene.add.container(0, 0);
    const g = scene.add.graphics();

    // shadow
    g.fillStyle(0x000000, 0.1);
    g.fillCircle(cx + 2, baseY + 4, Math.floor(T * 0.14));

    // base
    g.fillStyle(HYDRANT_RED, 1);
    g.fillRect(cx - Math.floor(T * 0.16), baseY - Math.floor(T * 0.08), Math.floor(T * 0.32), Math.floor(T * 0.1));

    // body
    g.fillRect(cx - Math.floor(T * 0.12), baseY - Math.floor(T * 0.46), Math.floor(T * 0.24), Math.floor(T * 0.4));

    // dome top
    g.fillCircle(cx, baseY - Math.floor(T * 0.44), Math.floor(T * 0.12));

    // side nozzles
    g.fillStyle(0xaa1111, 1);
    g.fillRect(cx - Math.floor(T * 0.22), baseY - Math.floor(T * 0.28), Math.floor(T * 0.1), Math.floor(T * 0.1));
    g.fillRect(cx + Math.floor(T * 0.12), baseY - Math.floor(T * 0.28), Math.floor(T * 0.1), Math.floor(T * 0.1));

    // bolt detail
    g.fillStyle(METAL_GRAY, 1);
    g.fillCircle(cx, baseY - Math.floor(T * 0.32), 2);

    container.add(g);

    return container;
  }

  /** Draw a mailbox */
  static drawMailbox(scene: Phaser.Scene, x: number, y: number, tileSize: number): Phaser.GameObjects.Container {
    const T = tileSize;
    const px = x * T + Math.floor(T * 0.2);
    const py = y * T + Math.floor(T * 0.28);
    const container = scene.add.container(0, 0);
    const g = scene.add.graphics();

    const bw = Math.floor(T * 0.6);
    const bh = Math.floor(T * 0.38);

    // shadow
    g.fillStyle(0x000000, 0.1);
    g.fillRect(px + 3, py + bh + Math.floor(T * 0.22) + 3, bw, 6);

    // pole
    g.fillStyle(METAL_GRAY, 1);
    g.fillRect(px + Math.floor(bw * 0.42), py + bh, Math.floor(T * 0.08), Math.floor(T * 0.28));
    // base foot
    g.fillRect(px + Math.floor(bw * 0.26), py + bh + Math.floor(T * 0.24), Math.floor(T * 0.3), Math.floor(T * 0.06));

    // box body
    g.fillStyle(MAILBOX_BLUE, 1);
    g.fillRect(px, py, bw, bh);

    // rounded top (dome)
    g.fillCircle(px + Math.floor(bw / 2), py, Math.floor(bw / 2));

    // mail slot
    g.fillStyle(0x112244, 1);
    g.fillRect(px + Math.floor(bw * 0.18), py + Math.floor(bh * 0.3), Math.floor(bw * 0.64), Math.floor(bh * 0.12));

    // USPS stripe
    g.fillStyle(0xcc3333, 1);
    g.fillRect(px, py + Math.floor(bh * 0.58), bw, Math.floor(bh * 0.12));

    // flag
    g.fillStyle(0xcc3333, 1);
    g.fillRect(px + bw - 2, py + Math.floor(bh * 0.1), 2, Math.floor(bh * 0.4));
    g.fillRect(px + bw - 2, py + Math.floor(bh * 0.1), Math.floor(T * 0.12), Math.floor(bh * 0.16));

    container.add(g);

    return container;
  }

  /** Draw a newspaper stand */
  static drawNewsstand(scene: Phaser.Scene, x: number, y: number, tileSize: number): Phaser.GameObjects.Container {
    const T = tileSize;
    const px = x * T + Math.floor(T * 0.08);
    const py = y * T + Math.floor(T * 0.18);
    const container = scene.add.container(0, 0);
    const g = scene.add.graphics();

    const sw = Math.floor(T * 0.72);
    const sh = Math.floor(T * 0.68);

    // shadow
    g.fillStyle(0x000000, 0.12);
    g.fillRect(px + 3, py + sh + 3, sw, 8);

    // body
    g.fillStyle(0x334455, 1);
    g.fillRect(px, py, sw, sh);

    // roof/lid
    g.fillStyle(0x223344, 1);
    g.fillRect(px - 2, py, sw + 4, Math.floor(T * 0.1));

    // front window display
    g.fillStyle(0xddddcc, 1);
    g.fillRect(px + Math.floor(sw * 0.08), py + Math.floor(T * 0.14), Math.floor(sw * 0.84), Math.floor(sh * 0.58));

    // newspaper front page mockup
    g.fillStyle(0xffffff, 1);
    g.fillRect(px + Math.floor(sw * 0.1), py + Math.floor(T * 0.16), Math.floor(sw * 0.8), Math.floor(sh * 0.52));
    g.fillStyle(0x111111, 0.8);
    g.fillRect(px + Math.floor(sw * 0.12), py + Math.floor(T * 0.18), Math.floor(sw * 0.76), Math.floor(T * 0.06));
    g.fillStyle(0x333333, 0.5);
    g.fillRect(px + Math.floor(sw * 0.12), py + Math.floor(T * 0.28), Math.floor(sw * 0.76), 2);
    g.fillRect(px + Math.floor(sw * 0.12), py + Math.floor(T * 0.34), Math.floor(sw * 0.5), 2);
    g.fillRect(px + Math.floor(sw * 0.12), py + Math.floor(T * 0.4), Math.floor(sw * 0.62), 2);

    // coin slot
    g.fillStyle(METAL_GRAY, 1);
    g.fillRect(px + Math.floor(sw * 0.3), py + sh - Math.floor(T * 0.12), Math.floor(sw * 0.4), Math.floor(T * 0.08));

    // handle
    g.fillStyle(METAL_GRAY, 1);
    g.fillRect(px + Math.floor(sw * 0.35), py + Math.floor(sh * 0.72), Math.floor(sw * 0.3), Math.floor(T * 0.06));

    // legs
    g.fillStyle(0x223344, 1);
    g.fillRect(px + Math.floor(sw * 0.1), py + sh, Math.floor(T * 0.08), Math.floor(T * 0.14));
    g.fillRect(px + Math.floor(sw * 0.82), py + sh, Math.floor(T * 0.08), Math.floor(T * 0.14));

    container.add(g);

    const nsLabel = scene.add.text(px + Math.floor(sw / 2), py + Math.floor(T * 0.21), 'NEWS', {
      fontSize: '5px', color: '#ffffff', stroke: '#000000', strokeThickness: 1,
    }).setOrigin(0.5, 0.5);
    container.add(nsLabel);

    return container;
  }
}
