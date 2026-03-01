/**
 * InteriorScene — renders building interiors (house, coop, barn)
 * Dynamic scaling to fill viewport. Pure pixel-art furniture (no emoji).
 */
import Phaser from 'phaser';
import { Events, InteractionKind, Quality, Season, Tool } from '../types';
import { PlayScene } from './PlayScene';
import { ITEMS } from '../data/registry';
import { ANIMAL_DEFS } from '../data/animalData';

export type BuildingType = 'house' | 'coop' | 'barn';

interface InteriorInitData { playScene: PlayScene; building: BuildingType; }

const enum ITile { FLOOR=0, WALL=1, DOOR=2, FURN=3, RUG=4, HAY=5, WOOD=6 }

interface BLayout {
  w: number; h: number; name: string;
  floor: number; wall: number;
  grid: ITile[][];
  objs: Array<{x:number;y:number;label:string;kind:InteractionKind;data?:any}>;
  animalBuilding?: 'coop'|'barn';
}

// ── Layouts ──
const HOUSE: BLayout = {
  w:14, h:11, name:'Home', floor:0xc4956a, wall:0x8b6914,
  grid:[
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,3,3,0,0,0,0,0,0,3,3,0,1],
    [1,0,0,0,0,4,4,4,4,0,0,0,0,1],
    [1,0,0,0,0,4,4,4,4,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,3,0,0,0,0,0,0,0,0,0,0,3,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,3,0,0,0,3,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,2,2,2,1,1,1,1,1,1],
  ],
  objs:[
    {x:2,y:1,label:'Bed',kind:InteractionKind.BED},
    {x:3,y:1,label:'Nightstand',kind:InteractionKind.CHEST,data:{msg:'An old alarm clock ticks quietly.'}},
    {x:10,y:1,label:'Kitchen',kind:InteractionKind.KITCHEN},
    {x:11,y:1,label:'Cupboard',kind:InteractionKind.CHEST,data:{msg:'Plates and cups, neatly stacked.'}},
    {x:1,y:5,label:'Bookshelf',kind:InteractionKind.CHEST,data:{msg:"Your grandfather's old journals..."}},
    {x:12,y:5,label:'Fireplace',kind:InteractionKind.CHEST,data:{msg:'The fire crackles warmly.'}},
    {x:4,y:7,label:'Table',kind:InteractionKind.CHEST,data:{msg:'A sturdy wooden table.'}},
    {x:8,y:7,label:'Plant',kind:InteractionKind.CHEST,data:{msg:'A cheerful potted fern.'}},
  ],
};

const COOP: BLayout = {
  w:10, h:9, name:'Chicken Coop', floor:0xc4a84a, wall:0x8b4513,
  animalBuilding:'coop',
  grid:[
    [1,1,1,1,1,1,1,1,1,1],
    [1,3,5,5,5,5,5,5,3,1],
    [1,5,5,5,5,5,5,5,5,1],
    [1,5,5,5,5,5,5,5,5,1],
    [1,5,5,5,5,5,5,5,5,1],
    [1,5,5,5,5,5,5,5,5,1],
    [1,5,5,5,5,5,5,5,3,1],
    [1,5,5,5,5,5,5,5,5,1],
    [1,1,1,1,2,2,1,1,1,1],
  ],
  objs:[
    {x:1,y:1,label:'NestBox',kind:InteractionKind.CHEST,data:{msg:'Collect eggs here when chickens are happy.'}},
    {x:8,y:1,label:'Feeder',kind:InteractionKind.CHEST,data:{msg:'Keep chickens fed daily!'}},
    {x:8,y:6,label:'BuyChick',kind:InteractionKind.CHEST,data:{buyAnimal:'chicken'}},
  ],
};

const BARN: BLayout = {
  w:12, h:11, name:'Barn', floor:0x9e8b6e, wall:0x6b3a2a,
  animalBuilding:'barn',
  grid:[
    [1,1,1,1,1,1,1,1,1,1,1,1],
    [1,3,6,6,6,6,6,6,6,6,3,1],
    [1,6,6,6,6,6,6,6,6,6,6,1],
    [1,6,6,6,6,6,6,6,6,6,6,1],
    [1,6,6,6,6,6,6,6,6,6,6,1],
    [1,3,6,6,6,6,6,6,6,6,6,1],
    [1,6,6,6,6,6,6,6,6,6,3,1],
    [1,6,6,6,6,6,6,6,6,6,6,1],
    [1,6,6,6,6,6,6,6,6,6,6,1],
    [1,6,6,6,6,6,6,6,6,6,6,1],
    [1,1,1,1,1,2,2,1,1,1,1,1],
  ],
  objs:[
    {x:1,y:1,label:'HayBale',kind:InteractionKind.CHEST,data:{msg:'Fresh hay for the animals.'}},
    {x:10,y:1,label:'Feeder',kind:InteractionKind.CHEST,data:{msg:'Cows eat fiber. Keep them fed!'}},
    {x:1,y:5,label:'MilkStn',kind:InteractionKind.CHEST,data:{msg:"Milk cows here when they're happy."}},
    {x:10,y:6,label:'BuyCow',kind:InteractionKind.CHEST,data:{buyAnimal:'cow'}},
  ],
};

const LAYOUTS: Record<BuildingType,BLayout> = {house:HOUSE,coop:COOP,barn:BARN};

