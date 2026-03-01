import Phaser from 'phaser';
import {
  Scenes, Events, TILE_SIZE, SCALE, SCALED_TILE, PLAYER_SPEED,
  FARM_WIDTH, FARM_HEIGHT, Direction, TileType, MapId, Tool,
  PlayerState, CalendarState, FarmTile, ShippingBinState,
  RelationshipState, MineState, AnimalState, HouseState, PlayStats,
  QuestState, SaveData, SAVE_KEY, START_GOLD, MAX_STAMINA,
  INVENTORY_SIZE, HOTBAR_SIZE, Season, Quality, DAY_LENGTH_MS,
  gridToWorld, worldToGrid, facingTile, clamp, ySortDepth, NPCRelation,
  InteractionKind, InventorySlot, ItemCategory
} from '../types';
import { ITEMS, CROPS, RECIPES, FISH, NPCS } from '../data/registry';
import { FishingMinigame } from '../systems/fishing';
import { MiningSystem } from '../systems/mining';
import { ShopSystem } from '../systems/shop';
import { WeatherSystem, WeatherType } from '../systems/weather';
import type { TouchInputState } from '../systems/touchControls';
import { QuestSystem, QuestSystemState } from '../systems/quests';
import { AnimalSystem } from '../systems/animals';
import { RomanceSystem, RomanceState } from '../systems/romance';
import { UpgradeSystem, UpgradeState } from '../systems/upgrades';
import { MachineSystem, MachineState } from '../systems/machines';
import { AchievementSystem, AchievementState } from '../systems/achievements';
import { ForagingSystem, ForagingState } from '../systems/foraging';
import { FestivalSystem } from '../systems/festivals';

interface TutorialAdvancePayload {
  active: boolean;
  step: number;
  text?: string;
  targetTile?: { x: number; y: number };
}

export class PlayScene extends Phaser.Scene {
  // Core state
  player!: PlayerState;
  calendar!: CalendarState;
  farmTiles: FarmTile[] = [];
  shippingBin: ShippingBinState = { items: [] };
  relationships: RelationshipState = {};
  quests: QuestState = { activeQuests: [], completedQuests: [] };
  mine: MineState = { currentFloor: 1, maxFloor: 1, health: 100, maxHealth: 100, elevatorsUnlocked: [1] };
  animalState: AnimalState = { animals: [], coopLevel: 0, barnLevel: 0 };
  house: HouseState = { tier: 0 };
  stats: PlayStats = { cropsHarvested: 0, fishCaught: 0, itemsShipped: 0, giftsGiven: 0, recipesCooked: 0, monstersKilled: 0, goldEarned: 0, daysPlayed: 0 };
  unlockedRecipes: string[] = [];
  toolLevels: { [tool: string]: number } = {};

  // Phaser objects
  playerSprite!: Phaser.GameObjects.Sprite;
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  keys!: { [k: string]: Phaser.Input.Keyboard.Key };
  farmLayer!: Phaser.GameObjects.Container;
  objectLayer!: Phaser.GameObjects.Container;
  npcSprites: Map<string, Phaser.GameObjects.Sprite> = new Map();
  cropSprites: Map<string, Phaser.GameObjects.Sprite> = new Map();
  foragingSprites: Phaser.GameObjects.Sprite[] = [];
  solidTiles: Set<string> = new Set();
  private seasonalTintOverlay?: Phaser.GameObjects.Rectangle;
  private dayNightOverlay?: Phaser.GameObjects.Rectangle;
  private weatherParticleEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;
  fishingMinigame!: FishingMinigame;
  miningSystem!: MiningSystem;
  shopSystem!: ShopSystem;
  weather!: WeatherSystem;
  currentWeather: WeatherType = WeatherType.SUNNY;
  questSystem!: QuestSystem;
  animalSystem!: AnimalSystem;
  romanceSystem!: RomanceSystem;
  upgradeSystem!: UpgradeSystem;
  machineSystem!: MachineSystem;
  achievementSystem!: AchievementSystem;
  foragingSystem!: ForagingSystem;
  festivalSystem!: FestivalSystem;
  private isNewGame = false;
  private tutorialStep: number = 0;
  private tutorialActive: boolean = true;
  private tutorialText?: Phaser.GameObjects.Text;
  private tutorialArrow?: Phaser.GameObjects.Text;
  private proximityPrompt?: Phaser.GameObjects.Text;
  private tutorialStartX = 0;
  private tutorialStartY = 0;

  // Day timer
  dayTimer = 0;
  dayPaused = false;

  constructor() { super(Scenes.PLAY); }

  init(data?: { loadSave?: boolean; playerName?: string }) {
    if (data?.loadSave) {
      this.isNewGame = false;
      this.loadGame();
    } else {
      this.isNewGame = true;
      this.initNewGame();
      if (data?.playerName) this.player.name = data.playerName;
    }
  }

  create() {
    // Launch UI overlay scene in parallel
    this.scene.launch(Scenes.UI, { playScene: this });

    // Create tilemap from farm tiles
    this.createFarmMap();

    // Create player sprite
    this.playerSprite = this.add.sprite(this.player.x, this.player.y, 'player', 0);
    this.playerSprite.setScale(SCALE);
    this.playerSprite.setDepth(ySortDepth(this.player.y));
    this.playerSprite.play('idle_down');
    this.tutorialStartX = this.player.x;
    this.tutorialStartY = this.player.y;

    // Camera follows player
    this.cameras.main.startFollow(this.playerSprite, true, 0.08, 0.08);
    this.cameras.main.setZoom(1);
    this.cameras.main.setBounds(0, 0, FARM_WIDTH * SCALED_TILE, FARM_HEIGHT * SCALED_TILE);

    // Create objects (shipping bin, crafting bench, bed, etc.)
    this.createWorldObjects();
    this.buildCollisionMap();

    // Spawn NPCs
    this.spawnNPCs();

    // Input
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keys = {
      w: this.input.keyboard!.addKey('W'),
      a: this.input.keyboard!.addKey('A'),
      s: this.input.keyboard!.addKey('S'),
      d: this.input.keyboard!.addKey('D'),
      space: this.input.keyboard!.addKey('SPACE'),   // use tool
      e: this.input.keyboard!.addKey('E'),            // interact
      f: this.input.keyboard!.addKey('F'),            // eat/use item
      i: this.input.keyboard!.addKey('I'),            // inventory
      esc: this.input.keyboard!.addKey('ESC'),        // pause
      one: this.input.keyboard!.addKey('ONE'),
      two: this.input.keyboard!.addKey('TWO'),
      three: this.input.keyboard!.addKey('THREE'),
      four: this.input.keyboard!.addKey('FOUR'),
      five: this.input.keyboard!.addKey('FIVE'),
      six: this.input.keyboard!.addKey('SIX'),
      seven: this.input.keyboard!.addKey('SEVEN'),
      eight: this.input.keyboard!.addKey('EIGHT'),
      nine: this.input.keyboard!.addKey('NINE'),
      zero: this.input.keyboard!.addKey('ZERO'),
    };

    this.proximityPrompt = this.add.text(0, 0, '', {
      fontFamily: 'monospace', fontSize: '11px', color: '#ffffff',
      backgroundColor: '#000000aa', padding: { x: 6, y: 3 },
    }).setOrigin(0.5).setDepth(10000).setVisible(false);

    // Event listeners
    this.setupEventListeners();

    this.fishingMinigame = new FishingMinigame(this);
    this.miningSystem = new MiningSystem(this);
    this.shopSystem = new ShopSystem(this);
    this.weather = new WeatherSystem(this);

    // New systems
    if (!this.questSystem) this.questSystem = new QuestSystem(this);
    if (!this.animalSystem) this.animalSystem = new AnimalSystem(this);
    if (!this.romanceSystem) this.romanceSystem = new RomanceSystem(this);
    this.romanceSystem.getState().relationships = this.relationships;
    if (!this.upgradeSystem) this.upgradeSystem = new UpgradeSystem(this);
    if (!this.machineSystem) this.machineSystem = new MachineSystem(this);
    if (!this.achievementSystem) this.achievementSystem = new AchievementSystem(this);
    if (!this.foragingSystem) this.foragingSystem = new ForagingSystem();
    if (!this.festivalSystem) this.festivalSystem = new FestivalSystem(this);

    const shouldRollInitialWeather = this.isNewGame;
    if (shouldRollInitialWeather) {
      this.currentWeather = this.weather.rollDailyWeather(this.calendar.season as any);
    }
    this.currentWeather = this.currentWeather || WeatherType.SUNNY;
    this.weather.renderOverlay(this.currentWeather);
    this.refreshWeatherParticles();
    this.applySeasonalMapTint();
    this.updateDayNightVisual();

    if (this.foragingSystem.getState().items.length === 0) {
      this.foragingSystem.onDayStart(
        this.calendar.season as any,
        FARM_WIDTH, FARM_HEIGHT,
        (x: number, y: number) => {
          const tile = this.getFarmTile(x, y);
          return !tile || tile.type !== TileType.GRASS || !!tile.cropId;
        }
      );
    }
    this.renderForageables();

    // Emit day start
    this.events.emit(Events.DAY_START, {
      day: this.calendar.day,
      season: this.calendar.season,
      year: this.calendar.year
    });
    this.events.emit(Events.TOAST, { message: `Weather: ${this.currentWeather.toUpperCase()}`, color: '#aaccff' });

    // Fade in from intro
    this.cameras.main.fadeIn(1500, 0, 0, 0);

    if (this.isNewGame) this.updateTutorial();
  }

