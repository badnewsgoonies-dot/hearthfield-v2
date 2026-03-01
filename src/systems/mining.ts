import Phaser from 'phaser';
import { TILE_SIZE, SCALE, Events } from '../types';

export interface MineRockData {
  x: number;
  y: number;
  oreId: string;
  hp: number;
  sprite?: Phaser.GameObjects.Sprite;
}

export interface MineMonsterData {
  x: number;
  y: number;
  type: string;
  hp: number;
  maxHp: number;
  damage: number;
  speed: number;
  sprite?: Phaser.GameObjects.Sprite;
}

export interface MineFloorData {
  floor: number;
  tiles: number[][];
  rocks: MineRockData[];
  monsters: MineMonsterData[];
  ladderX: number;
  ladderY: number;
  hasElevator: boolean;
}

export interface MineDrop {
  itemId: string;
  qty: number;
}

export interface MineCollisionData {
  monster: MineMonsterData;
  damage: number;
}

export class MiningSystem {
  private static readonly WIDTH = 20;
  private static readonly HEIGHT = 15;

  private readonly tilePixels = TILE_SIZE * SCALE;
  private activeFloorData?: MineFloorData;
  private ladderSprite?: Phaser.GameObjects.Sprite;

  constructor(private readonly scene: Phaser.Scene) {}

  generateFloor(floor: number): MineFloorData {
    const rng = this.createSeededRng(floor);
    const tiles: number[][] = Array.from({ length: MiningSystem.HEIGHT }, () =>
      Array.from({ length: MiningSystem.WIDTH }, () => (rng() < 0.12 ? 1 : 0)),
    );

    const occupied = new Set<string>();
    const rocks: MineRockData[] = [];
    const monsters: MineMonsterData[] = [];

    const rockCount = this.randomInt(rng, 8, 15);
    for (let i = 0; i < rockCount; i += 1) {
      const pos = this.pickFreeTile(rng, occupied);
      if (!pos) break;

      const oreId = this.rollOreForFloor(rng, floor);
      const hp = this.getRockHp(oreId, floor);
      rocks.push({ x: pos.x, y: pos.y, oreId, hp });
      occupied.add(this.key(pos.x, pos.y));
    }

    const monsterCount = this.randomInt(rng, 2, 5);
    const monsterType = this.getMonsterTypeForFloor(floor);
    for (let i = 0; i < monsterCount; i += 1) {
      const pos = this.pickFreeTile(rng, occupied);
      if (!pos) break;

      const stats = this.getMonsterStats(monsterType, floor);
      monsters.push({
        x: pos.x,
        y: pos.y,
        type: monsterType,
        hp: stats.hp,
        maxHp: stats.hp,
        damage: stats.damage,
        speed: stats.speed,
      });
      occupied.add(this.key(pos.x, pos.y));
    }

    const ladderPos = this.pickFreeTile(rng, occupied) ?? { x: 1, y: 1 };
    const floorData: MineFloorData = {
      floor,
      tiles,
      rocks,
      monsters,
      ladderX: ladderPos.x,
      ladderY: ladderPos.y,
      hasElevator: floor % 5 === 0,
    };

    this.activeFloorData = floorData;
    this.scene.events.emit(Events.ENTER_MINE, { floor });
    return floorData;
  }