export class InteriorScene extends Phaser.Scene {
  private ps!: PlayScene;
  private bt!: BuildingType;
  private L!: BLayout;
  private T = 48;
  private ox = 0; private oy = 0;
  private player!: Phaser.GameObjects.Container;
  private solid = new Set<string>();
  private exits = new Set<string>();
  private ints: Array<{x:number;y:number;label:string;kind:InteractionKind;data?:any}> = [];
  private keys!: {u:Phaser.Input.Keyboard.Key;d:Phaser.Input.Keyboard.Key;l:Phaser.Input.Keyboard.Key;r:Phaser.Input.Keyboard.Key;e:Phaser.Input.Keyboard.Key;esc:Phaser.Input.Keyboard.Key};
  private prompt!: Phaser.GameObjects.Text;
  private canExit = false;

  constructor() { super('InteriorScene'); }

  init(data: InteriorInitData) {
    this.ps = data.playScene;
    this.bt = data.building;
    this.L = LAYOUTS[data.building];
    this.ints = [];
    this.canExit = false;
  }

  create() {
    const {w,h,grid,floor,wall,name} = this.L;
    const cw = this.cameras.main.width;
    const ch = this.cameras.main.height;

    // Dynamic tile size — fill 90% of viewport
    this.T = Math.floor(Math.min((cw*0.92)/w, (ch*0.88)/h));
    const T = this.T;
    this.ox = Math.floor((cw - w*T)/2);
    this.oy = Math.floor((ch - h*T)/2) + Math.floor(T*0.3);

    this.cameras.main.setBackgroundColor('#0e0e1e');
    this.solid.clear(); this.exits.clear();

    const g = this.add.graphics().setDepth(0);
    const dg = this.add.graphics().setDepth(1);

    // ── Tiles ──
    for(let y=0;y<h;y++) for(let x=0;x<w;x++){
      const t = grid[y][x];
      const px = this.ox+x*T, py = this.oy+y*T;

      if(t===ITile.WALL){
        this.solid.add(`${x},${y}`);
        this.drawWall(g,px,py,T,wall);
        continue;
      }
      if(t===ITile.DOOR){
        this.exits.add(`${x},${y}`);
        this.drawDoor(g,dg,px,py,T);
        continue;
      }

      // Floor
      let base = floor;
      if(t===ITile.RUG) base=0x884433;
      else if(t===ITile.HAY) base=0xc4a84a;
      else if(t===ITile.WOOD) base=0x9e7b5e;
      this.drawFloor(g,dg,px,py,T,base,t,x,y);
    }

    // ── Wall shadows on floor ──
    for(let y=0;y<h;y++) for(let x=0;x<w;x++){
      const t=grid[y][x]; if(t===ITile.WALL||t===ITile.DOOR) continue;
      const px=this.ox+x*T, py=this.oy+y*T;
      if(y>0&&grid[y-1][x]===ITile.WALL){g.fillStyle(0x000000,0.2);g.fillRect(px,py,T,Math.ceil(T*0.15));}
      if(x>0&&grid[y][x-1]===ITile.WALL){g.fillStyle(0x000000,0.1);g.fillRect(px,py,3,T);}
    }

    // Window light (house only)
    if(this.bt==='house'){
      const lg=this.add.graphics().setDepth(1).setAlpha(0.06);
      lg.fillStyle(0xffffcc,1);
      lg.fillRect(this.ox+3*T,this.oy+T,T*2.5,T*3);
      lg.fillRect(this.ox+8.5*T,this.oy+T,T*2.5,T*3);
    }

    // ── Furniture (pixel art) ──
    const fg = this.add.graphics().setDepth(3);
    for(const o of this.L.objs){
      const px=this.ox+o.x*T, py=this.oy+o.y*T;
      this.drawFurniture(fg,px,py,T,o.label);
      this.solid.add(`${o.x},${o.y}`);
      this.ints.push({x:o.x,y:o.y,label:o.label,kind:o.kind,data:o.data});
    }

    // ── Animals ──
    if(this.L.animalBuilding) this.placeAnimals();

    // ── Player (container: body + head, like overworld) ──
    const doorKey = [...this.exits][0];
    const [dx,dy] = doorKey.split(',').map(Number);
    const pCont = this.add.container(this.ox+dx*T+T/2, this.oy+(dy-1)*T+T/2).setDepth(10);
    const bodySize = Math.floor(T*0.5);
    const headSize = Math.floor(T*0.3);
    // Body
    const body = this.add.graphics();
    body.fillStyle(0x3366aa,1); body.fillRect(-bodySize/2, -bodySize/2+2, bodySize, bodySize);
    // Head
    const head = this.add.graphics();
    head.fillStyle(0xffcc88,1); head.fillRect(-headSize/2, -bodySize/2-headSize+4, headSize, headSize);
    // Eyes
    head.fillStyle(0x000000,1);
    head.fillRect(-headSize/2+Math.floor(headSize*0.25), -bodySize/2-headSize+4+Math.floor(headSize*0.35), 2, 2);
    head.fillRect(-headSize/2+Math.floor(headSize*0.65), -bodySize/2-headSize+4+Math.floor(headSize*0.35), 2, 2);
    pCont.add([body,head]);
    this.player = pCont;

    // Title
    this.add.text(cw/2, this.oy-Math.floor(T*0.25), name, {
      fontSize:`${Math.max(14,Math.floor(T*0.35))}px`, color:'#ffdd88',
      fontFamily:'monospace', stroke:'#000000', strokeThickness:3,
    }).setOrigin(0.5,1).setDepth(20);

    // Prompt
    this.prompt = this.add.text(cw/2, ch-14, '', {
      fontSize:'12px', color:'#ffdd88', fontFamily:'monospace',
      backgroundColor:'#000000aa', padding:{x:8,y:4},
    }).setOrigin(0.5).setDepth(20).setVisible(false);

    // Exit arrows on door tiles
    for(const ek of this.exits){
      const [ex,ey]=ek.split(',').map(Number);
      dg.fillStyle(0xffdd88,0.6);
      const ax=this.ox+ex*T+T/2, ay=this.oy+ey*T+T*0.7;
      dg.fillTriangle(ax-6,ay-5,ax+6,ay-5,ax,ay+3);
    }

    // Keys
    this.keys = {
      u:this.input.keyboard!.addKey('W'), d:this.input.keyboard!.addKey('S'),
      l:this.input.keyboard!.addKey('A'), r:this.input.keyboard!.addKey('D'),
      e:this.input.keyboard!.addKey('E'), esc:this.input.keyboard!.addKey('ESC'),
    };

    this.cameras.main.fadeIn(250,0,0,0);
    this.time.delayedCall(400,()=>{this.canExit=true;});
  }