  update(time: number, delta: number) {
    this.handleMovement(delta);
    this.handleToolInput();
    this.handleInteractionInput();
    this.handleHotbarInput();
    const facing = facingTile(this.player.x, this.player.y, this.player.direction);
    const interaction = this.getInteractionAt(facing.x, facing.y);
    if (interaction) {
      const wp = gridToWorld(facing.x, facing.y);
      this.proximityPrompt!.setPosition(wp.x, wp.y - SCALED_TILE);
      const kindLabels: Record<string, string> = {
        [InteractionKind.BED]: 'Press E — Sleep',
        [InteractionKind.SHIPPING_BIN]: 'Press E — Ship Item',
        [InteractionKind.CRAFTING_BENCH]: 'Press E — Craft',
        [InteractionKind.KITCHEN]: 'Press E — Cook',
        [InteractionKind.SHOP]: 'Press E — Shop',
        [InteractionKind.DOOR]: 'Press E — Enter Mine',
        [InteractionKind.QUEST_BOARD]: 'Press E — Quests',
        [InteractionKind.NPC]: 'Press E — Talk',
        [InteractionKind.BLACKSMITH]: 'Press E — Upgrade Tools',
        [InteractionKind.CARPENTER]: 'Press E — Upgrade House',
        [InteractionKind.FORAGEABLE]: 'Press E — Collect',
      };
      this.proximityPrompt!.setText(kindLabels[interaction.kind] || 'Press E');
      this.proximityPrompt!.setVisible(true);
    } else {
      this.proximityPrompt!.setVisible(false);
    }
    this.updateDayTimer(delta);
    this.updateDayNightVisual();
    this.updateCropSprites();
    this.playerSprite.setDepth(ySortDepth(this.player.y));

    if (this.tutorialActive && this.tutorialStep === 0) {
      const dx = this.player.x - this.tutorialStartX;
      const dy = this.player.y - this.tutorialStartY;
      if (Math.sqrt(dx * dx + dy * dy) >= 200) this.advanceTutorial(1);
    }

    // Consume single-fire touch/gamepad flags after all handlers have read them
    const uiScene = this.scene.get(Scenes.UI) as any;
    if (uiScene?.touchControls) {
      uiScene.touchControls.consumeJustPressed();
    }
  }

  private getTouchState(): TouchInputState | null {
    const uiScene = this.scene.get(Scenes.UI) as any;
    return uiScene?.touchControls?.state ?? null;
  }

  // ── Initialization ──

  private initNewGame() {
    const spawn = gridToWorld(20, 12);
    this.player = {
      name: 'Farmer',
      x: spawn.x, y: spawn.y,
      direction: Direction.DOWN,
      currentTool: Tool.HOE,
      stamina: MAX_STAMINA,
      maxStamina: MAX_STAMINA,
      gold: START_GOLD,
      selectedSlot: 0,
      inventory: new Array(INVENTORY_SIZE).fill(null),
      currentMap: MapId.FARM,
    };

    // Give starter loadout
    this.player.inventory[0] = { itemId: 'tool_hoe', qty: 1, quality: Quality.NORMAL };
    this.player.inventory[1] = { itemId: 'parsnip_seeds', qty: 15, quality: Quality.NORMAL };
    this.player.inventory[2] = { itemId: 'tool_watering_can', qty: 1, quality: Quality.NORMAL };
    this.player.inventory[3] = { itemId: 'potato_seeds', qty: 5, quality: Quality.NORMAL };

    this.calendar = { day: 1, season: Season.SPRING, year: 1, timeOfDay: 0, isPaused: false };

    // Designed farm layout — matches composite fence/tree sprites from createWorldObjects
    this.farmTiles = [];
    for (let y = 0; y < FARM_HEIGHT; y++) {
      for (let x = 0; x < FARM_WIDTH; x++) {
        let type = TileType.GRASS;

        // Row 3-5: mine lane approach path
        if (y === 4 && x >= 22 && x <= 35) type = TileType.PATH;
        if (x >= 34 && x <= 36 && y >= 3 && y <= 5) type = TileType.STONE;

        // Row 5-9: house zone (dirt yard) and path toward farm
        if (x >= 17 && x <= 24 && y >= 6 && y <= 9) type = TileType.DIRT;
        if ((x === 19 || x === 20) && y >= 8 && y <= 10) type = TileType.PATH;

        // Fence border tiles (render as dirt under composite fence sprites)
        if ((x >= 10 && x <= 28 && (y === 10 || y === 20)) ||
            (y >= 10 && y <= 20 && (x === 10 || x === 28))) {
          type = TileType.DIRT;
        }
        // Entry gap in north fence
        if (x >= 18 && x <= 20 && y === 10) type = TileType.PATH;

        // Row 11-19: farm interior (dirt with tilled starter plots)
        if (x >= 11 && x <= 27 && y >= 11 && y <= 19) type = TileType.DIRT;

        // Central path through farm
        if ((x === 19 || x === 20) && y >= 10 && y <= 20) type = TileType.PATH;

        // Starter tilled plots (4 plots of 3×3 each)
        if (y >= 12 && y <= 14 && (
          (x >= 12 && x <= 14) ||
          (x >= 16 && x <= 18) ||
          (x >= 21 && x <= 23) ||
          (x >= 25 && x <= 27)
        )) {
          type = TileType.TILLED;
        }

        // Row 20-22: town connector — stone path east-west
        if (y === 21 && x >= 4 && x <= 35) type = TileType.STONE;
        if ((x === 19 || x === 20) && y >= 20 && y <= 24) type = TileType.PATH;
        if (x >= 30 && x <= 33 && y >= 15 && y <= 17) type = TileType.PATH;

        // Row 22-25: town area
        if (y >= 22 && y <= 25 && x >= 8 && x <= 32) type = TileType.GRASS;

        // Row 23-26: pond and shore
        if (x >= 4 && x <= 8 && y >= 19 && y <= 22) type = TileType.WATER;
        if (type !== TileType.WATER && x >= 3 && x <= 9 && y >= 18 && y <= 23) type = TileType.SAND;

        // Beach at bottom-right
        if (y >= 27 && x >= 33) type = TileType.SAND;

        this.farmTiles.push({ x, y, type, watered: false });
      }
    }

    // Init relationships
    for (const npc of NPCS) {
      this.relationships[npc.id] = {
        hearts: 0,
        maxHearts: 8,
        talkedToday: false,
        giftedToday: false,
        giftsThisWeek: 0,
        relation: NPCRelation.STRANGER
      };
    }

    // Init tool levels
    for (const t of Object.values(Tool)) {
      this.toolLevels[t] = 0;
    }

    // Starting recipes
    this.unlockedRecipes = RECIPES.filter(r => !r.isCooking).slice(0, 3).map(r => r.id);
  }

  // ── Movement ──

  private handleMovement(delta: number) {
    let vx = 0, vy = 0;
    const up = this.cursors.up?.isDown || this.keys.w.isDown;
    const down = this.cursors.down?.isDown || this.keys.s.isDown;
    const left = this.cursors.left?.isDown || this.keys.a.isDown;
    const right = this.cursors.right?.isDown || this.keys.d.isDown;

    if (up) { vy = -1; this.player.direction = Direction.UP; }
    if (down) { vy = 1; this.player.direction = Direction.DOWN; }
    if (left) { vx = -1; this.player.direction = Direction.LEFT; }
    if (right) { vx = 1; this.player.direction = Direction.RIGHT; }

    // Touch / gamepad overlay
    const touch = this.getTouchState();
    if (touch && (Math.abs(touch.dx) > 0.1 || Math.abs(touch.dy) > 0.1)) {
      vx = touch.dx;
      vy = touch.dy;
      // Set facing direction from strongest axis
      if (Math.abs(vx) > Math.abs(vy)) {
        this.player.direction = vx < 0 ? Direction.LEFT : Direction.RIGHT;
      } else {
        this.player.direction = vy < 0 ? Direction.UP : Direction.DOWN;
      }
    }

    // Normalize diagonal
    if (vx !== 0 && vy !== 0) {
      vx *= 0.707; vy *= 0.707;
    }

    const speed = PLAYER_SPEED * this.weather.getSpeedModifier(this.currentWeather) * (delta / 1000);
    
    // Collision: check each axis independently for wall sliding
    const halfBody = SCALED_TILE * 0.3; // collision radius
    const newX = this.player.x + vx * speed;
    const newY = this.player.y + vy * speed;
    
    // Check X movement
    const testXtiles = [
      worldToGrid(newX + halfBody, this.player.y + halfBody),
      worldToGrid(newX + halfBody, this.player.y - halfBody),
      worldToGrid(newX - halfBody, this.player.y + halfBody),
      worldToGrid(newX - halfBody, this.player.y - halfBody),
    ];
    const xBlocked = testXtiles.some(t => this.solidTiles.has(`${t.x},${t.y}`));
    if (!xBlocked) this.player.x = newX;
    
    // Check Y movement
    const testYtiles = [
      worldToGrid(this.player.x + halfBody, newY + halfBody),
      worldToGrid(this.player.x + halfBody, newY - halfBody),
      worldToGrid(this.player.x - halfBody, newY + halfBody),
      worldToGrid(this.player.x - halfBody, newY - halfBody),
    ];
    const yBlocked = testYtiles.some(t => this.solidTiles.has(`${t.x},${t.y}`));
    if (!yBlocked) this.player.y = newY;

    // Clamp to map
    this.player.x = clamp(this.player.x, SCALED_TILE / 2, FARM_WIDTH * SCALED_TILE - SCALED_TILE / 2);
    this.player.y = clamp(this.player.y, SCALED_TILE / 2, FARM_HEIGHT * SCALED_TILE - SCALED_TILE / 2);

    // Update sprite
    this.playerSprite.setPosition(this.player.x, this.player.y);

    // Play walk/idle animations
    const moving = vx !== 0 || vy !== 0;
    const animMap: Record<string, { walk: string; idle: string }> = {
      [Direction.DOWN]:  { walk: 'walk_down',  idle: 'idle_down' },
      [Direction.UP]:    { walk: 'walk_up',    idle: 'idle_up' },
      [Direction.LEFT]:  { walk: 'walk_left',  idle: 'idle_left' },
      [Direction.RIGHT]: { walk: 'walk_right', idle: 'idle_right' },
    };
    const anim = animMap[this.player.direction] || animMap[Direction.DOWN];
    const targetAnim = moving ? anim.walk : anim.idle;
    if (this.playerSprite.anims.currentAnim?.key !== targetAnim) {
      this.playerSprite.play(targetAnim);
    }
  }

