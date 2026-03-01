import Phaser from 'phaser';
import { Scenes, TILE_SIZE } from '../types';

export class BootScene extends Phaser.Scene {
  constructor() { super(Scenes.BOOT); }

  preload() {
    // Progress bar
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    const bar = this.add.rectangle(w / 2, h / 2, 300, 20, 0x333333);
    const fill = this.add.rectangle(w / 2 - 148, h / 2, 4, 16, 0x88cc44);
    this.load.on('progress', (v: number) => {
      fill.width = 296 * v;
      fill.x = w / 2 - 148 + fill.width / 2;
    });

    // Generate placeholder textures for all assets so the game can run
    // without real sprite files. Systems use these keys.
    this.generatePlaceholders();
  }

  create() {
    this.scene.start(Scenes.MENU);
  }

  private generatePlaceholders() {
    const T = TILE_SIZE;

    // Player: 4 frames (one per direction)
    const pg = this.make.graphics();
    for (let i = 0; i < 4; i++) {
      pg.fillStyle(0x44aaff);
      pg.fillRect(i * T, 0, T, T);
      pg.fillStyle(0xffcc88);
      pg.fillRect(i * T + 4, 2, 8, 6); // head
      pg.fillStyle(0x44aaff);
      pg.fillRect(i * T + 4, 8, 8, 8); // body
    }
    pg.generateTexture('player', T * 4, T);
    pg.destroy();

    // Terrain tileset: 16 tile types in a row
    const tg = this.make.graphics();
    const tileColors = [
      0x4CAF50, 0x8B6914, 0x6B4400, 0x3E2723, 0x2196F3,
      0x9E9E9E, 0x795548, 0xFFEB3B, 0xBDBDBD, 0x4CAF50,
      0x4CAF50, 0x4CAF50, 0x4CAF50, 0x4CAF50, 0x4CAF50, 0x4CAF50
    ];
    for (let i = 0; i < 16; i++) {
      tg.fillStyle(tileColors[i] || 0x333333);
      tg.fillRect(i * T, 0, T, T);
    }
    tg.generateTexture('terrain', T * 16, T);
    tg.destroy();

    // Crops: 6 stages × 15 crops (rows)
    const cg = this.make.graphics();
    const cropColors = [0x228B22, 0x32CD32, 0x7CFC00, 0xADFF2F, 0xFFD700, 0xFF6347];
    for (let row = 0; row < 15; row++) {
      for (let col = 0; col < 6; col++) {
        cg.fillStyle(cropColors[col]);
        const size = 4 + col * 2;
        cg.fillRect(col * T + (T - size) / 2, row * T + (T - size), size, size);
      }
    }
    cg.generateTexture('crops', T * 6, T * 15);
    cg.destroy();

    // Items: 8x8 grid of colored squares
    const ig = this.make.graphics();
    for (let i = 0; i < 64; i++) {
      const hue = (i * 37) % 360;
      ig.fillStyle(Phaser.Display.Color.HSLToColor(hue / 360, 0.7, 0.5).color);
      ig.fillRect((i % 8) * T + 2, Math.floor(i / 8) * T + 2, T - 4, T - 4);
    }
    ig.generateTexture('items', T * 8, T * 8);
    ig.destroy();

    // Objects: shipping bin, crafting bench, bed, signs, chests
    const og = this.make.graphics();
    const objColors = [0x8B4513, 0xCD853F, 0x4169E1, 0xFFD700, 0x808080, 0xDEB887, 0xFF4500, 0x800080];
    for (let i = 0; i < 8; i++) {
      og.fillStyle(objColors[i]);
      og.fillRect(i * T + 1, 1, T - 2, T - 2);
    }
    og.generateTexture('objects', T * 8, T);
    og.destroy();

    // NPCs: 10 colored sprites
    const ng = this.make.graphics();
    for (let i = 0; i < 10; i++) {
      const hue = (i * 36) % 360;
      ng.fillStyle(Phaser.Display.Color.HSLToColor(hue / 360, 0.6, 0.5).color);
      ng.fillRect(i * T + 3, 0, T - 6, T);
      ng.fillStyle(0xffcc88);
      ng.fillRect(i * T + 5, 2, 6, 5); // head
    }
    ng.generateTexture('npcs', T * 10, T);
    ng.destroy();

    // Portraits: 10 colored squares (bigger)
    const portG = this.make.graphics();
    for (let i = 0; i < 10; i++) {
      const hue = (i * 36) % 360;
      portG.fillStyle(Phaser.Display.Color.HSLToColor(hue / 360, 0.6, 0.5).color);
      portG.fillRect(i * 48, 0, 48, 48);
    }
    portG.generateTexture('portraits', 480, 48);
    portG.destroy();

    // UI icons
    const uig = this.make.graphics();
    for (let i = 0; i < 16; i++) {
      uig.fillStyle(0xcccccc);
      uig.fillRect(i * T + 1, 1, T - 2, T - 2);
    }
    uig.generateTexture('ui_icons', T * 16, T);
    uig.destroy();

    // Tools
    const toolG = this.make.graphics();
    const toolColors = [0x8B4513, 0x4169E1, 0xA0522D, 0x696969, 0x228B22, 0xC0C0C0];
    for (let i = 0; i < 6; i++) {
      toolG.fillStyle(toolColors[i]);
      toolG.fillRect(i * T + 3, 2, T - 6, T - 4);
    }
    toolG.generateTexture('tools', T * 6, T);
    toolG.destroy();

    // Animals
    const ag = this.make.graphics();
    const animalColors = [0xFFFFFF, 0x8B4513, 0xF5F5DC, 0xFF8C00, 0x808080];
    for (let i = 0; i < 5; i++) {
      ag.fillStyle(animalColors[i]);
      ag.fillRect(i * T + 2, 4, T - 4, T - 4);
    }
    ag.generateTexture('animals', T * 5, T);
    ag.destroy();

    // Monsters
    const mg = this.make.graphics();
    mg.fillStyle(0x00ff00); mg.fillRect(0, 0, T, T);     // slime
    mg.fillStyle(0x800080); mg.fillRect(T, 0, T, T);     // bat
    mg.fillStyle(0xff0000); mg.fillRect(T*2, 0, T, T);   // golem
    mg.generateTexture('monsters', T * 3, T);
    mg.destroy();
  }
}