  // ═══════ TILE RENDERERS ═══════

  private drawWall(g:Phaser.GameObjects.Graphics,px:number,py:number,T:number,tint:number){
    g.fillStyle(tint,1); g.fillRect(px,py,T,T);
    // Brick mortar
    const rh=Math.floor(T/3);
    g.fillStyle(0x000000,0.1);
    for(let r=0;r<3;r++){
      g.fillRect(px,py+r*rh,T,1);
      const off=r%2===0?Math.floor(T*0.5):0;
      g.fillRect(px+off,py+r*rh,1,rh);
      if(off>0) g.fillRect(px,py+r*rh,1,rh);
    }
    // Top highlight
    g.fillStyle(0xffffff,0.06); g.fillRect(px,py,T,2);
    g.fillStyle(0x000000,0.08); g.fillRect(px,py+T-2,T,2);
  }

  private drawDoor(g:Phaser.GameObjects.Graphics,dg:Phaser.GameObjects.Graphics,px:number,py:number,T:number){
    g.fillStyle(0x3a2a18,1); g.fillRect(px,py,T,T);
    // Mat
    g.fillStyle(0x665544,1); g.fillRect(px+3,py+3,T-6,T-6);
    g.fillStyle(0x554433,0.3);
    for(let ly=5;ly<T-5;ly+=3) g.fillRect(px+5,py+ly,T-10,1);
  }

  private drawFloor(g:Phaser.GameObjects.Graphics,dg:Phaser.GameObjects.Graphics,px:number,py:number,T:number,base:number,t:ITile,gx:number,gy:number){
    // Checkerboard variation
    const dark = (gx+gy)%2===0;
    g.fillStyle(base,1); g.fillRect(px,py,T,T);
    if(dark){g.fillStyle(0x000000,0.03);g.fillRect(px,py,T,T);}

    if(t===ITile.FLOOR||t===ITile.WOOD||t===ITile.FURN){
      // Wood plank lines
      g.fillStyle(0x000000,0.06);
      g.fillRect(px,py+Math.floor(T*0.5),T,1);
      const grain=((gx*7+gy*13)%5)*Math.floor(T/6)+Math.floor(T*0.15);
      g.fillStyle(0x000000,0.035);
      g.fillRect(px+grain,py,1,T);
    }
    if(t===ITile.RUG){
      dg.lineStyle(2,0xcc8855,0.5);
      dg.strokeRect(px+3,py+3,T-6,T-6);
      // Diamond center
      const cx=px+T/2,cy=py+T/2,s=Math.floor(T*0.2);
      dg.fillStyle(0xddaa66,0.25);
      dg.fillTriangle(cx,cy-s,cx+s,cy,cx,cy+s);
      dg.fillTriangle(cx,cy-s,cx-s,cy,cx,cy+s);
    }
    if(t===ITile.HAY){
      const seed=gx*31+gy*17;
      dg.fillStyle(0xddbb55,0.2);
      for(let s=0;s<5;s++){
        const sx=((seed+s*7)%(T-8))+4;
        const sy=((seed+s*11)%(T-8))+4;
        dg.fillRect(px+sx,py+sy,4+(seed+s)%5,1);
      }
    }
  }

  // ═══════ PIXEL ART FURNITURE ═══════

