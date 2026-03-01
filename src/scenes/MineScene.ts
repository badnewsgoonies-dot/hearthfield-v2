import Phaser from 'phaser';
import { ITEMS } from '../data/registry';
import { Events, MapId, Quality, Scenes, Tool } from '../types';
import type { PlayScene } from './PlayScene';

type MineTile = 'wall' | 'floor' | 'rock' | 'ladder' | 'exit';
type MonsterType = 'slime' | 'bat';

interface MineMonster {
  id: string;
  type: MonsterType;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  attack: number;
  body: Phaser.GameObjects.Rectangle;
  hpBg: Phaser.GameObjects.Rectangle;
  hpFill: Phaser.GameObjects.Rectangle;
}

interface MoveDir {
  x: number;
  y: number;
}

export class MineScene extends Phaser.Scene {
  private static readonly GRID_W = 15;
  private static readonly GRID_H = 11;
  private static readonly TILE = 44;

  private playScene!: PlayScene;
  private floor = 1;

  private grid: MineTile[][] = [];
  private tileRects: Phaser.GameObjects.Rectangle[][] = [];
  private monsters: MineMonster[] = [];

  private playerX = 1;
  private playerY = 1;
  private ladderX = 1;
  private ladderY = 1;
  private exitX = 1;
  private exitY = 1;

  private worldOffsetX = 0;
  private worldOffsetY = 0;

  private playerRect!: Phaser.GameObjects.Rectangle;
  private worldLayer!: Phaser.GameObjects.Container;
  private entityLayer!: Phaser.GameObjects.Container;

  private floorText!: Phaser.GameObjects.Text;
  private staminaText!: Phaser.GameObjects.Text;
  private foundText!: Phaser.GameObjects.Text;
  private healthBarBg!: Phaser.GameObjects.Rectangle;
  private healthBarFill!: Phaser.GameObjects.Rectangle;
  private hearts: Phaser.GameObjects.Rectangle[] = [];

  private foundItems = new Map<string, number>();

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: {
    w: Phaser.Input.Keyboard.Key;
    a: Phaser.Input.Keyboard.Key;
    s: Phaser.Input.Keyboard.Key;
    d: Phaser.Input.Keyboard.Key;
    esc: Phaser.Input.Keyboard.Key;
  };

  constructor() {
    super('MineScene');
  }

  init(data: { playScene: PlayScene; floor: number }) {
    this.playScene = data.playScene;
    this.floor = Math.max(1, data.floor || this.playScene.mine.currentFloor || 1);
    this.playScene.mine.currentFloor = this.floor;
  }

