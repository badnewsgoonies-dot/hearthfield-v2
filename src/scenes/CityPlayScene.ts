/**
 * CityPlayScene — The main playable city scene (City Life DLC)
 * Mirrors PlayScene structure but for urban gameplay:
 * office work, socializing, apartment life, shopping.
 */
import Phaser from 'phaser';
import {
  Scenes, Events, Direction, Season, TileType, InteractionKind,
  TILE_SIZE, SCALE, SCALED_TILE, PLAYER_SPEED, DAY_LENGTH_MS,
  CITY_SAVE_KEY, CityInteractionKind, CityVenue, JobRank,
  gridToWorld, ySortDepth, facingTile, clamp,
  type PlayerState, type CalendarState, type InventorySlot, type JobState,
} from '../types';
import { CITY_LAYOUT, type CityBuilding } from '../data/cityLayout';
import { CITY_ITEMS, CITY_NPCS } from '../data/cityRegistry';
import { CityRenderer } from '../systems/cityRenderer';
import { CityEventHandler } from '../systems/cityEvents';

// ─── CONSTANTS ───
const CITY_WIDTH = 40;
const CITY_HEIGHT = 25;
const MAP_PX_W = CITY_WIDTH * SCALED_TILE;
const MAP_PX_H = CITY_HEIGHT * SCALED_TILE;
const INTERACT_RANGE = SCALED_TILE * 1.8;

// Salary by rank
const SALARY: Record<string, number> = {
  [JobRank.INTERN]: 100,
  [JobRank.JUNIOR]: 200,
  [JobRank.ASSOCIATE]: 250,
  [JobRank.SENIOR]: 350,
  [JobRank.MANAGER]: 500,
  [JobRank.DIRECTOR]: 750,
  [JobRank.VP]: 1000,
};

// Promotion day thresholds
const PROMO_DAYS: Record<string, number> = {
  [JobRank.JUNIOR]: 5,
  [JobRank.ASSOCIATE]: 10,
  [JobRank.SENIOR]: 15,
  [JobRank.MANAGER]: 30,
  [JobRank.DIRECTOR]: 60,
  [JobRank.VP]: 100,
};

const RANK_ORDER = [
  JobRank.INTERN, JobRank.JUNIOR, JobRank.ASSOCIATE,
  JobRank.SENIOR, JobRank.MANAGER, JobRank.DIRECTOR, JobRank.VP,
];

interface CityInteractable {
  x: number; y: number;
  kind: CityInteractionKind;
  building?: CityBuilding;
  npcId?: string;
  label: string;
}

interface CitySaveData {
  player: PlayerState;
  calendar: CalendarState;
  relationships: Record<string, number>;
  jobState: JobState;
}

export class CityPlayScene extends Phaser.Scene {
  // Player
  private player!: PlayerState;
  private playerSprite!: Phaser.GameObjects.Rectangle;
  private playerShadow!: Phaser.GameObjects.Ellipse;

  // World
  private calendar!: CalendarState;
  private relationships: Record<string, number> = {};
  private jobState!: JobState;
  private collisionMap: boolean[][] = [];
  private interactables: CityInteractable[] = [];
  private npcSprites: Map<string, Phaser.GameObjects.Container> = new Map();

  // Visual layers
  private groundLayer!: Phaser.GameObjects.Container;
  private buildingLayer!: Phaser.GameObjects.Container;
  private decoLayer!: Phaser.GameObjects.Container;
  private dayNightOverlay?: Phaser.GameObjects.Rectangle;
  private proximityPrompt?: Phaser.GameObjects.Text;

  // Input
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;
  private interactKey!: Phaser.Input.Keyboard.Key;

  // State
  private dayTimer = 0;
  private isNewGame = false;

  constructor() {
    super(Scenes.CITY_PLAY);
  }

  init(data?: { loadSave?: boolean; playerName?: string }) {
    if (data?.loadSave) {
      this.loadGame();
    } else {
      this.initNewGame(data?.playerName ?? 'Player');
    }
  }

  // ═══════════════════════════════════════════
  //  CREATE
  // ═══════════════════════════════════════════