  // ── Tool Use ──

  private handleToolInput() {
    const touch = this.getTouchState();
    const toolPressed = Phaser.Input.Keyboard.JustDown(this.keys.space) || !!touch?.toolJust;
    if (toolPressed) {
      const slot = this.player.inventory[this.player.selectedSlot];
      const itemDef = slot ? ITEMS.find((item) => item.id === slot.itemId) : undefined;
      if (slot && itemDef && (itemDef.category === 'seed' || itemDef.edible)) {
        this.events.emit(Events.ITEM_USE, { itemId: slot.itemId, slotIndex: this.player.selectedSlot });
        return;
      }

      if (this.player.stamina <= 0) {
        this.events.emit(Events.TOAST, { message: 'Too tired!', color: '#ff4444' });
        return;
      }

      const target = facingTile(this.player.x, this.player.y, this.player.direction);
      const tile = this.getFarmTile(target.x, target.y);
      if (!tile) return;

      this.events.emit(Events.TOOL_USE, {
        tool: this.player.currentTool,
        tileX: target.x,
        tileY: target.y,
        direction: this.player.direction
      });
    }

    // F key = use held item (eat food, plant seed)
    if (Phaser.Input.Keyboard.JustDown(this.keys.f)) {
      const slot = this.player.inventory[this.player.selectedSlot];
      if (slot) {
        this.events.emit(Events.ITEM_USE, { itemId: slot.itemId, slotIndex: this.player.selectedSlot });
      }
    }
  }

  // ── Interaction ──

  private handleInteractionInput() {
    const touch = this.getTouchState();
    const interactPressed = Phaser.Input.Keyboard.JustDown(this.keys.e) || !!touch?.interactJust;
    if (interactPressed) {
      const target = facingTile(this.player.x, this.player.y, this.player.direction);
      const interaction = this.getInteractionAt(target.x, target.y);
      if (interaction) {
        this.events.emit(Events.INTERACT, interaction);
      }
    }

    // I = inventory
    if (Phaser.Input.Keyboard.JustDown(this.keys.i)) {
      this.events.emit(Events.OPEN_INVENTORY);
    }

    // ESC = pause
    if (Phaser.Input.Keyboard.JustDown(this.keys.esc)) {
      this.events.emit(Events.OPEN_PAUSE);
    }
  }

  // ── Hotbar ──

  private handleHotbarInput() {
    const numKeys = [this.keys.one, this.keys.two, this.keys.three, this.keys.four,
      this.keys.five, this.keys.six, this.keys.seven, this.keys.eight,
      this.keys.nine, this.keys.zero];
    for (let i = 0; i < numKeys.length; i++) {
      if (Phaser.Input.Keyboard.JustDown(numKeys[i])) {
        this.player.selectedSlot = i;
        // Check if selected item is a tool
        const slot = this.player.inventory[i];
        if (slot) {
          const item = ITEMS.find(it => it.id === slot.itemId);
          if (item?.category === 'tool') {
            const toolMap: { [k: string]: Tool } = {
              'tool_hoe': Tool.HOE, 'tool_watering_can': Tool.WATERING_CAN,
              'tool_axe': Tool.AXE, 'tool_pickaxe': Tool.PICKAXE,
              'tool_fishing_rod': Tool.FISHING_ROD, 'tool_scythe': Tool.SCYTHE,
            };
            if (toolMap[slot.itemId]) this.player.currentTool = toolMap[slot.itemId];
          }
        }
        this.events.emit(Events.INVENTORY_CHANGE, { inventory: this.player.inventory });
      }
    }
  }

  // ── Day Timer ──

  private updateDayTimer(delta: number) {
    if (this.calendar.isPaused || this.dayPaused) return;

    this.dayTimer += delta;
    this.calendar.timeOfDay = clamp(this.dayTimer / DAY_LENGTH_MS, 0, 1);

    this.events.emit(Events.TIME_TICK, { timeOfDay: this.calendar.timeOfDay });

    // Day tint
    const t = this.calendar.timeOfDay;
    let tint = 0xffffff;
    if (t < 0.1) tint = 0xffd4a0;       // morning golden
    else if (t > 0.7) tint = 0x6677aa;   // evening blue
    else if (t > 0.85) tint = 0x334466;  // night
    this.cameras.main.setBackgroundColor(tint);

    if (this.dayTimer >= DAY_LENGTH_MS) {
      this.endDay();
    }
  }

  private endDay() {
    this.dayTimer = 0;
    this.calendar.timeOfDay = 0;

    // Ship items
    let shipRevenue = 0;
    for (const item of this.shippingBin.items) {
      const def = ITEMS.find(i => i.id === item.itemId);
      if (def) {
        const qualityMult = item.quality === Quality.GOLD ? 1.5 : item.quality === Quality.SILVER ? 1.25 : 1;
        shipRevenue += Math.floor(def.sellPrice * item.qty * qualityMult);
        this.stats.itemsShipped += item.qty;
      }
    }
    if (shipRevenue > 0) {
      this.player.gold += shipRevenue;
      this.stats.goldEarned += shipRevenue;
      this.events.emit(Events.GOLD_CHANGE, { amount: shipRevenue, newTotal: this.player.gold });
      this.events.emit(Events.TOAST, { message: `Shipped items for ${shipRevenue}g!`, color: '#ffdd44' });
    }
    this.shippingBin.items = [];

    this.events.emit(Events.DAY_END, {
      day: this.calendar.day,
      season: this.calendar.season,
      year: this.calendar.year,
    });

    // Advance day
    this.calendar.day++;
    this.stats.daysPlayed++;

    if (this.calendar.day > 28) {
      this.calendar.day = 1;
      const seasons = [Season.SPRING, Season.SUMMER, Season.FALL, Season.WINTER];
      const idx = seasons.indexOf(this.calendar.season);
      const oldSeason = this.calendar.season;
      if (idx >= 3) {
        this.calendar.season = Season.SPRING;
        this.calendar.year++;
      } else {
        this.calendar.season = seasons[idx + 1];
      }
      this.events.emit(Events.SEASON_CHANGE, { oldSeason, newSeason: this.calendar.season, year: this.calendar.year });
    }

    if (this.weather.getCropGrowthBonus(this.currentWeather)) {
      this.farmTiles.forEach((t) => { if (t.cropId) t.watered = true; });
    }

    // Grow crops, reset watered
    this.growCrops();

    // Reset NPC daily flags
    for (const npcId of Object.keys(this.relationships)) {
      this.relationships[npcId].talkedToday = false;
      this.relationships[npcId].giftedToday = false;
    }

    // Restore stamina
    this.player.stamina = this.player.maxStamina;

    // Auto save
    // Daily system ticks
    this.animalSystem.onDayStart();
    this.romanceSystem.onDayStart();
    this.machineSystem.onDayStart();
    this.foragingSystem.onDayStart(
      this.calendar.season as any,
      40, 30,  // FARM_WIDTH, FARM_HEIGHT
      (x: number, y: number) => {
        const tile = this.getFarmTile(x, y);
        return !tile || tile.type !== 0 || !!tile.cropId;
      }
    );
    this.renderForageables();
    this.festivalSystem.onDayStart(this.calendar.day, this.calendar.season as any);
    const festival = (this.festivalSystem as any).getTodaysFestival?.(this.calendar.season, this.calendar.day);
    if (festival) {
      this.events.emit(Events.TOAST, {
        message: `🎉 Today: ${festival.name}! Visit the town square.`,
        color: '#ffaa44',
        duration: 5000
      });
    }
    this.upgradeSystem.checkPendingUpgrade(this.calendar.day, this.calendar.season, this.calendar.year);
    const houseTierUp = this.upgradeSystem.checkHouseUpgrade(this.calendar.day, this.calendar.season, this.calendar.year);
    if (houseTierUp) {
      this.house.tier++;
      this.events.emit(Events.BUILDING_UPGRADE, { buildingType: 'house', newLevel: this.house.tier });
      this.events.emit(Events.TOAST, { message: 'Your house has been upgraded!', color: '#ffdd44' });
    }
    this.achievementSystem.checkStats(this.stats);
    this.achievementSystem.checkYear(this.calendar.year);

    // Auto-water sprinkler tiles
    const sprinklerTiles = this.machineSystem.getSprinklerTiles();
    for (const st of sprinklerTiles) {
      const tile = this.getFarmTile(st.x, st.y);
      if (tile && (tile.type === 2 || tile.type === 3)) { // TILLED or WATERED
        tile.type = 3; // WATERED
        tile.watered = true;
      }
    }

    // Weekly reset
    if (this.calendar.day % 7 === 0) {
      this.romanceSystem.onWeekStart();
    }

    this.saveGame();

    const newWeather = this.weather.rollDailyWeather(this.calendar.season as any);
    this.currentWeather = newWeather;
    this.weather.renderOverlay(newWeather);

    this.events.emit(Events.DAY_START, {
      day: this.calendar.day,
      season: this.calendar.season,
      year: this.calendar.year,
    });
    this.events.emit(Events.TOAST, { message: `Weather: ${this.currentWeather.toUpperCase()}`, color: '#aaccff' });
  }