  private drawFurniture(g:Phaser.GameObjects.Graphics,px:number,py:number,T:number,label:string){
    const m=Math.floor(T*0.06); // margin

    switch(label){
      case 'Bed': {
        // Frame
        g.fillStyle(0x5a3318,1); g.fillRect(px+m,py+m,T-m*2,T-m*2);
        // Headboard (darker, top)
        g.fillStyle(0x4a2810,1); g.fillRect(px+m,py+m,T-m*2,Math.floor(T*0.15));
        // Mattress
        g.fillStyle(0x3355aa,1); g.fillRect(px+m+3,py+m+Math.floor(T*0.15),T-m*2-6,T-m*2-Math.floor(T*0.15)-3);
        // Pillow
        g.fillStyle(0xddeeff,1);
        g.fillRect(px+m+5,py+m+Math.floor(T*0.18),Math.floor(T*0.35),Math.floor(T*0.18));
        // Blanket fold line
        g.fillStyle(0x2244aa,0.6);
        g.fillRect(px+m+3,py+Math.floor(T*0.55),T-m*2-6,2);
        // Blanket pattern
        g.fillStyle(0x4466cc,0.3);
        g.fillRect(px+m+5,py+Math.floor(T*0.58),Math.floor(T*0.2),Math.floor(T*0.15));
        g.fillRect(px+Math.floor(T*0.5),py+Math.floor(T*0.58),Math.floor(T*0.2),Math.floor(T*0.15));
        break;
      }
      case 'Nightstand': {
        // Small bedside table
        g.fillStyle(0x6b4a2a,1); g.fillRect(px+Math.floor(T*0.2),py+Math.floor(T*0.15),Math.floor(T*0.6),Math.floor(T*0.7));
        // Drawer
        g.fillStyle(0x5a3a1a,1); g.fillRect(px+Math.floor(T*0.25),py+Math.floor(T*0.5),Math.floor(T*0.5),Math.floor(T*0.25));
        // Knob
        g.fillStyle(0xccaa66,1); g.fillCircle(px+T/2,py+Math.floor(T*0.62),2);
        // Candle on top
        g.fillStyle(0xeedd99,1); g.fillRect(px+Math.floor(T*0.42),py+Math.floor(T*0.05),Math.floor(T*0.08),Math.floor(T*0.15));
        // Flame
        g.fillStyle(0xff8800,0.8); g.fillCircle(px+Math.floor(T*0.46),py+Math.floor(T*0.04),3);
        g.fillStyle(0xffcc00,0.6); g.fillCircle(px+Math.floor(T*0.46),py+Math.floor(T*0.04),2);
        break;
      }
      case 'Kitchen': {
        // Counter
        g.fillStyle(0x777777,1); g.fillRect(px+m,py+m,T-m*2,T-m*2);
        // Stovetop (dark)
        g.fillStyle(0x333333,1); g.fillRect(px+m+3,py+m+3,T-m*2-6,T-m*2-6);
        // 4 burners
        const bs=Math.floor(T*0.16);
        const cx1=px+Math.floor(T*0.32),cx2=px+Math.floor(T*0.68);
        const cy1=py+Math.floor(T*0.32),cy2=py+Math.floor(T*0.68);
        g.fillStyle(0x555555,1);
        g.fillCircle(cx1,cy1,bs/2); g.fillCircle(cx2,cy1,bs/2);
        g.fillCircle(cx1,cy2,bs/2); g.fillCircle(cx2,cy2,bs/2);
        // Active burner glow
        g.fillStyle(0xff5500,0.35); g.fillCircle(cx1,cy1,bs/2);
        g.fillStyle(0xff8800,0.2); g.fillCircle(cx1,cy1,bs/2+2);
        break;
      }
      case 'Cupboard': {
        // Tall cabinet
        g.fillStyle(0x6b4a2a,1); g.fillRect(px+Math.floor(T*0.1),py+m,Math.floor(T*0.8),T-m*2);
        // Two doors
        const dw=Math.floor(T*0.35),dh=T-m*2-6;
        g.fillStyle(0x5a3a1a,1);
        g.fillRect(px+Math.floor(T*0.13),py+m+3,dw,dh);
        g.fillRect(px+Math.floor(T*0.52),py+m+3,dw,dh);
        // Knobs
        g.fillStyle(0xccaa66,1);
        g.fillCircle(px+Math.floor(T*0.46),py+T/2,2);
        g.fillCircle(px+Math.floor(T*0.54),py+T/2,2);
        // Shelf line
        g.fillStyle(0x4a2a10,1);
        g.fillRect(px+Math.floor(T*0.13),py+Math.floor(T*0.4),Math.floor(T*0.74),1);
        break;
      }
      case 'Bookshelf': {
        g.fillStyle(0x5a3a1a,1); g.fillRect(px+m,py+m,T-m*2,T-m*2);
        const sh=Math.floor((T-m*2)/3);
        g.fillStyle(0x4a2a10,1);
        for(let i=1;i<3;i++) g.fillRect(px+m,py+m+i*sh,T-m*2,2);
        // Books — varied heights and colors
        const colors=[0xcc3333,0x3366cc,0x33aa55,0xddaa33,0x9944aa,0xcc6633,0x228888,0xaa3366];
        const bw=Math.max(3,Math.floor(T*0.08));
        for(let r=0;r<3;r++){
          let bx=px+m+3;
          for(let b=0;b<Math.floor((T-m*2-6)/(bw+1));b++){
            const bh=sh-4-((r*3+b)%3)*2; // varied height
            g.fillStyle(colors[(r*5+b)%colors.length],1);
            g.fillRect(bx,py+m+r*sh+sh-bh-1,bw,bh);
            bx+=bw+1;
          }
        }
        break;
      }
      case 'Fireplace': {
        // Stone surround
        g.fillStyle(0x666655,1); g.fillRect(px+m,py+m,T-m*2,T-m*2);
        // Mantle top
        g.fillStyle(0x777766,1); g.fillRect(px+m-2,py+m,T-m*2+4,Math.floor(T*0.12));
        // Hearth (dark)
        const fw=Math.floor(T*0.55),fh=Math.floor(T*0.5);
        const hx=px+(T-fw)/2, hy=py+Math.floor(T*0.28);
        g.fillStyle(0x111111,1); g.fillRect(hx,hy,fw,fh);
        // Fire layers
        const fcx=px+T/2, fby=hy+fh;
        g.fillStyle(0xff3300,0.85);
        g.fillTriangle(fcx-fw*0.35,fby,fcx+fw*0.35,fby,fcx,fby-fh*0.75);
        g.fillStyle(0xff6600,0.7);
        g.fillTriangle(fcx-fw*0.2,fby,fcx+fw*0.15,fby,fcx-2,fby-fh*0.55);
        g.fillStyle(0xffaa00,0.6);
        g.fillTriangle(fcx-fw*0.12,fby,fcx+fw*0.12,fby,fcx+1,fby-fh*0.35);
        g.fillStyle(0xffdd44,0.4);
        g.fillTriangle(fcx-fw*0.06,fby,fcx+fw*0.06,fby,fcx,fby-fh*0.2);
        // Glow
        g.fillStyle(0xff4400,0.06); g.fillCircle(fcx,fby-fh*0.3,T*0.5);
        break;
      }
      case 'Table': {
        // Top surface
        g.fillStyle(0x8b6b3a,1); g.fillRect(px+m+2,py+m+Math.floor(T*0.15),T-m*2-4,T-m*2-Math.floor(T*0.15)-2);
        // Top edge highlight
        g.fillStyle(0x9a7a4a,1); g.fillRect(px+m+2,py+m+Math.floor(T*0.15),T-m*2-4,3);
        // Wood grain
        g.fillStyle(0x7a5a2a,0.3);
        g.fillRect(px+m+4,py+Math.floor(T*0.4),T-m*2-8,1);
        g.fillRect(px+m+4,py+Math.floor(T*0.6),T-m*2-8,1);
        // Legs (4 dark rects at corners)
        const leg=Math.max(3,Math.floor(T*0.07));
        g.fillStyle(0x5a3a1a,1);
        g.fillRect(px+m+3,py+T-m-leg-1,leg,leg);
        g.fillRect(px+T-m-3-leg,py+T-m-leg-1,leg,leg);
        g.fillRect(px+m+3,py+m+Math.floor(T*0.15),leg,leg);
        g.fillRect(px+T-m-3-leg,py+m+Math.floor(T*0.15),leg,leg);
        break;
      }
      case 'Plant': {
        // Pot
        const pw=Math.floor(T*0.4),ph=Math.floor(T*0.3);
        const ppx=px+(T-pw)/2, ppy=py+T-m-ph;
        g.fillStyle(0xbb5522,1); g.fillRect(ppx,ppy,pw,ph);
        g.fillStyle(0xaa4411,1); g.fillRect(ppx,ppy,pw,3); // rim
        // Soil
        g.fillStyle(0x443322,1); g.fillRect(ppx+2,ppy+3,pw-4,4);
        // Leaves (layered triangles)
        const lcx=px+T/2,lby=ppy;
        g.fillStyle(0x227733,1);
        g.fillTriangle(lcx-T*0.3,lby,lcx+T*0.3,lby,lcx,lby-T*0.4);
        g.fillStyle(0x33aa44,1);
        g.fillTriangle(lcx-T*0.22,lby-T*0.08,lcx+T*0.22,lby-T*0.08,lcx,lby-T*0.45);
        g.fillStyle(0x44cc55,1);
        g.fillTriangle(lcx-T*0.14,lby-T*0.16,lcx+T*0.14,lby-T*0.16,lcx+1,lby-T*0.42);
        break;
      }
      case 'NestBox': {
        // Wooden box
        g.fillStyle(0x998866,1); g.fillRect(px+m,py+Math.floor(T*0.2),T-m*2,Math.floor(T*0.65));
        // Straw inside
        g.fillStyle(0xccbb88,1); g.fillRect(px+m+3,py+Math.floor(T*0.3),T-m*2-6,Math.floor(T*0.45));
        // Eggs
        g.fillStyle(0xffeedd,1);
        g.fillEllipse(px+Math.floor(T*0.3),py+Math.floor(T*0.55),Math.floor(T*0.1),Math.floor(T*0.13));
        g.fillEllipse(px+Math.floor(T*0.5),py+Math.floor(T*0.5),Math.floor(T*0.1),Math.floor(T*0.13));
        g.fillEllipse(px+Math.floor(T*0.7),py+Math.floor(T*0.55),Math.floor(T*0.1),Math.floor(T*0.13));
        break;
      }
      case 'Feeder': {
        // Trough
        g.fillStyle(0x8b7355,1); g.fillRect(px+m,py+Math.floor(T*0.3),T-m*2,Math.floor(T*0.4));
        // Feed inside
        g.fillStyle(0xccbb77,0.5); g.fillRect(px+m+3,py+Math.floor(T*0.38),T-m*2-6,Math.floor(T*0.22));
        // Rim
        g.fillStyle(0x6b5335,1); g.fillRect(px+m,py+Math.floor(T*0.28),T-m*2,3);
        // Legs
        g.fillStyle(0x5a3a1a,1);
        g.fillRect(px+m+2,py+Math.floor(T*0.7),3,Math.floor(T*0.18));
        g.fillRect(px+T-m-5,py+Math.floor(T*0.7),3,Math.floor(T*0.18));
        break;
      }
      case 'HayBale': {
        g.fillStyle(0xccaa44,1); g.fillRect(px+m,py+m+3,T-m*2,T-m*2-3);
        // Horizontal straps
        g.fillStyle(0xbbaa33,0.6);
        for(let i=0;i<3;i++) g.fillRect(px+m,py+m+3+i*Math.floor(T/4),T-m*2,2);
        // Vertical binding
        g.fillStyle(0x886622,1); g.fillRect(px+T/2-2,py+m+3,4,T-m*2-3);
        // Straw texture
        g.fillStyle(0xddcc55,0.3);
        for(let s=0;s<4;s++){
          const sx=(s*11+7)%(T-m*2-10)+m+5;
          g.fillRect(px+sx,py+m+5,1,Math.floor(T*0.3));
        }
        break;
      }
      case 'MilkStn': {
        // Stool
        g.fillStyle(0x6b5335,1);
        g.fillRect(px+Math.floor(T*0.15),py+Math.floor(T*0.35),Math.floor(T*0.35),Math.floor(T*0.12));
        g.fillRect(px+Math.floor(T*0.2),py+Math.floor(T*0.47),3,Math.floor(T*0.35));
        g.fillRect(px+Math.floor(T*0.42),py+Math.floor(T*0.47),3,Math.floor(T*0.35));
        // Bucket
        const bw=Math.floor(T*0.3),bh=Math.floor(T*0.35);
        const bpx=px+Math.floor(T*0.55),bpy=py+T-m-bh;
        g.fillStyle(0x888899,1); g.fillRect(bpx,bpy,bw,bh);
        // Rim
        g.fillStyle(0x99aacc,1); g.fillRect(bpx,bpy,bw,3);
        // Handle
        g.fillStyle(0x777788,1);
        g.fillRect(bpx+bw/2-Math.floor(bw*0.4),bpy-3,Math.floor(bw*0.8),3);
        break;
      }
      default: {
        if(label.includes('Buy')){
          // Sign post
          g.fillStyle(0x5a3a1a,1); g.fillRect(px+T/2-2,py+Math.floor(T*0.45),4,Math.floor(T*0.45));
          // Sign board
          g.fillStyle(0x337733,1); g.fillRect(px+m+3,py+m+2,T-m*2-6,Math.floor(T*0.42));
          g.fillStyle(0x449944,1); g.fillRect(px+m+5,py+m+4,T-m*2-10,Math.floor(T*0.42)-4);
          // Gold coin
          g.fillStyle(0xffcc00,1);
          const cr=Math.max(3,Math.floor(T*0.09));
          g.fillCircle(px+T/2,py+m+Math.floor(T*0.22),cr);
          g.fillStyle(0xddaa00,1); g.fillCircle(px+T/2,py+m+Math.floor(T*0.22),cr-1);
        } else {
          // Crate fallback
          g.fillStyle(0x665544,1); g.fillRect(px+m,py+m,T-m*2,T-m*2);
          g.fillStyle(0x554433,1);
          g.fillRect(px+m,py+T/2-1,T-m*2,2);
          g.fillRect(px+T/2-1,py+m,2,T-m*2);
        }
        break;
      }
    }
  }

