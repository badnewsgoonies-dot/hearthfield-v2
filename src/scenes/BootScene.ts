import Phaser from 'phaser';
import { Scenes, TILE_SIZE } from '../types';

export class BootScene extends Phaser.Scene {
  constructor() { super(Scenes.BOOT); }

  preload() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    const bar = this.add.rectangle(w / 2, h / 2, 300, 20, 0x333333);
    const fill = this.add.rectangle(w / 2 - 148, h / 2, 4, 16, 0x88cc44);
    this.load.on('progress', (v: number) => {
      fill.width = 296 * v;
      fill.x = w / 2 - 148 + fill.width / 2;
    });
    this.generateAllTextures();
  }

  create() { this.scene.start(Scenes.MENU); }

  private generateAllTextures() {
    const T = TILE_SIZE;
    this.genPlayer(T);
    this.genTerrain(T);
    this.genCrops(T);
    this.genItems(T);
    this.genObjects(T);
    this.genNPCs(T);
    this.genPortraits();
    this.genUIIcons(T);
    this.genTools(T);
    this.genAnimals(T);
    this.genMonsters(T);
  }

  private genPlayer(T: number) {
    const g = this.make.graphics();
    for (let i = 0; i < 4; i++) {
      const ox = i * T;
      g.fillStyle(0x6B3A2A); g.fillRect(ox+4,13,3,3); g.fillRect(ox+9,13,3,3);
      g.fillStyle(0x3B5998); g.fillRect(ox+4,10,3,3); g.fillRect(ox+9,10,3,3);
      g.fillStyle(0xE74C3C); g.fillRect(ox+3,6,10,4);
      g.fillStyle(0xFFCC88); g.fillRect(ox+2,7,1,3); g.fillRect(ox+13,7,1,3);
      g.fillStyle(0xFFCC88); g.fillRect(ox+4,1,8,5);
      g.fillStyle(0xD4A937); g.fillRect(ox+3,0,10,1);
      g.fillStyle(0x8B4513); g.fillRect(ox+4,0,8,2);
      g.fillStyle(0x222222);
      if (i===0) { g.fillRect(ox+6,3,1,1); g.fillRect(ox+9,3,1,1); }
      else if (i===1) { g.fillStyle(0x8B4513); g.fillRect(ox+4,1,8,3); }
      else if (i===2) { g.fillRect(ox+5,3,1,1); }
      else { g.fillRect(ox+10,3,1,1); }
    }
    g.generateTexture('player', T*4, T); g.destroy();
  }

  private genTerrain(T: number) {
    const g = this.make.graphics();
    for (let i = 0; i < 16; i++) {
      const ox = i * T;
      switch(i) {
        case 0: // GRASS
          g.fillStyle(0x5DAE47); g.fillRect(ox,0,T,T);
          g.fillStyle(0x4A9636); g.fillRect(ox+3,5,1,2); g.fillRect(ox+8,10,1,2); g.fillRect(ox+12,3,1,2);
          break;
        case 1: // DIRT
          g.fillStyle(0x8B6914); g.fillRect(ox,0,T,T);
          g.fillStyle(0x7A5C10); g.fillRect(ox+2,4,2,1); g.fillRect(ox+10,8,2,1);
          break;
        case 2: // TILLED
          g.fillStyle(0x5C4020); g.fillRect(ox,0,T,T);
          g.fillStyle(0x4A3318); for(let r=2;r<T;r+=4) g.fillRect(ox,r,T,1);
          break;
        case 3: // WATERED
          g.fillStyle(0x3A2A15); g.fillRect(ox,0,T,T);
          g.fillStyle(0x2E2010); for(let r=2;r<T;r+=4) g.fillRect(ox,r,T,1);
          break;
        case 4: // WATER
          g.fillStyle(0x3A8FD6); g.fillRect(ox,0,T,T);
          g.fillStyle(0x5AAFEE); g.fillRect(ox+1,4,5,1); g.fillRect(ox+8,9,5,1); g.fillRect(ox+3,13,4,1);
          break;
        case 5: // STONE
          g.fillStyle(0x5DAE47); g.fillRect(ox,0,T,T);
          g.fillStyle(0x888888); g.fillRect(ox+3,5,10,8);
          g.fillStyle(0xAAAAAA); g.fillRect(ox+4,5,8,3);
          break;
        case 6: // WOOD
          g.fillStyle(0x5DAE47); g.fillRect(ox,0,T,T);
          g.fillStyle(0x6B4226); g.fillRect(ox+4,6,8,8);
          g.fillStyle(0x8B5A2B); g.fillRect(ox+5,7,6,6);
          break;
        case 7: // SAND
          g.fillStyle(0xE8D5A3); g.fillRect(ox,0,T,T);
          break;
        case 8: // PATH
          g.fillStyle(0xC4A86E); g.fillRect(ox,0,T,T);
          g.fillStyle(0xB09858); g.fillRect(ox+3,3,2,2); g.fillRect(ox+10,10,2,2);
          break;
        default:
          g.fillStyle(0x5DAE47+(i*0x030303)); g.fillRect(ox,0,T,T);
      }
    }
    g.generateTexture('terrain', T*16, T); g.destroy();
  }

  private genCrops(T: number) {
    const g = this.make.graphics();
    const hues = [0xFFD700,0xE8790A,0xFF4444,0x8B45FF,0x44BB44,0xFF69B4,0xFFAA00,0x22CCAA,0xBB2244,0x6B8E23,0xFF6347,0x9370DB,0x20B2AA,0xDAA520,0xDC143C];
    for (let row=0; row<15; row++) {
      for (let col=0; col<6; col++) {
        const ox=col*T, oy=row*T;
        g.fillStyle(0x5C4020); g.fillRect(ox,oy,T,T);
        if (col===0) { g.fillStyle(0x8B6914); g.fillRect(ox+6,oy+10,2,2); g.fillRect(ox+9,oy+11,2,1); }
        else if (col===1) { g.fillStyle(0x228B22); g.fillRect(ox+7,oy+8,2,4); g.fillRect(ox+6,oy+8,4,1); }
        else if (col===2) { g.fillStyle(0x228B22); g.fillRect(ox+7,oy+5,2,7); g.fillRect(ox+5,oy+6,2,2); g.fillRect(ox+9,oy+7,2,2); }
        else if (col===3) { g.fillStyle(0x2E8B2E); g.fillRect(ox+7,oy+3,2,9); g.fillRect(ox+4,oy+4,3,3); g.fillRect(ox+9,oy+5,3,3); }
        else if (col===4) { g.fillStyle(0x2E8B2E); g.fillRect(ox+7,oy+2,2,10); g.fillRect(ox+4,oy+3,3,3); g.fillRect(ox+9,oy+4,3,3); g.fillStyle(hues[row]); g.fillRect(ox+6,oy+1,4,3); }
        else { g.fillStyle(0x2E8B2E); g.fillRect(ox+7,oy+3,2,9); g.fillRect(ox+4,oy+4,3,3); g.fillRect(ox+9,oy+5,3,3); g.fillStyle(hues[row]); g.fillRect(ox+5,oy+0,6,4); g.fillStyle(0xFFFFFF); g.fillRect(ox+6,oy+1,2,1); }
      }
    }
    g.generateTexture('crops', T*6, T*15); g.destroy();
  }

  private genItems(T: number) {
    const g = this.make.graphics();
    for (let i=0; i<64; i++) {
      const col=i%8, row=Math.floor(i/8), ox=col*T, oy=row*T;
      const hue=(i*47+30)%360;
      const c = Phaser.Display.Color.HSLToColor(hue/360,0.7,0.5).color;
      g.fillStyle(0x2A2A3A); g.fillRect(ox,oy,T,T);
      if (i<8) { g.fillStyle(0xBB9955); g.fillRect(ox+4,oy+3,8,10); g.fillStyle(c); g.fillRect(ox+5,oy+5,6,4); }
      else if (i<16) { g.fillStyle(c); g.fillRect(ox+4,oy+4,8,8); g.fillStyle(0x228B22); g.fillRect(ox+6,oy+2,4,2); }
      else if (i<24) { g.fillStyle(c); g.fillRect(ox+2,oy+6,10,4); g.fillRect(ox+12,oy+5,2,6); g.fillStyle(0x222222); g.fillRect(ox+4,oy+7,1,1); }
      else if (i<32) { g.fillStyle(c); g.fillRect(ox+5,oy+3,6,10); g.fillStyle(0xFFFFFF); g.fillRect(ox+6,oy+4,2,3); }
      else if (i<40) { g.fillStyle(c); g.fillRect(ox+3,oy+6,10,6); g.fillStyle(0xFFFFFF); g.fillRect(ox+5,oy+6,4,2); }
      else if (i<48) { g.fillStyle(0xDEB887); g.fillRect(ox+3,oy+8,10,4); g.fillStyle(c); g.fillRect(ox+4,oy+5,8,4); }
      else if (i<56) { g.fillStyle(0x8B6914); g.fillRect(ox+7,oy+4,2,10); g.fillStyle(c); g.fillRect(ox+4,oy+2,8,4); }
      else { g.fillStyle(c); g.fillRect(ox+3,oy+3,10,10); g.fillStyle(0x222222); g.fillRect(ox+5,oy+5,6,6); g.fillStyle(c); g.fillRect(ox+6,oy+6,4,4); }
    }
    g.generateTexture('items', T*8, T*8); g.destroy();
  }

  private genObjects(T: number) {
    const g = this.make.graphics();
    // 0: Shipping Bin
    g.fillStyle(0x8B4513); g.fillRect(1,4,14,12); g.fillStyle(0xA0522D); g.fillRect(2,5,12,10);
    g.fillStyle(0x6B3410); g.fillRect(1,8,14,2); g.fillStyle(0xFFD700); g.fillRect(6,2,4,3);
    // 1: Crafting Bench
    let ox=T; g.fillStyle(0xA0522D); g.fillRect(ox+1,6,14,4); g.fillStyle(0x8B4513); g.fillRect(ox+2,10,3,6); g.fillRect(ox+11,10,3,6);
    g.fillStyle(0xCD853F); g.fillRect(ox+2,6,12,2); g.fillStyle(0x888888); g.fillRect(ox+5,4,1,3); g.fillRect(ox+4,4,3,1);
    // 2: Bed
    ox=T*2; g.fillStyle(0x5C3A21); g.fillRect(ox+2,3,12,12); g.fillStyle(0xFFFFFF); g.fillRect(ox+3,4,10,3);
    g.fillStyle(0x4169E1); g.fillRect(ox+3,7,10,7); g.fillStyle(0x3458B0); g.fillRect(ox+3,10,10,2);
    // 3: Kitchen
    ox=T*3; g.fillStyle(0x888888); g.fillRect(ox+1,4,14,12); g.fillStyle(0xAAAAAA); g.fillRect(ox+2,4,12,4);
    g.fillStyle(0xFF4500); g.fillRect(ox+4,5,3,2); g.fillRect(ox+9,5,3,2);
    // 4: Shop Sign
    ox=T*4; g.fillStyle(0x5DAE47); g.fillRect(ox,0,T,T); g.fillStyle(0x6B4226); g.fillRect(ox+7,6,2,10);
    g.fillStyle(0xDEB887); g.fillRect(ox+2,2,12,6); g.fillStyle(0x4A7A2E); g.fillRect(ox+3,3,10,4); g.fillStyle(0xFFD700); g.fillRect(ox+5,4,2,2);
    // 5: Mine Entrance
    ox=T*5; g.fillStyle(0x666666); g.fillRect(ox,0,T,T); g.fillStyle(0x888888); g.fillRect(ox+1,0,14,6);
    g.fillStyle(0x222222); g.fillRect(ox+3,4,10,12); g.fillStyle(0x111111); g.fillRect(ox+5,6,6,10);
    g.fillStyle(0xBBBBBB); g.fillRect(ox+6,7,4,1); g.fillRect(ox+7,7,2,4);
    // 6: Quest Board
    ox=T*6; g.fillStyle(0x5DAE47); g.fillRect(ox,0,T,T); g.fillStyle(0x6B4226); g.fillRect(ox+3,4,2,12); g.fillRect(ox+11,4,2,12);
    g.fillStyle(0xDEB887); g.fillRect(ox+2,2,12,9); g.fillStyle(0xFFFFF0); g.fillRect(ox+4,3,3,4); g.fillRect(ox+8,4,3,3);
    g.fillStyle(0xFF4444); g.fillRect(ox+5,3,1,1); g.fillRect(ox+9,4,1,1);
    // 7: House
    ox=T*7; g.fillStyle(0xA0522D); g.fillRect(ox+1,6,14,10);
    g.fillStyle(0xCC4444); g.fillRect(ox,5,16,2); g.fillRect(ox+2,3,12,2); g.fillRect(ox+4,1,8,2); g.fillRect(ox+6,0,4,1);
    g.fillStyle(0x5C3A21); g.fillRect(ox+6,10,4,6);
    g.fillStyle(0x87CEEB); g.fillRect(ox+2,7,3,3); g.fillRect(ox+11,7,3,3);

    g.generateTexture('objects', T*8, T); g.destroy();
  }

  private genNPCs(T: number) {
    const g = this.make.graphics();
    const designs = [
      {hair:0xFF6347,shirt:0x4169E1,skin:0xFFCC88},{hair:0x8B4513,shirt:0x228B22,skin:0xFFCC88},
      {hair:0xFFD700,shirt:0xFF69B4,skin:0xFAD7B6},{hair:0x222222,shirt:0x800080,skin:0xD4A574},
      {hair:0xFFFFFF,shirt:0x4682B4,skin:0xFFCC88},{hair:0xFF8C00,shirt:0x2E8B57,skin:0xFAD7B6},
      {hair:0x9370DB,shirt:0xDC143C,skin:0xFFCC88},{hair:0x20B2AA,shirt:0xDAA520,skin:0xD4A574},
      {hair:0xCD853F,shirt:0x708090,skin:0xFFCC88},{hair:0xFF1493,shirt:0x6B8E23,skin:0xFAD7B6},
    ];
    for (let i=0; i<10; i++) {
      const ox=i*T, d=designs[i];
      g.fillStyle(0x444444); g.fillRect(ox+4,14,3,2); g.fillRect(ox+9,14,3,2);
      g.fillStyle(0x3B3B5C); g.fillRect(ox+4,11,3,3); g.fillRect(ox+9,11,3,3);
      g.fillStyle(d.shirt); g.fillRect(ox+3,6,10,5);
      g.fillStyle(d.skin); g.fillRect(ox+2,7,1,3); g.fillRect(ox+13,7,1,3);
      g.fillStyle(d.skin); g.fillRect(ox+4,1,8,5);
      g.fillStyle(d.hair); g.fillRect(ox+4,0,8,2); g.fillRect(ox+3,1,1,3); g.fillRect(ox+12,1,1,3);
      g.fillStyle(0x222222); g.fillRect(ox+6,3,1,1); g.fillRect(ox+9,3,1,1);
    }
    g.generateTexture('npcs', T*10, T); g.destroy();
  }

  private genPortraits() {
    const g = this.make.graphics();
    const designs = [
      {hair:0xFF6347,shirt:0x4169E1,skin:0xFFCC88},{hair:0x8B4513,shirt:0x228B22,skin:0xFFCC88},
      {hair:0xFFD700,shirt:0xFF69B4,skin:0xFAD7B6},{hair:0x222222,shirt:0x800080,skin:0xD4A574},
      {hair:0xFFFFFF,shirt:0x4682B4,skin:0xFFCC88},{hair:0xFF8C00,shirt:0x2E8B57,skin:0xFAD7B6},
      {hair:0x9370DB,shirt:0xDC143C,skin:0xFFCC88},{hair:0x20B2AA,shirt:0xDAA520,skin:0xD4A574},
      {hair:0xCD853F,shirt:0x708090,skin:0xFFCC88},{hair:0xFF1493,shirt:0x6B8E23,skin:0xFAD7B6},
    ];
    for (let i=0; i<10; i++) {
      const ox=i*48, d=designs[i];
      g.fillStyle(0x1A2A3A); g.fillRect(ox,0,48,48);
      g.fillStyle(d.shirt); g.fillRect(ox+4,34,40,14);
      g.fillStyle(d.skin); g.fillRect(ox+18,30,12,6); g.fillRect(ox+10,8,28,24); g.fillRect(ox+12,6,24,28);
      g.fillStyle(d.hair); g.fillRect(ox+10,4,28,8); g.fillRect(ox+8,6,4,14); g.fillRect(ox+36,6,4,14);
      g.fillStyle(0xFFFFFF); g.fillRect(ox+15,16,7,5); g.fillRect(ox+26,16,7,5);
      g.fillStyle(0x334455); g.fillRect(ox+17,17,4,3); g.fillRect(ox+28,17,4,3);
      g.fillStyle(0x111111); g.fillRect(ox+18,17,2,2); g.fillRect(ox+29,17,2,2);
      g.fillStyle(0xCC8866); g.fillRect(ox+19,27,10,2);
    }
    g.generateTexture('portraits', 480, 48); g.destroy();
  }

  private genUIIcons(T: number) {
    const g = this.make.graphics();
    for (let i=0; i<16; i++) { const ox=i*T; g.fillStyle(0x333344); g.fillRect(ox,0,T,T); g.fillStyle(0x888899); g.fillRect(ox+2,2,T-4,T-4); }
    g.generateTexture('ui_icons', T*16, T); g.destroy();
  }

  private genTools(T: number) {
    const g = this.make.graphics();
    // 0: Hoe
    g.fillStyle(0x8B6914); g.fillRect(7,3,2,11); g.fillStyle(0x888888); g.fillRect(4,2,8,3);
    // 1: Watering Can
    let ox=T; g.fillStyle(0x4682B4); g.fillRect(ox+4,5,8,8); g.fillRect(ox+3,6,1,4); g.fillRect(ox+12,4,3,2); g.fillStyle(0x5AAFEE); g.fillRect(ox+13,3,2,1);
    // 2: Axe
    ox=T*2; g.fillStyle(0x8B6914); g.fillRect(ox+7,4,2,10); g.fillStyle(0x888888); g.fillRect(ox+3,2,6,4); g.fillRect(ox+2,3,2,2);
    // 3: Pickaxe
    ox=T*3; g.fillStyle(0x8B6914); g.fillRect(ox+7,5,2,9); g.fillStyle(0x888888); g.fillRect(ox+3,2,10,3); g.fillRect(ox+2,3,2,2); g.fillRect(ox+12,3,2,2);
    // 4: Fishing Rod
    ox=T*4; g.fillStyle(0x8B6914); g.fillRect(ox+6,2,2,12); g.fillStyle(0xCCCCCC); g.fillRect(ox+8,2,5,1); g.fillRect(ox+12,2,1,6); g.fillStyle(0xFF4444); g.fillRect(ox+12,8,1,2);
    // 5: Scythe
    ox=T*5; g.fillStyle(0x8B6914); g.fillRect(ox+7,4,2,10); g.fillStyle(0xBBBBBB); g.fillRect(ox+2,2,8,2); g.fillRect(ox+2,4,2,3);
    g.generateTexture('tools', T*6, T); g.destroy();
  }

  private genAnimals(T: number) {
    const g = this.make.graphics();
    const a = [{b:0xFFFFFF,d:0xFFCCCC},{b:0x8B4513,d:0xFFCC88},{b:0xF5F5DC,d:0xCCCCBB},{b:0xFF8C00,d:0xFFAA44},{b:0x888888,d:0xAAAAAA}];
    for (let i=0; i<5; i++) {
      const ox=i*T;
      g.fillStyle(a[i].b); g.fillRect(ox+3,6,10,6); g.fillRect(ox+4,5,8,8);
      g.fillStyle(a[i].d); g.fillRect(ox+10,3,5,4);
      g.fillStyle(0x222222); g.fillRect(ox+12,4,1,1);
      g.fillStyle(0x8B6914); g.fillRect(ox+5,12,2,4); g.fillRect(ox+9,12,2,4);
    }
    g.generateTexture('animals', T*5, T); g.destroy();
  }

  private genMonsters(T: number) {
    const g = this.make.graphics();
    // Slime
    g.fillStyle(0x44CC44); g.fillRect(3,6,10,8); g.fillRect(4,4,8,10);
    g.fillStyle(0x88FF88); g.fillRect(5,5,3,2);
    g.fillStyle(0x222222); g.fillRect(5,7,2,2); g.fillRect(9,7,2,2);
    // Bat
    let ox=T; g.fillStyle(0x8844AA); g.fillRect(ox+1,5,5,4); g.fillRect(ox+10,5,5,4);
    g.fillStyle(0x6622AA); g.fillRect(ox+5,4,6,6); g.fillStyle(0xFF4444); g.fillRect(ox+6,6,2,1); g.fillRect(ox+8,6,2,1);
    // Golem
    ox=T*2; g.fillStyle(0x888888); g.fillRect(ox+3,4,10,10); g.fillStyle(0xAAAAAA); g.fillRect(ox+4,3,8,4);
    g.fillStyle(0xFF4444); g.fillRect(ox+5,5,2,2); g.fillRect(ox+9,5,2,2);
    g.generateTexture('monsters', T*3, T); g.destroy();
  }
}