  // ── Crop Growth ──

  private growCrops() {
    for (const tile of this.farmTiles) {
      if (tile.cropId && tile.watered) {
        const cropDef = CROPS.find(c => c.id === tile.cropId);
        if (cropDef) {
          tile.growthDay = (tile.growthDay ?? 0) + 1;
          const stageLen = Math.ceil(cropDef.growthDays / cropDef.growthStages);
          tile.cropStage = Math.min(
            cropDef.growthStages - 1,
            Math.floor((tile.growthDay ?? 0) / stageLen)
          );
        }
      }
      tile.watered = !!tile.hasSprinkler;
    }
  }

  // ── Event Listeners ──

  private setupEventListeners() {
    // Tool use handling
    this.events.on(Events.TOOL_USE, (data: { tool: Tool; tileX: number; tileY: number }) => {
      const tile = this.getFarmTile(data.tileX, data.tileY);
      if (!tile) return;

      switch (data.tool) {
        case Tool.HOE:
          if (tile.type === TileType.GRASS || tile.type === TileType.DIRT) {
            tile.type = TileType.TILLED;
            this.player.stamina -= 2;
            this.events.emit(Events.SOIL_TILLED, { x: data.tileX, y: data.tileY });
            this.refreshTileSprite(tile);
          }
          break;
        case Tool.WATERING_CAN:
          if (tile.type === TileType.TILLED || tile.type === TileType.WATERED) {
            tile.type = TileType.WATERED;
            tile.watered = true;
            this.player.stamina -= 1;
            this.events.emit(Events.CROP_WATERED, { x: data.tileX, y: data.tileY });
            this.refreshTileSprite(tile);
          }
          break;
        case Tool.AXE:
          if (tile.type === TileType.WOOD) {
            tile.type = TileType.GRASS;
            this.player.stamina -= 3;
            this.addToInventory('wood', 2);
            this.refreshTileSprite(tile);
          }
          break;
        case Tool.PICKAXE:
          if (tile.type === TileType.STONE) {
            tile.type = TileType.GRASS;
            this.player.stamina -= 3;
            this.addToInventory('stone', 2);
            this.refreshTileSprite(tile);
          }
          break;
        case Tool.SCYTHE:
          if (tile.cropId) {
            const cropDef = CROPS.find(c => c.id === tile.cropId);
            if (cropDef && tile.cropStage !== undefined && tile.cropStage >= cropDef.growthStages - 1) {
              // Harvest!
              const quality = Math.random() < 0.1 ? Quality.GOLD : Math.random() < 0.3 ? Quality.SILVER : Quality.NORMAL;
              const qty = 1;
              this.addToInventory(cropDef.harvestId, qty, quality);
              this.stats.cropsHarvested += qty;
              this.events.emit(Events.CROP_HARVESTED, { cropId: cropDef.id, qty, quality });
              this.events.emit(Events.STAT_INCREMENT, { stat: 'cropsHarvested', amount: qty });

              if (cropDef.regrows) {
                tile.cropStage = cropDef.growthStages - 3;
                tile.growthDay = Math.max(0, (tile.growthDay ?? 0) - (cropDef.regrowDays ?? 3));
              } else {
                tile.cropId = undefined;
                tile.cropStage = undefined;
                tile.growthDay = undefined;
                tile.type = TileType.TILLED;
              }
              this.player.stamina -= 1;
              this.refreshTileSprite(tile);
            }
          }
          break;
        case Tool.FISHING_ROD: {
          // Launch standalone FishingScene
          const timeOfDay = this.calendar.timeOfDay < 0.25 ? 'morning' : this.calendar.timeOfDay < 0.5 ? 'afternoon' : this.calendar.timeOfDay < 0.75 ? 'evening' : 'night';
          this.scene.pause(Scenes.PLAY);
          this.scene.launch('FishingScene', {
            playScene: this,
            mapId: 'farm' as any,
            timeOfDay: timeOfDay as any,
            season: this.calendar.season as any,
          });
          break;
        }
      }

      const slotIndex = this.player.selectedSlot;
      const slot = this.player.inventory[slotIndex];
      const itemDef = slot ? ITEMS.find(item => item.id === slot.itemId) : undefined;
      if (slot && itemDef && (itemDef.category === ItemCategory.MACHINE || String(itemDef.category).toUpperCase() === 'MACHINE')) {
        const machineType = slot.itemId as MachineState['placed'][number]['type'];
        const placedMachine = this.machineSystem.placeMachine?.(machineType, data.tileX, data.tileY) ?? null;
        if (placedMachine) {
          this.removeFromSlot(slotIndex, 1);
          this.events.emit(Events.TOAST, { message: `Placed ${itemDef.name}!`, color: '#44ffaa' });

          const machinePos = gridToWorld(data.tileX, data.tileY);
          const machineSprite = this.add.sprite(machinePos.x, machinePos.y, 'items', itemDef.spriteIndex ?? 0);
          machineSprite.setScale(SCALE);
          machineSprite.setDepth(ySortDepth(machinePos.y));
          machineSprite.setData('interaction', {
            kind: InteractionKind.MACHINE,
            targetId: placedMachine.id,
            x: data.tileX,
            y: data.tileY
          });
          this.objectLayer.add(machineSprite);
        } else {
          this.events.emit(Events.TOAST, { message: 'Cannot place machine here.', color: '#ff4444' });
        }
      }
    });

    // Item use (eat food, plant seeds)
    this.events.on(Events.ITEM_USE, (data: { itemId: string; slotIndex: number }) => {
      const itemDef = ITEMS.find(i => i.id === data.itemId);
      if (!itemDef) return;

      // Eat food
      if (itemDef.edible && itemDef.staminaRestore) {
        this.player.stamina = clamp(this.player.stamina + itemDef.staminaRestore, 0, this.player.maxStamina);
        this.removeFromSlot(data.slotIndex, 1);
        this.events.emit(Events.TOAST, { message: `Ate ${itemDef.name}! +${itemDef.staminaRestore} stamina`, color: '#44ff44' });
        return;
      }

      // Plant seed
      if (itemDef.category === 'seed') {
        const target = facingTile(this.player.x, this.player.y, this.player.direction);
        const tile = this.getFarmTile(target.x, target.y);
        if (tile && (tile.type === TileType.TILLED || tile.type === TileType.WATERED) && !tile.cropId) {
          const cropDef = CROPS.find(c => c.seedId === data.itemId);
          if (cropDef && cropDef.seasons.includes(this.calendar.season)) {
            tile.cropId = cropDef.id;
            tile.cropStage = 0;
            tile.growthDay = 0;
            this.removeFromSlot(data.slotIndex, 1);
            this.events.emit(Events.CROP_PLANTED, { x: target.x, y: target.y, cropId: cropDef.id });
            this.refreshTileSprite(tile);
          } else {
            this.events.emit(Events.TOAST, { message: 'Wrong season for this crop!', color: '#ff4444' });
          }
        }
      }
    });

    // Interact handler
    this.events.on(Events.INTERACT, (data: { kind: InteractionKind; targetId?: string; x: number; y: number }) => {
      switch (data.kind) {
        case InteractionKind.SHIPPING_BIN: {
          const slot = this.player.inventory[this.player.selectedSlot];
          if (slot) {
            const itemDef = ITEMS.find(i => i.id === slot.itemId);
            if (itemDef && itemDef.sellPrice > 0) {
              this.shippingBin.items.push({ itemId: slot.itemId, qty: 1, quality: slot.quality });
              this.removeFromSlot(this.player.selectedSlot, 1);
              this.events.emit(Events.ITEM_SHIPPED, { itemId: slot.itemId, qty: 1, quality: slot.quality });
              this.events.emit(Events.TOAST, { message: `Added ${itemDef.name} to shipping bin`, color: '#ffdd44' });
            }
          }
          if (this.tutorialActive && this.tutorialStep === 4) this.advanceTutorial(5);
          break;
        }
        case InteractionKind.CRAFTING_BENCH:
          this.events.emit(Events.OPEN_CRAFTING, { cooking: false });
          break;
        case InteractionKind.KITCHEN:
          if (this.house.tier >= 1) {
            this.events.emit(Events.OPEN_CRAFTING, { cooking: true });
          } else {
            this.events.emit(Events.TOAST, { message: 'Upgrade your house first!', color: '#ff4444' });
          }
          break;
        case InteractionKind.BED:
          if (this.tutorialActive && this.tutorialStep === 5) this.advanceTutorial(6);
          this.endDay();
          break;
        case InteractionKind.NPC: {
          if (data.targetId) {
            this.handleNPCInteraction(data.targetId);
          }
          break;
        }
        case InteractionKind.SHOP:
          // UI listens directly to INTERACT(kind=SHOP); no PlayScene-side action needed here.
          break;
        case InteractionKind.DOOR:
          // Mine entrance — launch the standalone MineScene
          this.events.emit(Events.TOAST, { message: 'Entering the mines...', color: '#aaccff' });
          this.scene.pause(Scenes.PLAY);
          this.scene.launch('MineScene', { playScene: this, floor: this.mine.currentFloor || 1 });
          break;
        case InteractionKind.QUEST_BOARD: {
          const available = this.questSystem.getAvailableQuests(this.calendar.season);
          const active = this.questSystem.getActiveQuests();
          
          // First priority: turn in any completed quest
          const completed = active.filter(q => q.completed);
          if (completed.length > 0) {
            for (const q of completed) {
              const reward = this.questSystem.turnInQuest(q.def.id);
              if (reward) {
                this.player.gold += reward.gold;
                this.events.emit(Events.GOLD_CHANGE, { amount: reward.gold, newTotal: this.player.gold });
                if (reward.itemId) this.addToInventory(reward.itemId, reward.itemQty ?? 1);
                this.events.emit(Events.TOAST, { message: `✓ ${q.def.name} +${reward.gold}g`, color: '#ffdd44' });
              }
            }
            break;
          }
          
          // Second: show progress on active quests
          const inProgress = active.filter(q => !q.completed);
          if (inProgress.length > 0) {
            const lines = inProgress.map(q => `${q.def.name}: ${q.progress}/${q.def.targetQty}`).join(' | ');
            this.events.emit(Events.TOAST, { message: lines, color: '#aaccff' });
            // Also accept a new quest if there's room
            if (inProgress.length < 3 && available.length > 0) {
              const quest = available[0];
              this.questSystem.acceptQuest(quest.id);
              this.events.emit(Events.TOAST, { message: `New quest: ${quest.name}`, color: '#88ff44' });
            }
            break;
          }
          
          // Third: accept new quests (up to 3)
          if (available.length > 0) {
            const toAccept = available.slice(0, 3);
            for (const quest of toAccept) {
              this.questSystem.acceptQuest(quest.id);
            }
            const names = toAccept.map(q => q.name).join(', ');
            this.events.emit(Events.TOAST, { message: `Accepted: ${names}`, color: '#88ff44' });
          } else {
            this.events.emit(Events.TOAST, { message: 'No quests available right now.', color: '#ffaa44' });
          }
          break;
        }

        case InteractionKind.BLACKSMITH: {
          const activeSlot = (this.player as any).activeSlot ?? this.player.selectedSlot;
          const equipped = this.player.inventory[activeSlot];
          if (!equipped) {
            this.events.emit(Events.TOAST, { message: 'Equip a tool to upgrade it.', color: '#ffaa44' });
            break;
          }

          const toolByItemId: Record<string, Tool> = {
            tool_hoe: Tool.HOE,
            tool_watering_can: Tool.WATERING_CAN,
            tool_axe: Tool.AXE,
            tool_pickaxe: Tool.PICKAXE,
            tool_fishing_rod: Tool.FISHING_ROD,
            tool_scythe: Tool.SCYTHE,
          };
          const tool = toolByItemId[equipped.itemId];
          if (!tool) {
            this.events.emit(Events.TOAST, { message: 'Equip a tool to upgrade it.', color: '#ffaa44' });
            break;
          }

          const info = this.upgradeSystem.getToolUpgradeInfo(tool);
          if (!info) {
            this.events.emit(Events.TOAST, { message: 'Tool is already max level!', color: '#aaaaaa' });
            break;
          }
          if (this.player.gold < info.cost) {
            this.events.emit(Events.TOAST, { message: 'Not enough gold', color: '#ff4444' });
            break;
          }
          if (this.countItem(info.materialId) < info.materialQty) {
            this.events.emit(Events.TOAST, {
              message: `Need ${info.materialQty}x ${info.materialId.replace(/_/g, ' ')}`,
              color: '#ff4444'
            });
            break;
          }

          const started = this.upgradeSystem.startToolUpgrade(
            tool,
            this.player.gold,
            (id, qty) => this.countItem(id) >= qty
          );
          if (!started) {
            this.events.emit(Events.TOAST, { message: 'Unable to start tool upgrade.', color: '#ff4444' });
            break;
          }
          this.player.gold -= started.cost;
          this.removeItem(started.materialId, started.materialQty);
          this.events.emit(Events.GOLD_CHANGE, { amount: -started.cost, newTotal: this.player.gold });
          const pending = this.upgradeSystem.getState().pendingUpgrade;
          if (pending) {
            const ready = this.getFutureDate(started.daysToComplete);
            pending.readyDay = ready.day;
            pending.readySeason = ready.season;
            pending.readyYear = ready.year;
          }
          this.events.emit(Events.TOAST, { message: `${tool} upgrade started!`, color: '#44ffaa' });
          break;
        }

        case InteractionKind.CARPENTER: {
          const nextUpgrade = this.upgradeSystem.getNextHouseUpgrade(this.house.tier);
          if (!nextUpgrade) {
            this.events.emit(Events.TOAST, { message: 'House is fully upgraded!', color: '#aaaaaa' });
            break;
          }
          if (this.player.gold < nextUpgrade.cost) {
            this.events.emit(Events.TOAST, { message: 'Not enough gold', color: '#ff4444' });
            break;
          }
          if (this.countItem(nextUpgrade.materialId) < nextUpgrade.materialQty) {
            this.events.emit(Events.TOAST, {
              message: `Need ${nextUpgrade.materialQty}x ${nextUpgrade.materialId.replace(/_/g, ' ')}`,
              color: '#ff4444'
            });
            break;
          }
          this.player.gold -= nextUpgrade.cost;
          this.removeItem(nextUpgrade.materialId, nextUpgrade.materialQty);
          this.events.emit(Events.GOLD_CHANGE, { amount: -nextUpgrade.cost, newTotal: this.player.gold });
          this.house.tier += 1;
          this.events.emit(Events.BUILDING_UPGRADE, { buildingType: 'house', newLevel: this.house.tier });
          this.events.emit(Events.TOAST, { message: `${nextUpgrade.name} complete!`, color: '#44ffaa' });
          break;
        }

        case InteractionKind.CHEST: {
          // Simple chest: store current held item
          const slotIndex = (this.player as any).hotbarIndex ?? this.player.selectedSlot;
          const slot = this.player.inventory[slotIndex];
          if (slot && slot.qty > 0) {
            this.events.emit(Events.TOAST, { message: `Stored ${slot.qty}x ${slot.itemId} in chest.`, color: '#aaddff' });
            this.player.inventory[slotIndex] = null;
            this.events.emit(Events.INVENTORY_CHANGE, { inventory: this.player.inventory });
          } else {
            this.events.emit(Events.TOAST, { message: 'Chest is empty. Hold an item to store it.', color: '#aaddff' });
          }
          break;
        }

        case InteractionKind.FORAGEABLE: {
          let forageId = data.targetId;
          if (!forageId) {
            const fallback = this.foragingSystem.getAt(data.x, data.y);
            forageId = fallback?.id;
          }
          if (!forageId) break;

          const target = this.foragingSystem.getState().items.find((i) => i.id === forageId);
          if (!target) break;

          const foraged = this.foragingSystem.collect(target.tileX, target.tileY);
          if (!foraged) break;

          const added = this.addToInventory(foraged, 1);
          if (!added) {
            this.events.emit(Events.TOAST, { message: 'Inventory full!', color: '#ff4444' });
            break;
          }

          const spr = this.foragingSprites.find(s => {
            const d = s.getData('interaction');
            return d?.data?.id === forageId;
          });
          if (spr) {
            spr.destroy();
            this.foragingSprites = this.foragingSprites.filter(s => s !== spr);
          }

          const itemDef = ITEMS.find((i) => i.id === foraged);
          const itemName = itemDef?.name ?? foraged.replace(/_/g, ' ');
          this.events.emit(Events.TOAST, { message: `Found ${itemName}!`, color: '#88ff44' });
          break;
        }

        case InteractionKind.ANIMAL: {
          // Show animal menu — simplified: auto-collect products + pet/feed all
          const animals = this.animalSystem.getState().animals;
          if (animals.length === 0) {
            // No animals — offer to buy
            if (this.player.gold >= 800) {
              const purchase = this.animalSystem.purchaseAnimal('chicken', 'Hen', this.player.gold);
              if (purchase) {
                this.player.gold -= purchase.cost;
                this.events.emit(Events.TOAST, { message: `Bought a chicken! (${purchase.cost}g)`, color: '#ffdd44' });
                this.events.emit(Events.GOLD_CHANGE, { amount: -purchase.cost, newTotal: this.player.gold });
              } else {
                this.events.emit(Events.TOAST, { message: 'Unable to buy a chicken right now.', color: '#ff8844' });
              }
            } else {
              this.events.emit(Events.TOAST, { message: 'Buy a chicken: 800g (not enough gold)', color: '#ff8844' });
            }
            break;
          }

          // Feed + pet + collect from all animals
          let collected = 0;
          for (const animal of animals) {
            this.animalSystem.feedAnimal(animal.id);
            this.animalSystem.petAnimal(animal.id);
            const product = this.animalSystem.collectProduct(animal.id);
            if (product) {
              const added = this.addToInventory(product.itemId, 1, product.quality);
              if (added) collected++;
            }
          }

          if (collected > 0) {
            this.events.emit(Events.TOAST, { message: `Collected ${collected} product(s)!`, color: '#88ff44' });
          } else {
            this.events.emit(Events.TOAST, { message: `Petted ${animals.length} animal(s). No products ready.`, color: '#aaddff' });
          }
          break;
        }
      }
    });

    // Crafting
    this.events.on(Events.CRAFT_ITEM, (data: { recipeId: string }) => {
      const recipe = RECIPES.find(r => r.id === data.recipeId);
      if (!recipe) return;
      // Check ingredients
      const canCraft = recipe.ingredients.every(ing => {
        return this.countItem(ing.itemId) >= ing.qty;
      });
      if (!canCraft) {
        this.events.emit(Events.TOAST, { message: 'Missing ingredients!', color: '#ff4444' });
        return;
      }
      // Consume ingredients
      for (const ing of recipe.ingredients) {
        this.removeItem(ing.itemId, ing.qty);
      }
      // Add result
      this.addToInventory(recipe.resultId, recipe.resultQty);
      this.stats.recipesCooked += recipe.isCooking ? 1 : 0;
      this.events.emit(Events.TOAST, { message: `Crafted ${recipe.name}!`, color: '#44ffaa' });
    });

    // Gift giving
    this.events.on(Events.GIFT_GIVEN, (data: { npcId: string; itemId: string }) => {
      const rel = this.relationships[data.npcId];
      const npcDef = NPCS.find(n => n.id === data.npcId);
      if (!rel || !npcDef) return;
      if (rel.giftedToday) {
        this.events.emit(Events.TOAST, { message: 'Already gave a gift today.', color: '#aaaaaa' });
        return;
      }
      let points = 20; // neutral
      let reaction = 'neutral';
      if (npcDef.lovedItems.includes(data.itemId)) { points = 80; reaction = 'love'; }
      else if (npcDef.likedItems.includes(data.itemId)) { points = 45; reaction = 'like'; }
      else if (npcDef.hatedItems.includes(data.itemId)) { points = -40; reaction = 'hate'; }

      rel.hearts = clamp(rel.hearts + points, 0, 1000);
      rel.giftedToday = true;
      this.stats.giftsGiven++;
      this.events.emit(Events.RELATIONSHIP_UP, { npcId: data.npcId, newHearts: rel.hearts });
      this.events.emit(Events.TOAST, { message: `${npcDef.name} ${reaction}d the gift!`, color: reaction === 'hate' ? '#ff4444' : '#ff88cc' });
    });

    this.events.on(Events.FISH_CAUGHT, (data: { fishId: string; quality: Quality }) => {
      const added = this.addToInventory(data.fishId, 1, data.quality);
      if (!added) return;
      this.stats.fishCaught += 1;
      this.events.emit(Events.STAT_INCREMENT, { stat: 'fishCaught', amount: 1 });
    });

    this.events.on(Events.SHOP_BUY, (data: { itemId: string; qty: number; cost: number }) => {
      if (data.cost > this.player.gold) {
        this.events.emit(Events.TOAST, { message: 'Not enough gold!', color: '#ff4444' });
        return;
      }

      const added = this.addToInventory(data.itemId, data.qty);
      if (!added) return;
      this.player.gold -= data.cost;
      this.events.emit(Events.GOLD_CHANGE, { amount: -data.cost, newTotal: this.player.gold });
    });

    this.events.on(Events.SHOP_SELL, (data: { itemId: string; qty: number; revenue: number }) => {
      if (this.countItem(data.itemId) < data.qty) return;
      this.removeItem(data.itemId, data.qty);
      this.player.gold += data.revenue;
      this.stats.goldEarned += data.revenue;
      this.events.emit(Events.GOLD_CHANGE, { amount: data.revenue, newTotal: this.player.gold });
    });
  }

