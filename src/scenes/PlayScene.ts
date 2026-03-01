import Phaser from 'phaser';
import {
  Scenes, Events, TILE_SIZE, SCALE, SCALED_TILE, PLAYER_SPEED,
  FARM_WIDTH, FARM_HEIGHT, Direction, TileType, MapId, Tool,
  PlayerState, CalendarState, FarmTile, ShippingBinState,
  RelationshipState, MineState, AnimalState, HouseState, PlayStats,
  QuestState, SaveData, SAVE_KEY, START_GOLD, MAX_STAMINA,
  INVENTORY_SIZE, HOTBAR_SIZE, Season, Quality, DAY_LENGTH_MS,
  gridToWorld, worldToGrid, facingTile, clamp, ySortDepth,
  InteractionKind, InventorySlot
} from '../types';
import { ITEMS, CROPS, RECIPES, FISH, NPCS } from '../data/registry';
import { FishingMinigame } from '../systems/fishing';
import { MiningSystem } from '../systems/mining';
import { ShopSystem } from '../systems/shop';

export class PlayScene extends Phaser.Scene {
  // Core state
  player!: PlayerState;
  calendar!: CalendarState;
  farmTiles: FarmTile[] = [];
  shippingBin: ShippingBinState = { items: [] };
  relationships: RelationshipState = {};
  quests: QuestState = { activeQuests: [], completedQuests: [] };
  mine: MineState = { currentFloor: 1, maxFloor: 1, health: 100, maxHealth: 100, elevatorsUnlocked: [1] };
  animalState: AnimalState = { animals: [], hasCoopLevel: 0, hasBarnLevel: 0 };
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
  fishingMinigame!: FishingMinigame;
  miningSystem!: MiningSystem;
  shopSystem!: ShopSystem;

  // Day timer
  dayTimer = 0;
  dayPaused = false;

  constructor() { super(Scenes.PLAY); }