  create() {
    // Layers
    this.groundLayer = this.add.container(0, 0);
    this.buildingLayer = this.add.container(0, 0);
    this.decoLayer = this.add.container(0, 0);

    this.createCityMap();
    this.renderBuildings();
    this.renderDecorations();
    this.buildCollisionMap();
    this.buildInteractables();
    this.spawnPlayer();
    this.spawnNPCs();
    this.setupCamera();
    this.setupInput();
    this.setupUI();
    this.setupEventListeners();

    // Day/night overlay
    this.dayNightOverlay = this.add.rectangle(
      MAP_PX_W / 2, MAP_PX_H / 2, MAP_PX_W, MAP_PX_H, 0x000033, 0
    ).setDepth(9000).setScrollFactor(1);

    // Emit initial day start
    this.events.emit(Events.DAY_START, {
      day: this.calendar.day, season: this.calendar.season, year: this.calendar.year
    });
    this.toast(`Welcome to the city, ${this.player.name}!`);
  }

  // ═══════════════════════════════════════════
  //  UPDATE LOOP
  // ═══════════════════════════════════════════

  update(_time: number, delta: number) {
    this.handleMovement(delta);
    this.handleInteractionInput();
    this.updateDayTimer(delta);
    this.updateDayNightVisual();
    this.updateNPCDepths();
    this.updateProximityPrompt();
  }

  // ═══════════════════════════════════════════
  //  MAP CREATION
  // ═══════════════════════════════════════════

  private createCityMap() {
    const T = SCALED_TILE;
    const { parkArea, mainStreetY, sidewalks } = CITY_LAYOUT;

    for (let y = 0; y < CITY_HEIGHT; y++) {
      for (let x = 0; x < CITY_WIDTH; x++) {
        let color = 0x555555; // default asphalt

        // Park area — grass
        if (parkArea && x >= parkArea.x1 && x <= parkArea.x2 && y >= parkArea.y1 && y <= parkArea.y2) {
          color = 0x4a7a3b;
        }
        // Main street road
        else if (mainStreetY && (y === mainStreetY || y === mainStreetY + 1)) {
          color = 0x333333;
        }
        // Sidewalks
        else if (sidewalks?.some(s => s.x === x && s.y === y)) {
          color = 0x999999;
        }
        // Top rows — sky/backdrop
        else if (y < 3) {
          color = 0x667799;
        }
        // Bottom rows — transit
        else if (y >= 22) {
          color = 0x444444;
        }

        const tile = this.add.rectangle(
          x * T + T / 2, y * T + T / 2, T, T, color
        ).setOrigin(0.5);
        this.groundLayer.add(tile);
      }
    }
    this.groundLayer.setDepth(0);
  }

  private renderBuildings() {
    const T = SCALED_TILE;
    for (const b of CITY_LAYOUT.buildings) {
      let container: Phaser.GameObjects.Container | null = null;
      const wx = b.x * T;
      const wy = b.y * T;

      switch (b.venue) {
        case CityVenue.OFFICE:
          container = CityRenderer.drawOffice(this, wx, wy, T);
          break;
        case CityVenue.CAFE:
          container = CityRenderer.drawCoffeeShop(this, wx, wy, T);
          break;
        case CityVenue.RESTAURANT:
          container = CityRenderer.drawRestaurant(this, wx, wy, T);
          break;
        case CityVenue.BAR:
          container = CityRenderer.drawBar(this, wx, wy, T);
          break;
        case CityVenue.APARTMENT:
          container = CityRenderer.drawApartment(this, wx, wy, T, b.name.includes('Player'));
          break;
        case CityVenue.GYM:
          container = CityRenderer.drawGym(this, wx, wy, T);
          break;
        case CityVenue.BOOKSTORE:
          container = CityRenderer.drawBookstore(this, wx, wy, T);
          break;
        default:
          // Generic building — simple colored rect
          const g = this.add.graphics();
          g.fillStyle(b.color, 1);
          g.fillRect(0, 0, b.width * T, b.height * T);
          g.fillStyle(b.roofColor, 1);
          g.fillRect(0, 0, b.width * T, T * 0.3);
          if (b.hasSign) {
            const label = this.add.text(
              b.width * T / 2, b.height * T + 4, b.name,
              { fontSize: '10px', color: '#ffffff', fontFamily: 'monospace' }
            ).setOrigin(0.5, 0);
            container = this.add.container(wx, wy, [g, label]);
          } else {
            container = this.add.container(wx, wy, [g]);
          }
          break;
      }

      if (container) {
        container.setDepth(ySortDepth((b.y + b.height) * T));
        this.buildingLayer.add(container);
      }
    }
    this.buildingLayer.setDepth(1);
  }