  renderFloor(
    floorData: MineFloorData,
    container: Phaser.GameObjects.Container,
  ): Phaser.GameObjects.Container {
    container.removeAll(true);
    this.ensureFallbackTextures();

    const graphics = this.scene.add.graphics();
    for (let y = 0; y < MiningSystem.HEIGHT; y += 1) {
      for (let x = 0; x < MiningSystem.WIDTH; x += 1) {
        const shade = floorData.tiles[y]?.[x] === 1 ? 0x191919 : 0x222222;
        graphics.fillStyle(shade, 1);
        graphics.fillRect(
          x * this.tilePixels,
          y * this.tilePixels,
          this.tilePixels,
          this.tilePixels,
        );
      }
    }
    container.add(graphics);

    for (const rock of floorData.rocks) {
      const world = this.tileToWorld(rock.x, rock.y);
      const sprite = this.scene.add.sprite(world.x, world.y, 'mine_rock');
      sprite.setDisplaySize(this.tilePixels * 0.75, this.tilePixels * 0.75);
      rock.sprite = sprite;
      container.add(sprite);
    }

    for (const monster of floorData.monsters) {
      const world = this.tileToWorld(monster.x, monster.y);
      const sprite = this.scene.add.sprite(world.x, world.y, 'mine_monster');
      sprite.setDisplaySize(this.tilePixels * 0.75, this.tilePixels * 0.75);
      monster.sprite = sprite;
      monster.x = world.x;
      monster.y = world.y;
      container.add(sprite);
    }

    const ladderWorld = this.tileToWorld(floorData.ladderX, floorData.ladderY);
    this.ladderSprite = this.scene.add.sprite(ladderWorld.x, ladderWorld.y, 'mine_ladder');
    this.ladderSprite.setDisplaySize(this.tilePixels * 0.8, this.tilePixels * 0.8);
    if (floorData.hasElevator) {
      this.ladderSprite.setTint(0x66ccff);
    } else {
      this.ladderSprite.clearTint();
    }
    container.add(this.ladderSprite);

    this.activeFloorData = floorData;
    return container;
  }

  hitRock(
    rock: MineRockData,
    toolLevel: number,
  ): { destroyed: boolean; drops: MineDrop[] } {
    const damage = Math.max(1, 1 + toolLevel);
    rock.hp -= damage;
    if (rock.hp > 0) {
      return { destroyed: false, drops: [] };
    }

    if (rock.sprite) {
      rock.sprite.destroy();
      rock.sprite = undefined;
    }

    const drops: MineDrop[] = [];
    const isGem = rock.oreId.endsWith('_gem');
    if (isGem) {
      drops.push({ itemId: rock.oreId, qty: 1 });
      if (Math.random() < 0.15) {
        drops.push({ itemId: rock.oreId, qty: 1 });
      }
    } else {
      drops.push({ itemId: rock.oreId, qty: Phaser.Math.Between(1, 2) });
      if (Math.random() < 0.2) {
        drops.push({ itemId: 'coal', qty: 1 });
      }
    }

    this.tryEmitFloorClear();
    return { destroyed: true, drops };
  }

  updateMonsters(
    delta: number,
    playerX: number,
    playerY: number,
  ): MineCollisionData | null {
    const floorData = this.activeFloorData;
    if (!floorData) return null;

    let collision: MineCollisionData | null = null;
    for (const monster of floorData.monsters) {
      if (monster.hp <= 0) continue;

      let mx = monster.x;
      let my = monster.y;
      if (!monster.sprite) {
        const world = this.tileToWorld(monster.x, monster.y);
        mx = world.x;
        my = world.y;
      }

      const dx = playerX - mx;
      const dy = playerY - my;
      const dist = Math.hypot(dx, dy);
      if (dist > 0.001) {
        const step = Math.min(dist, monster.speed * (delta / 1000));
        mx += (dx / dist) * step;
        my += (dy / dist) * step;
      }

      monster.x = mx;
      monster.y = my;
      if (monster.sprite) {
        monster.sprite.setPosition(mx, my);
      }

      if (!collision && dist <= this.tilePixels * 0.45) {
        collision = { monster, damage: monster.damage };
      }
    }

    return collision;
  }

  attackMonster(monster: MineMonsterData, damage: number): { killed: boolean } {
    monster.hp -= Math.max(1, damage);
    if (monster.hp > 0) {
      return { killed: false };
    }

    monster.hp = 0;
    if (monster.sprite) {
      monster.sprite.destroy();
      monster.sprite = undefined;
    }

    this.scene.events.emit(Events.MONSTER_KILLED, {
      monsterId: monster.type,
    });
    this.tryEmitFloorClear();
    return { killed: true };
  }