  init(data?: { loadSave?: boolean }) {
    if (data?.loadSave) {
      this.loadGame();
    } else {
      this.initNewGame();
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

    // Camera follows player
    this.cameras.main.startFollow(this.playerSprite, true, 0.1, 0.1);
    this.cameras.main.setZoom(1);
    this.cameras.main.setBounds(0, 0, FARM_WIDTH * SCALED_TILE, FARM_HEIGHT * SCALED_TILE);

    // Create objects (shipping bin, crafting bench, bed, etc.)
    this.createWorldObjects();

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

    // Event listeners
    this.setupEventListeners();

    this.fishingMinigame = new FishingMinigame(this);
    this.miningSystem = new MiningSystem(this);
    this.shopSystem = new ShopSystem(this);

    // Emit day start
    this.events.emit(Events.DAY_START, {
      day: this.calendar.day,
      season: this.calendar.season,
      year: this.calendar.year
    });
  }

  update(time: number, delta: number) {
    this.handleMovement(delta);
    this.handleToolInput();
    this.handleInteractionInput();
    this.handleHotbarInput();
    this.updateDayTimer(delta);
    this.updateCropSprites();
    this.playerSprite.setDepth(ySortDepth(this.player.y));
  }

  // ── Initialization ──

  private initNewGame() {
    const spawn = gridToWorld(20, 15);
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

    // Give starter items
    this.player.inventory[0] = { itemId: 'parsnip_seeds', qty: 15, quality: Quality.NORMAL };
    this.player.inventory[1] = { itemId: 'potato_seeds', qty: 5, quality: Quality.NORMAL };

    this.calendar = { day: 1, season: Season.SPRING, year: 1, timeOfDay: 0, isPaused: false };

    // Init farm tiles
    this.farmTiles = [];
    for (let y = 0; y < FARM_HEIGHT; y++) {
      for (let x = 0; x < FARM_WIDTH; x++) {
        let type = TileType.GRASS;
        // Water pond
        if (x >= 30 && x <= 34 && y >= 10 && y <= 14) type = TileType.WATER;
        // Some rocks and stumps
        if (Math.random() < 0.03 && type === TileType.GRASS) type = TileType.STONE;
        if (Math.random() < 0.03 && type === TileType.GRASS) type = TileType.WOOD;
        this.farmTiles.push({ x, y, type, watered: false });
      }
    }

    // Init relationships
    for (const npc of NPCS) {
      this.relationships[npc.id] = { hearts: 0, relation: 0, talkedToday: false, giftedToday: false };
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

    // Normalize diagonal
    if (vx !== 0 && vy !== 0) {
      vx *= 0.707; vy *= 0.707;
    }

    const speed = PLAYER_SPEED * (delta / 1000);
    this.player.x += vx * speed;
    this.player.y += vy * speed;

    // Clamp to map
    this.player.x = clamp(this.player.x, SCALED_TILE / 2, FARM_WIDTH * SCALED_TILE - SCALED_TILE / 2);
    this.player.y = clamp(this.player.y, SCALED_TILE / 2, FARM_HEIGHT * SCALED_TILE - SCALED_TILE / 2);

    // Update sprite
    this.playerSprite.setPosition(this.player.x, this.player.y);

    // Direction frame
    const dirFrames = { [Direction.DOWN]: 0, [Direction.LEFT]: 1, [Direction.RIGHT]: 2, [Direction.UP]: 3 };
    this.playerSprite.setFrame(dirFrames[this.player.direction] ?? 0);
  }

  // ── Tool Use ──

  private handleToolInput() {
    if (Phaser.Input.Keyboard.JustDown(this.keys.space)) {
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
    if (Phaser.Input.Keyboard.JustDown(this.keys.e)) {
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
    this.saveGame();

    this.events.emit(Events.DAY_START, {
      day: this.calendar.day,
      season: this.calendar.season,
      year: this.calendar.year,
    });
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
          this.endDay();
          break;
        case InteractionKind.NPC: {
          if (data.targetId) {
            this.handleNPCInteraction(data.targetId);
          }
          break;
        }
        case InteractionKind.SHOP:
          this.events.emit(Events.TOAST, { message: 'Shop coming soon!', color: '#aaaaff' });
          break;
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
    this.events.emit(Events.DIALOGUE_START, { npcId });
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

    // Shipping bin at (25, 10)
    this.createInteractable(25, 10, 0, InteractionKind.SHIPPING_BIN);
    // Crafting bench at (18, 12)
    this.createInteractable(18, 12, 1, InteractionKind.CRAFTING_BENCH);
    // Bed at (22, 8)
    this.createInteractable(22, 8, 2, InteractionKind.BED);
    // Kitchen at (20, 8)
    this.createInteractable(20, 8, 3, InteractionKind.KITCHEN);
  }

  private createInteractable(tileX: number, tileY: number, frame: number, kind: InteractionKind) {
    const pos = gridToWorld(tileX, tileY);
    const spr = this.add.sprite(pos.x, pos.y, 'objects', frame);
    spr.setScale(SCALE);
    spr.setDepth(ySortDepth(pos.y));
    spr.setData('interaction', { kind, x: tileX, y: tileY });
    this.objectLayer.add(spr);
  }

  private spawnNPCs() {
    for (const npc of NPCS) {
      // Place NPCs at fixed positions on the farm for now
      const x = 15 + NPCS.indexOf(npc) * 3;
      const y = 20;
      const pos = gridToWorld(x, y);
      const spr = this.add.sprite(pos.x, pos.y, 'npcs', npc.spriteIndex);
      spr.setScale(SCALE);
      spr.setDepth(ySortDepth(pos.y));
      spr.setData('interaction', { kind: InteractionKind.NPC, targetId: npc.id, x, y });
      this.npcSprites.set(npc.id, spr);
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

  // ── Save / Load ──

  saveGame() {
    const data: SaveData = {
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
      achievements: [],
      unlockedRecipes: this.unlockedRecipes,
      chestContents: {},
      toolLevels: this.toolLevels,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    this.events.emit(Events.TOAST, { message: 'Game saved!', color: '#44aaff', duration: 1500 });
  }

  loadGame(): boolean {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) { this.initNewGame(); return false; }
    try {
      const data: SaveData = JSON.parse(raw);
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
      return true;
    } catch {
      this.initNewGame();
      return false;
    }
  }
}