  private renderDecorations() {
    const T = SCALED_TILE;
    for (const d of CITY_LAYOUT.decorations) {
      const wx = d.x * T;
      const wy = d.y * T;
      let obj: Phaser.GameObjects.Container | null = null;

      switch (d.type) {
        case 'streetlight':
          obj = CityRenderer.drawStreetLamp(this, wx, wy, T);
          break;
        case 'bench':
          obj = CityRenderer.drawBench(this, wx, wy, T);
          break;
        case 'fountain':
          obj = CityRenderer.drawFountain(this, wx, wy, T);
          break;
        case 'bus_sign':
          obj = CityRenderer.drawBusStop(this, wx, wy, T);
          break;
        case 'fire_hydrant':
          obj = CityRenderer.drawHydrant(this, wx, wy, T);
          break;
        case 'mailbox':
          obj = CityRenderer.drawMailbox(this, wx, wy, T);
          break;
        default: {
          // Simple colored rectangle for unlisted types
          const g = this.add.graphics();
          g.fillStyle(0x888888, 1);
          g.fillRect(0, 0, T * 0.5, T * 0.5);
          obj = this.add.container(wx, wy, [g]);
          break;
        }
      }
      if (obj) {
        obj.setDepth(ySortDepth(wy + T));
        this.decoLayer.add(obj);
      }
    }
    this.decoLayer.setDepth(2);
  }

  // ═══════════════════════════════════════════
  //  COLLISION
  // ═══════════════════════════════════════════

  private buildCollisionMap() {
    this.collisionMap = Array.from({ length: CITY_HEIGHT }, () =>
      Array(CITY_WIDTH).fill(false)
    );

    // Buildings are solid
    for (const b of CITY_LAYOUT.buildings) {
      for (let dy = 0; dy < b.height; dy++) {
        for (let dx = 0; dx < b.width; dx++) {
          const tx = b.x + dx;
          const ty = b.y + dy;
          if (tx >= 0 && tx < CITY_WIDTH && ty >= 0 && ty < CITY_HEIGHT) {
            this.collisionMap[ty][tx] = true;
          }
        }
      }
      // Leave bottom-center tile walkable (door)
      const doorX = b.x + Math.floor(b.width / 2);
      const doorY = b.y + b.height; // tile just below building
      if (doorY < CITY_HEIGHT && doorX < CITY_WIDTH) {
        this.collisionMap[doorY][doorX] = false;
      }
    }

    // Top rows blocked
    for (let x = 0; x < CITY_WIDTH; x++) {
      for (let y = 0; y < 3; y++) {
        this.collisionMap[y][x] = true;
      }
    }
  }

  private isBlocked(tileX: number, tileY: number): boolean {
    if (tileX < 0 || tileX >= CITY_WIDTH || tileY < 0 || tileY >= CITY_HEIGHT) return true;
    return this.collisionMap[tileY][tileX];
  }

  // ═══════════════════════════════════════════
  //  INTERACTABLES
  // ═══════════════════════════════════════════

  private buildInteractables() {
    this.interactables = [];

    // Building entrances — place at door tile (bottom center)
    for (const b of CITY_LAYOUT.buildings) {
      const doorX = b.x + Math.floor(b.width / 2);
      const doorY = b.y + b.height;
      const pos = gridToWorld(doorX, doorY);
      this.interactables.push({
        x: pos.x, y: pos.y,
        kind: b.interaction,
        building: b,
        label: b.name,
      });
    }

    // Benches in park — restoring
    for (const d of CITY_LAYOUT.decorations) {
      if (d.type === 'bench') {
        const pos = gridToWorld(d.x, d.y);
        this.interactables.push({
          x: pos.x, y: pos.y,
          kind: CityInteractionKind.PARK_BENCH,
          label: 'Park Bench',
        });
      }
      if (d.type === 'bus_sign') {
        const pos = gridToWorld(d.x, d.y);
        this.interactables.push({
          x: pos.x, y: pos.y,
          kind: CityInteractionKind.BUS_STOP,
          label: 'Bus Stop',
        });
      }
    }
  }