  // ═══════ ANIMALS ═══════

  private placeAnimals(){
    if(!this.ps.animalSystem) return;
    const T=this.T;
    const state=this.ps.animalSystem.getState();
    const bt=this.L.animalBuilding!;
    const animals=state.animals.filter(a=>{
      const d=ANIMAL_DEFS.find(d2=>d2.id===a.type);
      return d?.building===bt;
    });
    const slots=this.getSlots();
    const ag=this.add.graphics().setDepth(8);

    for(let i=0;i<Math.min(animals.length,slots.length);i++){
      const a=animals[i], s=slots[i];
      const cx=this.ox+s.x*T+T/2, cy=this.oy+s.y*T+T/2;
      const def=ANIMAL_DEFS.find(d=>d.id===a.type);
      const isChick=def?.type==='chicken';

      if(isChick){
        // Body
        ag.fillStyle(0xffffff,1); ag.fillEllipse(cx,cy+3,Math.floor(T*0.35),Math.floor(T*0.25));
        // Wing
        ag.fillStyle(0xeeeeee,1); ag.fillEllipse(cx+Math.floor(T*0.08),cy+3,Math.floor(T*0.15),Math.floor(T*0.18));
        // Head
        ag.fillStyle(0xffffff,1); ag.fillCircle(cx-Math.floor(T*0.05),cy-Math.floor(T*0.12),Math.floor(T*0.12));
        // Comb
        ag.fillStyle(0xdd2222,1);
        ag.fillRect(cx-Math.floor(T*0.08),cy-Math.floor(T*0.24),Math.floor(T*0.08),Math.floor(T*0.08));
        // Beak
        ag.fillStyle(0xffaa00,1);
        ag.fillTriangle(cx+Math.floor(T*0.06),cy-Math.floor(T*0.12),cx+Math.floor(T*0.16),cy-Math.floor(T*0.09),cx+Math.floor(T*0.06),cy-Math.floor(T*0.06));
        // Eye
        ag.fillStyle(0x111111,1); ag.fillCircle(cx,cy-Math.floor(T*0.13),1.5);
        // Feet
        ag.fillStyle(0xddaa22,1);
        ag.fillRect(cx-Math.floor(T*0.1),cy+Math.floor(T*0.15),2,Math.floor(T*0.08));
        ag.fillRect(cx+Math.floor(T*0.06),cy+Math.floor(T*0.15),2,Math.floor(T*0.08));
      } else {
        // Cow body
        ag.fillStyle(0xddbb88,1); ag.fillEllipse(cx+2,cy+2,Math.floor(T*0.42),Math.floor(T*0.3));
        // Spots
        ag.fillStyle(0x553322,0.5);
        ag.fillCircle(cx+Math.floor(T*0.1),cy-Math.floor(T*0.03),Math.floor(T*0.08));
        ag.fillCircle(cx-Math.floor(T*0.06),cy+Math.floor(T*0.08),Math.floor(T*0.06));
        // Head
        ag.fillStyle(0xddbb88,1); ag.fillCircle(cx-Math.floor(T*0.22),cy-Math.floor(T*0.02),Math.floor(T*0.14));
        // Horns
        ag.fillStyle(0xccbbaa,1);
        ag.fillRect(cx-Math.floor(T*0.28),cy-Math.floor(T*0.18),3,Math.floor(T*0.1));
        ag.fillRect(cx-Math.floor(T*0.17),cy-Math.floor(T*0.18),3,Math.floor(T*0.1));
        // Eye
        ag.fillStyle(0x111111,1); ag.fillCircle(cx-Math.floor(T*0.2),cy-Math.floor(T*0.06),1.5);
        // Nose
        ag.fillStyle(0xbb8866,1); ag.fillEllipse(cx-Math.floor(T*0.28),cy+Math.floor(T*0.02),Math.floor(T*0.08),Math.floor(T*0.05));
        // Legs
        ag.fillStyle(0xccaa77,1);
        ag.fillRect(cx-Math.floor(T*0.12),cy+Math.floor(T*0.18),3,Math.floor(T*0.1));
        ag.fillRect(cx+Math.floor(T*0.1),cy+Math.floor(T*0.18),3,Math.floor(T*0.1));
      }

      // Name label
      this.add.text(cx,cy-Math.floor(T*0.35),a.name,{
        fontSize:`${Math.max(7,Math.floor(T*0.14))}px`,color:'#ffeecc',
        fontFamily:'monospace',stroke:'#000000',strokeThickness:2,
      }).setOrigin(0.5).setDepth(9);

      // Happiness heart
      const hp=a.happiness;
      const hc=hp>200?0xff6688:hp>100?0xffcc66:0x666666;
      ag.fillStyle(hc,0.8);
      ag.fillCircle(cx+Math.floor(T*0.28),cy-Math.floor(T*0.28),3);

      // Product ready sparkle
      if(a.productReady){
        ag.fillStyle(0xffdd44,0.8);
        const sx=cx,sy=cy+Math.floor(T*0.3);
        ag.fillRect(sx-1,sy-4,2,8); ag.fillRect(sx-4,sy-1,8,2);
      }

      this.ints.push({x:s.x,y:s.y,label:a.name,kind:InteractionKind.ANIMAL,data:{animalId:a.id}});
    }

    // Capacity
    const cap=bt==='coop'?Math.max(4,(state.coopLevel+1)*4):Math.max(4,(state.barnLevel+1)*4);
    this.add.text(this.cameras.main.width/2,this.cameras.main.height-4,
      `${animals.length}/${cap} ${bt==='coop'?'chickens':'cows'}`,
      {fontSize:'10px',color:'#aaaaaa',fontFamily:'monospace',stroke:'#000',strokeThickness:1}
    ).setOrigin(0.5,1).setDepth(20);
  }

