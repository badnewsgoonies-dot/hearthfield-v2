import Phaser from 'phaser';

export interface CityBuilding {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;     // in tiles
  height: number;    // in tiles
  color: number;     // base wall color
  roofColor: number;
  style: 'office' | 'shop' | 'apartment' | 'venue' | 'park';
}

export class CityRenderer {
  static drawBuilding(scene: Phaser.Scene, building: CityBuilding, tileSize: number): Phaser.GameObjects.Container {
    const T = tileSize;
    const px = building.x * T;
    const py = building.y * T;
    const w = building.width * T;
    const h = building.height * T;
    const container = scene.add.container(0, 0);
    const g = scene.add.graphics();

    switch (building.style) {
      case 'office':
        this.drawOffice(g, px, py, w, h, T);
        break;
      case 'shop':
        this.drawShop(g, px, py, w, h, T, building.color, building.name);
        break;
      case 'apartment':
        this.drawApartment(g, px, py, w, h, T);
        break;
      default:
        // generic building fallback
        g.fillStyle(building.color, 1);
        g.fillRect(px, py, w, h);
        g.fillStyle(building.roofColor, 1);
        g.fillRect(px, py, w, Math.floor(T * 0.4));
        break;
    }

    container.add(g);
    return container;
  }

  static drawOffice(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, T: number): void {
    // Drop shadow
    g.fillStyle(0x000000, 0.12);
    g.fillRect(x + Math.floor(T * 0.2), y + h + Math.floor(T * 0.1), w, Math.floor(T * 0.2));

    // Blue-gray glass facade
    g.fillStyle(0x445566, 1);
    g.fillRect(x, y, w, h);

    // Darker base
    g.fillStyle(0x334455, 1);
    g.fillRect(x, y + h - Math.floor(T * 0.6), w, Math.floor(T * 0.6));

    // Window grid (lighter blue)
    const winW = Math.floor(T * 0.55);
    const winH = Math.floor(T * 0.5);
    const cols = Math.max(1, Math.floor(w / T) - 1);
    const rows = Math.max(1, Math.floor(h / T) - 1);
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const wx = x + Math.floor(T * 0.2) + col * T;
        const wy = y + Math.floor(T * 0.3) + row * T;
        // window frame
        g.fillStyle(0x334455, 1);
        g.fillRect(wx, wy, winW + 4, winH + 4);
        // glass
        g.fillStyle(0x6688aa, 1);
        g.fillRect(wx + 2, wy + 2, winW, winH);
      }
    }

    // Double door at bottom center
    const doorW = Math.floor(T * 0.8);
    const doorH = Math.floor(T * 0.7);
    const doorX = x + Math.floor((w - doorW) / 2);
    const doorY = y + h - doorH;
    g.fillStyle(0x333333, 1);
    g.fillRect(doorX, doorY, doorW, doorH);
    // door frame
    g.fillStyle(0x556677, 1);
    g.fillRect(doorX, doorY, Math.floor(doorW * 0.48), doorH);
    g.fillRect(doorX + Math.floor(doorW * 0.52), doorY, Math.floor(doorW * 0.48), doorH);
    g.fillStyle(0x88aacc, 1);
    g.fillRect(doorX + 2, doorY + 2, Math.floor(doorW * 0.46), doorH - 4);
    g.fillRect(doorX + Math.floor(doorW * 0.52) + 2, doorY + 2, Math.floor(doorW * 0.46), doorH - 4);

    // Rooftop antenna
    const antX = x + Math.floor(w / 2);
    g.fillStyle(0x888899, 1);
    g.fillRect(antX - 1, y - Math.floor(T * 0.6), 3, Math.floor(T * 0.6));
    g.fillRect(antX - Math.floor(T * 0.1), y - Math.floor(T * 0.65), Math.floor(T * 0.2), Math.floor(T * 0.06));
  }

  static drawShop(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, T: number, color: number, name: string): void {
    // Drop shadow
    g.fillStyle(0x000000, 0.1);
    g.fillRect(x + Math.floor(T * 0.14), y + h + Math.floor(T * 0.1), w, Math.floor(T * 0.18));

    // Warm interior glow behind windows
    g.fillStyle(0xffee88, 0.6);
    g.fillRect(x + Math.floor(T * 0.08), y + Math.floor(T * 0.4), w - Math.floor(T * 0.16), Math.floor(T * 0.8));

    // Wall
    g.fillStyle(0xddccbb, 1);
    g.fillRect(x, y, w, h);

    // Awning stripe above door
    const awningY = y + Math.floor(T * 0.28);
    const awningH = Math.floor(T * 0.28);
    g.fillStyle(color, 1);
    g.fillRect(x, awningY, w, awningH);
    // awning stripes lighter
    g.fillStyle(0xffffff, 0.3);
    const stripes = Math.floor(w / Math.floor(T * 0.25));
    for (let i = 0; i < stripes; i++) {
      if (i % 2 === 0) {
        g.fillRect(x + i * Math.floor(T * 0.25), awningY, Math.floor(T * 0.12), awningH);
      }
    }

    // Window display area (left + right of door)
    const winW = Math.floor(T * 0.6);
    const winH = Math.floor(T * 0.55);
    const winY = y + Math.floor(T * 0.6);
    g.fillStyle(0x334455, 1);
    g.fillRect(x + Math.floor(T * 0.1), winY, winW + 4, winH + 4);
    g.fillRect(x + w - Math.floor(T * 0.1) - winW - 4, winY, winW + 4, winH + 4);
    g.fillStyle(0x88bbdd, 1);
    g.fillRect(x + Math.floor(T * 0.1) + 2, winY + 2, winW, winH);
    g.fillRect(x + w - Math.floor(T * 0.1) - winW - 2, winY + 2, winW, winH);

    // Door centered
    const doorW = Math.floor(T * 0.42);
    const doorH = Math.floor(T * 0.65);
    const doorX = x + Math.floor((w - doorW) / 2);
    const doorY = y + h - doorH;
    g.fillStyle(0x3a2a1a, 1);
    g.fillRect(doorX, doorY, doorW, doorH);
    g.fillStyle(0x6688aa, 1);
    g.fillRect(doorX + 2, doorY + 2, doorW - 4, Math.floor(doorH * 0.6));

    void name; // name label handled externally via Phaser text
  }

  static drawApartment(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, T: number): void {
    // Drop shadow
    g.fillStyle(0x000000, 0.12);
    g.fillRect(x + Math.floor(T * 0.2), y + h + Math.floor(T * 0.1), w, Math.floor(T * 0.2));

    // Brick red/brown facade
    g.fillStyle(0x884433, 1);
    g.fillRect(x, y, w, h);

    // Brick texture lines
    g.fillStyle(0x6b3328, 1);
    const brickH = Math.floor(T * 0.22);
    for (let ry = y + Math.floor(T * 0.1); ry < y + h; ry += brickH + 1) {
      g.fillRect(x + 2, ry, w - 4, 1);
    }
    // Vertical brick joints
    g.fillStyle(0x6b3328, 1);
    for (let row = 0; row < Math.floor(h / (brickH + 1)); row++) {
      const offset = row % 2 === 0 ? Math.floor(T * 0.5) : 0;
      for (let bx = x + offset; bx < x + w; bx += Math.floor(T * 1.0)) {
        g.fillRect(bx, y + row * (brickH + 1), 1, brickH);
      }
    }

    // Regular window grid: 3 cols × 3 rows
    const cols = 3;
    const rows = 3;
    const winW = Math.floor(T * 0.5);
    const winH = Math.floor(T * 0.45);
    const marginX = Math.floor((w - cols * (winW + Math.floor(T * 0.2))) / 2);
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const wx = x + marginX + col * (winW + Math.floor(T * 0.22));
        const wy = y + Math.floor(T * 0.3) + row * (winH + Math.floor(T * 0.3));
        // some lit, some dark
        const isLit = (row * cols + col) % 3 !== 0;
        g.fillStyle(0x4a3020, 1);
        g.fillRect(wx, wy, winW + 4, winH + 4);
        g.fillStyle(isLit ? 0xffdd88 : 0x334455, 1);
        g.fillRect(wx + 2, wy + 2, winW, winH);
      }
    }

    // Front steps
    g.fillStyle(0x998877, 1);
    g.fillRect(x + Math.floor(w / 2) - Math.floor(T * 0.6), y + h - Math.floor(T * 0.15), Math.floor(T * 1.2), Math.floor(T * 0.15));
    g.fillRect(x + Math.floor(w / 2) - Math.floor(T * 0.45), y + h - Math.floor(T * 0.28), Math.floor(T * 0.9), Math.floor(T * 0.15));

    // Main door
    const doorW = Math.floor(T * 0.5);
    const doorH = Math.floor(T * 0.7);
    const doorX = x + Math.floor((w - doorW) / 2);
    const doorY = y + h - doorH - Math.floor(T * 0.28);
    g.fillStyle(0x3a2a1a, 1);
    g.fillRect(doorX, doorY, doorW, doorH);
    g.fillStyle(0x6688aa, 1);
    g.fillRect(doorX + 2, doorY + 2, doorW - 4, Math.floor(doorH * 0.55));

    // Fire escape on right side (thin lines)
    const escX = x + w - Math.floor(T * 0.22);
    g.lineStyle(2, 0x667788, 1);
    for (let row = 0; row < rows; row++) {
      const fy = y + Math.floor(T * 0.6) + row * (winH + Math.floor(T * 0.3));
      g.strokeRect(escX, fy, Math.floor(T * 0.18), winH + Math.floor(T * 0.3));
    }
    g.lineStyle(1, 0x667788, 1);
    g.beginPath();
    g.moveTo(escX + Math.floor(T * 0.09), y + Math.floor(T * 0.6));
    g.lineTo(escX + Math.floor(T * 0.09), y + h - Math.floor(T * 0.2));
    g.strokePath();
  }

  static drawParkBench(g: Phaser.GameObjects.Graphics, x: number, y: number, T: number): void {
    // Shadow
    g.fillStyle(0x000000, 0.1);
    g.fillRect(x + Math.floor(T * 0.14), y + Math.floor(T * 0.76), Math.floor(T * 0.72), Math.floor(T * 0.14));

    // Back rest
    g.fillStyle(0x6b4a2a, 1);
    g.fillRect(x + Math.floor(T * 0.2), y + Math.floor(T * 0.34), Math.floor(T * 0.6), Math.floor(T * 0.1));

    // Seat slats (brown)
    g.fillStyle(0x8b6b4a, 1);
    for (let i = 0; i < 3; i++) {
      g.fillRect(x + Math.floor(T * (0.2 + i * 0.2)), y + Math.floor(T * 0.54), Math.floor(T * 0.16), Math.floor(T * 0.1));
    }

    // Legs (gray)
    g.fillStyle(0x888888, 1);
    g.fillRect(x + Math.floor(T * 0.24), y + Math.floor(T * 0.64), Math.floor(T * 0.08), Math.floor(T * 0.16));
    g.fillRect(x + Math.floor(T * 0.68), y + Math.floor(T * 0.64), Math.floor(T * 0.08), Math.floor(T * 0.16));
  }

  static drawStreetLamp(g: Phaser.GameObjects.Graphics, x: number, y: number, T: number): void {
    const cx = x + Math.floor(T * 0.5);
    const baseY = y + T;

    // Glow halo
    g.fillStyle(0xffeeaa, 0.18);
    g.fillCircle(cx, baseY - Math.floor(T * 0.65), Math.floor(T * 0.7));

    // Shadow
    g.fillStyle(0x000000, 0.1);
    g.fillCircle(cx + Math.floor(T * 0.08), baseY - Math.floor(T * 0.04), Math.floor(T * 0.18));

    // Pole
    g.fillStyle(0x555566, 1);
    g.fillRect(cx - Math.max(1, Math.floor(T * 0.05)), baseY - Math.floor(T * 0.72), Math.max(2, Math.floor(T * 0.1)), Math.floor(T * 0.62));

    // Lamp housing
    g.fillStyle(0x555566, 1);
    g.fillRect(cx - Math.floor(T * 0.12), baseY - Math.floor(T * 0.8), Math.floor(T * 0.24), Math.floor(T * 0.08));

    // Lamp glow
    g.fillStyle(0xffeeaa, 1);
    g.fillRect(cx - Math.floor(T * 0.09), baseY - Math.floor(T * 0.72), Math.floor(T * 0.18), Math.floor(T * 0.14));
  }

  static drawFountain(g: Phaser.GameObjects.Graphics, x: number, y: number, T: number): void {
    const cx = x + Math.floor(T * 0.5);
    const cy = y + Math.floor(T * 0.65);
    const r = Math.floor(T * 0.38);

    // Shadow
    g.fillStyle(0x000000, 0.1);
    g.fillCircle(cx + Math.floor(T * 0.08), cy + Math.floor(T * 0.1), r + 2);

    // Basin outer ring
    g.fillStyle(0x88aacc, 1);
    g.fillCircle(cx, cy, r);

    // Water
    g.fillStyle(0x4499cc, 1);
    g.fillCircle(cx, cy, r - Math.floor(T * 0.06));

    // Center plinth
    g.fillStyle(0x88aacc, 1);
    g.fillCircle(cx, cy, Math.floor(T * 0.1));

    // Water spray lines
    g.lineStyle(1, 0xaaddff, 0.8);
    const sprayOffsets = [
      { dx: 0, dy: -1 },
      { dx: 0.7, dy: -0.7 },
      { dx: 1, dy: 0 },
      { dx: 0.7, dy: 0.7 },
      { dx: -0.7, dy: -0.7 },
      { dx: -1, dy: 0 },
    ];
    for (const off of sprayOffsets) {
      const sx = cx + Math.floor(off.dx * T * 0.08);
      const sy = cy + Math.floor(off.dy * T * 0.08);
      const ex = cx + Math.floor(off.dx * T * 0.22);
      const ey = cy + Math.floor(off.dy * T * 0.22);
      g.beginPath();
      g.moveTo(sx, sy);
      g.lineTo(ex, ey);
      g.strokePath();
    }
  }

  static drawBusStop(g: Phaser.GameObjects.Graphics, x: number, y: number, T: number): void {
    const poleX = x + Math.floor(T * 0.2);

    // Shadow
    g.fillStyle(0x000000, 0.1);
    g.fillRect(poleX + Math.floor(T * 0.04), y + T - Math.floor(T * 0.04), Math.floor(T * 0.12), Math.floor(T * 0.08));

    // Pole
    g.fillStyle(0x888899, 1);
    g.fillRect(poleX, y + Math.floor(T * 0.2), Math.max(2, Math.floor(T * 0.08)), Math.floor(T * 0.8));

    // Sign board
    g.fillStyle(0x2255aa, 1);
    g.fillRect(poleX - Math.floor(T * 0.1), y + Math.floor(T * 0.2), Math.floor(T * 0.28), Math.floor(T * 0.22));
    g.fillStyle(0xffffff, 1);
    g.fillRect(poleX - Math.floor(T * 0.08), y + Math.floor(T * 0.24), Math.floor(T * 0.24), Math.floor(T * 0.14));

    // Small shelter roof
    g.fillStyle(0x445566, 1);
    g.fillRect(x + Math.floor(T * 0.1), y + Math.floor(T * 0.48), Math.floor(T * 0.7), Math.floor(T * 0.08));
    // shelter walls
    g.fillStyle(0x88aabb, 0.5);
    g.fillRect(x + Math.floor(T * 0.1), y + Math.floor(T * 0.56), Math.floor(T * 0.08), Math.floor(T * 0.3));
    g.fillRect(x + Math.floor(T * 0.72), y + Math.floor(T * 0.56), Math.floor(T * 0.08), Math.floor(T * 0.3));
  }

  static drawMailbox(g: Phaser.GameObjects.Graphics, x: number, y: number, T: number): void {
    const cx = x + Math.floor(T * 0.5);

    // Post
    g.fillStyle(0x555555, 1);
    g.fillRect(cx - Math.max(1, Math.floor(T * 0.04)), y + Math.floor(T * 0.6), Math.max(2, Math.floor(T * 0.08)), Math.floor(T * 0.4));

    // Box body (blue)
    g.fillStyle(0x1144aa, 1);
    g.fillRect(cx - Math.floor(T * 0.22), y + Math.floor(T * 0.3), Math.floor(T * 0.44), Math.floor(T * 0.34));

    // Rounded top suggestion
    g.fillStyle(0x1155cc, 1);
    g.fillRect(cx - Math.floor(T * 0.22), y + Math.floor(T * 0.3), Math.floor(T * 0.44), Math.floor(T * 0.08));

    // Mail slot
    g.fillStyle(0x000033, 1);
    g.fillRect(cx - Math.floor(T * 0.14), y + Math.floor(T * 0.42), Math.floor(T * 0.28), Math.floor(T * 0.04));

    // US Mail indicator (white stripe)
    g.fillStyle(0xffffff, 0.6);
    g.fillRect(cx - Math.floor(T * 0.2), y + Math.floor(T * 0.56), Math.floor(T * 0.4), Math.floor(T * 0.04));
  }

  static drawTrashCan(g: Phaser.GameObjects.Graphics, x: number, y: number, T: number): void {
    const cx = x + Math.floor(T * 0.5);

    // Shadow
    g.fillStyle(0x000000, 0.1);
    g.fillCircle(cx + Math.floor(T * 0.04), y + T - Math.floor(T * 0.02), Math.floor(T * 0.2));

    // Cylinder body (gray)
    g.fillStyle(0x888888, 1);
    g.fillRect(cx - Math.floor(T * 0.18), y + Math.floor(T * 0.35), Math.floor(T * 0.36), Math.floor(T * 0.6));

    // Slightly tapered top
    g.fillStyle(0x999999, 1);
    g.fillRect(cx - Math.floor(T * 0.2), y + Math.floor(T * 0.32), Math.floor(T * 0.4), Math.floor(T * 0.06));

    // Lid
    g.fillStyle(0x666666, 1);
    g.fillRect(cx - Math.floor(T * 0.22), y + Math.floor(T * 0.28), Math.floor(T * 0.44), Math.floor(T * 0.08));

    // Horizontal band lines
    g.fillStyle(0x777777, 1);
    g.fillRect(cx - Math.floor(T * 0.18), y + Math.floor(T * 0.56), Math.floor(T * 0.36), Math.floor(T * 0.03));
    g.fillRect(cx - Math.floor(T * 0.18), y + Math.floor(T * 0.72), Math.floor(T * 0.36), Math.floor(T * 0.03));
  }

  static drawCrosswalk(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, T: number): void {
    const stripeW = Math.floor(T * 0.22);
    const stripeH = Math.floor(T * 0.7);
    const stripeY = y + Math.floor(T * 0.15);
    const gap = Math.floor(T * 0.14);

    // Dark road under crosswalk
    g.fillStyle(0x333333, 1);
    g.fillRect(x, y, w, T);

    // White stripes
    g.fillStyle(0xffffff, 0.85);
    for (let sx = x + gap; sx + stripeW <= x + w - gap; sx += stripeW + gap) {
      g.fillRect(sx, stripeY, stripeW, stripeH);
    }
  }

  static drawTree(g: Phaser.GameObjects.Graphics, x: number, y: number, T: number, season: string): void {
    const cx = x + Math.floor(T * 0.5);
    const trunkBase = y + T - Math.floor(T * 0.04);

    // Shadow
    g.fillStyle(0x000000, 0.1);
    g.fillCircle(cx + Math.floor(T * 0.1), trunkBase - Math.floor(T * 0.06), Math.floor(T * 0.26));

    // Trunk
    g.fillStyle(0x6b4a2a, 1);
    g.fillRect(cx - Math.max(1, Math.floor(T * 0.08)), trunkBase - Math.floor(T * 0.38), Math.max(2, Math.floor(T * 0.16)), Math.floor(T * 0.38));

    // Foliage color based on season
    let leafColor: number;
    let leafColor2: number;
    switch (season.toLowerCase()) {
      case 'summer':
        leafColor = 0x228833;
        leafColor2 = 0x33aa44;
        break;
      case 'fall':
      case 'autumn':
        leafColor = 0xcc6622;
        leafColor2 = 0xdd9933;
        break;
      case 'winter':
        leafColor = 0xddeeff;
        leafColor2 = 0xeeeeff;
        break;
      case 'spring':
      default:
        leafColor = 0x44bb55;
        leafColor2 = 0x66dd66;
        break;
    }

    // Winter bare branches
    if (season.toLowerCase() === 'winter') {
      g.fillStyle(0x6b4a2a, 1);
      g.fillRect(cx - Math.floor(T * 0.24), trunkBase - Math.floor(T * 0.52), Math.floor(T * 0.48), Math.max(1, Math.floor(T * 0.05)));
      g.fillRect(cx - Math.floor(T * 0.16), trunkBase - Math.floor(T * 0.66), Math.floor(T * 0.32), Math.max(1, Math.floor(T * 0.05)));
      // snow cap
      g.fillStyle(leafColor2, 0.7);
      g.fillCircle(cx, trunkBase - Math.floor(T * 0.66), Math.floor(T * 0.22));
    } else {
      // Canopy layers
      g.fillStyle(leafColor, 1);
      g.fillCircle(cx, trunkBase - Math.floor(T * 0.62), Math.floor(T * 0.36));
      g.fillStyle(leafColor2, 1);
      g.fillCircle(cx - Math.floor(T * 0.16), trunkBase - Math.floor(T * 0.72), Math.floor(T * 0.26));
      g.fillCircle(cx + Math.floor(T * 0.14), trunkBase - Math.floor(T * 0.74), Math.floor(T * 0.24));
    }
  }
}