  // ── NPC Interaction ──

  private handleNPCInteraction(npcId: string) {
    const npcDef = NPCS.find(n => n.id === npcId);
    const rel = this.relationships[npcId];
    if (!npcDef || !rel) return;

    // Check if player has giftable item selected
    const slot = this.player.inventory[this.player.selectedSlot];
    if (slot && slot.qty > 0) {
      const itemDef = ITEMS.find(i => i.id === slot.itemId);
      if (itemDef && itemDef.category !== 'tool') {
        // Gift it
        this.events.emit(Events.GIFT_GIVEN, { npcId, itemId: slot.itemId });
        this.removeFromSlot(this.player.selectedSlot, 1);
        return;
      }
    }

    // Otherwise dialogue
    if (!rel.talkedToday) {
      rel.hearts = clamp(rel.hearts + 10, 0, 1000);
      rel.talkedToday = true;
    }
    const heartBracket = Math.min(Math.floor(rel.hearts / 200), 4).toString();
    const pool = npcDef.dialoguePool[heartBracket] ?? npcDef.dialoguePool['0'] ?? ['...'];
    const line = pool[Math.floor(Math.random() * pool.length)];
    this.events.emit(Events.DIALOGUE_START, { npcId, text: line, portraitIndex: npcDef.portraitIndex });
    this.events.emit(Events.TOAST, { message: `${npcDef.name}: "${line}"`, duration: 3000 });
  }