  private getSlots():{x:number;y:number}[]{
    const sl:{x:number;y:number}[]=[];
    const {w:gw,h:gh,grid}=this.L;
    const op=new Set(this.L.objs.map(o=>`${o.x},${o.y}`));
    for(let y=2;y<gh-2;y++) for(let x=2;x<gw-2;x++){
      if(grid[y][x]!==ITile.WALL&&grid[y][x]!==ITile.DOOR&&!op.has(`${x},${y}`)) sl.push({x,y});
    }
    return sl;
  }

  // ═══════ UPDATE LOOP ═══════

  update(){
    const speed=120,dt=this.game.loop.delta/1000;
    const T=this.T;
    let vx=0,vy=0;
    if(this.keys.l.isDown)vx=-speed; else if(this.keys.r.isDown)vx=speed;
    if(this.keys.u.isDown)vy=-speed; else if(this.keys.d.isDown)vy=speed;

    if(vx||vy){
      const hb=T*0.3;
      const nx=this.player.x+vx*dt, ny=this.player.y+vy*dt;
      const test=(cx:number,cy:number)=>[
        this.tg(cx-hb,cy-hb),this.tg(cx+hb,cy-hb),
        this.tg(cx-hb,cy+hb),this.tg(cx+hb,cy+hb),
      ];
      if(!test(nx,this.player.y).some(([gx,gy])=>this.solid.has(`${gx},${gy}`))) this.player.x=nx;
      if(!test(this.player.x,ny).some(([gx,gy])=>this.solid.has(`${gx},${gy}`))) this.player.y=ny;
    }

    // Exit
    const [pgx,pgy]=this.tg(this.player.x,this.player.y);
    if(this.canExit&&this.exits.has(`${pgx},${pgy}`)){this.doExit();return;}
    if(this.canExit&&Phaser.Input.Keyboard.JustDown(this.keys.esc)){this.doExit();return;}

    // Interaction proximity
    this.prompt.setVisible(false);
    let near:typeof this.ints[0]|null=null, best=Infinity;
    for(const o of this.ints){
      const ox=this.ox+o.x*T+T/2, oy=this.oy+o.y*T+T/2;
      const d=Phaser.Math.Distance.Between(this.player.x,this.player.y,ox,oy);
      if(d<T*1.5&&d<best){best=d;near=o;}
    }
    if(near){
      const txt=near.kind===InteractionKind.ANIMAL
        ?`Press E — ${near.label}`
        :`Press E — ${this.friendlyLabel(near.label)}`;
      this.prompt.setText(txt).setVisible(true);
      if(Phaser.Input.Keyboard.JustDown(this.keys.e)) this.interact(near);
    }
  }

