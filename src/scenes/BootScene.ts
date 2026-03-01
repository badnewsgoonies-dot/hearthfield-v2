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

  create() {
    // Player animations (4 frames: 0=down, 1=up, 2=left, 3=right)
    // Since we only have 1 frame per direction, idle and walk use the same frame
    const dirs = [
      { dir: 'down', frame: 0 },
      { dir: 'up', frame: 1 },
      { dir: 'left', frame: 2 },
      { dir: 'right', frame: 3 },
    ];
    for (const { dir, frame } of dirs) {
      this.anims.create({
        key: `idle_${dir}`,
        frames: [{ key: 'player', frame }],
        frameRate: 1,
        repeat: -1,
      });
      this.anims.create({
        key: `walk_${dir}`,
        frames: [{ key: 'player', frame }],
        frameRate: 6,
        repeat: -1,
      });
    }

    this.scene.start(Scenes.MENU);
  }

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
    this.genHouseComposite(T);
    this.genTreeComposite(T);
    this.genFenceComposite(T);
  }

  private genPlayer(T: number) {
    const g = this.make.graphics();
    const outline = 0x1f1a1a;
    const skin = 0xf2c191;
    const skinShadow = 0xd69d71;
    const denim = 0x3a5f9b;
    const denimHi = 0x5c82be;
    const shirt = 0xe8f0d5;
    const hat = 0xb88a4a;
    const hatBand = 0x7f5a30;
    const boot = 0x5a3f2c;

    for (let i = 0; i < 4; i++) {
      const ox = i * T;
      const facingSide = i >= 2;
      const isLeft = i === 2;

      // Hat + brim
      g.fillStyle(outline); g.fillRect(ox + 3, 0, 10, 1); g.fillRect(ox + 2, 1, 12, 1);
      g.fillStyle(hat); g.fillRect(ox + 4, 0, 8, 1); g.fillRect(ox + 3, 1, 10, 1);
      g.fillStyle(hatBand); g.fillRect(ox + 4, 1, 8, 1);

      // Head
      g.fillStyle(outline); g.fillRect(ox + 3, 2, 10, 5);
      g.fillStyle(skin); g.fillRect(ox + 4, 2, 8, 4);
      g.fillStyle(skinShadow); g.fillRect(ox + 10, 3, 1, 2);
      if (!facingSide) {
        g.fillStyle(0x2a2322); g.fillRect(ox + 6, 4, 1, 1); g.fillRect(ox + 9, 4, 1, 1);
      } else {
        g.fillStyle(0x2a2322); g.fillRect(ox + (isLeft ? 6 : 9), 4, 1, 1);
      }

      // Torso and overalls
      g.fillStyle(outline); g.fillRect(ox + 2, 7, 12, 6);
      g.fillStyle(shirt); g.fillRect(ox + 3, 8, 10, 4);
      g.fillStyle(denim); g.fillRect(ox + 5, 8, 6, 5);
      g.fillStyle(denimHi); g.fillRect(ox + 6, 9, 4, 2);
      g.fillStyle(outline); g.fillRect(ox + 6, 7, 1, 5); g.fillRect(ox + 9, 7, 1, 5);

      // Arms
      if (!facingSide) {
        g.fillStyle(skin); g.fillRect(ox + 2, 8, 1, 3); g.fillRect(ox + 13, 8, 1, 3);
      } else if (isLeft) {
        g.fillStyle(skin); g.fillRect(ox + 2, 8, 1, 3); g.fillRect(ox + 11, 8, 1, 2);
      } else {
        g.fillStyle(skin); g.fillRect(ox + 4, 8, 1, 2); g.fillRect(ox + 13, 8, 1, 3);
      }

      // Legs and boots
      g.fillStyle(denim); g.fillRect(ox + 4, 12, 3, 2); g.fillRect(ox + 9, 12, 3, 2);
      g.fillStyle(boot); g.fillRect(ox + 4, 14, 3, 2); g.fillRect(ox + 9, 14, 3, 2);
      g.fillStyle(0x2f241c); g.fillRect(ox + 5, 15, 2, 1); g.fillRect(ox + 10, 15, 2, 1);

      // Side-facing profile tweak
      if (facingSide) {
        g.fillStyle(outline); g.fillRect(ox + (isLeft ? 11 : 4), 3, 1, 2);
      }
    }
    g.generateTexture('player', T*4, T); g.destroy();
    const pTex = this.textures.get('player');
    for (let i = 0; i < 4; i++) pTex.add(i, 0, i * T, 0, T, T);
  }

  private genTerrain(T: number) {
    const g = this.make.graphics();
    for (let i = 0; i < 16; i++) {
      const ox = i * T;
      switch(i) {
        case 0: // GRASS
          g.fillStyle(0x74bf54); g.fillRect(ox,0,T,T);
          g.fillStyle(0x89ce63); g.fillRect(ox,0,T,4); g.fillRect(ox+1,6,2,1); g.fillRect(ox+9,2,2,1);
          g.fillStyle(0x5aa43d); g.fillRect(ox,12,T,4); g.fillRect(ox+4,8,1,2); g.fillRect(ox+11,9,1,2);
          g.fillStyle(0x4a8f33);
          g.fillRect(ox+2,3,1,2); g.fillRect(ox+6,11,1,2); g.fillRect(ox+12,5,1,2); g.fillRect(ox+14,10,1,2);
          g.fillStyle(0x9fe07a);
          g.fillRect(ox+3,4,1,1); g.fillRect(ox+8,7,1,1); g.fillRect(ox+13,2,1,1); g.fillRect(ox+5,13,1,1);
          break;
        case 1: // DIRT
          g.fillStyle(0x9a6a3f); g.fillRect(ox,0,T,T);
          g.fillStyle(0xae7b4d); g.fillRect(ox,0,T,4); g.fillRect(ox+3,6,2,1);
          g.fillStyle(0x7f5431); g.fillRect(ox,12,T,4); g.fillRect(ox+10,9,2,1);
          g.fillStyle(0xc49667); g.fillRect(ox+2,3,1,1); g.fillRect(ox+12,5,1,1); g.fillRect(ox+7,11,1,1);
          g.fillStyle(0x6d4629); g.fillRect(ox+5,7,2,1); g.fillRect(ox+13,10,2,1); g.fillRect(ox+1,13,2,1);
          break;
        case 2: // TILLED
          g.fillStyle(0x6f4a2c); g.fillRect(ox,0,T,T);
          g.fillStyle(0x55361f);
          for (let r = 2; r < T; r += 4) g.fillRect(ox, r, T, 1);
          g.fillStyle(0x84603a);
          for (let r = 0; r < T; r += 4) g.fillRect(ox + 1, r, T - 2, 1);
          break;
        case 3: // WATERED
          g.fillStyle(0x4c3727); g.fillRect(ox,0,T,T);
          g.fillStyle(0x3d2b1f);
          for (let r = 2; r < T; r += 4) g.fillRect(ox, r, T, 1);
          g.fillStyle(0x5f4c3b); g.fillRect(ox, 0, T, 2);
          g.fillStyle(0x6f8aa1); g.fillRect(ox+2,3,2,1); g.fillRect(ox+9,7,2,1); g.fillRect(ox+5,11,2,1);
          break;
        case 4: // WATER
          g.fillStyle(0x2f79bf); g.fillRect(ox,0,T,T);
          g.fillStyle(0x4d9de0); g.fillRect(ox,0,T,6); g.fillRect(ox+2,8,11,2);
          g.fillStyle(0x78c4f4);
          g.fillRect(ox+1,3,5,1); g.fillRect(ox+9,5,4,1); g.fillRect(ox+5,9,6,1); g.fillRect(ox+2,13,5,1);
          g.fillStyle(0x1f5e99); g.fillRect(ox,14,T,2);
          break;
        case 5: // STONE
          g.fillStyle(0x74bf54); g.fillRect(ox,0,T,T);
          g.fillStyle(0x777b82); g.fillRect(ox+3,5,10,8);
          g.fillStyle(0x999ea6); g.fillRect(ox+4,5,7,3); g.fillRect(ox+6,10,5,2);
          g.fillStyle(0x5d6168); g.fillRect(ox+4,12,7,1); g.fillRect(ox+11,8,1,3);
          break;
        case 6: // WOOD
          g.fillStyle(0x74bf54); g.fillRect(ox,0,T,T);
          g.fillStyle(0x7c4f2e); g.fillRect(ox+4,5,8,9);
          g.fillStyle(0xa16a3b); g.fillRect(ox+5,6,6,7);
          g.fillStyle(0x5e3a22); g.fillRect(ox+6,6,1,7); g.fillRect(ox+9,6,1,7);
          g.fillStyle(0xc38754); g.fillRect(ox+7,8,2,1); g.fillRect(ox+8,11,2,1);
          break;
        case 7: // SAND
          g.fillStyle(0xe6d39b); g.fillRect(ox,0,T,T);
          g.fillStyle(0xf0e0b2); g.fillRect(ox,0,T,4);
          g.fillStyle(0xd2bd86); g.fillRect(ox,12,T,4);
          g.fillStyle(0xc9b278); g.fillRect(ox+2,6,1,1); g.fillRect(ox+7,10,1,1); g.fillRect(ox+12,8,1,1);
          break;
        case 8: // PATH
          g.fillStyle(0xbf9a67); g.fillRect(ox,0,T,T);
          g.fillStyle(0xd1af7d); g.fillRect(ox,0,T,3);
          g.fillStyle(0x9f7f53); g.fillRect(ox,13,T,3);
          g.fillStyle(0x8b6c45);
          g.fillRect(ox+2,4,2,2); g.fillRect(ox+11,6,2,2); g.fillRect(ox+6,10,3,2); g.fillRect(ox+1,12,2,1);
          g.fillStyle(0xe3c18e); g.fillRect(ox+4,7,1,1); g.fillRect(ox+9,3,1,1);
          break;
        case 9: // FENCE TILE
          g.fillStyle(0x74bf54); g.fillRect(ox,0,T,T);
          g.fillStyle(0x7e5536); g.fillRect(ox+6,1,4,14);
          g.fillStyle(0xa67646); g.fillRect(ox,4,T,3); g.fillRect(ox,10,T,3);
          g.fillStyle(0x5f3e27); g.fillRect(ox+7,2,1,12); g.fillRect(ox+2,5,1,1); g.fillRect(ox+11,11,1,1);
          g.fillStyle(0xc48f5a); g.fillRect(ox+1,4,2,1); g.fillRect(ox+12,10,2,1);
          break;
        default:
          g.fillStyle(0x74bf54); g.fillRect(ox,0,T,T);
          g.fillStyle(0x84c95f); g.fillRect(ox,0,T,5);
          g.fillStyle(0x609c45); g.fillRect(ox,11,T,5);
          g.fillStyle(0x4a8a35);
          g.fillRect(ox+((i*3)%13),3,1,2);
          g.fillRect(ox+((i*5)%12),8,1,2);
          g.fillRect(ox+((i*7)%11),13,1,1);
      }
    }
    g.generateTexture('terrain', T*16, T); g.destroy();
    const tTex = this.textures.get('terrain');
    for (let i = 0; i < 16; i++) tTex.add(i, 0, i * T, 0, T, T);
  }

  private genCrops(T: number) {
    const g = this.make.graphics();
    const produce = [0xf6cf35, 0xe68a2e, 0xcf4343, 0x8a5de1, 0x5bbf58, 0xf08fc6, 0xffb146, 0x3bc8b4, 0xc94858, 0x9cbd45, 0xff7a5a, 0xa68be0, 0x3ac1af, 0xe4bb4e, 0xe65353];
    const leafA = [0x5ba744, 0x4d943a, 0x6bbd52, 0x3f7f32];
    const soil = 0x6f4a2c;
    const soilHi = 0x87603a;
    const soilLo = 0x55361f;
    for (let row=0; row<15; row++) {
      for (let col=0; col<6; col++) {
        const ox=col*T, oy=row*T;
        g.fillStyle(soil); g.fillRect(ox,oy,T,T);
        g.fillStyle(soilHi); g.fillRect(ox,oy,T,2);
        g.fillStyle(soilLo); g.fillRect(ox,oy+12,T,4);
        g.fillStyle(0x4c2f1b); g.fillRect(ox+2,oy+4,2,1); g.fillRect(ox+10,oy+7,2,1); g.fillRect(ox+6,oy+11,2,1);

        const stem = leafA[row % leafA.length];
        const stemHi = leafA[(row + 1) % leafA.length];
        const fruit = produce[row];
        const fruitHi = Phaser.Display.Color.IntegerToColor(fruit).lighten(20).color;
        const fruitLo = Phaser.Display.Color.IntegerToColor(fruit).darken(25).color;

        if (col === 0) {
          g.fillStyle(0xceb37a); g.fillRect(ox+7,oy+9,2,2);
          g.fillStyle(0x9c7f49); g.fillRect(ox+8,oy+10,2,1);
          g.fillStyle(0x5f8a37); g.fillRect(ox+7,oy+8,1,1);
        } else if (col === 1) {
          g.fillStyle(stem); g.fillRect(ox+7,oy+7,2,4);
          g.fillStyle(stemHi); g.fillRect(ox+6,oy+8,1,2); g.fillRect(ox+9,oy+8,1,2);
        } else if (col === 2) {
          g.fillStyle(stem); g.fillRect(ox+7,oy+5,2,6);
          g.fillStyle(stemHi); g.fillRect(ox+5,oy+7,2,2); g.fillRect(ox+9,oy+6,2,2);
          g.fillStyle(0x31652b); g.fillRect(ox+10,oy+7,1,2);
        } else if (col === 3) {
          g.fillStyle(stem); g.fillRect(ox+7,oy+3,2,8);
          g.fillStyle(stemHi); g.fillRect(ox+4,oy+6,3,2); g.fillRect(ox+9,oy+5,3,2);
          g.fillStyle(0x31652b); g.fillRect(ox+5,oy+8,2,1); g.fillRect(ox+9,oy+7,2,1);
        } else if (col === 4) {
          g.fillStyle(stem); g.fillRect(ox+7,oy+2,2,9);
          g.fillStyle(stemHi); g.fillRect(ox+4,oy+4,3,3); g.fillRect(ox+9,oy+4,3,3);
          g.fillStyle(fruit); g.fillRect(ox+6,oy+1,4,3);
          g.fillStyle(fruitHi); g.fillRect(ox+6,oy+1,2,1);
          g.fillStyle(fruitLo); g.fillRect(ox+8,oy+3,2,1);
        } else {
          g.fillStyle(stem); g.fillRect(ox+7,oy+2,2,9);
          g.fillStyle(stemHi); g.fillRect(ox+4,oy+4,3,3); g.fillRect(ox+9,oy+4,3,3);
          g.fillStyle(fruit); g.fillRect(ox+4,oy,8,5);
          g.fillStyle(fruitHi); g.fillRect(ox+5,oy+1,3,1); g.fillRect(ox+9,oy+1,2,1);
          g.fillStyle(fruitLo); g.fillRect(ox+8,oy+4,3,1);
          g.fillStyle(0xffffff); g.fillRect(ox+6,oy+2,1,1); g.fillRect(ox+10,oy+2,1,1);
        }
      }
    }
    g.generateTexture('crops', T*6, T*15); g.destroy();
    const cTex = this.textures.get('crops');
    for (let row = 0; row < 15; row++) {
      for (let col = 0; col < 6; col++) {
        cTex.add(row * 6 + col, 0, col * T, row * T, T, T);
      }
    }
  }

  private genItems(T: number) {
    const g = this.make.graphics();
    const ITEM_COLS = 16;
    const ITEM_ROWS = 8;
    const ITEM_FRAMES = ITEM_COLS * ITEM_ROWS;
    const outline = 0x1d1a1a;
    const seedColors = [0xe84f4f, 0xf1a43d, 0xf4d04f, 0x73bf4a, 0x50b89d, 0x5a8de1, 0x9962d5, 0xc8629f];
    const produceColors = [0xf2e5d0, 0x9f7a4f, 0xf4ca43, 0xdf6b3d, 0x76c84f, 0xbd5ed9, 0xe05268, 0x57bba0];
    const resourceColors = [0x8f8f95, 0x7b5a3e, 0x6e757f, 0xaf6d37, 0xb7b8bd, 0x7a4f37, 0x87a2b0, 0x596a73];
    const fishColors = [0x62a7d8, 0x4c8ca7, 0x7fb8a5, 0xbf8f59, 0x9099bc, 0xa8c76b, 0xd9825e, 0x6aa1b5];
    const gemColors = [0x58d9d9, 0x6ec4ff, 0xa58bf0, 0xf07aca, 0x7de091, 0xf4bf5a, 0xe66f6f, 0xc5ccd4];
    const foodColors = [0xc78d52, 0xbc5d3f, 0xd0a34a, 0x8cb860, 0xd484b0, 0xb86f52, 0x9a8ccf, 0xd5a678];

    for (let i=0; i<ITEM_FRAMES; i++) {
      const col=i%ITEM_COLS, row=Math.floor(i/ITEM_COLS), ox=col*T, oy=row*T;
      g.fillStyle(0x000000); g.fillRect(ox,oy,T,T);
      g.fillStyle(0x2b2730); g.fillRect(ox+1,oy+1,T-2,T-2);

      if (i <= 7) {
        const c = seedColors[i % seedColors.length];
        g.fillStyle(outline); g.fillRect(ox+4,oy+3,8,10);
        g.fillStyle(0xd3b181); g.fillRect(ox+5,oy+4,6,8);
        g.fillStyle(0xb08758); g.fillRect(ox+5,oy+10,6,2);
        g.fillStyle(c); g.fillRect(ox+6,oy+6,1,1); g.fillRect(ox+8,oy+7,1,1); g.fillRect(ox+9,oy+5,1,1); g.fillRect(ox+7,oy+9,1,1);
      } else if (i <= 15) {
        const type = i - 8;
        const c = produceColors[type];
        if (type === 0) { // turnip
          g.fillStyle(c); g.fillRect(ox+5,oy+7,6,5);
          g.fillStyle(0x79b84f); g.fillRect(ox+6,oy+5,4,2);
        } else if (type === 1) { // potato
          g.fillStyle(c); g.fillRect(ox+4,oy+7,8,5); g.fillRect(ox+6,oy+6,4,1);
          g.fillStyle(0x6a5234); g.fillRect(ox+6,oy+9,1,1); g.fillRect(ox+10,oy+8,1,1);
        } else if (type === 2) { // corn
          g.fillStyle(c); g.fillRect(ox+6,oy+4,4,9);
          g.fillStyle(0x69ad43); g.fillRect(ox+5,oy+7,1,4); g.fillRect(ox+10,oy+7,1,4);
        } else if (type === 3) { // carrot
          g.fillStyle(c); g.fillRect(ox+7,oy+6,2,6); g.fillRect(ox+6,oy+8,4,2);
          g.fillStyle(0x63a845); g.fillRect(ox+6,oy+4,4,2);
        } else if (type === 4) { // cabbage
          g.fillStyle(c); g.fillRect(ox+4,oy+6,8,6);
          g.fillStyle(0x90d86b); g.fillRect(ox+5,oy+7,3,2);
        } else if (type === 5) { // eggplant
          g.fillStyle(c); g.fillRect(ox+6,oy+6,5,6);
          g.fillStyle(0x6cab43); g.fillRect(ox+6,oy+5,3,1);
        } else if (type === 6) { // tomato
          g.fillStyle(c); g.fillRect(ox+5,oy+7,6,5);
          g.fillStyle(0x68b645); g.fillRect(ox+6,oy+6,4,1);
        } else { // cucumber
          g.fillStyle(c); g.fillRect(ox+5,oy+6,7,4);
          g.fillStyle(0x7ad0b8); g.fillRect(ox+6,oy+7,4,1);
        }
      } else if (i <= 23) {
        const type = i - 16;
        const c = resourceColors[type];
        if (type % 2 === 0) { // stone/ore chunks
          g.fillStyle(outline); g.fillRect(ox+3,oy+6,10,7);
          g.fillStyle(c); g.fillRect(ox+4,oy+7,8,5);
          g.fillStyle(Phaser.Display.Color.IntegerToColor(c).lighten(20).color); g.fillRect(ox+5,oy+7,3,1);
          g.fillStyle(Phaser.Display.Color.IntegerToColor(c).darken(20).color); g.fillRect(ox+9,oy+11,3,1);
        } else { // logs
          g.fillStyle(0x7f5431); g.fillRect(ox+3,oy+6,10,5);
          g.fillStyle(c); g.fillRect(ox+4,oy+7,8,3);
          g.fillStyle(0x5f3d25); g.fillRect(ox+4,oy+11,8,1);
          g.fillStyle(0xc29165); g.fillRect(ox+5,oy+7,2,1);
        }
      } else if (i <= 31) {
        const type = i - 24;
        const c = fishColors[type];
        g.fillStyle(c); g.fillRect(ox+4,oy+7,7,4);
        g.fillStyle(c); g.fillRect(ox+11,oy+8,2,2);
        g.fillStyle(Phaser.Display.Color.IntegerToColor(c).darken(25).color); g.fillRect(ox+3,oy+8,1,2);
        g.fillStyle(Phaser.Display.Color.IntegerToColor(c).lighten(20).color); g.fillRect(ox+5,oy+7,3,1);
        g.fillStyle(0xffffff); g.fillRect(ox+9,oy+8,1,1);
      } else if (i <= 39) {
        const c = gemColors[i - 32];
        g.fillStyle(outline); g.fillRect(ox+4,oy+4,8,9);
        g.fillStyle(c); g.fillRect(ox+5,oy+5,6,7);
        g.fillStyle(Phaser.Display.Color.IntegerToColor(c).lighten(25).color); g.fillRect(ox+6,oy+6,2,2);
        g.fillStyle(Phaser.Display.Color.IntegerToColor(c).darken(20).color); g.fillRect(ox+9,oy+10,2,1);
        g.fillStyle(0xffffff); g.fillRect(ox+10,oy+5,1,1);
      } else if (i <= 47) {
        const c = foodColors[i - 40];
        if (i % 2 === 0) { // plates
          g.fillStyle(0xdacfb7); g.fillRect(ox+3,oy+9,10,3);
          g.fillStyle(c); g.fillRect(ox+4,oy+6,8,3);
          g.fillStyle(0xf3f0e4); g.fillRect(ox+4,oy+9,8,1);
        } else { // bowls with steam
          g.fillStyle(0xb38f6b); g.fillRect(ox+4,oy+8,8,4);
          g.fillStyle(c); g.fillRect(ox+5,oy+7,6,2);
          g.fillStyle(0xe5e0d2); g.fillRect(ox+6,oy+4,1,2); g.fillRect(ox+9,oy+3,1,2);
        }
      } else if (i <= 55) {
        const type = i - 48;
        g.fillStyle(0x7f5431); g.fillRect(ox+7,oy+5,2,8);
        if (type === 0) { g.fillStyle(0xa9a9ae); g.fillRect(ox+4,oy+4,8,2); } // hoe
        else if (type === 1) { g.fillStyle(0x568fc1); g.fillRect(ox+4,oy+6,8,5); g.fillRect(ox+12,oy+7,2,2); } // can
        else if (type === 2) { g.fillStyle(0xb9bdc7); g.fillRect(ox+3,oy+3,6,4); } // axe
        else if (type === 3) { g.fillStyle(0xb9bdc7); g.fillRect(ox+3,oy+3,10,2); } // pick
        else if (type === 4) { g.fillStyle(0xd0d0d0); g.fillRect(ox+8,oy+3,5,1); g.fillRect(ox+12,oy+3,1,5); g.fillStyle(0xe34f4f); g.fillRect(ox+12,oy+8,1,1); } // rod
        else if (type === 5) { g.fillStyle(0xced4dd); g.fillRect(ox+2,oy+3,8,2); g.fillRect(ox+2,oy+5,2,2); } // sword/scythe style
        else if (type === 6) { g.fillStyle(0x8e8e95); g.fillRect(ox+4,oy+4,8,5); g.fillStyle(0x474b52); g.fillRect(ox+6,oy+6,4,2); } // machine part
        else { g.fillStyle(0xa67343); g.fillRect(ox+5,oy+5,6,6); g.fillStyle(0x6e4929); g.fillRect(ox+6,oy+6,4,4); } // crate
      } else if (i <= 63) {
        const c = Phaser.Display.Color.HSLToColor(((i - 56) * 0.11 + 0.08) % 1, 0.45, 0.45).color;
        g.fillStyle(0x6d727c); g.fillRect(ox+3,oy+3,10,10);
        g.fillStyle(0x4f535b); g.fillRect(ox+4,oy+4,8,8);
        g.fillStyle(c); g.fillRect(ox+6,oy+6,4,4);
        g.fillStyle(0xb3b9c4); g.fillRect(ox+5,oy+5,1,1); g.fillRect(ox+10,oy+10,1,1);
      } else if (i >= 70 && i <= 76) {
        const type = i - 70;
        if (type <= 2) { // eggs
          g.fillStyle(0xf2e4c6); g.fillRect(ox+6,oy+5,4,6);
          g.fillStyle(0xdfcfad); g.fillRect(ox+7,oy+10,3,1);
        } else if (type <= 4) { // milk
          g.fillStyle(0xe9f4ff); g.fillRect(ox+5,oy+4,6,8);
          g.fillStyle(0x7f9dbf); g.fillRect(ox+6,oy+3,4,1);
          g.fillStyle(0xc3d8ed); g.fillRect(ox+6,oy+9,4,2);
        } else { // cheese/wool
          g.fillStyle(type === 5 ? 0xf4c659 : 0xfff5de); g.fillRect(ox+4,oy+6,8,5);
          g.fillStyle(type === 5 ? 0xe0af3f : 0xdfd4b8); g.fillRect(ox+5,oy+10,6,1);
        }
      } else if (i >= 90 && i <= 104) {
        const type = i - 90;
        if (type < 4) { // mushrooms
          const cap = [0x9a5a41, 0xbd8f59, 0xc24f57, 0x6d7a53][type];
          g.fillStyle(cap); g.fillRect(ox+4,oy+5,8,3);
          g.fillStyle(0xe1d3b6); g.fillRect(ox+7,oy+8,2,4);
          g.fillStyle(Phaser.Display.Color.IntegerToColor(cap).lighten(20).color); g.fillRect(ox+5,oy+5,2,1);
        } else if (type < 8) { // berries
          const berry = [0xbe365a, 0x5d79d2, 0x8c4cc4, 0xcf4a4a][type - 4];
          g.fillStyle(berry); g.fillRect(ox+5,oy+7,2,2); g.fillRect(ox+8,oy+7,2,2); g.fillRect(ox+6,oy+9,2,2);
          g.fillStyle(0x69aa42); g.fillRect(ox+6,oy+5,3,1);
        } else if (type < 11) { // roots
          g.fillStyle(0xa47a51); g.fillRect(ox+6,oy+6,4,6);
          g.fillStyle(0xd7b182); g.fillRect(ox+7,oy+6,2,2);
          g.fillStyle(0x5f8f3f); g.fillRect(ox+6,oy+5,4,1);
        } else { // flowers
          const petal = [0xf0d256, 0xf07cb4, 0x79c4f0, 0xc38ce7][type - 11];
          g.fillStyle(0x65a844); g.fillRect(ox+7,oy+7,2,5);
          g.fillStyle(petal); g.fillRect(ox+6,oy+4,4,4);
          g.fillStyle(0xf8e9bc); g.fillRect(ox+7,oy+5,2,2);
        }
      } else if (i >= 105 && i <= 108) {
        const type = i - 105;
        if (type === 0) { // bouquet
          g.fillStyle(0x7cb64a); g.fillRect(ox+7,oy+7,2,6);
          g.fillStyle(0xe65c7b); g.fillRect(ox+5,oy+4,3,3);
          g.fillStyle(0x7aa6f3); g.fillRect(ox+8,oy+4,3,3);
          g.fillStyle(0xf2d35c); g.fillRect(ox+6,oy+2,3,3);
          g.fillStyle(0xd7c2a4); g.fillRect(ox+6,oy+11,4,2);
        } else if (type === 1) { // pendant
          g.fillStyle(0xd8c291); g.fillRect(ox+7,oy+4,2,2);
          g.fillStyle(0x7ec7ff); g.fillRect(ox+6,oy+6,4,5);
          g.fillStyle(0xffffff); g.fillRect(ox+8,oy+7,1,1);
        } else if (type === 2) { // charm
          g.fillStyle(0xe6b94b); g.fillRect(ox+6,oy+5,4,6);
          g.fillStyle(0xf8df89); g.fillRect(ox+7,oy+6,2,2);
        } else { // relic
          g.fillStyle(0x9d7adf); g.fillRect(ox+5,oy+5,6,6);
          g.fillStyle(0xffffff); g.fillRect(ox+7,oy+4,2,1); g.fillRect(ox+8,oy+7,1,1);
        }
      } else {
        const c = Phaser.Display.Color.HSLToColor(((i * 37) % 360) / 360, 0.45, 0.55).color;
        const hi = Phaser.Display.Color.IntegerToColor(c).lighten(20).color;
        const lo = Phaser.Display.Color.IntegerToColor(c).darken(25).color;
        g.fillStyle(outline); g.fillRect(ox+4,oy+4,8,8);
        g.fillStyle(c); g.fillRect(ox+5,oy+5,6,6);
        g.fillStyle(hi); g.fillRect(ox+5,oy+5,2,2);
        g.fillStyle(lo); g.fillRect(ox+9,oy+9,2,2);
      }
    }
    g.generateTexture('items', T*ITEM_COLS, T*ITEM_ROWS); g.destroy();
    const iTex = this.textures.get('items');
    for (let i = 0; i < ITEM_FRAMES; i++) {
      const col = i % ITEM_COLS;
      const row = Math.floor(i / ITEM_COLS);
      iTex.add(i, 0, col * T, row * T, T, T);
    }
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
    const oTex = this.textures.get('objects');
    for (let i = 0; i < 8; i++) oTex.add(i, 0, i * T, 0, T, T);
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
    const nTex = this.textures.get('npcs');
    for (let i = 0; i < 10; i++) nTex.add(i, 0, i * T, 0, T, T);
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
    const prTex = this.textures.get('portraits');
    for (let i = 0; i < 10; i++) prTex.add(i, 0, i * 48, 0, 48, 48);
  }

  private genUIIcons(T: number) {
    const g = this.make.graphics();
    for (let i=0; i<16; i++) { const ox=i*T; g.fillStyle(0x333344); g.fillRect(ox,0,T,T); g.fillStyle(0x888899); g.fillRect(ox+2,2,T-4,T-4); }
    g.generateTexture('ui_icons', T*16, T); g.destroy();
    const uTex = this.textures.get('ui_icons');
    for (let i = 0; i < 16; i++) uTex.add(i, 0, i * T, 0, T, T);
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
    const tlTex = this.textures.get('tools');
    for (let i = 0; i < 6; i++) tlTex.add(i, 0, i * T, 0, T, T);
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
    const aTex = this.textures.get('animals');
    for (let i = 0; i < 5; i++) aTex.add(i, 0, i * T, 0, T, T);
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
    const mTex = this.textures.get('monsters');
    for (let i = 0; i < 3; i++) mTex.add(i, 0, i * T, 0, T, T);
  }

  private genHouseComposite(T: number) {
    const g = this.make.graphics();
    const W = T * 5;
    const H = T * 4;

    g.fillStyle(0x8B6914); g.fillRect(0, H - 4, W, 4);
    g.fillStyle(0xD2B48C); g.fillRect(4, 20, W - 8, H - 24);
    g.fillStyle(0xC4A882);
    for (let y = 24; y < H - 4; y += 6) g.fillRect(6, y, W - 12, 1);

    g.fillStyle(0xCC4444);
    g.fillTriangle(W / 2, 0, -4, 22, W + 4, 22);
    g.fillStyle(0xAA3333);
    g.fillTriangle(W / 2, 0, -4, 22, W / 2, 22);
    g.fillStyle(0x8B2222); g.fillRect(-4, 20, W + 8, 3);

    g.fillStyle(0x5C3A21); g.fillRect(W / 2 - 6, H - 22, 12, 18);
    g.fillStyle(0x4A2E18); g.fillRect(W / 2 - 4, H - 20, 8, 16);
    g.fillStyle(0xFFD700); g.fillRect(W / 2 + 2, H - 12, 2, 2);

    g.fillStyle(0x87CEEB);
    g.fillRect(10, 28, 12, 10);
    g.fillRect(W - 22, 28, 12, 10);
    g.fillStyle(0x5C3A21);
    g.fillRect(10, 32, 12, 1);
    g.fillRect(15, 28, 1, 10);
    g.fillRect(W - 22, 32, 12, 1);
    g.fillRect(W - 17, 28, 1, 10);

    g.fillStyle(0x888888); g.fillRect(W - 18, 2, 8, 20);
    g.fillStyle(0x666666); g.fillRect(W - 18, 2, 8, 2);

    g.generateTexture('house', W, H);
    g.destroy();
  }

  private genTreeComposite(T: number) {
    const g = this.make.graphics();
    const W = T * 2;
    const H = T * 3;

    g.fillStyle(0x6B4226); g.fillRect(12, 24, 8, 24);
    g.fillStyle(0x8B5A2B); g.fillRect(14, 26, 4, 20);

    g.fillStyle(0x2D6B2D);
    g.fillRect(2, 18, 28, 10);
    g.fillStyle(0x3A8B3A);
    g.fillRect(4, 10, 24, 12);
    g.fillStyle(0x4AAE4A);
    g.fillRect(6, 4, 20, 12);
    g.fillStyle(0x5DC85D);
    g.fillRect(10, 0, 12, 8);

    g.fillStyle(0x6BDB6B);
    g.fillRect(12, 2, 4, 3);
    g.fillRect(8, 8, 3, 3);
    g.fillRect(18, 6, 3, 2);

    g.generateTexture('tree', W, H);
    g.destroy();
  }

  private genFenceComposite(T: number) {
    const g = this.make.graphics();

    g.fillStyle(0x8B6914); g.fillRect(6, 2, 4, 14);
    g.fillStyle(0xA0822C); g.fillRect(0, 4, T, 3);
    g.fillStyle(0xA0822C); g.fillRect(0, 10, T, 3);
    g.fillStyle(0xBB9944); g.fillRect(6, 1, 4, 2);

    g.generateTexture('fence', T, T);
    g.destroy();
  }
}