  // ── World Creation ──

  private createFarmMap() {
    this.farmLayer = this.add.container(0, 0);
    for (const tile of this.farmTiles) {
      const pos = gridToWorld(tile.x, tile.y);
      const spr = this.add.sprite(pos.x, pos.y, 'terrain', tile.type);
      spr.setScale(SCALE);
      spr.setData('tileRef', tile);
      this.farmLayer.add(spr);
    }
  }

  private createWorldObjects() {
    this.objectLayer = this.add.container(0, 0);
  
    // House using composite texture
    const housePos = gridToWorld(20, 7);
    const house = this.add.sprite(housePos.x, housePos.y - SCALED_TILE * 0.5, 'house');
    house.setScale(SCALE * 1.8);
    house.setDepth(ySortDepth(housePos.y) - 1);
    this.objectLayer.add(house);
    this.addLabel(20, 5, 'Home');
  
    // Trees around map edges using composite texture
    const treePositions = [
      // Top edge
      [2, 1], [5, 0], [8, 1], [12, 0], [15, 1], [33, 0], [36, 1], [38, 0],
      // Bottom edge
      [2, 28], [6, 29], [10, 28], [14, 29], [33, 28], [36, 29], [38, 28],
      // Left edge
      [0, 5], [1, 10], [0, 16], [1, 22],
      // Right edge
      [39, 5], [38, 12], [39, 18], [38, 24],
      // Scattered decorative
      [5, 5], [7, 3], [34, 6], [36, 10],
    ];
    for (const [tx, ty] of treePositions) {
      const tPos = gridToWorld(tx, ty);
      const tree = this.add.sprite(tPos.x, tPos.y - SCALED_TILE * 0.6, 'tree');
      tree.setScale(SCALE * 0.8);
      tree.setDepth(ySortDepth(tPos.y));
      this.objectLayer.add(tree);
    }
  
    // Fence border around farm plot using composite texture
    // Farm area: roughly tiles 10-28, 10-20
    for (let fx = 10; fx <= 28; fx++) {
      for (const fy of [10, 20]) {
        if (fx >= 18 && fx <= 20 && fy === 10) continue; // gap for entry
        const fPos = gridToWorld(fx, fy);
        const fence = this.add.sprite(fPos.x, fPos.y, 'fence');
        fence.setScale(SCALE);
        fence.setDepth(ySortDepth(fPos.y));
        this.objectLayer.add(fence);
      }
    }
    for (let fy = 11; fy <= 19; fy++) {
      for (const fx of [10, 28]) {
        const fPos = gridToWorld(fx, fy);
        const fence = this.add.sprite(fPos.x, fPos.y, 'fence');
        fence.setScale(SCALE);
        fence.setDepth(ySortDepth(fPos.y));
        this.objectLayer.add(fence);
      }
    }
  
    // Farm plot label
    const farmCenter = gridToWorld(19, 15);
    this.add.text(farmCenter.x, farmCenter.y - SCALED_TILE, '🌱 Farm Plot', {
      fontSize: '12px', color: '#a8d5a3', fontFamily: 'monospace',
      backgroundColor: '#00000066', padding: { x: 4, y: 2 },
    }).setOrigin(0.5).setDepth(500);
  
    // Interactable objects with labels
    this.createInteractable(22, 8, 2, InteractionKind.BED);
    this.createInteractable(18, 8, 3, InteractionKind.KITCHEN);
    this.createInteractable(12, 16, 1, InteractionKind.CRAFTING_BENCH);
    this.createInteractable(27, 12, 0, InteractionKind.SHIPPING_BIN);
    this.createInteractable(28, 23, 4, InteractionKind.SHOP);
    this.createInteractable(35, 4, 5, InteractionKind.DOOR);
    this.createInteractable(15, 23, 6, InteractionKind.QUEST_BOARD);
    this.createInteractable(17, 22, 7, InteractionKind.BLACKSMITH);
    this.createInteractable(10, 23, 7, InteractionKind.CARPENTER);
    this.createInteractable(28, 10, 'Coop', InteractionKind.ANIMAL);
    this.createInteractable(32, 10, 'Barn', InteractionKind.ANIMAL);
  
    this.addLabel(27, 12, 'Shipping Bin');
    this.addLabel(12, 16, 'Crafting Bench');
    this.addLabel(22, 8, 'Bed');
    this.addLabel(18, 8, 'Kitchen');
    this.addLabel(28, 23, 'Shop');
    this.addLabel(35, 4, 'Mine Entrance');
    this.addLabel(15, 23, 'Quest Board');
    this.addLabel(17, 22, 'Owen\'s Forge');
    this.addLabel(10, 23, 'Carpenter');
    this.addLabel(28, 10, 'Coop');
    this.addLabel(32, 10, 'Barn');
    this.addLabel(6, 18, 'Fishing Pond');
  }