  private friendlyLabel(l:string):string{
    const map:Record<string,string>={
      NestBox:'Nesting Box',MilkStn:'Milking Station',BuyChick:'Buy Chicken (800g)',
      BuyCow:'Buy Cow (1500g)',HayBale:'Hay Bale',
    };
    return map[l]||l;
  }

  // ═══════ INTERACTION ═══════

  private interact(obj:typeof this.ints[0]){
    switch(obj.kind){
      case InteractionKind.BED:{
        this.cameras.main.fadeOut(600,0,0,0);
        this.cameras.main.once('camerafadeoutcomplete',()=>{
          this.ps.endDay();
          this.ps.player.stamina=100;
          const c=this.ps.calendar;
          this.ps.events.emit(Events.TOAST,{message:`Day ${c.day}, ${c.season} — Year ${c.year}`,color:'#ffdd44',duration:3000});
          this.scene.resume('PlayScene'); this.scene.stop();
        });
        break;
      }
      case InteractionKind.KITCHEN:{
        if(this.ps.house.tier>=1) this.ps.events.emit(Events.OPEN_CRAFTING,{cooking:true});
        else this.ps.events.emit(Events.TOAST,{message:'Upgrade your house first!',color:'#ff4444'});
        break;
      }
      case InteractionKind.ANIMAL:{
        const aid=obj.data?.animalId;
        if(!aid||!this.ps.animalSystem) break;
        const a=this.ps.animalSystem.getState().animals.find(x=>x.id===aid);
        if(!a) break;
        this.ps.animalSystem.feedAnimal(aid);
        this.ps.animalSystem.petAnimal(aid);
        const prod=this.ps.animalSystem.collectProduct(aid);
        if(prod){
          this.ps.addToInventory(prod.itemId,1);
          this.ps.events.emit(Events.TOAST,{message:`Collected ${prod.itemId} from ${a.name}!`,color:'#ffaacc'});
        } else {
          const mood=a.happiness>200?'very happy':a.happiness>100?'content':'needs attention';
          this.ps.events.emit(Events.TOAST,{message:`${a.name} is ${mood}. `+(a.fed?'Already fed.':'Needs food!'),color:'#aaddff'});
        }
        break;
      }
      case InteractionKind.CHEST:{
        if(obj.data?.buyAnimal){
          const defId=obj.data.buyAnimal;
          const def=ANIMAL_DEFS.find(d=>d.id===defId);
          if(!def||!this.ps.animalSystem) break;
          const names=defId==='chicken'
            ?['Clucky','Peep','Nugget','Sunny','Daisy','Pepper','Coco','Maple']
            :['Bessie','Daisy','Buttercup','Clover','Mocha','Patches','Belle','Rosie'];
          const existing=this.ps.animalSystem.getState().animals;
          const used=new Set(existing.map(x=>x.name));
          const nm=names.find(n=>!used.has(n))||`${def.name} ${existing.length+1}`;
          const res=this.ps.animalSystem.purchaseAnimal(defId,nm,this.ps.player.gold);
          if(res){
            this.ps.player.gold-=res.cost;
            this.ps.events.emit(Events.TOAST,{message:`Bought ${nm} the ${def.name}! (-${res.cost}g)`,color:'#ffaacc'});
            this.time.delayedCall(800,()=>{this.scene.restart({playScene:this.ps,building:this.bt});});
          } else {
            if(this.ps.player.gold<def.purchasePrice) this.ps.events.emit(Events.TOAST,{message:`Need ${def.purchasePrice}g!`,color:'#ff4444'});
            else this.ps.events.emit(Events.TOAST,{message:`Building is full!`,color:'#ff4444'});
          }
          break;
        }
        this.ps.events.emit(Events.TOAST,{message:obj.data?.msg||'Nothing here.',color:'#ccccaa'});
        break;
      }
    }
  }

  private doExit(){
    this.canExit=false;
    this.cameras.main.fadeOut(200,0,0,0);
    this.cameras.main.once('camerafadeoutcomplete',()=>{this.scene.resume('PlayScene');this.scene.stop();});
  }

  private tg(px:number,py:number):[number,number]{
    return [Math.floor((px-this.ox)/this.T),Math.floor((py-this.oy)/this.T)];
  }
}