  create() {
    this.cameras.main.setBackgroundColor(0x121212);

    this.worldOffsetX = Math.floor((this.scale.width - MineScene.GRID_W * MineScene.TILE) / 2);
    this.worldOffsetY = Math.floor((this.scale.height - MineScene.GRID_H * MineScene.TILE) / 2) + 24;

    this.worldLayer = this.add.container(0, 0);
    this.entityLayer = this.add.container(0, 0);

    this.createHud();

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keys = {
      w: this.input.keyboard!.addKey('W'),
      a: this.input.keyboard!.addKey('A'),
      s: this.input.keyboard!.addKey('S'),
      d: this.input.keyboard!.addKey('D'),
      esc: this.input.keyboard!.addKey('ESC'),
    };

    this.playScene.player.currentMap = MapId.MINE;
    this.generateFloor(this.floor);
    this.playScene.events.emit(Events.ENTER_MINE, { floor: this.floor });
    this.updateHud();
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.keys.esc)) {
      this.leaveMine();
      return;
    }

    const dir = this.getMoveIntent();
    if (!dir) return;

    this.tryMovePlayer(dir.x, dir.y);
    this.updateHud();
  }

  private createHud() {
    const style: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#f0f0f0',
    };

    this.floorText = this.add.text(18, 12, '', style).setScrollFactor(0);

    this.healthBarBg = this.add.rectangle(18, 42, 180, 10, 0x2b2b2b).setOrigin(0, 0.5).setScrollFactor(0);
    this.healthBarFill = this.add.rectangle(18, 42, 180, 10, 0xff6666).setOrigin(0, 0.5).setScrollFactor(0);

    this.staminaText = this.add.text(18, 56, '', style).setScrollFactor(0);
    this.foundText = this.add.text(18, 80, '', {
      ...style,
      fontSize: '14px',
      color: '#d6d6d6',
      wordWrap: { width: 300 },
    }).setScrollFactor(0);
  }

  private generateFloor(floor: number) {
    this.worldLayer.removeAll(true);
    this.entityLayer.removeAll(true);
    this.monsters = [];
    this.tileRects = [];

    this.grid = Array.from({ length: MineScene.GRID_H }, (_, y) =>
      Array.from({ length: MineScene.GRID_W }, (_, x) =>
        x === 0 || y === 0 || x === MineScene.GRID_W - 1 || y === MineScene.GRID_H - 1 ? 'wall' : 'floor',
      ),
    );

    for (let y = 1; y < MineScene.GRID_H - 1; y += 1) {
      for (let x = 1; x < MineScene.GRID_W - 1; x += 1) {
        if (Math.random() < 0.08) this.grid[y][x] = 'wall';
      }
    }

    this.exitX = 1;
    this.exitY = MineScene.GRID_H - 2;
    this.playerX = this.exitX;
    this.playerY = this.exitY;
    this.grid[this.exitY][this.exitX] = 'exit';

    const rockCount = Phaser.Math.Clamp(18 + Math.floor(floor * 1.2), 18, 46);
    for (let i = 0; i < rockCount; i += 1) {
      const pos = this.pickFreeTile();
      if (!pos) break;
      this.grid[pos.y][pos.x] = 'rock';
    }

    const ladder = this.pickFreeTile();
    if (ladder) {
      this.ladderX = ladder.x;
      this.ladderY = ladder.y;
      this.grid[ladder.y][ladder.x] = 'ladder';
    } else {
      this.ladderX = MineScene.GRID_W - 2;
      this.ladderY = 1;
      this.grid[this.ladderY][this.ladderX] = 'ladder';
    }

    const monsterCount = Phaser.Math.Clamp(2 + Math.floor(floor / 2), 2, 12);
    for (let i = 0; i < monsterCount; i += 1) {
      const pos = this.pickFreeTile();
      if (!pos) break;
      const type: MonsterType = Math.random() < 0.65 ? 'slime' : 'bat';
      const baseHp = type === 'slime' ? 10 : 8;
      const baseAtk = type === 'slime' ? 3 : 4;
      const maxHp = baseHp + Math.floor(floor * 0.8);
      const attack = baseAtk + Math.floor(floor / 5);

      const body = this.add.rectangle(0, 0, MineScene.TILE * 0.55, MineScene.TILE * 0.55, type === 'slime' ? 0x6cbc4f : 0x8e6ccf);
      const hpBg = this.add.rectangle(0, 0, MineScene.TILE * 0.7, 5, 0x1b1b1b).setOrigin(0.5, 0.5);
      const hpFill = this.add.rectangle(0, 0, MineScene.TILE * 0.7, 5, 0xff5555).setOrigin(0.5, 0.5);

      this.entityLayer.add(body);
      this.entityLayer.add(hpBg);
      this.entityLayer.add(hpFill);

      const monster: MineMonster = {
        id: `${type}_${floor}_${i}_${Date.now()}`,
        type,
        x: pos.x,
        y: pos.y,
        hp: maxHp,
        maxHp,
        attack,
        body,
        hpBg,
        hpFill,
      };
      this.monsters.push(monster);
      this.positionMonster(monster);
    }

    for (let y = 0; y < MineScene.GRID_H; y += 1) {
      const row: Phaser.GameObjects.Rectangle[] = [];
      for (let x = 0; x < MineScene.GRID_W; x += 1) {
        const rect = this.add.rectangle(
          this.worldOffsetX + x * MineScene.TILE,
          this.worldOffsetY + y * MineScene.TILE,
          MineScene.TILE - 1,
          MineScene.TILE - 1,
          this.tileColor(this.grid[y][x]),
        );
        rect.setOrigin(0, 0);
        this.worldLayer.add(rect);
        row.push(rect);
      }
      this.tileRects.push(row);
    }

    this.playerRect = this.add.rectangle(0, 0, MineScene.TILE * 0.5, MineScene.TILE * 0.65, 0x67b6ff);
    this.entityLayer.add(this.playerRect);
    this.positionPlayer();

    this.playScene.mine.currentFloor = floor;
    this.playScene.mine.maxFloor = Math.max(this.playScene.mine.maxFloor, floor);

    if (floor % 5 === 0 && !this.playScene.mine.elevatorsUnlocked.includes(floor)) {
      this.playScene.mine.elevatorsUnlocked.push(floor);
      this.playScene.events.emit(Events.TOAST, {
        message: `Elevator unlocked at floor ${floor}!`,
        color: '#66ccff',
      });
    }
  }

  private getMoveIntent(): MoveDir | null {
    if (Phaser.Input.Keyboard.JustDown(this.cursors.left!) || Phaser.Input.Keyboard.JustDown(this.keys.a)) {
      return { x: -1, y: 0 };
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursors.right!) || Phaser.Input.Keyboard.JustDown(this.keys.d)) {
      return { x: 1, y: 0 };
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up!) || Phaser.Input.Keyboard.JustDown(this.keys.w)) {
      return { x: 0, y: -1 };
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursors.down!) || Phaser.Input.Keyboard.JustDown(this.keys.s)) {
      return { x: 0, y: 1 };
    }
    return null;
  }

  private tryMovePlayer(dx: number, dy: number) {
    const tx = this.playerX + dx;
    const ty = this.playerY + dy;

    if (!this.inBounds(tx, ty)) return;

    const tile = this.grid[ty][tx];
    if (tile === 'wall') return;

    const monster = this.getMonsterAt(tx, ty);
    if (monster) {
      this.resolveCombat(monster, tx, ty);
      return;
    }

    if (tile === 'rock') {
      this.breakRock(tx, ty);
      return;
    }

    this.playerX = tx;
    this.playerY = ty;
    this.positionPlayer();

    if (tile === 'ladder') {
      this.advanceFloor();
      return;
    }

    if (tile === 'exit') {
      this.leaveMine();
    }
  }

  private resolveCombat(monster: MineMonster, tx: number, ty: number) {
    const pickaxeLevel = this.playScene.toolLevels[Tool.PICKAXE] ?? 0;
    const playerDamage = 3 + pickaxeLevel * 2;

    monster.hp = Math.max(0, monster.hp - playerDamage);
    this.updateMonsterBar(monster);

    if (monster.hp <= 0) {
      this.killMonster(monster);
      this.playerX = tx;
      this.playerY = ty;
      this.positionPlayer();
      return;
    }

    this.playScene.mine.health = Math.max(0, this.playScene.mine.health - monster.attack);
    this.playScene.events.emit(Events.TOAST, {
      message: `${monster.type} hit you for ${monster.attack}!`,
      color: '#ff8888',
    });

    if (this.playScene.mine.health <= 0) {
      this.playScene.mine.health = Math.ceil(this.playScene.mine.maxHealth * 0.5);
      this.playScene.events.emit(Events.TOAST, {
        message: 'You were knocked out in the mine.',
        color: '#ff4444',
      });
      this.leaveMine();
    }
  }

  private breakRock(x: number, y: number) {
    const cost = 3;
    if (this.playScene.player.stamina < cost) {
      this.playScene.events.emit(Events.TOAST, { message: 'Too exhausted to break rocks.', color: '#ff4444' });
      return;
    }

    this.playScene.player.stamina -= cost;
    this.grid[y][x] = 'floor';
    this.tileRects[y][x].setFillStyle(this.tileColor('floor'));

    const drop = this.rollRockDrop(this.floor);
    this.addDrop(drop, 1);
  }

  private killMonster(monster: MineMonster) {
    monster.body.destroy();
    monster.hpBg.destroy();
    monster.hpFill.destroy();
    this.monsters = this.monsters.filter((m) => m !== monster);

    this.playScene.stats.monstersKilled += 1;
    this.playScene.events.emit(Events.MONSTER_KILLED, { monsterId: monster.type });

    const drop = this.rollMonsterDrop(this.floor);
    this.addDrop(drop, 1);
  }

  private rollRockDrop(floor: number): string {
    const r = Math.random();
    if (floor >= 40) {
      if (r < 0.2) return 'gold_ore';
      if (r < 0.55) return 'iron_ore';
      if (r < 0.85) return 'copper_ore';
      return 'stone';
    }
    if (floor >= 20) {
      if (r < 0.08) return 'gold_ore';
      if (r < 0.4) return 'iron_ore';
      if (r < 0.75) return 'copper_ore';
      return 'stone';
    }
    if (floor >= 10) {
      if (r < 0.2) return 'iron_ore';
      if (r < 0.55) return 'copper_ore';
      return 'stone';
    }
    if (r < 0.25) return 'copper_ore';
    return 'stone';
  }

  private rollMonsterDrop(floor: number): string {
    const gemRoll = Math.random();
    if (floor >= 50 && gemRoll < 0.16) return 'diamond';
    if (floor >= 35 && gemRoll < 0.22) return 'ruby';
    if (floor >= 25 && gemRoll < 0.3) return 'emerald';
    if (floor >= 15 && gemRoll < 0.36) return 'aquamarine';
    if (gemRoll < 0.4) return 'amethyst';
    return this.rollRockDrop(floor);
  }

  private addDrop(itemId: string, qty: number) {
    this.playScene.addToInventory(itemId, qty, Quality.NORMAL);
    this.foundItems.set(itemId, (this.foundItems.get(itemId) ?? 0) + qty);

    const item = ITEMS.find((it) => it.id === itemId);
    this.playScene.events.emit(Events.TOAST, {
      message: `Found ${qty}x ${item?.name ?? itemId}`,
      color: '#ffe18a',
    });
  }

  private advanceFloor() {
    this.floor += 1;
    this.playScene.events.emit(Events.TOAST, {
      message: `Descending to floor ${this.floor}...`,
      color: '#ccccff',
    });
    this.generateFloor(this.floor);
  }

  private leaveMine() {
    this.playScene.player.currentMap = MapId.FARM;
    this.playScene.mine.currentFloor = this.floor;

    this.scene.resume(Scenes.PLAY);
    this.scene.stop();
  }

  private updateHud() {
    this.floorText.setText(`Mine Floor ${this.floor}`);

    const hp = this.playScene.mine.health;
    const maxHp = this.playScene.mine.maxHealth;
    const hpRatio = Phaser.Math.Clamp(hp / Math.max(1, maxHp), 0, 1);
    this.healthBarFill.width = 180 * hpRatio;

    this.renderHearts(hp, maxHp);
    this.staminaText.setText(`Stamina: ${Math.floor(this.playScene.player.stamina)}/${this.playScene.player.maxStamina}`);

    const foundLines = Array.from(this.foundItems.entries())
      .slice(0, 6)
      .map(([itemId, qty]) => {
        const item = ITEMS.find((it) => it.id === itemId);
        return `${item?.name ?? itemId} x${qty}`;
      });

    this.foundText.setText(`Found:\n${foundLines.length ? foundLines.join('\n') : '(nothing yet)'}`);
  }

  private renderHearts(hp: number, maxHp: number) {
    for (const heart of this.hearts) heart.destroy();
    this.hearts = [];

    const totalHearts = Math.max(1, Math.ceil(maxHp / 10));
    const filledHearts = Math.round((hp / Math.max(1, maxHp)) * totalHearts);

    for (let i = 0; i < totalHearts; i += 1) {
      const heart = this.add.rectangle(18 + i * 14, 28, 10, 10, i < filledHearts ? 0xff5b6e : 0x55333a)
        .setOrigin(0, 0)
        .setScrollFactor(0);
      this.hearts.push(heart);
    }
  }

  private tileColor(tile: MineTile): number {
    switch (tile) {
      case 'wall': return 0x2b2b2b;
      case 'rock': return 0x6d4e31;
      case 'ladder': return 0xc9a44b;
      case 'exit': return 0x3f8796;
      default: return 0x444444;
    }
  }

  private positionPlayer() {
    const cx = this.worldOffsetX + this.playerX * MineScene.TILE + MineScene.TILE / 2;
    const cy = this.worldOffsetY + this.playerY * MineScene.TILE + MineScene.TILE / 2;
    this.playerRect.setPosition(cx, cy);
  }

  private positionMonster(monster: MineMonster) {
    const cx = this.worldOffsetX + monster.x * MineScene.TILE + MineScene.TILE / 2;
    const cy = this.worldOffsetY + monster.y * MineScene.TILE + MineScene.TILE / 2;
    monster.body.setPosition(cx, cy);
    monster.hpBg.setPosition(cx, cy - MineScene.TILE * 0.42);
    monster.hpFill.setPosition(cx, cy - MineScene.TILE * 0.42);
  }

  private updateMonsterBar(monster: MineMonster) {
    const ratio = Phaser.Math.Clamp(monster.hp / Math.max(1, monster.maxHp), 0, 1);
    monster.hpFill.width = MineScene.TILE * 0.7 * ratio;
    this.positionMonster(monster);
  }

  private pickFreeTile(): { x: number; y: number } | null {
    const tries = 150;
    for (let i = 0; i < tries; i += 1) {
      const x = Phaser.Math.Between(1, MineScene.GRID_W - 2);
      const y = Phaser.Math.Between(1, MineScene.GRID_H - 2);
      if (x === this.exitX && y === this.exitY) continue;
      if (this.grid[y][x] !== 'floor') continue;
      if (this.getMonsterAt(x, y)) continue;
      return { x, y };
    }
    return null;
  }

  private getMonsterAt(x: number, y: number): MineMonster | null {
    return this.monsters.find((m) => m.x === x && m.y === y) ?? null;
  }

  private inBounds(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < MineScene.GRID_W && y < MineScene.GRID_H;
  }
}