  private tryEmitFloorClear(): void {
    if (!this.activeFloorData) return;

    const monstersAlive = this.activeFloorData.monsters.some((m) => m.hp > 0);
    const rocksLeft = this.activeFloorData.rocks.some((r) => r.hp > 0);
    if (!monstersAlive && !rocksLeft) {
      this.scene.events.emit(Events.FLOOR_CLEAR, { floor: this.activeFloorData.floor });
    }
  }

  private rollOreForFloor(rng: () => number, floor: number): string {
    const gemChance = 0.08 + Math.min(0.12, floor * 0.001);
    if (rng() < gemChance) {
      const gems = ['amethyst_gem', 'topaz_gem', 'emerald_gem', 'ruby_gem'];
      return gems[this.randomInt(rng, 0, gems.length - 1)];
    }

    if (floor >= 80) return 'gold_ore';
    if (floor >= 40) return 'iron_ore';
    return 'copper_ore';
  }

  private getRockHp(oreId: string, floor: number): number {
    const base = oreId.endsWith('_gem') ? 4 : 3;
    return base + Math.floor(floor / 25);
  }

  private getMonsterTypeForFloor(floor: number): string {
    if (floor >= 80) return 'golem';
    if (floor >= 40) return 'bat';
    return 'slime';
  }

  private getMonsterStats(
    type: string,
    floor: number,
  ): { hp: number; damage: number; speed: number } {
    let baseHp = 16;
    let baseDamage = 4;
    let baseSpeed = 42;

    if (type === 'bat') {
      baseHp = 13;
      baseDamage = 5;
      baseSpeed = 68;
    } else if (type === 'golem') {
      baseHp = 28;
      baseDamage = 8;
      baseSpeed = 34;
    }

    const scale = 1 + floor * 0.04;
    return {
      hp: Math.max(1, Math.round(baseHp * scale)),
      damage: Math.max(1, Math.round(baseDamage + floor * 0.12)),
      speed: Math.round(baseSpeed + floor * 0.3),
    };
  }

  private pickFreeTile(
    rng: () => number,
    occupied: Set<string>,
  ): { x: number; y: number } | null {
    for (let i = 0; i < 200; i += 1) {
      const x = this.randomInt(rng, 0, MiningSystem.WIDTH - 1);
      const y = this.randomInt(rng, 0, MiningSystem.HEIGHT - 1);
      const posKey = this.key(x, y);
      if (!occupied.has(posKey)) {
        return { x, y };
      }
    }

    for (let y = 0; y < MiningSystem.HEIGHT; y += 1) {
      for (let x = 0; x < MiningSystem.WIDTH; x += 1) {
        const posKey = this.key(x, y);
        if (!occupied.has(posKey)) {
          return { x, y };
        }
      }
    }
    return null;
  }

  private key(x: number, y: number): string {
    return `${x},${y}`;
  }

  private tileToWorld(tileX: number, tileY: number): { x: number; y: number } {
    return {
      x: tileX * this.tilePixels + this.tilePixels * 0.5,
      y: tileY * this.tilePixels + this.tilePixels * 0.5,
    };
  }

  private randomInt(rng: () => number, min: number, max: number): number {
    return Math.floor(rng() * (max - min + 1)) + min;
  }

  private createSeededRng(seed: number): () => number {
    let state = seed >>> 0;
    return () => {
      state += 0x6d2b79f5;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  private ensureFallbackTextures(): void {
    this.ensureSolidTexture('mine_rock', 0x777777);
    this.ensureSolidTexture('mine_monster', 0x9f2a2a);
    this.ensureSolidTexture('mine_ladder', 0xc2a36e);
  }

  private ensureSolidTexture(key: string, color: number): void {
    if (this.scene.textures.exists(key)) return;
    const graphics = this.scene.add.graphics();
    graphics.fillStyle(color, 1);
    graphics.fillRect(0, 0, 16, 16);
    graphics.generateTexture(key, 16, 16);
    graphics.destroy();
  }
}