  private buildCollisionMap() {
    this.solidTiles.clear();
    const mark = (x: number, y: number) => this.solidTiles.add(`${x},${y}`);
    
    // Water tiles
    for (const tile of this.farmTiles) {
      if (tile.type === TileType.WATER) mark(tile.x, tile.y);
    }
    
    // House — block roof and upper walls, leave interior walkable for bed/kitchen
    for (let x = 18; x <= 22; x++) {
      for (let y = 4; y <= 6; y++) {
        mark(x, y);
      }
    }
    mark(17, 7); mark(17, 8); // left wall
    mark(23, 7); mark(23, 8); // right wall
    
    // Trees
    const treePositions = [
      [2, 1], [5, 0], [8, 1], [12, 0], [15, 1], [33, 0], [36, 1], [38, 0],
      [2, 28], [6, 29], [10, 28], [14, 29], [33, 28], [36, 29], [38, 28],
      [0, 5], [1, 10], [0, 16], [1, 22],
      [39, 5], [38, 12], [39, 18], [38, 24],
      [5, 5], [7, 3], [34, 6], [36, 10],
    ];
    for (const [tx, ty] of treePositions) {
      mark(tx, ty);
    }
    
    // Map border
    for (let x = -1; x <= FARM_WIDTH; x++) {
      mark(x, -1);
      mark(x, FARM_HEIGHT);
    }
    for (let y = -1; y <= FARM_HEIGHT; y++) {
      mark(-1, y);
      mark(FARM_WIDTH, y);
    }
  }

  private createInteractable(tileX: number, tileY: number, frameOrLabel: number | string, kind: InteractionKind) {
    const frameByKind: Partial<Record<InteractionKind, number>> = {
      [InteractionKind.BLACKSMITH]: 7,
      [InteractionKind.CARPENTER]: 7,
    };
    const frame = typeof frameOrLabel === 'number' ? frameOrLabel : (frameByKind[kind] ?? 0);
    const label = typeof frameOrLabel === 'string' ? frameOrLabel : null;
    const pos = gridToWorld(tileX, tileY);
    const spr = this.add.sprite(pos.x, pos.y, 'objects', frame);
    spr.setScale(SCALE);
    spr.setDepth(ySortDepth(pos.y));
    spr.setData('interaction', { kind, x: tileX, y: tileY });
    this.objectLayer.add(spr);
    if (label) this.addLabel(tileX, tileY, label);
  }

  private spawnNPCs() {
    const npcPositions: Record<string, { x: number; y: number }> = {
      elena: { x: 30, y: 23 },   // near the shop in town
      owen: { x: 17, y: 23 },    // near quest board in town
      lily: { x: 6, y: 20 },     // near the pond
      marcus: { x: 35, y: 5 },   // at the mine
      sage: { x: 18, y: 22 },
    };

    for (const npc of NPCS) {
      const posDef = npcPositions[npc.id] ?? { x: 20, y: 20 };
      const x = posDef.x;
      const y = posDef.y;
      const pos = gridToWorld(x, y);
      const spr = this.add.sprite(pos.x, pos.y, 'npcs', npc.spriteIndex);
      spr.setScale(SCALE);
      spr.setDepth(ySortDepth(pos.y));
      spr.setData('interaction', { kind: InteractionKind.NPC, targetId: npc.id, x, y });
      this.npcSprites.set(npc.id, spr);

      // NPC name label
      const label = this.add.text(pos.x, pos.y - SCALED_TILE * 0.7, npc.name, {
        fontSize: '9px', color: '#ffffff', fontFamily: 'monospace',
        backgroundColor: '#00000088', padding: { x: 2, y: 1 },
      }).setOrigin(0.5).setDepth(ySortDepth(pos.y) + 1);
    }
  }

  private addLabel(x: number, y: number, text: string) {
    const pos = gridToWorld(x, y);
    const label = this.add.text(pos.x, pos.y - SCALED_TILE * 0.8, text, {
      fontSize: '10px',
      color: '#ffffff',
      fontFamily: 'monospace',
      backgroundColor: '#00000088',
      padding: { x: 3, y: 2 },
    }).setOrigin(0.5).setDepth(1000);
    this.objectLayer.add(label);
  }

  private updateTutorial() {
    this.tutorialActive = true;
    this.tutorialStep = 0;
    this.tutorialText = undefined;
    this.tutorialArrow = undefined;

    this.events.on(Events.SOIL_TILLED, () => {
      if (this.tutorialActive && this.tutorialStep === 1) this.advanceTutorial(2);
    });
    this.events.on(Events.CROP_PLANTED, () => {
      if (this.tutorialActive && this.tutorialStep === 2) this.advanceTutorial(3);
    });
    this.events.on(Events.CROP_WATERED, () => {
      if (this.tutorialActive && this.tutorialStep === 3) this.advanceTutorial(4);
    });

    this.time.delayedCall(0, () => this.advanceTutorial(0));
  }

  private advanceTutorial(step: number) {
    this.tutorialStep = step;

    const emitState = (payload: TutorialAdvancePayload) => {
      this.events.emit('TUTORIAL_ADVANCE', payload);
    };

    switch (step) {
      case 0:
        emitState({
          active: true,
          step,
          text: 'Welcome to your farm! Use WASD to walk around.',
          targetTile: { x: 16, y: 12 }
        });
        break;
      case 1:
        emitState({
          active: true,
          step,
          text: 'Press 1-0 to select tools. Your Hoe is selected - face the dark soil and press SPACE to till it.',
          targetTile: { x: 12, y: 12 }
        });
        break;
      case 2:
        emitState({
          active: true,
          step,
          text: 'Great! Now select your Parsnip Seeds (slot 2) and press SPACE to plant.',
          targetTile: { x: 15, y: 12 }
        });
        break;
      case 3:
        emitState({
          active: true,
          step,
          text: 'Now switch to your Watering Can and press SPACE to water.',
          targetTile: { x: 15, y: 12 }
        });
        break;
      case 4:
        emitState({
          active: true,
          step,
          text: 'Perfect! Your crop will grow overnight. Walk to the shipping bin (the brown box ->) and press E to interact.',
          targetTile: { x: 25, y: 8 }
        });
        break;
      case 5:
        emitState({
          active: true,
          step,
          text: 'You can ship items here for gold. Walk to your bed and press E to sleep.',
          targetTile: { x: 20, y: 8 }
        });
        break;
      case 6:
        emitState({
          active: true,
          step,
          text: 'Tutorial complete! Explore the farm, talk to villagers, and make Hearthfield flourish!'
        });
        this.time.delayedCall(3500, () => this.advanceTutorial(7));
        break;
      default:
        this.tutorialActive = false;
        emitState({ active: false, step: 7 });
    }
  }

  // ── Helpers ──

  getFarmTile(x: number, y: number): FarmTile | undefined {
    return this.farmTiles.find(t => t.x === x && t.y === y);
  }

  private getInteractionAt(tileX: number, tileY: number): { kind: InteractionKind; targetId?: string; x: number; y: number } | null {
    // Check objects
    const objs = this.objectLayer.getAll();
    for (const obj of objs) {
      const data = (obj as Phaser.GameObjects.Sprite).getData('interaction');
      if (data && data.x === tileX && data.y === tileY) {
        return data;
      }
    }
    // Check NPCs
    for (const [npcId, spr] of this.npcSprites) {
      const data = spr.getData('interaction');
      if (data && data.x === tileX && data.y === tileY) {
        return data;
      }
    }
    return null;
  }

  addToInventory(itemId: string, qty: number, quality: Quality = Quality.NORMAL): boolean {
    // Try stack first
    for (let i = 0; i < this.player.inventory.length; i++) {
      const slot = this.player.inventory[i];
      if (slot && slot.itemId === itemId && slot.quality === quality) {
        slot.qty += qty;
        this.events.emit(Events.INVENTORY_CHANGE, { inventory: this.player.inventory });
        return true;
      }
    }
    // Try empty slot
    for (let i = 0; i < this.player.inventory.length; i++) {
      if (!this.player.inventory[i]) {
        this.player.inventory[i] = { itemId, qty, quality };
        this.events.emit(Events.INVENTORY_CHANGE, { inventory: this.player.inventory });
        return true;
      }
    }
    this.events.emit(Events.TOAST, { message: 'Inventory full!', color: '#ff4444' });
    return false;
  }

  removeFromSlot(slotIndex: number, qty: number) {
    const slot = this.player.inventory[slotIndex];
    if (!slot) return;
    slot.qty -= qty;
    if (slot.qty <= 0) {
      this.player.inventory[slotIndex] = null;
    }
    this.events.emit(Events.INVENTORY_CHANGE, { inventory: this.player.inventory });
  }

  removeItem(itemId: string, qty: number) {
    let remaining = qty;
    for (let i = 0; i < this.player.inventory.length && remaining > 0; i++) {
      const slot = this.player.inventory[i];
      if (slot && slot.itemId === itemId) {
        const take = Math.min(slot.qty, remaining);
        slot.qty -= take;
        remaining -= take;
        if (slot.qty <= 0) this.player.inventory[i] = null;
      }
    }
    this.events.emit(Events.INVENTORY_CHANGE, { inventory: this.player.inventory });
  }

  countItem(itemId: string): number {
    return this.player.inventory.reduce((sum, slot) => {
      return sum + (slot && slot.itemId === itemId ? slot.qty : 0);
    }, 0);
  }