  // ═══════════════════════════════════════════
  //  PLAYER
  // ═══════════════════════════════════════════

  private spawnPlayer() {
    const { x, y } = this.player;
    this.playerShadow = this.add.ellipse(x, y + 12, 20, 8, 0x000000, 0.3)
      .setDepth(ySortDepth(y) - 0.001);

    // Simple colored rectangle player (no sprite assets needed)
    this.playerSprite = this.add.rectangle(x, y, SCALED_TILE * 0.6, SCALED_TILE * 0.9, 0x3388cc)
      .setOrigin(0.5, 0.7)
      .setDepth(ySortDepth(y));

    // Head
    this.add.circle(x, y - SCALED_TILE * 0.45, SCALED_TILE * 0.2, 0xffcc99)
      .setDepth(ySortDepth(y) + 0.001);
  }

  private spawnNPCs() {
    // Default spawn positions per NPC (grid coords)
    const NPC_SPAWNS: Record<string, { gx: number; gy: number; color: number }> = {
      alex:   { gx: 17, gy: 8, color: 0xcc8844 },
      morgan: { gx: 9,  gy: 6, color: 0x4466aa },
      sam:    { gx: 24, gy: 11, color: 0x884422 },
      jordan: { gx: 17, gy: 14, color: 0x448844 },
      casey:  { gx: 13, gy: 11, color: 0xcc4444 },
      riley:  { gx: 28, gy: 11, color: 0x664488 },
      taylor: { gx: 9,  gy: 18, color: 0xcc88aa },
      priya:  { gx: 27, gy: 8, color: 0x886644 },
    };

    for (const npc of CITY_NPCS) {
      const spawn = NPC_SPAWNS[npc.id] ?? { gx: 15, gy: 12, color: 0xcc6644 };
      const spawnX = spawn.gx * SCALED_TILE + SCALED_TILE / 2;
      const spawnY = spawn.gy * SCALED_TILE + SCALED_TILE / 2;

      const body = this.add.rectangle(0, 0, SCALED_TILE * 0.5, SCALED_TILE * 0.8, spawn.color)
        .setOrigin(0.5, 0.7);
      const head = this.add.circle(0, -SCALED_TILE * 0.4, SCALED_TILE * 0.18, 0xffddaa)
        .setOrigin(0.5);
      const nameTag = this.add.text(0, -SCALED_TILE * 0.7, npc.name, {
        fontSize: '10px', color: '#ffffff', fontFamily: 'monospace',
        stroke: '#000000', strokeThickness: 2,
      }).setOrigin(0.5);

      const container = this.add.container(spawnX, spawnY, [body, head, nameTag]);
      container.setDepth(ySortDepth(spawnY));
      this.npcSprites.set(npc.id, container);

      // Add as interactable
      this.interactables.push({
        x: spawnX, y: spawnY,
        kind: CityInteractionKind.NPC_TALK,
        npcId: npc.id,
        label: npc.name,
      });

      // Init relationship
      if (!(npc.id in this.relationships)) {
        this.relationships[npc.id] = 0;
      }
    }
  }

  // ═══════════════════════════════════════════
  //  INPUT & MOVEMENT
  // ═══════════════════════════════════════════

  private setupInput() {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      W: this.input.keyboard!.addKey('W'),
      A: this.input.keyboard!.addKey('A'),
      S: this.input.keyboard!.addKey('S'),
      D: this.input.keyboard!.addKey('D'),
    };
    this.interactKey = this.input.keyboard!.addKey('E');
  }

  private handleMovement(delta: number) {
    const speed = PLAYER_SPEED * (delta / 1000) * SCALE;
    let dx = 0, dy = 0;

    if (this.cursors.left.isDown || this.wasd.A.isDown) { dx = -1; this.player.direction = Direction.LEFT; }
    else if (this.cursors.right.isDown || this.wasd.D.isDown) { dx = 1; this.player.direction = Direction.RIGHT; }
    if (this.cursors.up.isDown || this.wasd.W.isDown) { dy = -1; this.player.direction = Direction.UP; }
    else if (this.cursors.down.isDown || this.wasd.S.isDown) { dy = 1; this.player.direction = Direction.DOWN; }

    if (dx === 0 && dy === 0) return;

    // Normalize diagonal
    if (dx !== 0 && dy !== 0) {
      const norm = 1 / Math.SQRT2;
      dx *= norm;
      dy *= norm;
    }

    const newX = this.player.x + dx * speed;
    const newY = this.player.y + dy * speed;

    // Collision check per axis
    const tileAtNewX = Math.floor(newX / SCALED_TILE);
    const tileAtNewY = Math.floor(newY / SCALED_TILE);
    const curTileY = Math.floor(this.player.y / SCALED_TILE);
    const curTileX = Math.floor(this.player.x / SCALED_TILE);

    if (!this.isBlocked(tileAtNewX, curTileY)) {
      this.player.x = clamp(newX, SCALED_TILE / 2, MAP_PX_W - SCALED_TILE / 2);
    }
    if (!this.isBlocked(curTileX, tileAtNewY)) {
      this.player.y = clamp(newY, SCALED_TILE * 3, MAP_PX_H - SCALED_TILE / 2);
    }

    // Update sprite positions
    this.playerSprite.setPosition(this.player.x, this.player.y);
    this.playerSprite.setDepth(ySortDepth(this.player.y));
    this.playerShadow.setPosition(this.player.x, this.player.y + 12);
    this.playerShadow.setDepth(ySortDepth(this.player.y) - 0.001);
  }

  private handleInteractionInput() {
    if (!Phaser.Input.Keyboard.JustDown(this.interactKey)) return;

    const nearest = this.findNearestInteractable();
    if (!nearest) return;

    switch (nearest.kind) {
      case CityInteractionKind.OFFICE_WORK:
        this.handleOfficeWork();
        break;
      case CityInteractionKind.APARTMENT_DOOR:
        this.handleApartment();
        break;
      case CityInteractionKind.CAFE:
      case CityInteractionKind.RESTAURANT:
      case CityInteractionKind.BAR:
      case CityInteractionKind.BOOKSTORE:
      case CityInteractionKind.SHOP_GROCERY:
      case CityInteractionKind.SHOP_ELECTRONICS:
      case CityInteractionKind.SHOP_CLOTHING:
        this.handleShopVisit(nearest);
        break;
      case CityInteractionKind.GYM:
        this.handleGym();
        break;
      case CityInteractionKind.PARK_BENCH:
        this.handleParkBench();
        break;
      case CityInteractionKind.BUS_STOP:
        this.toast('🚌 Bus service coming soon — travel to the farm!');
        break;
      case CityInteractionKind.NPC_TALK:
        if (nearest.npcId) this.handleNPCTalk(nearest.npcId);
        break;
      case CityInteractionKind.COMMUNITY_GARDEN:
        this.toast('🌱 The community garden is peaceful.');
        this.adjustStamina(5);
        break;
    }
  }

  private findNearestInteractable(): CityInteractable | null {
    let best: CityInteractable | null = null;
    let bestDist = INTERACT_RANGE;

    for (const ia of this.interactables) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, ia.x, ia.y);
      if (dist < bestDist) {
        bestDist = dist;
        best = ia;
      }
    }
    return best;
  }

  // ═══════════════════════════════════════════
  //  INTERACTION HANDLERS
  // ═══════════════════════════════════════════

  private handleOfficeWork() {
    const tod = this.calendar.timeOfDay;
    // timeOfDay 0.0 = 6am, so 9am = 0.15, 5pm = 0.55
    if (tod < 0.15 || tod > 0.55) {
      this.toast('The office is closed. Work hours: 9AM - 5PM.');
      return;
    }
    if (this.jobState.workedToday) {
      this.toast('Already clocked in today!');
      return;
    }

    this.jobState.workedToday = true;
    this.jobState.daysWorked++;
    this.jobState.streak++;

    // Streak bonus: +10% per day, max 50%
    const streakBonus = Math.min(this.jobState.streak * 0.1, 0.5);
    const baseSalary = SALARY[this.jobState.rank] ?? 100;
    const earned = Math.floor(baseSalary * (1 + streakBonus));

    this.player.gold += earned;
    this.adjustStamina(-20);

    // Reputation
    this.jobState.performanceRating = clamp(
      this.jobState.performanceRating + 5 + (this.jobState.streak > 1 ? 2 : 0),
      0, 100
    );

    this.toast(`💼 Earned ${earned}g at work! (Day ${this.jobState.daysWorked})`);
    this.events.emit(Events.GOLD_CHANGE, { amount: earned, newTotal: this.player.gold });

    // Check promotion
    this.checkPromotion();
  }

  private checkPromotion() {
    const currentIdx = RANK_ORDER.indexOf(this.jobState.rank);
    if (currentIdx >= RANK_ORDER.length - 1) return; // Already VP

    const nextRank = RANK_ORDER[currentIdx + 1];
    const daysNeeded = PROMO_DAYS[nextRank] ?? 999;

    // VP/Director need reputation >= 80
    const needsRep = (nextRank === JobRank.VP || nextRank === JobRank.DIRECTOR);
    if (this.jobState.daysWorked >= daysNeeded) {
      if (needsRep && this.jobState.performanceRating < 80) {
        this.toast(`⭐ You need higher reputation (${this.jobState.performanceRating}/80) for ${nextRank}!`);
        return;
      }
      this.jobState.rank = nextRank;
      this.jobState.salary = SALARY[nextRank] ?? this.jobState.salary;
      this.toast(`🎉 PROMOTED to ${nextRank.toUpperCase()}! New salary: ${this.jobState.salary}g/day`);
    }
  }

  private handleApartment() {
    this.toast('🏠 Home sweet home. You feel rested.');
    this.adjustStamina(30);
  }

  private handleShopVisit(ia: CityInteractable) {
    // Simple buy interaction — spend gold for stamina/items
    const prices: Record<string, { cost: number; stamina: number; msg: string }> = {
      [CityInteractionKind.CAFE]: { cost: 15, stamina: 20, msg: '☕ Grabbed a coffee!' },
      [CityInteractionKind.RESTAURANT]: { cost: 55, stamina: 40, msg: '🍽️ Enjoyed a nice meal!' },
      [CityInteractionKind.BAR]: { cost: 45, stamina: 15, msg: '🍸 Had a cocktail!' },
      [CityInteractionKind.BOOKSTORE]: { cost: 25, stamina: 10, msg: '📚 Bought a good book!' },
      [CityInteractionKind.SHOP_GROCERY]: { cost: 30, stamina: 25, msg: '🛒 Got some groceries!' },
      [CityInteractionKind.SHOP_ELECTRONICS]: { cost: 200, stamina: 0, msg: '🔌 Browsed electronics!' },
      [CityInteractionKind.SHOP_CLOTHING]: { cost: 80, stamina: 0, msg: '👔 Got a new outfit!' },
    };

    const info = prices[ia.kind];
    if (!info) { this.toast(`Visited ${ia.label}.`); return; }

    if (this.player.gold < info.cost) {
      this.toast(`Not enough gold! Need ${info.cost}g.`);
      return;
    }

    this.player.gold -= info.cost;
    this.adjustStamina(info.stamina);
    this.toast(info.msg + ` (-${info.cost}g)`);
    this.events.emit(Events.GOLD_CHANGE, { amount: -info.cost, newTotal: this.player.gold });
  }

  private handleGym() {
    if (this.player.gold < 20) {
      this.toast('Gym membership costs 20g.');
      return;
    }
    this.player.gold -= 20;
    this.adjustStamina(40);
    this.toast('💪 Great workout! Stamina restored. (-20g)');
    this.events.emit(Events.GOLD_CHANGE, { amount: -20, newTotal: this.player.gold });
  }

  private handleParkBench() {
    this.adjustStamina(10);
    this.toast('🌳 You rest on the bench and enjoy the view.');
  }

  private handleNPCTalk(npcId: string) {
    const npc = CITY_NPCS.find(n => n.id === npcId);
    if (!npc) return;

    const hearts = this.relationships[npcId] ?? 0;
    const pool = npc.dialoguePool ?? {};
    // Pick bracket: 0-2 hearts = 'low', 3-5 = 'mid', 6+ = 'high'
    const bracket = hearts >= 300 ? 'high' : hearts >= 100 ? 'mid' : 'low';
    const lines = pool[bracket] ?? pool['low'] ?? Object.values(pool)[0] ?? [];
    const line = lines.length > 0
      ? lines[Math.floor(Math.random() * lines.length)]
      : 'Nice to see you!';

    this.toast(`${npc.name}: "${line}"`);

    // Small friendship gain per conversation per day
    this.relationships[npcId] = Math.min(hearts + 5, 1000);
  }

  // ═══════════════════════════════════════════
  //  DAY/NIGHT CYCLE
  // ═══════════════════════════════════════════

  private updateDayTimer(delta: number) {
    if (this.calendar.isPaused) return;

    this.dayTimer += delta;
    this.calendar.timeOfDay = clamp(this.dayTimer / DAY_LENGTH_MS, 0, 1);

    // End of day at timeOfDay >= 1.0 (2AM)
    if (this.calendar.timeOfDay >= 1.0) {
      this.advanceDay();
    }
  }

  private advanceDay() {
    // Reset
    this.dayTimer = 0;
    this.calendar.timeOfDay = 0;
    this.calendar.day++;
    this.jobState.workedToday = false;

    // Streak: if didn't work yesterday, reset
    // (already handled — if workedToday was false at day end, streak stays)

    // Season change
    if (this.calendar.day > 28) {
      this.calendar.day = 1;
      const seasons = [Season.SPRING, Season.SUMMER, Season.FALL, Season.WINTER];
      const idx = seasons.indexOf(this.calendar.season);
      if (idx === 3) {
        this.calendar.season = Season.SPRING;
        this.calendar.year++;
      } else {
        this.calendar.season = seasons[idx + 1];
      }
      this.toast(`🌸 ${this.calendar.season.toUpperCase()} has arrived!`);
    }

    // Check city events
    const event = CityEventHandler.getTodaysEvent(this.calendar.season, this.calendar.day);
    if (event) {
      this.toast(`🎉 Today: ${event.name} — ${event.description}`);
    }

    // Auto-save
    this.saveGame();

    // Restore some stamina (sleeping)
    this.player.stamina = Math.min(this.player.stamina + 50, this.player.maxStamina);

    this.events.emit(Events.DAY_START, {
      day: this.calendar.day, season: this.calendar.season, year: this.calendar.year,
    });

    // Streak break check
    if (!this.jobState.workedToday) {
      // Previous day they didn't work — already reset above
    }
  }

  private updateDayNightVisual() {
    if (!this.dayNightOverlay) return;
    const t = this.calendar.timeOfDay;

    // 0.0=6am, 0.25=11am, 0.5=3pm, 0.75=9pm, 1.0=2am
    let alpha = 0;
    if (t < 0.1) alpha = 0.15 - t * 1.5; // dawn fade out
    else if (t < 0.6) alpha = 0; // daylight
    else if (t < 0.8) alpha = (t - 0.6) * 2; // dusk
    else alpha = 0.4 + (t - 0.8) * 1.5; // night deepens

    // City has more ambient light than farm — cap darkness
    this.dayNightOverlay.setAlpha(clamp(alpha, 0, 0.5));

    // Warm tint during golden hour
    if (t > 0.55 && t < 0.7) {
      this.dayNightOverlay.setFillStyle(0x332200, clamp((t - 0.55) * 3, 0, 0.2));
    } else {
      this.dayNightOverlay.setFillStyle(0x000033);
    }
  }

  // ═══════════════════════════════════════════
  //  UI HELPERS
  // ═══════════════════════════════════════════

  private setupUI() {
    this.proximityPrompt = this.add.text(0, 0, '', {
      fontSize: '12px', color: '#ffffff', fontFamily: 'monospace',
      backgroundColor: '#00000088', padding: { x: 6, y: 3 },
    }).setOrigin(0.5).setDepth(10000).setVisible(false).setScrollFactor(0);
  }

  private updateProximityPrompt() {
    const nearest = this.findNearestInteractable();
    if (nearest && this.proximityPrompt) {
      this.proximityPrompt.setText(`[E] ${nearest.label}`);
      this.proximityPrompt.setPosition(
        this.cameras.main.width / 2,
        this.cameras.main.height - 60
      );
      this.proximityPrompt.setVisible(true);
    } else {
      this.proximityPrompt?.setVisible(false);
    }
  }

  private setupCamera() {
    this.cameras.main.startFollow(this.playerSprite, true, 0.08, 0.08);
    this.cameras.main.setZoom(1);
    this.cameras.main.setBounds(0, 0, MAP_PX_W, MAP_PX_H);
  }

  private setupEventListeners() {
    // Keyboard shortcut for save
    this.input.keyboard!.on('keydown-P', () => {
      this.calendar.isPaused = !this.calendar.isPaused;
      this.toast(this.calendar.isPaused ? '⏸ Paused' : '▶ Resumed');
    });

    // Quick save
    this.input.keyboard!.on('keydown-F5', () => {
      this.saveGame();
      this.toast('💾 Game saved!');
    });
  }

  private toast(message: string, color = '#ffffff') {
    const text = this.add.text(
      this.cameras.main.scrollX + this.cameras.main.width / 2,
      this.cameras.main.scrollY + 60,
      message,
      {
        fontSize: '14px', color, fontFamily: 'monospace',
        backgroundColor: '#000000cc', padding: { x: 10, y: 6 },
        wordWrap: { width: 400 },
      }
    ).setOrigin(0.5).setDepth(11000).setScrollFactor(0);

    // Fixed position on screen
    text.setPosition(this.cameras.main.width / 2, 60);

    this.tweens.add({
      targets: text,
      alpha: 0,
      y: text.y - 30,
      duration: 2500,
      delay: 1500,
      onComplete: () => text.destroy(),
    });
  }

  private adjustStamina(amount: number) {
    this.player.stamina = clamp(this.player.stamina + amount, 0, this.player.maxStamina);
    this.events.emit(Events.INVENTORY_CHANGE, { inventory: this.player.inventory });
  }

  private updateNPCDepths() {
    for (const [, sprite] of this.npcSprites) {
      sprite.setDepth(ySortDepth(sprite.y));
    }
  }

  // ═══════════════════════════════════════════
  //  SAVE / LOAD
  // ═══════════════════════════════════════════

  private saveGame() {
    const data: CitySaveData = {
      player: { ...this.player },
      calendar: { ...this.calendar },
      relationships: { ...this.relationships },
      jobState: { ...this.jobState },
    };
    try {
      localStorage.setItem(CITY_SAVE_KEY, JSON.stringify(data));
    } catch {
      // Storage might not be available
    }
  }

  private loadGame() {
    try {
      const raw = localStorage.getItem(CITY_SAVE_KEY);
      if (raw) {
        const data: CitySaveData = JSON.parse(raw);
        this.player = data.player;
        this.calendar = data.calendar;
        this.relationships = data.relationships ?? {};
        this.jobState = data.jobState;
        this.dayTimer = this.calendar.timeOfDay * DAY_LENGTH_MS;
        return;
      }
    } catch { /* fall through */ }
    this.initNewGame('Player');
  }

  private initNewGame(name: string) {
    this.isNewGame = true;
    const startPos = gridToWorld(18, 20); // Near apartment

    this.player = {
      name,
      x: startPos.x,
      y: startPos.y,
      direction: Direction.DOWN,
      currentTool: 'hoe' as any,
      stamina: 100,
      maxStamina: 100,
      gold: 500,
      selectedSlot: 0,
      inventory: Array(12).fill(null),
      currentMap: 'farm' as any,
    };

    this.calendar = {
      day: 1,
      season: Season.SPRING,
      year: 1,
      timeOfDay: 0,
      isPaused: false,
    };

    this.jobState = {
      rank: JobRank.INTERN,
      daysWorked: 0,
      streak: 0,
      performanceRating: 50,
      salary: SALARY[JobRank.INTERN],
      workedToday: false,
    };

    this.relationships = {};
    this.dayTimer = 0;
  }
}