  private refreshTileSprite(tile: FarmTile) {
    const children = this.farmLayer.getAll() as Phaser.GameObjects.Sprite[];
    for (const child of children) {
      const ref = child.getData('tileRef') as FarmTile;
      if (ref && ref.x === tile.x && ref.y === tile.y) {
        child.setFrame(tile.type);
        break;
      }
    }
    // Update crop sprite
    if (tile.cropId && tile.cropStage !== undefined) {
      const key = `${tile.x},${tile.y}`;
      let cropSpr = this.cropSprites.get(key);
      const cropDef = CROPS.find(c => c.id === tile.cropId);
      if (cropDef) {
        const pos = gridToWorld(tile.x, tile.y);
        if (!cropSpr) {
          cropSpr = this.add.sprite(pos.x, pos.y - 8, 'crops');
          cropSpr.setScale(SCALE);
          this.cropSprites.set(key, cropSpr);
        }
        cropSpr.setFrame(cropDef.spriteRow * 6 + tile.cropStage);
        cropSpr.setDepth(ySortDepth(pos.y));
        cropSpr.setVisible(true);
      }
    } else {
      const key = `${tile.x},${tile.y}`;
      const cropSpr = this.cropSprites.get(key);
      if (cropSpr) cropSpr.setVisible(false);
    }
  }

  private updateCropSprites() {
    // Periodic visual refresh — only needed if something external changed
  }

  private refreshWeatherParticles() {
    // Clean up existing emitter
    if (this.weatherParticleEmitter) {
      this.weatherParticleEmitter.stop();
      this.weatherParticleEmitter = undefined;
    }
    if (this.currentWeather === WeatherType.RAIN || this.currentWeather === WeatherType.STORM) {
      // Create rain particle effect using Phaser 3.60+ API
      const { width, height } = this.cameras.main;
      if (!this.textures.exists('rain_drop')) {
        const g = this.add.graphics();
        g.fillStyle(0x8888cc, 0.5);
        g.fillRect(0, 0, 2, 6);
        g.generateTexture('rain_drop', 2, 6);
        g.destroy();
      }
      this.weatherParticleEmitter = this.add.particles(0, -20, 'rain_drop', {
        x: { min: -50, max: width + 50 },
        y: -20,
        lifespan: 1200,
        speedY: { min: 200, max: 350 },
        speedX: { min: -30, max: -10 },
        quantity: this.currentWeather === WeatherType.STORM ? 4 : 2,
        alpha: { start: 0.6, end: 0.1 },
        scale: { start: 1, end: 0.5 },
        frequency: 30,
      });
      this.weatherParticleEmitter.setScrollFactor(0);
      this.weatherParticleEmitter.setDepth(9998);
    }
  }

  private applySeasonalMapTint() {
    const { width, height } = this.cameras.main;
    if (this.seasonalTintOverlay) this.seasonalTintOverlay.destroy();
    const tints: Record<string, number> = {
      [Season.SPRING]: 0x88ff88,
      [Season.SUMMER]: 0xffffaa,
      [Season.FALL]: 0xffcc88,
      [Season.WINTER]: 0xaaccff,
    };
    const color = tints[this.calendar.season] ?? 0xffffff;
    this.seasonalTintOverlay = this.add.rectangle(
      width / 2, height / 2, width, height, color, 0.06
    );
    this.seasonalTintOverlay.setScrollFactor(0);
    this.seasonalTintOverlay.setDepth(9990);
  }

  private updateDayNightVisual() {
    const { width, height } = this.cameras.main;
    if (!this.dayNightOverlay) {
      this.dayNightOverlay = this.add.rectangle(
        width / 2, height / 2, width, height, 0x000022, 0
      );
      this.dayNightOverlay.setScrollFactor(0);
      this.dayNightOverlay.setDepth(9991);
    }
    // Map time to darkness: morning=0, dusk=0.15, night=0.35
    const progress = this.dayTimer / DAY_LENGTH_MS;
    let alpha = 0;
    if (progress > 0.7) alpha = (progress - 0.7) / 0.3 * 0.35; // evening → night
    else if (progress > 0.55) alpha = (progress - 0.55) / 0.15 * 0.08; // late afternoon
    this.dayNightOverlay.setAlpha(alpha);
  }

  private renderForageables() {
    for (const sprite of this.foragingSprites) {
      sprite.destroy();
    }
    this.foragingSprites = [];

    const forageItems = this.foragingSystem.getState().items;
    for (const item of forageItems) {
      const pos = gridToWorld(item.tileX, item.tileY);
      const itemDef = ITEMS.find((i) => i.id === item.itemId);
      const sprite = this.add.sprite(pos.x, pos.y, 'items', itemDef?.spriteIndex ?? 0);
      sprite.setScale(SCALE);
      sprite.setDepth(ySortDepth(pos.y));
      sprite.setData('interaction', {
        kind: InteractionKind.FORAGEABLE,
        label: item.itemId,
        data: item,
        x: item.tileX,
        y: item.tileY
      });
      this.objectLayer.add(sprite);
      this.foragingSprites.push(sprite);
    }
  }

  private getFutureDate(daysToAdd: number): { day: number; season: Season; year: number } {
    const seasons = [Season.SPRING, Season.SUMMER, Season.FALL, Season.WINTER];
    let day = this.calendar.day + daysToAdd;
    let year = this.calendar.year;
    let seasonIdx = seasons.indexOf(this.calendar.season);

    while (day > 28) {
      day -= 28;
      seasonIdx += 1;
      if (seasonIdx >= seasons.length) {
        seasonIdx = 0;
        year += 1;
      }
    }

    return { day, season: seasons[seasonIdx], year };
  }

  // ── Save / Load ──

  getEquippedTool(): Tool | null {
    const slot = this.player.inventory[this.player.selectedSlot];
    if (!slot) return null;
    const toolValues = Object.values(Tool) as string[];
    return toolValues.includes(slot.itemId) ? slot.itemId as Tool : null;
  }

  saveGame() {
    const data: SaveData & {
      currentWeather?: WeatherType;
      tutorialStep?: number;
      tutorialActive?: boolean;
    } = {
      version: 1,
      player: { ...this.player },
      calendar: { ...this.calendar },
      farmTiles: this.farmTiles,
      shippingBin: this.shippingBin,
      relationships: this.relationships,
      quests: this.quests,
      mine: this.mine,
      animalState: this.animalState,
      house: this.house,
      stats: this.stats,
      achievements: this.achievementSystem.getUnlocked(),
      unlockedRecipes: this.unlockedRecipes,
      chestContents: {},
      toolLevels: this.toolLevels,
      currentWeather: this.currentWeather,
      tutorialStep: this.tutorialStep,
      tutorialActive: this.tutorialActive,
      questSystemState: this.questSystem.getState(),
      romanceState: this.romanceSystem.getState(),
      upgradeState: this.upgradeSystem.getState(),
      machineState: this.machineSystem.getState(),
      achievementState: this.achievementSystem.getState(),
      foragingState: this.foragingSystem.getState(),
      festivalAttended: this.festivalSystem.getAttended(),
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    this.events.emit(Events.TOAST, { message: 'Game saved!', color: '#44aaff', duration: 1500 });
  }

  loadGame(): boolean {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) { this.initNewGame(); return false; }
    try {
      const data: SaveData & {
        currentWeather?: WeatherType;
        tutorialStep?: number;
        tutorialActive?: boolean;
      } = JSON.parse(raw);
      this.player = data.player;
      this.calendar = data.calendar;
      this.farmTiles = data.farmTiles;
      this.shippingBin = data.shippingBin;
      this.relationships = data.relationships;
      this.quests = data.quests;
      this.mine = data.mine;
      this.animalState = data.animalState;
      this.house = data.house;
      this.stats = data.stats;
      this.unlockedRecipes = data.unlockedRecipes;
      this.toolLevels = data.toolLevels;
      if (data.currentWeather) this.currentWeather = data.currentWeather;
      if (data.tutorialStep !== undefined) this.tutorialStep = data.tutorialStep;
      if (data.tutorialActive !== undefined) this.tutorialActive = data.tutorialActive;
      // Restore new system states from save
      if (data.questSystemState) {
        this.questSystem = new QuestSystem(this, data.questSystemState);
      }
      if (data.romanceState) {
        this.romanceSystem = new RomanceSystem(this, data.romanceState);
      }
      if (data.upgradeState) {
        this.upgradeSystem = new UpgradeSystem(this, data.upgradeState);
      }
      if (data.machineState) {
        this.machineSystem = new MachineSystem(this, data.machineState);
      }
      if (data.achievementState || Array.isArray(data.achievements)) {
        const achievementState: AchievementState = data.achievementState ? {
          ...data.achievementState,
          unlocked: Array.isArray(data.achievements) ? data.achievements : data.achievementState.unlocked,
        } : {
          unlocked: data.achievements,
          shippedItems: [],
          cookedRecipes: [],
          caughtFish: [],
          grownCrops: [],
          totalGoldEarned: 0,
          questsCompleted: 0,
          giftedNpcs: [],
        };
        this.achievementSystem = new AchievementSystem(this, achievementState);
      }
      if (data.foragingState) {
        this.foragingSystem = new ForagingSystem(data.foragingState);
      }
      if (data.festivalAttended) {
        this.festivalSystem = new FestivalSystem(this, data.festivalAttended);
      }
      return true;
    } catch {
      this.initNewGame();
      return false;
    }
  }
}
