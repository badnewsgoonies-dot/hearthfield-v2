// src/phaser-shim.ts
var Phaser = window.Phaser;
var phaser_shim_default = Phaser;
var Scene = Phaser?.Scene;
var GameObjects = Phaser?.GameObjects;
var Display = Phaser?.Display;
var Scale = Phaser?.Scale;

// src/types.ts
var TILE_SIZE = 16;
var SCALE = 3;
var SCALED_TILE = TILE_SIZE * SCALE;
var FARM_WIDTH = 40;
var FARM_HEIGHT = 30;
var PLAYER_SPEED = 120;
var MAX_STAMINA = 100;
var START_GOLD = 500;
var INVENTORY_SIZE = 36;
var HOTBAR_SIZE = 12;
var DAY_LENGTH_MS = 72e4;
var SAVE_KEY = "hearthfield_save";
var Tool = /* @__PURE__ */ ((Tool2) => {
  Tool2["HOE"] = "hoe";
  Tool2["WATERING_CAN"] = "watering_can";
  Tool2["AXE"] = "axe";
  Tool2["PICKAXE"] = "pickaxe";
  Tool2["FISHING_ROD"] = "fishing_rod";
  Tool2["SCYTHE"] = "scythe";
  return Tool2;
})(Tool || {});
var Events = {
  // ── Player Actions ──
  TOOL_USE: "tool:use",
  // { tool, tileX, tileY, direction }
  ITEM_USE: "item:use",
  // { itemId, slotIndex }
  INTERACT: "interact",
  // { kind: InteractionKind, targetId?, x, y }
  INVENTORY_CHANGE: "inventory:change",
  // { inventory }
  // ── Farming ──
  CROP_PLANTED: "crop:planted",
  // { x, y, cropId }
  CROP_WATERED: "crop:watered",
  // { x, y }
  CROP_HARVESTED: "crop:harvested",
  // { cropId, qty, quality }
  SOIL_TILLED: "soil:tilled",
  // { x, y }
  // ── Economy ──
  GOLD_CHANGE: "gold:change",
  // { amount, newTotal }
  ITEM_SHIPPED: "item:shipped",
  // { itemId, qty, quality }
  SHOP_BUY: "shop:buy",
  // { itemId, qty, cost }
  SHOP_SELL: "shop:sell",
  // { itemId, qty, revenue }
  // ── Calendar ──
  DAY_START: "day:start",
  // { day, season, year }
  DAY_END: "day:end",
  // { day, season, year }
  SEASON_CHANGE: "season:change",
  // { oldSeason, newSeason, year }
  TIME_TICK: "time:tick",
  // { timeOfDay: number }
  // ── NPC ──
  DIALOGUE_START: "dialogue:start",
  // { npcId }
  DIALOGUE_END: "dialogue:end",
  // { npcId }
  GIFT_GIVEN: "gift:given",
  // { npcId, itemId, reaction }
  RELATIONSHIP_UP: "relationship:up",
  // { npcId, newHearts }
  // ── Crafting ──
  CRAFT_ITEM: "craft:item",
  // { recipeId }
  OPEN_CRAFTING: "crafting:open",
  // { cooking: boolean }
  CLOSE_CRAFTING: "crafting:close",
  // {}
  // ── Fishing ──
  CAST_LINE: "fish:cast",
  // { x, y }
  FISH_CAUGHT: "fish:caught",
  // { fishId, quality }
  FISH_ESCAPED: "fish:escaped",
  // {}
  // ── Mining ──
  ENTER_MINE: "mine:enter",
  // { floor }
  FLOOR_CLEAR: "mine:floor_clear",
  // { floor }
  MONSTER_KILLED: "mine:monster_killed",
  // { monsterId }
  // ── Building ──
  BUILDING_UPGRADE: "building:upgrade",
  // { buildingType, newLevel }
  TOOL_UPGRADE: "tool:upgrade",
  // { tool, newLevel }
  // ── Animals ──
  ANIMAL_PURCHASE: "animal:purchase",
  // { animalType, name }
  ANIMAL_PRODUCT: "animal:product",
  // { animalId, itemId }
  // ── Map ──
  MAP_TRANSITION: "map:transition",
  // { from: MapId, to: MapId, spawnX, spawnY }
  // ── UI ──
  TOAST: "ui:toast",
  // { message, duration?, color? }
  ACHIEVEMENT: "ui:achievement",
  // { achievementId, name }
  OPEN_INVENTORY: "ui:inventory",
  // {}
  OPEN_PAUSE: "ui:pause",
  // {}
  // ── Save ──
  SAVE_GAME: "save:game",
  // { slot }
  LOAD_GAME: "load:game",
  // { slot }
  // ── Quest ──
  QUEST_ACCEPTED: "quest:accepted",
  // { questId }
  QUEST_COMPLETED: "quest:completed",
  // { questId }
  QUEST_PROGRESS: "quest:progress",
  // { questId, current, target }
  // ── Stats ──
  STAT_INCREMENT: "stat:increment"
  // { stat: keyof PlayStats, amount }
};
var Scenes = {
  BOOT: "BootScene",
  MENU: "MenuScene",
  INTRO: "IntroScene",
  PLAY: "PlayScene",
  UI: "UIScene"
  // runs parallel to PlayScene as overlay
};
function gridToWorld(tileX, tileY) {
  return {
    x: tileX * SCALED_TILE + SCALED_TILE / 2,
    y: tileY * SCALED_TILE + SCALED_TILE / 2
  };
}
function worldToGrid(worldX, worldY) {
  return {
    x: Math.floor(worldX / SCALED_TILE),
    y: Math.floor(worldY / SCALED_TILE)
  };
}
function ySortDepth(worldY) {
  return worldY * 1e-3;
}
function facingTile(playerX, playerY, dir) {
  const grid = worldToGrid(playerX, playerY);
  switch (dir) {
    case "up" /* UP */:
      return { x: grid.x, y: grid.y - 1 };
    case "down" /* DOWN */:
      return { x: grid.x, y: grid.y + 1 };
    case "left" /* LEFT */:
      return { x: grid.x - 1, y: grid.y };
    case "right" /* RIGHT */:
      return { x: grid.x + 1, y: grid.y };
  }
}
function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

// src/scenes/BootScene.ts
var BootScene = class extends phaser_shim_default.Scene {
  constructor() {
    super(Scenes.BOOT);
  }
  preload() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    const bar = this.add.rectangle(w / 2, h / 2, 300, 20, 3355443);
    const fill = this.add.rectangle(w / 2 - 148, h / 2, 4, 16, 8965188);
    this.load.on("progress", (v) => {
      fill.width = 296 * v;
      fill.x = w / 2 - 148 + fill.width / 2;
    });
    this.generateAllTextures();
  }
  create() {
    const dirs = [
      { dir: "down", frame: 0 },
      { dir: "up", frame: 1 },
      { dir: "left", frame: 2 },
      { dir: "right", frame: 3 }
    ];
    for (const { dir, frame } of dirs) {
      this.anims.create({
        key: `idle_${dir}`,
        frames: [{ key: "player", frame }],
        frameRate: 1,
        repeat: -1
      });
      this.anims.create({
        key: `walk_${dir}`,
        frames: [{ key: "player", frame }],
        frameRate: 6,
        repeat: -1
      });
    }
    this.scene.start(Scenes.MENU);
  }
  generateAllTextures() {
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
  genPlayer(T) {
    const g = this.make.graphics();
    for (let i = 0; i < 4; i++) {
      const ox = i * T;
      g.fillStyle(7027242);
      g.fillRect(ox + 4, 13, 3, 3);
      g.fillRect(ox + 9, 13, 3, 3);
      g.fillStyle(3889560);
      g.fillRect(ox + 4, 10, 3, 3);
      g.fillRect(ox + 9, 10, 3, 3);
      g.fillStyle(15158332);
      g.fillRect(ox + 3, 6, 10, 4);
      g.fillStyle(16764040);
      g.fillRect(ox + 2, 7, 1, 3);
      g.fillRect(ox + 13, 7, 1, 3);
      g.fillStyle(16764040);
      g.fillRect(ox + 4, 1, 8, 5);
      g.fillStyle(13936951);
      g.fillRect(ox + 3, 0, 10, 1);
      g.fillStyle(9127187);
      g.fillRect(ox + 4, 0, 8, 2);
      g.fillStyle(2236962);
      if (i === 0) {
        g.fillRect(ox + 6, 3, 1, 1);
        g.fillRect(ox + 9, 3, 1, 1);
      } else if (i === 1) {
        g.fillStyle(9127187);
        g.fillRect(ox + 4, 1, 8, 3);
      } else if (i === 2) {
        g.fillRect(ox + 5, 3, 1, 1);
      } else {
        g.fillRect(ox + 10, 3, 1, 1);
      }
    }
    g.generateTexture("player", T * 4, T);
    g.destroy();
    const pTex = this.textures.get("player");
    for (let i = 0; i < 4; i++)
      pTex.add(i, 0, i * T, 0, T, T);
  }
  genTerrain(T) {
    const g = this.make.graphics();
    for (let i = 0; i < 16; i++) {
      const ox = i * T;
      switch (i) {
        case 0:
          g.fillStyle(6139463);
          g.fillRect(ox, 0, T, T);
          g.fillStyle(4888118);
          g.fillRect(ox + 3, 5, 1, 2);
          g.fillRect(ox + 8, 10, 1, 2);
          g.fillRect(ox + 12, 3, 1, 2);
          break;
        case 1:
          g.fillStyle(9136404);
          g.fillRect(ox, 0, T, T);
          g.fillStyle(8018960);
          g.fillRect(ox + 2, 4, 2, 1);
          g.fillRect(ox + 10, 8, 2, 1);
          break;
        case 2:
          g.fillStyle(6045728);
          g.fillRect(ox, 0, T, T);
          g.fillStyle(4862744);
          for (let r = 2; r < T; r += 4)
            g.fillRect(ox, r, T, 1);
          break;
        case 3:
          g.fillStyle(3811861);
          g.fillRect(ox, 0, T, T);
          g.fillStyle(3022864);
          for (let r = 2; r < T; r += 4)
            g.fillRect(ox, r, T, 1);
          break;
        case 4:
          g.fillStyle(3837910);
          g.fillRect(ox, 0, T, T);
          g.fillStyle(5943278);
          g.fillRect(ox + 1, 4, 5, 1);
          g.fillRect(ox + 8, 9, 5, 1);
          g.fillRect(ox + 3, 13, 4, 1);
          break;
        case 5:
          g.fillStyle(6139463);
          g.fillRect(ox, 0, T, T);
          g.fillStyle(8947848);
          g.fillRect(ox + 3, 5, 10, 8);
          g.fillStyle(11184810);
          g.fillRect(ox + 4, 5, 8, 3);
          break;
        case 6:
          g.fillStyle(6139463);
          g.fillRect(ox, 0, T, T);
          g.fillStyle(7029286);
          g.fillRect(ox + 4, 6, 8, 8);
          g.fillStyle(9132587);
          g.fillRect(ox + 5, 7, 6, 6);
          break;
        case 7:
          g.fillStyle(15259043);
          g.fillRect(ox, 0, T, T);
          break;
        case 8:
          g.fillStyle(12888174);
          g.fillRect(ox, 0, T, T);
          g.fillStyle(11573336);
          g.fillRect(ox + 3, 3, 2, 2);
          g.fillRect(ox + 10, 10, 2, 2);
          break;
        default:
          g.fillStyle(6139463 + i * 197379);
          g.fillRect(ox, 0, T, T);
      }
    }
    g.generateTexture("terrain", T * 16, T);
    g.destroy();
    const tTex = this.textures.get("terrain");
    for (let i = 0; i < 16; i++)
      tTex.add(i, 0, i * T, 0, T, T);
  }
  genCrops(T) {
    const g = this.make.graphics();
    const hues = [16766720, 15235338, 16729156, 9127423, 4504388, 16738740, 16755200, 2280618, 12264004, 7048739, 16737095, 9662683, 2142890, 14329120, 14423100];
    for (let row = 0; row < 15; row++) {
      for (let col = 0; col < 6; col++) {
        const ox = col * T, oy = row * T;
        g.fillStyle(6045728);
        g.fillRect(ox, oy, T, T);
        if (col === 0) {
          g.fillStyle(9136404);
          g.fillRect(ox + 6, oy + 10, 2, 2);
          g.fillRect(ox + 9, oy + 11, 2, 1);
        } else if (col === 1) {
          g.fillStyle(2263842);
          g.fillRect(ox + 7, oy + 8, 2, 4);
          g.fillRect(ox + 6, oy + 8, 4, 1);
        } else if (col === 2) {
          g.fillStyle(2263842);
          g.fillRect(ox + 7, oy + 5, 2, 7);
          g.fillRect(ox + 5, oy + 6, 2, 2);
          g.fillRect(ox + 9, oy + 7, 2, 2);
        } else if (col === 3) {
          g.fillStyle(3050286);
          g.fillRect(ox + 7, oy + 3, 2, 9);
          g.fillRect(ox + 4, oy + 4, 3, 3);
          g.fillRect(ox + 9, oy + 5, 3, 3);
        } else if (col === 4) {
          g.fillStyle(3050286);
          g.fillRect(ox + 7, oy + 2, 2, 10);
          g.fillRect(ox + 4, oy + 3, 3, 3);
          g.fillRect(ox + 9, oy + 4, 3, 3);
          g.fillStyle(hues[row]);
          g.fillRect(ox + 6, oy + 1, 4, 3);
        } else {
          g.fillStyle(3050286);
          g.fillRect(ox + 7, oy + 3, 2, 9);
          g.fillRect(ox + 4, oy + 4, 3, 3);
          g.fillRect(ox + 9, oy + 5, 3, 3);
          g.fillStyle(hues[row]);
          g.fillRect(ox + 5, oy + 0, 6, 4);
          g.fillStyle(16777215);
          g.fillRect(ox + 6, oy + 1, 2, 1);
        }
      }
    }
    g.generateTexture("crops", T * 6, T * 15);
    g.destroy();
    const cTex = this.textures.get("crops");
    for (let row = 0; row < 15; row++) {
      for (let col = 0; col < 6; col++) {
        cTex.add(row * 6 + col, 0, col * T, row * T, T, T);
      }
    }
  }
  genItems(T) {
    const g = this.make.graphics();
    for (let i = 0; i < 64; i++) {
      const col = i % 8, row = Math.floor(i / 8), ox = col * T, oy = row * T;
      const hue = (i * 47 + 30) % 360;
      const c = phaser_shim_default.Display.Color.HSLToColor(hue / 360, 0.7, 0.5).color;
      g.fillStyle(2763322);
      g.fillRect(ox, oy, T, T);
      if (i < 8) {
        g.fillStyle(12294485);
        g.fillRect(ox + 4, oy + 3, 8, 10);
        g.fillStyle(c);
        g.fillRect(ox + 5, oy + 5, 6, 4);
      } else if (i < 16) {
        g.fillStyle(c);
        g.fillRect(ox + 4, oy + 4, 8, 8);
        g.fillStyle(2263842);
        g.fillRect(ox + 6, oy + 2, 4, 2);
      } else if (i < 24) {
        g.fillStyle(c);
        g.fillRect(ox + 2, oy + 6, 10, 4);
        g.fillRect(ox + 12, oy + 5, 2, 6);
        g.fillStyle(2236962);
        g.fillRect(ox + 4, oy + 7, 1, 1);
      } else if (i < 32) {
        g.fillStyle(c);
        g.fillRect(ox + 5, oy + 3, 6, 10);
        g.fillStyle(16777215);
        g.fillRect(ox + 6, oy + 4, 2, 3);
      } else if (i < 40) {
        g.fillStyle(c);
        g.fillRect(ox + 3, oy + 6, 10, 6);
        g.fillStyle(16777215);
        g.fillRect(ox + 5, oy + 6, 4, 2);
      } else if (i < 48) {
        g.fillStyle(14596231);
        g.fillRect(ox + 3, oy + 8, 10, 4);
        g.fillStyle(c);
        g.fillRect(ox + 4, oy + 5, 8, 4);
      } else if (i < 56) {
        g.fillStyle(9136404);
        g.fillRect(ox + 7, oy + 4, 2, 10);
        g.fillStyle(c);
        g.fillRect(ox + 4, oy + 2, 8, 4);
      } else {
        g.fillStyle(c);
        g.fillRect(ox + 3, oy + 3, 10, 10);
        g.fillStyle(2236962);
        g.fillRect(ox + 5, oy + 5, 6, 6);
        g.fillStyle(c);
        g.fillRect(ox + 6, oy + 6, 4, 4);
      }
    }
    g.generateTexture("items", T * 8, T * 8);
    g.destroy();
    const iTex = this.textures.get("items");
    for (let i = 0; i < 64; i++) {
      const col = i % 8;
      const row = Math.floor(i / 8);
      iTex.add(i, 0, col * T, row * T, T, T);
    }
  }
  genObjects(T) {
    const g = this.make.graphics();
    g.fillStyle(9127187);
    g.fillRect(1, 4, 14, 12);
    g.fillStyle(10506797);
    g.fillRect(2, 5, 12, 10);
    g.fillStyle(7025680);
    g.fillRect(1, 8, 14, 2);
    g.fillStyle(16766720);
    g.fillRect(6, 2, 4, 3);
    let ox = T;
    g.fillStyle(10506797);
    g.fillRect(ox + 1, 6, 14, 4);
    g.fillStyle(9127187);
    g.fillRect(ox + 2, 10, 3, 6);
    g.fillRect(ox + 11, 10, 3, 6);
    g.fillStyle(13468991);
    g.fillRect(ox + 2, 6, 12, 2);
    g.fillStyle(8947848);
    g.fillRect(ox + 5, 4, 1, 3);
    g.fillRect(ox + 4, 4, 3, 1);
    ox = T * 2;
    g.fillStyle(6044193);
    g.fillRect(ox + 2, 3, 12, 12);
    g.fillStyle(16777215);
    g.fillRect(ox + 3, 4, 10, 3);
    g.fillStyle(4286945);
    g.fillRect(ox + 3, 7, 10, 7);
    g.fillStyle(3430576);
    g.fillRect(ox + 3, 10, 10, 2);
    ox = T * 3;
    g.fillStyle(8947848);
    g.fillRect(ox + 1, 4, 14, 12);
    g.fillStyle(11184810);
    g.fillRect(ox + 2, 4, 12, 4);
    g.fillStyle(16729344);
    g.fillRect(ox + 4, 5, 3, 2);
    g.fillRect(ox + 9, 5, 3, 2);
    ox = T * 4;
    g.fillStyle(6139463);
    g.fillRect(ox, 0, T, T);
    g.fillStyle(7029286);
    g.fillRect(ox + 7, 6, 2, 10);
    g.fillStyle(14596231);
    g.fillRect(ox + 2, 2, 12, 6);
    g.fillStyle(4880942);
    g.fillRect(ox + 3, 3, 10, 4);
    g.fillStyle(16766720);
    g.fillRect(ox + 5, 4, 2, 2);
    ox = T * 5;
    g.fillStyle(6710886);
    g.fillRect(ox, 0, T, T);
    g.fillStyle(8947848);
    g.fillRect(ox + 1, 0, 14, 6);
    g.fillStyle(2236962);
    g.fillRect(ox + 3, 4, 10, 12);
    g.fillStyle(1118481);
    g.fillRect(ox + 5, 6, 6, 10);
    g.fillStyle(12303291);
    g.fillRect(ox + 6, 7, 4, 1);
    g.fillRect(ox + 7, 7, 2, 4);
    ox = T * 6;
    g.fillStyle(6139463);
    g.fillRect(ox, 0, T, T);
    g.fillStyle(7029286);
    g.fillRect(ox + 3, 4, 2, 12);
    g.fillRect(ox + 11, 4, 2, 12);
    g.fillStyle(14596231);
    g.fillRect(ox + 2, 2, 12, 9);
    g.fillStyle(16777200);
    g.fillRect(ox + 4, 3, 3, 4);
    g.fillRect(ox + 8, 4, 3, 3);
    g.fillStyle(16729156);
    g.fillRect(ox + 5, 3, 1, 1);
    g.fillRect(ox + 9, 4, 1, 1);
    ox = T * 7;
    g.fillStyle(10506797);
    g.fillRect(ox + 1, 6, 14, 10);
    g.fillStyle(13386820);
    g.fillRect(ox, 5, 16, 2);
    g.fillRect(ox + 2, 3, 12, 2);
    g.fillRect(ox + 4, 1, 8, 2);
    g.fillRect(ox + 6, 0, 4, 1);
    g.fillStyle(6044193);
    g.fillRect(ox + 6, 10, 4, 6);
    g.fillStyle(8900331);
    g.fillRect(ox + 2, 7, 3, 3);
    g.fillRect(ox + 11, 7, 3, 3);
    g.generateTexture("objects", T * 8, T);
    g.destroy();
    const oTex = this.textures.get("objects");
    for (let i = 0; i < 8; i++)
      oTex.add(i, 0, i * T, 0, T, T);
  }
  genNPCs(T) {
    const g = this.make.graphics();
    const designs = [
      { hair: 16737095, shirt: 4286945, skin: 16764040 },
      { hair: 9127187, shirt: 2263842, skin: 16764040 },
      { hair: 16766720, shirt: 16738740, skin: 16439222 },
      { hair: 2236962, shirt: 8388736, skin: 13935988 },
      { hair: 16777215, shirt: 4620980, skin: 16764040 },
      { hair: 16747520, shirt: 3050327, skin: 16439222 },
      { hair: 9662683, shirt: 14423100, skin: 16764040 },
      { hair: 2142890, shirt: 14329120, skin: 13935988 },
      { hair: 13468991, shirt: 7372944, skin: 16764040 },
      { hair: 16716947, shirt: 7048739, skin: 16439222 }
    ];
    for (let i = 0; i < 10; i++) {
      const ox = i * T, d = designs[i];
      g.fillStyle(4473924);
      g.fillRect(ox + 4, 14, 3, 2);
      g.fillRect(ox + 9, 14, 3, 2);
      g.fillStyle(3881820);
      g.fillRect(ox + 4, 11, 3, 3);
      g.fillRect(ox + 9, 11, 3, 3);
      g.fillStyle(d.shirt);
      g.fillRect(ox + 3, 6, 10, 5);
      g.fillStyle(d.skin);
      g.fillRect(ox + 2, 7, 1, 3);
      g.fillRect(ox + 13, 7, 1, 3);
      g.fillStyle(d.skin);
      g.fillRect(ox + 4, 1, 8, 5);
      g.fillStyle(d.hair);
      g.fillRect(ox + 4, 0, 8, 2);
      g.fillRect(ox + 3, 1, 1, 3);
      g.fillRect(ox + 12, 1, 1, 3);
      g.fillStyle(2236962);
      g.fillRect(ox + 6, 3, 1, 1);
      g.fillRect(ox + 9, 3, 1, 1);
    }
    g.generateTexture("npcs", T * 10, T);
    g.destroy();
    const nTex = this.textures.get("npcs");
    for (let i = 0; i < 10; i++)
      nTex.add(i, 0, i * T, 0, T, T);
  }
  genPortraits() {
    const g = this.make.graphics();
    const designs = [
      { hair: 16737095, shirt: 4286945, skin: 16764040 },
      { hair: 9127187, shirt: 2263842, skin: 16764040 },
      { hair: 16766720, shirt: 16738740, skin: 16439222 },
      { hair: 2236962, shirt: 8388736, skin: 13935988 },
      { hair: 16777215, shirt: 4620980, skin: 16764040 },
      { hair: 16747520, shirt: 3050327, skin: 16439222 },
      { hair: 9662683, shirt: 14423100, skin: 16764040 },
      { hair: 2142890, shirt: 14329120, skin: 13935988 },
      { hair: 13468991, shirt: 7372944, skin: 16764040 },
      { hair: 16716947, shirt: 7048739, skin: 16439222 }
    ];
    for (let i = 0; i < 10; i++) {
      const ox = i * 48, d = designs[i];
      g.fillStyle(1714746);
      g.fillRect(ox, 0, 48, 48);
      g.fillStyle(d.shirt);
      g.fillRect(ox + 4, 34, 40, 14);
      g.fillStyle(d.skin);
      g.fillRect(ox + 18, 30, 12, 6);
      g.fillRect(ox + 10, 8, 28, 24);
      g.fillRect(ox + 12, 6, 24, 28);
      g.fillStyle(d.hair);
      g.fillRect(ox + 10, 4, 28, 8);
      g.fillRect(ox + 8, 6, 4, 14);
      g.fillRect(ox + 36, 6, 4, 14);
      g.fillStyle(16777215);
      g.fillRect(ox + 15, 16, 7, 5);
      g.fillRect(ox + 26, 16, 7, 5);
      g.fillStyle(3359829);
      g.fillRect(ox + 17, 17, 4, 3);
      g.fillRect(ox + 28, 17, 4, 3);
      g.fillStyle(1118481);
      g.fillRect(ox + 18, 17, 2, 2);
      g.fillRect(ox + 29, 17, 2, 2);
      g.fillStyle(13404262);
      g.fillRect(ox + 19, 27, 10, 2);
    }
    g.generateTexture("portraits", 480, 48);
    g.destroy();
    const prTex = this.textures.get("portraits");
    for (let i = 0; i < 10; i++)
      prTex.add(i, 0, i * 48, 0, 48, 48);
  }
  genUIIcons(T) {
    const g = this.make.graphics();
    for (let i = 0; i < 16; i++) {
      const ox = i * T;
      g.fillStyle(3355460);
      g.fillRect(ox, 0, T, T);
      g.fillStyle(8947865);
      g.fillRect(ox + 2, 2, T - 4, T - 4);
    }
    g.generateTexture("ui_icons", T * 16, T);
    g.destroy();
    const uTex = this.textures.get("ui_icons");
    for (let i = 0; i < 16; i++)
      uTex.add(i, 0, i * T, 0, T, T);
  }
  genTools(T) {
    const g = this.make.graphics();
    g.fillStyle(9136404);
    g.fillRect(7, 3, 2, 11);
    g.fillStyle(8947848);
    g.fillRect(4, 2, 8, 3);
    let ox = T;
    g.fillStyle(4620980);
    g.fillRect(ox + 4, 5, 8, 8);
    g.fillRect(ox + 3, 6, 1, 4);
    g.fillRect(ox + 12, 4, 3, 2);
    g.fillStyle(5943278);
    g.fillRect(ox + 13, 3, 2, 1);
    ox = T * 2;
    g.fillStyle(9136404);
    g.fillRect(ox + 7, 4, 2, 10);
    g.fillStyle(8947848);
    g.fillRect(ox + 3, 2, 6, 4);
    g.fillRect(ox + 2, 3, 2, 2);
    ox = T * 3;
    g.fillStyle(9136404);
    g.fillRect(ox + 7, 5, 2, 9);
    g.fillStyle(8947848);
    g.fillRect(ox + 3, 2, 10, 3);
    g.fillRect(ox + 2, 3, 2, 2);
    g.fillRect(ox + 12, 3, 2, 2);
    ox = T * 4;
    g.fillStyle(9136404);
    g.fillRect(ox + 6, 2, 2, 12);
    g.fillStyle(13421772);
    g.fillRect(ox + 8, 2, 5, 1);
    g.fillRect(ox + 12, 2, 1, 6);
    g.fillStyle(16729156);
    g.fillRect(ox + 12, 8, 1, 2);
    ox = T * 5;
    g.fillStyle(9136404);
    g.fillRect(ox + 7, 4, 2, 10);
    g.fillStyle(12303291);
    g.fillRect(ox + 2, 2, 8, 2);
    g.fillRect(ox + 2, 4, 2, 3);
    g.generateTexture("tools", T * 6, T);
    g.destroy();
    const tlTex = this.textures.get("tools");
    for (let i = 0; i < 6; i++)
      tlTex.add(i, 0, i * T, 0, T, T);
  }
  genAnimals(T) {
    const g = this.make.graphics();
    const a = [{ b: 16777215, d: 16764108 }, { b: 9127187, d: 16764040 }, { b: 16119260, d: 13421755 }, { b: 16747520, d: 16755268 }, { b: 8947848, d: 11184810 }];
    for (let i = 0; i < 5; i++) {
      const ox = i * T;
      g.fillStyle(a[i].b);
      g.fillRect(ox + 3, 6, 10, 6);
      g.fillRect(ox + 4, 5, 8, 8);
      g.fillStyle(a[i].d);
      g.fillRect(ox + 10, 3, 5, 4);
      g.fillStyle(2236962);
      g.fillRect(ox + 12, 4, 1, 1);
      g.fillStyle(9136404);
      g.fillRect(ox + 5, 12, 2, 4);
      g.fillRect(ox + 9, 12, 2, 4);
    }
    g.generateTexture("animals", T * 5, T);
    g.destroy();
    const aTex = this.textures.get("animals");
    for (let i = 0; i < 5; i++)
      aTex.add(i, 0, i * T, 0, T, T);
  }
  genMonsters(T) {
    const g = this.make.graphics();
    g.fillStyle(4508740);
    g.fillRect(3, 6, 10, 8);
    g.fillRect(4, 4, 8, 10);
    g.fillStyle(8978312);
    g.fillRect(5, 5, 3, 2);
    g.fillStyle(2236962);
    g.fillRect(5, 7, 2, 2);
    g.fillRect(9, 7, 2, 2);
    let ox = T;
    g.fillStyle(8930474);
    g.fillRect(ox + 1, 5, 5, 4);
    g.fillRect(ox + 10, 5, 5, 4);
    g.fillStyle(6693546);
    g.fillRect(ox + 5, 4, 6, 6);
    g.fillStyle(16729156);
    g.fillRect(ox + 6, 6, 2, 1);
    g.fillRect(ox + 8, 6, 2, 1);
    ox = T * 2;
    g.fillStyle(8947848);
    g.fillRect(ox + 3, 4, 10, 10);
    g.fillStyle(11184810);
    g.fillRect(ox + 4, 3, 8, 4);
    g.fillStyle(16729156);
    g.fillRect(ox + 5, 5, 2, 2);
    g.fillRect(ox + 9, 5, 2, 2);
    g.generateTexture("monsters", T * 3, T);
    g.destroy();
    const mTex = this.textures.get("monsters");
    for (let i = 0; i < 3; i++)
      mTex.add(i, 0, i * T, 0, T, T);
  }
  genHouseComposite(T) {
    const g = this.make.graphics();
    const W = T * 5;
    const H = T * 4;
    g.fillStyle(9136404);
    g.fillRect(0, H - 4, W, 4);
    g.fillStyle(13808780);
    g.fillRect(4, 20, W - 8, H - 24);
    g.fillStyle(12888194);
    for (let y = 24; y < H - 4; y += 6)
      g.fillRect(6, y, W - 12, 1);
    g.fillStyle(13386820);
    g.fillTriangle(W / 2, 0, -4, 22, W + 4, 22);
    g.fillStyle(11154227);
    g.fillTriangle(W / 2, 0, -4, 22, W / 2, 22);
    g.fillStyle(9118242);
    g.fillRect(-4, 20, W + 8, 3);
    g.fillStyle(6044193);
    g.fillRect(W / 2 - 6, H - 22, 12, 18);
    g.fillStyle(4861464);
    g.fillRect(W / 2 - 4, H - 20, 8, 16);
    g.fillStyle(16766720);
    g.fillRect(W / 2 + 2, H - 12, 2, 2);
    g.fillStyle(8900331);
    g.fillRect(10, 28, 12, 10);
    g.fillRect(W - 22, 28, 12, 10);
    g.fillStyle(6044193);
    g.fillRect(10, 32, 12, 1);
    g.fillRect(15, 28, 1, 10);
    g.fillRect(W - 22, 32, 12, 1);
    g.fillRect(W - 17, 28, 1, 10);
    g.fillStyle(8947848);
    g.fillRect(W - 18, 2, 8, 20);
    g.fillStyle(6710886);
    g.fillRect(W - 18, 2, 8, 2);
    g.generateTexture("house", W, H);
    g.destroy();
  }
  genTreeComposite(T) {
    const g = this.make.graphics();
    const W = T * 2;
    const H = T * 3;
    g.fillStyle(7029286);
    g.fillRect(12, 24, 8, 24);
    g.fillStyle(9132587);
    g.fillRect(14, 26, 4, 20);
    g.fillStyle(2976557);
    g.fillRect(2, 18, 28, 10);
    g.fillStyle(3836730);
    g.fillRect(4, 10, 24, 12);
    g.fillStyle(4894282);
    g.fillRect(6, 4, 20, 12);
    g.fillStyle(6146141);
    g.fillRect(10, 0, 12, 8);
    g.fillStyle(7068523);
    g.fillRect(12, 2, 4, 3);
    g.fillRect(8, 8, 3, 3);
    g.fillRect(18, 6, 3, 2);
    g.generateTexture("tree", W, H);
    g.destroy();
  }
  genFenceComposite(T) {
    const g = this.make.graphics();
    g.fillStyle(9136404);
    g.fillRect(6, 2, 4, 14);
    g.fillStyle(10519084);
    g.fillRect(0, 4, T, 3);
    g.fillStyle(10519084);
    g.fillRect(0, 10, T, 3);
    g.fillStyle(12294468);
    g.fillRect(6, 1, 4, 2);
    g.generateTexture("fence", T, T);
    g.destroy();
  }
};

// src/scenes/MenuScene.ts
var MenuScene = class extends phaser_shim_default.Scene {
  constructor() {
    super(Scenes.MENU);
    this.stars = [];
    this.titleHue = 0.22;
  }
  create() {
    const { width, height, centerX } = this.cameras.main;
    this.drawBackdrop(width, height);
    this.createStarfield(width, height);
    this.titleText = this.add.text(centerX, 110, "HEARTHFIELD", {
      fontFamily: "monospace",
      fontSize: "76px",
      fontStyle: "bold",
      color: "#9de06f",
      stroke: "#1a2d0f",
      strokeThickness: 8
    }).setOrigin(0.5).setShadow(0, 5, "#0a1408", 0, false, true);
    this.add.text(centerX, 168, "A farming adventure", {
      fontFamily: "monospace",
      fontSize: "22px",
      color: "#d8efb8"
    }).setOrigin(0.5);
    const menuStartY = 260;
    const rowGap = 52;
    this.createMenuButton("New Game", menuStartY, () => {
      this.openNamePrompt();
    });
    if (this.hasSaveData()) {
      this.createMenuButton("Continue", menuStartY + rowGap, () => {
        this.scene.start(Scenes.PLAY, { loadSave: true });
      });
    }
    const controlsY = this.hasSaveData() ? menuStartY + rowGap * 2 : menuStartY + rowGap;
    this.createMenuButton("Controls", controlsY, () => {
      this.toggleControlsOverlay(true);
    });
    this.createControlsOverlay(width, height);
    this.input.keyboard?.on("keydown-ESC", () => {
      if (this.controlsOverlay?.visible) {
        this.toggleControlsOverlay(false);
      }
    });
    this.events.once(phaser_shim_default.Scenes.Events.SHUTDOWN, this.cleanupDom, this);
    this.events.once(phaser_shim_default.Scenes.Events.DESTROY, this.cleanupDom, this);
  }
  update(_time, delta) {
    this.updateStarfield(delta);
    this.cycleTitleColor(delta);
  }
  drawBackdrop(width, height) {
    const bg = this.add.graphics();
    bg.fillStyle(991021, 1);
    bg.fillRect(0, 0, width, height);
    bg.fillStyle(1716290, 1);
    bg.fillRect(0, height - 160, width, 160);
    bg.fillStyle(2441042, 1);
    for (let i = 0; i < width; i += 18) {
      const h = 30 + i / 18 % 3 * 12;
      bg.fillRect(i, height - h, 16, h);
    }
  }
  createStarfield(width, height) {
    this.starGraphics = this.add.graphics();
    const starCount = 100;
    this.stars = [];
    for (let i = 0; i < starCount; i += 1) {
      this.stars.push({
        x: phaser_shim_default.Math.Between(0, width),
        y: phaser_shim_default.Math.Between(0, height),
        size: phaser_shim_default.Math.Between(1, 3),
        speed: phaser_shim_default.Math.FloatBetween(5, 22),
        twinkle: phaser_shim_default.Math.FloatBetween(0, Math.PI * 2)
      });
    }
    this.updateStarfield(0);
  }
  updateStarfield(delta) {
    const { width, height } = this.cameras.main;
    this.starGraphics.clear();
    for (const star of this.stars) {
      star.y += star.speed * (delta / 1e3);
      star.twinkle += delta * 4e-3;
      if (star.y > height + 4) {
        star.y = -4;
        star.x = phaser_shim_default.Math.Between(0, width);
      }
      const alpha = 0.35 + Math.sin(star.twinkle) * 0.25;
      this.starGraphics.fillStyle(16777215, phaser_shim_default.Math.Clamp(alpha, 0.1, 0.9));
      this.starGraphics.fillRect(Math.round(star.x), Math.round(star.y), star.size, star.size);
    }
  }
  cycleTitleColor(delta) {
    this.titleHue = (this.titleHue + delta * 3e-5) % 1;
    const color = phaser_shim_default.Display.Color.HSLToColor(this.titleHue, 0.65, 0.62).color.toString(16).padStart(6, "0");
    this.titleText.setColor(`#${color}`);
  }
  createMenuButton(label, y, onClick) {
    const cx = this.cameras.main.centerX;
    const btn = this.add.text(cx, y, label, {
      fontFamily: "monospace",
      fontSize: "36px",
      color: "#f2f7db",
      stroke: "#12240e",
      strokeThickness: 6
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    btn.on("pointerover", () => {
      btn.setColor("#fff9b0");
      btn.setScale(1.05);
    });
    btn.on("pointerout", () => {
      btn.setColor("#f2f7db");
      btn.setScale(1);
    });
    btn.on("pointerdown", onClick);
    return btn;
  }
  hasSaveData() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      return Boolean(raw && raw.trim().length > 0);
    } catch {
      return false;
    }
  }
  createControlsOverlay(width, height) {
    const panel = this.add.container(width / 2, height / 2);
    const bg = this.add.rectangle(0, 0, 700, 420, 858660, 0.95);
    const border = this.add.rectangle(0, 0, 704, 424, 12115872, 0).setStrokeStyle(4, 12115872, 1);
    const title = this.add.text(0, -170, "CONTROLS", {
      fontFamily: "monospace",
      fontSize: "40px",
      fontStyle: "bold",
      color: "#f2f7db"
    }).setOrigin(0.5);
    const lines = [
      "WASD / Arrow Keys  - Move",
      "E                  - Interact",
      "1-9                - Hotbar Select",
      "Space              - Use Tool",
      "Tab                - Inventory",
      "Esc                - Pause / Close",
      "F                  - Fish"
    ];
    const body = this.add.text(-290, -110, lines.join("\n"), {
      fontFamily: "monospace",
      fontSize: "24px",
      color: "#d9f0c8",
      lineSpacing: 14
    }).setOrigin(0, 0);
    const close = this.add.text(0, 160, "Close", {
      fontFamily: "monospace",
      fontSize: "30px",
      color: "#f2f7db",
      stroke: "#12240e",
      strokeThickness: 6
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    close.on("pointerover", () => close.setColor("#fff9b0"));
    close.on("pointerout", () => close.setColor("#f2f7db"));
    close.on("pointerdown", () => this.toggleControlsOverlay(false));
    panel.add([bg, border, title, body, close]);
    panel.setDepth(20);
    panel.setVisible(false);
    this.controlsOverlay = panel;
  }
  toggleControlsOverlay(show) {
    if (!this.controlsOverlay) {
      return;
    }
    this.controlsOverlay.setVisible(show);
  }
  openNamePrompt() {
    if (this.namePrompt) {
      return;
    }
    const prompt = document.createElement("div");
    prompt.style.position = "fixed";
    prompt.style.padding = "14px";
    prompt.style.background = "#101b25";
    prompt.style.border = "3px solid #b8dfa0";
    prompt.style.boxShadow = "0 0 0 3px #263e31";
    prompt.style.fontFamily = "monospace";
    prompt.style.zIndex = "1000";
    prompt.style.display = "flex";
    prompt.style.flexDirection = "column";
    prompt.style.gap = "10px";
    prompt.style.minWidth = "280px";
    const label = document.createElement("label");
    label.textContent = "Enter your farmer name:";
    label.style.color = "#eef9d7";
    label.style.fontSize = "14px";
    const input = document.createElement("input");
    input.type = "text";
    input.maxLength = 20;
    input.placeholder = "Farmer";
    input.style.padding = "8px";
    input.style.fontFamily = "monospace";
    input.style.fontSize = "16px";
    input.style.border = "2px solid #7eaf69";
    input.style.background = "#1f2f22";
    input.style.color = "#f5ffe4";
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.gap = "8px";
    row.style.justifyContent = "flex-end";
    const startBtn = document.createElement("button");
    startBtn.type = "button";
    startBtn.textContent = "Start";
    startBtn.style.fontFamily = "monospace";
    startBtn.style.padding = "8px 14px";
    startBtn.style.cursor = "pointer";
    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.textContent = "Cancel";
    cancelBtn.style.fontFamily = "monospace";
    cancelBtn.style.padding = "8px 14px";
    cancelBtn.style.cursor = "pointer";
    row.appendChild(cancelBtn);
    row.appendChild(startBtn);
    prompt.appendChild(label);
    prompt.appendChild(input);
    prompt.appendChild(row);
    const startGame = () => {
      const playerName = input.value.trim() || "Farmer";
      this.cleanupDom();
      this.scene.start(Scenes.INTRO, { playerName });
    };
    startBtn.addEventListener("click", startGame);
    cancelBtn.addEventListener("click", () => this.cleanupDom());
    input.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter") {
        startGame();
      } else if (ev.key === "Escape") {
        this.cleanupDom();
      }
    });
    document.body.appendChild(prompt);
    const positionPrompt = () => {
      const rect = this.game.canvas.getBoundingClientRect();
      prompt.style.left = `${rect.left + rect.width / 2}px`;
      prompt.style.top = `${rect.top + rect.height / 2}px`;
      prompt.style.transform = "translate(-50%, -50%)";
    };
    this.promptReposition = positionPrompt;
    window.addEventListener("resize", this.promptReposition);
    this.scale.on("resize", positionPrompt);
    positionPrompt();
    input.focus();
    this.namePrompt = prompt;
  }
  cleanupDom() {
    if (this.promptReposition) {
      window.removeEventListener("resize", this.promptReposition);
      this.scale.off("resize", this.promptReposition);
      this.promptReposition = void 0;
    }
    if (this.namePrompt) {
      this.namePrompt.remove();
      this.namePrompt = void 0;
    }
  }
};

// src/scenes/IntroScene.ts
var IntroScene = class extends phaser_shim_default.Scene {
  constructor() {
    super(Scenes.INTRO);
    this.lines = [
      "Dear Farmer,",
      "Your grandfather has left you his farm in Hearthfield Valley.",
      "It's been years since anyone worked the land...",
      "But with some care, it could flourish again.",
      "Spring 1, Year 1 \u2014 Your new life begins."
    ];
    this.lineIndex = 0;
    this.currentTyped = "";
    this.isTyping = false;
    this.canAdvance = false;
    this.playerName = "Farmer";
  }
  init(data) {
    if (data?.playerName?.trim()) {
      this.playerName = data.playerName.trim();
    }
  }
  create() {
    const { width, height } = this.cameras.main;
    this.lines[0] = `Dear ${this.playerName},`;
    this.add.rectangle(width / 2, height / 2, width, height, 0, 1);
    this.bodyText = this.add.text(width / 2, height / 2 - 20, "", {
      fontFamily: "monospace",
      fontSize: "24px",
      color: "#f4f1d4",
      align: "center",
      lineSpacing: 6,
      wordWrap: { width: 680 }
    }).setOrigin(0.5);
    this.promptText = this.add.text(width / 2, height - 70, "Click or SPACE to continue", {
      fontFamily: "monospace",
      fontSize: "14px",
      color: "#9e9e9e"
    }).setOrigin(0.5).setAlpha(0);
    this.tweens.add({
      targets: this.promptText,
      alpha: { from: 0.15, to: 0.85 },
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });
    this.cameras.main.fadeIn(600, 0, 0, 0);
    this.typeLine(this.lines[this.lineIndex]);
    this.input.on("pointerdown", () => this.advance());
    this.input.keyboard?.on("keydown-SPACE", () => this.advance());
    this.events.once(phaser_shim_default.Scenes.Events.SHUTDOWN, () => {
      this.typeTimer?.remove(false);
    });
  }
  typeLine(line) {
    this.typeTimer?.remove(false);
    this.currentTyped = "";
    this.bodyText.setText("");
    this.isTyping = true;
    this.canAdvance = false;
    let i = 0;
    this.typeTimer = this.time.addEvent({
      delay: 30,
      repeat: Math.max(0, line.length - 1),
      callback: () => {
        this.currentTyped += line.charAt(i);
        i += 1;
        this.bodyText.setText(this.currentTyped);
      },
      callbackScope: this
    });
    const doneAfterMs = Math.max(280, line.length * 30 + 120);
    this.time.delayedCall(doneAfterMs, () => {
      this.bodyText.setText(line);
      this.isTyping = false;
      this.canAdvance = true;
    });
  }
  advance() {
    if (this.isTyping) {
      const line = this.lines[this.lineIndex];
      this.typeTimer?.remove(false);
      this.bodyText.setText(line);
      this.isTyping = false;
      this.canAdvance = true;
      return;
    }
    if (!this.canAdvance) {
      return;
    }
    this.canAdvance = false;
    this.lineIndex += 1;
    if (this.lineIndex >= this.lines.length) {
      this.cameras.main.fadeOut(900, 0, 0, 0);
      this.cameras.main.once(phaser_shim_default.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        this.scene.start(Scenes.PLAY, { playerName: this.playerName });
      });
      return;
    }
    this.typeLine(this.lines[this.lineIndex]);
  }
};

// src/data/registry.ts
var ITEMS = [
  // Seeds
  { id: "parsnip_seeds", name: "Parsnip Seeds", category: "seed" /* SEED */, sellPrice: 10, description: "Plant in spring.", spriteIndex: 0 },
  { id: "potato_seeds", name: "Potato Seeds", category: "seed" /* SEED */, sellPrice: 25, description: "Plant in spring.", spriteIndex: 1 },
  { id: "cauliflower_seeds", name: "Cauliflower Seeds", category: "seed" /* SEED */, sellPrice: 40, description: "Plant in spring.", spriteIndex: 2 },
  { id: "melon_seeds", name: "Melon Seeds", category: "seed" /* SEED */, sellPrice: 40, description: "Plant in summer.", spriteIndex: 3 },
  { id: "tomato_seeds", name: "Tomato Seeds", category: "seed" /* SEED */, sellPrice: 25, description: "Plant in summer. Regrows.", spriteIndex: 4 },
  { id: "blueberry_seeds", name: "Blueberry Seeds", category: "seed" /* SEED */, sellPrice: 40, description: "Plant in summer. Regrows.", spriteIndex: 5 },
  { id: "pumpkin_seeds", name: "Pumpkin Seeds", category: "seed" /* SEED */, sellPrice: 50, description: "Plant in fall.", spriteIndex: 6 },
  { id: "cranberry_seeds", name: "Cranberry Seeds", category: "seed" /* SEED */, sellPrice: 60, description: "Plant in fall. Regrows.", spriteIndex: 7 },
  { id: "corn_seeds", name: "Corn Seeds", category: "seed" /* SEED */, sellPrice: 75, description: "Plant in summer or fall.", spriteIndex: 8 },
  // Crops (harvest products)
  { id: "parsnip", name: "Parsnip", category: "crop" /* CROP */, sellPrice: 35, description: "A tasty root vegetable.", spriteIndex: 10 },
  { id: "potato", name: "Potato", category: "crop" /* CROP */, sellPrice: 80, description: "Versatile and filling.", spriteIndex: 11 },
  { id: "cauliflower", name: "Cauliflower", category: "crop" /* CROP */, sellPrice: 175, description: "A prized spring crop.", spriteIndex: 12 },
  { id: "melon", name: "Melon", category: "crop" /* CROP */, sellPrice: 250, description: "Sweet and refreshing.", spriteIndex: 13 },
  { id: "tomato", name: "Tomato", category: "crop" /* CROP */, sellPrice: 60, description: "Juicy and versatile.", spriteIndex: 14 },
  { id: "blueberry", name: "Blueberry", category: "crop" /* CROP */, sellPrice: 50, description: "Tiny but packed with flavor.", spriteIndex: 15 },
  { id: "pumpkin", name: "Pumpkin", category: "crop" /* CROP */, sellPrice: 320, description: "The pride of fall.", spriteIndex: 16 },
  { id: "cranberry", name: "Cranberry", category: "crop" /* CROP */, sellPrice: 75, description: "Tart and colorful.", spriteIndex: 17 },
  { id: "corn", name: "Corn", category: "crop" /* CROP */, sellPrice: 50, description: "Golden and sweet.", spriteIndex: 18 },
  // Resources
  { id: "wood", name: "Wood", category: "resource" /* RESOURCE */, sellPrice: 2, description: "Basic building material.", spriteIndex: 20 },
  { id: "stone", name: "Stone", category: "resource" /* RESOURCE */, sellPrice: 2, description: "Hard and dependable.", spriteIndex: 21 },
  { id: "fiber", name: "Fiber", category: "resource" /* RESOURCE */, sellPrice: 1, description: "Useful for crafting.", spriteIndex: 22 },
  { id: "clay", name: "Clay", category: "resource" /* RESOURCE */, sellPrice: 5, description: "Found when tilling soil.", spriteIndex: 23 },
  { id: "coal", name: "Coal", category: "resource" /* RESOURCE */, sellPrice: 15, description: "Burns hot.", spriteIndex: 24 },
  { id: "sap", name: "Sap", category: "resource" /* RESOURCE */, sellPrice: 2, description: "Sticky tree sap.", spriteIndex: 25 },
  // Ores & Bars
  { id: "copper_ore", name: "Copper Ore", category: "ore" /* ORE */, sellPrice: 5, description: "Common ore.", spriteIndex: 26 },
  { id: "iron_ore", name: "Iron Ore", category: "ore" /* ORE */, sellPrice: 10, description: "Sturdy ore.", spriteIndex: 27 },
  { id: "gold_ore", name: "Gold Ore", category: "ore" /* ORE */, sellPrice: 25, description: "Precious ore.", spriteIndex: 28 },
  { id: "copper_bar", name: "Copper Bar", category: "bar" /* BAR */, sellPrice: 60, description: "Smelted copper.", spriteIndex: 29 },
  { id: "iron_bar", name: "Iron Bar", category: "bar" /* BAR */, sellPrice: 120, description: "Smelted iron.", spriteIndex: 30 },
  { id: "gold_bar", name: "Gold Bar", category: "bar" /* BAR */, sellPrice: 250, description: "Smelted gold.", spriteIndex: 31 },
  // Fish
  { id: "sardine", name: "Sardine", category: "fish" /* FISH */, sellPrice: 40, description: "A common ocean fish.", spriteIndex: 32 },
  { id: "trout", name: "Trout", category: "fish" /* FISH */, sellPrice: 65, description: "Freshwater beauty.", spriteIndex: 33 },
  { id: "salmon", name: "Salmon", category: "fish" /* FISH */, sellPrice: 75, description: "A prized catch.", spriteIndex: 34 },
  { id: "catfish", name: "Catfish", category: "fish" /* FISH */, sellPrice: 200, description: "Lurks in the deep.", spriteIndex: 35 },
  { id: "tuna", name: "Tuna", category: "fish" /* FISH */, sellPrice: 100, description: "Fast and powerful.", spriteIndex: 36 },
  { id: "legendary_fish", name: "Legend", category: "fish" /* FISH */, sellPrice: 5e3, description: "The fish of legend.", spriteIndex: 37 },
  // Food (cooked / foraged)
  { id: "wild_berries", name: "Wild Berries", category: "food" /* FOOD */, sellPrice: 20, description: "Sweet and wild.", edible: true, staminaRestore: 15, spriteIndex: 40 },
  { id: "mushroom", name: "Mushroom", category: "food" /* FOOD */, sellPrice: 40, description: "An earthy fungus.", edible: true, staminaRestore: 20, spriteIndex: 41 },
  { id: "baked_potato", name: "Baked Potato", category: "food" /* FOOD */, sellPrice: 120, description: "Warm and filling.", edible: true, staminaRestore: 35, spriteIndex: 42 },
  { id: "tomato_soup", name: "Tomato Soup", category: "food" /* FOOD */, sellPrice: 150, description: "Comforting.", edible: true, staminaRestore: 40, spriteIndex: 43 },
  { id: "fish_stew", name: "Fish Stew", category: "food" /* FOOD */, sellPrice: 200, description: "Hearty and warming.", edible: true, staminaRestore: 50, buff: "fishing" /* FISHING */, buffDuration: 120, spriteIndex: 44 },
  { id: "farmers_lunch", name: "Farmer's Lunch", category: "food" /* FOOD */, sellPrice: 180, description: "Energizing!", edible: true, staminaRestore: 60, buff: "farming" /* FARMING */, buffDuration: 120, spriteIndex: 45 },
  { id: "miners_treat", name: "Miner's Treat", category: "food" /* FOOD */, sellPrice: 220, description: "Sustaining.", edible: true, staminaRestore: 50, buff: "mining" /* MINING */, buffDuration: 180, spriteIndex: 46 },
  { id: "lucky_charm", name: "Lucky Charm", category: "food" /* FOOD */, sellPrice: 300, description: "Feels lucky!", edible: true, staminaRestore: 25, buff: "luck" /* LUCK */, buffDuration: 240, spriteIndex: 47 },
  // Gems
  { id: "amethyst", name: "Amethyst", category: "gem" /* GEM */, sellPrice: 100, description: "A purple gem.", spriteIndex: 48 },
  { id: "aquamarine", name: "Aquamarine", category: "gem" /* GEM */, sellPrice: 180, description: "A blue-green gem.", spriteIndex: 49 },
  { id: "ruby", name: "Ruby", category: "gem" /* GEM */, sellPrice: 250, description: "A fiery red gem.", spriteIndex: 50 },
  { id: "emerald", name: "Emerald", category: "gem" /* GEM */, sellPrice: 250, description: "Lush green.", spriteIndex: 51 },
  { id: "diamond", name: "Diamond", category: "gem" /* GEM */, sellPrice: 750, description: "Flawless.", spriteIndex: 52 },
  // Craftables & Machines
  { id: "chest", name: "Chest", category: "craftable" /* CRAFTABLE */, sellPrice: 0, description: "Stores items.", spriteIndex: 53 },
  { id: "sprinkler", name: "Sprinkler", category: "machine" /* MACHINE */, sellPrice: 100, description: "Waters adjacent tiles.", spriteIndex: 54 },
  { id: "scarecrow", name: "Scarecrow", category: "machine" /* MACHINE */, sellPrice: 50, description: "Protects crops from crows.", spriteIndex: 55 },
  { id: "furnace", name: "Furnace", category: "machine" /* MACHINE */, sellPrice: 0, description: "Smelts ore into bars.", spriteIndex: 56 },
  { id: "bee_house", name: "Bee House", category: "machine" /* MACHINE */, sellPrice: 100, description: "Produces honey.", spriteIndex: 57 },
  { id: "honey", name: "Honey", category: "food" /* FOOD */, sellPrice: 100, description: "Golden sweetness.", edible: true, staminaRestore: 20, spriteIndex: 58 },
  // Gifts / Special
  { id: "bouquet", name: "Bouquet", category: "gift" /* GIFT */, sellPrice: 0, description: "Express your feelings.", spriteIndex: 59 },
  { id: "pendant", name: "Mermaid Pendant", category: "special" /* SPECIAL */, sellPrice: 0, description: "A proposal item.", spriteIndex: 60 },
  { id: "starfruit", name: "Starfruit", category: "crop" /* CROP */, sellPrice: 750, description: "An exotic fruit.", spriteIndex: 61 },
  // Tools (in inventory form)
  { id: "tool_hoe", name: "Hoe", category: "tool" /* TOOL */, sellPrice: 0, description: "Tills soil.", spriteIndex: 62 },
  { id: "tool_watering_can", name: "Watering Can", category: "tool" /* TOOL */, sellPrice: 0, description: "Waters crops.", spriteIndex: 63 }
];
var CROPS = [
  { id: "parsnip_crop", name: "Parsnip", seedId: "parsnip_seeds", harvestId: "parsnip", seasons: ["spring" /* SPRING */], growthDays: 4, growthStages: 4, regrows: false, sellPrice: 35, spriteRow: 0 },
  { id: "potato_crop", name: "Potato", seedId: "potato_seeds", harvestId: "potato", seasons: ["spring" /* SPRING */], growthDays: 6, growthStages: 5, regrows: false, sellPrice: 80, spriteRow: 1 },
  { id: "cauliflower_crop", name: "Cauliflower", seedId: "cauliflower_seeds", harvestId: "cauliflower", seasons: ["spring" /* SPRING */], growthDays: 12, growthStages: 5, regrows: false, sellPrice: 175, spriteRow: 2 },
  { id: "melon_crop", name: "Melon", seedId: "melon_seeds", harvestId: "melon", seasons: ["summer" /* SUMMER */], growthDays: 12, growthStages: 5, regrows: false, sellPrice: 250, spriteRow: 3 },
  { id: "tomato_crop", name: "Tomato", seedId: "tomato_seeds", harvestId: "tomato", seasons: ["summer" /* SUMMER */], growthDays: 11, growthStages: 5, regrows: true, regrowDays: 4, sellPrice: 60, spriteRow: 4 },
  { id: "blueberry_crop", name: "Blueberry", seedId: "blueberry_seeds", harvestId: "blueberry", seasons: ["summer" /* SUMMER */], growthDays: 13, growthStages: 5, regrows: true, regrowDays: 4, sellPrice: 50, spriteRow: 5 },
  { id: "pumpkin_crop", name: "Pumpkin", seedId: "pumpkin_seeds", harvestId: "pumpkin", seasons: ["fall" /* FALL */], growthDays: 13, growthStages: 5, regrows: false, sellPrice: 320, spriteRow: 6 },
  { id: "cranberry_crop", name: "Cranberry", seedId: "cranberry_seeds", harvestId: "cranberry", seasons: ["fall" /* FALL */], growthDays: 7, growthStages: 5, regrows: true, regrowDays: 5, sellPrice: 75, spriteRow: 7 },
  { id: "corn_crop", name: "Corn", seedId: "corn_seeds", harvestId: "corn", seasons: ["summer" /* SUMMER */, "fall" /* FALL */], growthDays: 14, growthStages: 6, regrows: false, sellPrice: 50, spriteRow: 8 }
];
var RECIPES = [
  // Crafting (bench)
  { id: "craft_chest", name: "Chest", resultId: "chest", resultQty: 1, ingredients: [{ itemId: "wood", qty: 50 }], isCooking: false, spriteIndex: 53 },
  { id: "craft_scarecrow", name: "Scarecrow", resultId: "scarecrow", resultQty: 1, ingredients: [{ itemId: "wood", qty: 50 }, { itemId: "coal", qty: 1 }, { itemId: "fiber", qty: 20 }], isCooking: false, spriteIndex: 55 },
  { id: "craft_sprinkler", name: "Sprinkler", resultId: "sprinkler", resultQty: 1, ingredients: [{ itemId: "copper_bar", qty: 1 }, { itemId: "iron_bar", qty: 1 }], isCooking: false, spriteIndex: 54 },
  { id: "craft_furnace", name: "Furnace", resultId: "furnace", resultQty: 1, ingredients: [{ itemId: "copper_ore", qty: 20 }, { itemId: "stone", qty: 25 }], isCooking: false, spriteIndex: 56 },
  { id: "craft_bee_house", name: "Bee House", resultId: "bee_house", resultQty: 1, ingredients: [{ itemId: "wood", qty: 40 }, { itemId: "coal", qty: 8 }, { itemId: "iron_bar", qty: 1 }], isCooking: false, spriteIndex: 57 },
  // Cooking (kitchen)
  { id: "cook_baked_potato", name: "Baked Potato", resultId: "baked_potato", resultQty: 1, ingredients: [{ itemId: "potato", qty: 1 }], isCooking: true, spriteIndex: 42 },
  { id: "cook_tomato_soup", name: "Tomato Soup", resultId: "tomato_soup", resultQty: 1, ingredients: [{ itemId: "tomato", qty: 2 }], isCooking: true, spriteIndex: 43 },
  { id: "cook_fish_stew", name: "Fish Stew", resultId: "fish_stew", resultQty: 1, ingredients: [{ itemId: "trout", qty: 1 }, { itemId: "tomato", qty: 1 }, { itemId: "potato", qty: 1 }], isCooking: true, spriteIndex: 44 },
  { id: "cook_farmers_lunch", name: "Farmer's Lunch", resultId: "farmers_lunch", resultQty: 1, ingredients: [{ itemId: "parsnip", qty: 1 }, { itemId: "potato", qty: 1 }], isCooking: true, spriteIndex: 45 },
  { id: "cook_miners_treat", name: "Miner's Treat", resultId: "miners_treat", resultQty: 1, ingredients: [{ itemId: "mushroom", qty: 2 }, { itemId: "gold_bar", qty: 1 }], isCooking: true, spriteIndex: 46 }
];
var FISH = [
  { id: "sardine", name: "Sardine", seasons: ["spring" /* SPRING */, "summer" /* SUMMER */, "fall" /* FALL */, "winter" /* WINTER */], locations: ["beach" /* BEACH */], timeOfDay: ["morning" /* MORNING */, "afternoon" /* AFTERNOON */], difficulty: "easy" /* EASY */, sellPrice: 40, spriteIndex: 32 },
  { id: "trout", name: "Trout", seasons: ["spring" /* SPRING */, "summer" /* SUMMER */], locations: ["forest" /* FOREST */, "farm" /* FARM */], timeOfDay: ["morning" /* MORNING */, "evening" /* EVENING */], difficulty: "easy" /* EASY */, sellPrice: 65, spriteIndex: 33 },
  { id: "salmon", name: "Salmon", seasons: ["fall" /* FALL */], locations: ["forest" /* FOREST */], timeOfDay: ["morning" /* MORNING */, "afternoon" /* AFTERNOON */, "evening" /* EVENING */], difficulty: "medium" /* MEDIUM */, sellPrice: 75, spriteIndex: 34 },
  { id: "catfish", name: "Catfish", seasons: ["spring" /* SPRING */, "fall" /* FALL */], locations: ["forest" /* FOREST */], timeOfDay: ["evening" /* EVENING */, "night" /* NIGHT */], difficulty: "hard" /* HARD */, sellPrice: 200, spriteIndex: 35 },
  { id: "tuna", name: "Tuna", seasons: ["summer" /* SUMMER */, "winter" /* WINTER */], locations: ["beach" /* BEACH */], timeOfDay: ["morning" /* MORNING */, "afternoon" /* AFTERNOON */], difficulty: "medium" /* MEDIUM */, sellPrice: 100, spriteIndex: 36 },
  { id: "legendary_fish", name: "Legend", seasons: ["spring" /* SPRING */], locations: ["forest" /* FOREST */], timeOfDay: ["morning" /* MORNING */], difficulty: "hard" /* HARD */, sellPrice: 5e3, spriteIndex: 37 }
];
var NPCS = [
  {
    id: "elena",
    name: "Elena",
    marriageable: true,
    birthday: { season: "spring" /* SPRING */, day: 14 },
    lovedItems: ["cauliflower", "amethyst", "tomato_soup"],
    likedItems: ["parsnip", "potato", "wild_berries"],
    hatedItems: ["coal", "stone"],
    defaultMap: "town" /* TOWN */,
    portraitIndex: 0,
    spriteIndex: 0,
    dialoguePool: {
      "0": ["Oh, hello. I don't think we've met.", "New around here?"],
      "1": ["Nice to see you again!", "How's the farm coming along?"],
      "2": ["I always enjoy our chats.", "Want to see my garden sometime?"],
      "3": ["You're so sweet to visit me.", "I made you something!"],
      "4": ["I can't imagine life without you.", "Every day with you is an adventure."]
    }
  },
  {
    id: "marcus",
    name: "Marcus",
    marriageable: true,
    birthday: { season: "summer" /* SUMMER */, day: 8 },
    lovedItems: ["diamond", "gold_bar", "miners_treat"],
    likedItems: ["copper_ore", "iron_ore", "amethyst"],
    hatedItems: ["wild_berries", "fiber"],
    defaultMap: "mine" /* MINE */,
    portraitIndex: 1,
    spriteIndex: 1,
    dialoguePool: {
      "0": ["Watch your step in the mines.", "Hmph."],
      "1": ["You handle yourself well down there.", "Need any ore?"],
      "2": ["I respect your work ethic.", "Here, found this while digging."],
      "3": ["You're tougher than you look.", "I saved the best vein for you."],
      "4": ["You complete me... like a full ore deposit.", "Mining with you is the best."]
    }
  },
  {
    id: "lily",
    name: "Lily",
    marriageable: true,
    birthday: { season: "fall" /* FALL */, day: 21 },
    lovedItems: ["melon", "pumpkin", "bouquet"],
    likedItems: ["blueberry", "cranberry", "honey"],
    hatedItems: ["iron_ore", "coal"],
    defaultMap: "beach" /* BEACH */,
    portraitIndex: 2,
    spriteIndex: 2,
    dialoguePool: {
      "0": ["Oh! The waves are beautiful today.", "Are you new here?"],
      "1": ["It's nice having someone to talk to!", "Do you like the beach?"],
      "2": ["I painted something for you!", "Let's watch the sunset!"],
      "3": ["You make every day brighter.", "I dream about you sometimes."],
      "4": ["I love you with all my heart.", "Let's grow old by the sea."]
    }
  },
  {
    id: "owen",
    name: "Owen",
    marriageable: false,
    birthday: { season: "winter" /* WINTER */, day: 5 },
    lovedItems: ["gold_bar", "ruby"],
    likedItems: ["copper_bar", "iron_bar"],
    hatedItems: ["parsnip"],
    defaultMap: "town" /* TOWN */,
    portraitIndex: 3,
    spriteIndex: 3,
    dialoguePool: {
      "0": ["Welcome to the blacksmith shop.", "Need something upgraded?"],
      "1": ["Bring me ore and I'll make you something nice.", "Business is good!"],
      "2": ["You're one of my best customers!", "Here, take this."],
      "3": ["I consider you a true friend.", "This one's on the house."],
      "4": ["You're like family to me.", "Best friends forever!"]
    }
  },
  {
    id: "sage",
    name: "Sage",
    marriageable: false,
    birthday: { season: "spring" /* SPRING */, day: 27 },
    lovedItems: ["emerald", "mushroom", "lucky_charm"],
    likedItems: ["wild_berries", "fiber", "sap"],
    hatedItems: ["gold_bar", "diamond"],
    defaultMap: "forest" /* FOREST */,
    portraitIndex: 4,
    spriteIndex: 4,
    dialoguePool: {
      "0": ["The forest speaks to those who listen.", "Hmm, you have potential."],
      "1": ["Nature rewards patience.", "The spirits favor you."],
      "2": ["I sense great harmony in you.", "Let me teach you something."],
      "3": ["You understand the old ways.", "The forest protects its friends."],
      "4": ["You are a true guardian of nature.", "I am honored to call you friend."]
    }
  }
];

// src/systems/fishing.ts
var FishingMinigame = class {
  constructor(scene) {
    this.castGraphics = null;
    this.biteTimer = null;
    this.minigameState = null;
    this.spaceKey = null;
    this.scene = scene;
  }
  startFishing(playerX, playerY, season, timeOfDay, mapId) {
    this.cleanup();
    const availableFish = this.getAvailableFish(season, timeOfDay, mapId);
    if (availableFish.length === 0) {
      this.scene.events.emit(Events.FISH_ESCAPED);
      return;
    }
    const fish = phaser_shim_default.Utils.Array.GetRandom(availableFish);
    this.scene.events.emit(Events.CAST_LINE, { x: playerX, y: playerY });
    this.playCastingAnimation(playerX, playerY);
    const waitMs = phaser_shim_default.Math.Between(1e3, 3e3);
    this.biteTimer = this.scene.time.delayedCall(waitMs, () => {
      this.clearCastGraphics();
      this.startCatchMinigame(fish);
    });
  }
  getAvailableFish(season, timeOfDay, mapId) {
    return FISH.filter((fish) => fish.seasons.includes(season) && fish.timeOfDay.includes(timeOfDay) && fish.locations.includes(mapId));
  }
  playCastingAnimation(playerX, playerY) {
    const lineLength = 72;
    const endX = playerX + lineLength;
    const endY = playerY + 10;
    this.castGraphics = this.scene.add.graphics();
    this.castGraphics.setDepth(9998);
    const state = { t: 0 };
    this.scene.tweens.add({
      targets: state,
      t: 1,
      duration: 250,
      ease: "Sine.Out",
      onUpdate: () => {
        if (!this.castGraphics) {
          return;
        }
        const currentX = phaser_shim_default.Math.Linear(playerX, endX, state.t);
        const currentY = phaser_shim_default.Math.Linear(playerY, endY, state.t);
        this.castGraphics.clear();
        this.castGraphics.lineStyle(2, 15921906, 1);
        this.castGraphics.beginPath();
        this.castGraphics.moveTo(playerX, playerY);
        this.castGraphics.lineTo(currentX, currentY);
        this.castGraphics.strokePath();
        this.castGraphics.fillStyle(16764006, 1);
        this.castGraphics.fillCircle(currentX, currentY, 3);
      }
    });
  }
  startCatchMinigame(fish) {
    const camera = this.scene.cameras.main;
    const centerX = camera.centerX;
    const centerY = camera.centerY;
    const barHeight = 200;
    const barWidth = 24;
    const zoneHeight = this.getZoneHeight(fish.difficulty);
    const container = this.scene.add.container(centerX, centerY);
    container.setScrollFactor(0);
    container.setDepth(9999);
    const barGraphics = this.scene.add.graphics();
    const zoneGraphics = this.scene.add.graphics();
    const fishGraphics = this.scene.add.graphics();
    const progressBgGraphics = this.scene.add.graphics();
    const progressFillGraphics = this.scene.add.graphics();
    container.add([
      barGraphics,
      zoneGraphics,
      fishGraphics,
      progressBgGraphics,
      progressFillGraphics
    ]);
    this.minigameState = {
      fish,
      container,
      barGraphics,
      zoneGraphics,
      fishGraphics,
      progressBgGraphics,
      progressFillGraphics,
      barHeight,
      barWidth,
      zoneHeight,
      zoneY: (barHeight - zoneHeight) * 0.5,
      zoneVelocity: 0,
      fishY: barHeight * 0.5,
      fishVelocity: 0,
      progress: 35,
      fillRate: this.getFillRate(fish.difficulty),
      drainRate: this.getDrainRate(fish.difficulty),
      fishSpeed: this.getFishSpeed(fish.difficulty)
    };
    if (this.scene.input.keyboard) {
      this.spaceKey = this.scene.input.keyboard.addKey(phaser_shim_default.Input.Keyboard.KeyCodes.SPACE);
    }
    this.scene.events.on("update", this.updateCatchMinigame, this);
    this.renderCatchMinigame();
  }
  updateCatchMinigame(_time, delta) {
    if (!this.minigameState) {
      return;
    }
    const state = this.minigameState;
    const dt = delta / 1e3;
    const pressing = !!this.spaceKey?.isDown;
    const upForce = 550;
    const gravity = 420;
    state.zoneVelocity += (pressing ? -upForce : gravity) * dt;
    state.zoneVelocity = phaser_shim_default.Math.Clamp(state.zoneVelocity, -220, 220);
    state.zoneY += state.zoneVelocity * dt;
    if (state.zoneY < 0) {
      state.zoneY = 0;
      state.zoneVelocity = 0;
    } else if (state.zoneY > state.barHeight - state.zoneHeight) {
      state.zoneY = state.barHeight - state.zoneHeight;
      state.zoneVelocity = 0;
    }
    const randomNudge = phaser_shim_default.Math.FloatBetween(-180, 180) * dt;
    state.fishVelocity += randomNudge;
    state.fishVelocity = phaser_shim_default.Math.Clamp(state.fishVelocity, -state.fishSpeed, state.fishSpeed);
    state.fishY += state.fishVelocity * dt;
    if (state.fishY < 0) {
      state.fishY = 0;
      state.fishVelocity = Math.abs(state.fishVelocity) * 0.85;
    } else if (state.fishY > state.barHeight) {
      state.fishY = state.barHeight;
      state.fishVelocity = -Math.abs(state.fishVelocity) * 0.85;
    }
    const fishInZone = state.fishY >= state.zoneY && state.fishY <= state.zoneY + state.zoneHeight;
    const progressDelta = (fishInZone ? state.fillRate : -state.drainRate) * dt;
    state.progress = phaser_shim_default.Math.Clamp(state.progress + progressDelta, 0, 100);
    this.renderCatchMinigame();
    if (state.progress >= 100) {
      const quality = this.rollQuality();
      this.scene.events.emit(Events.FISH_CAUGHT, { fishId: state.fish.id, quality });
      this.cleanupMinigame();
      return;
    }
    if (state.progress <= 0) {
      this.scene.events.emit(Events.FISH_ESCAPED);
      this.cleanupMinigame();
    }
  }
  renderCatchMinigame() {
    if (!this.minigameState) {
      return;
    }
    const state = this.minigameState;
    const barX = -20;
    const barY = -state.barHeight / 2;
    const progressX = 18;
    state.barGraphics.clear();
    state.barGraphics.fillStyle(1844274, 0.95);
    state.barGraphics.fillRect(barX, barY, state.barWidth, state.barHeight);
    state.barGraphics.lineStyle(2, 16777215, 0.9);
    state.barGraphics.strokeRect(barX, barY, state.barWidth, state.barHeight);
    state.zoneGraphics.clear();
    state.zoneGraphics.fillStyle(5955722, 0.8);
    state.zoneGraphics.fillRect(barX + 2, barY + state.zoneY, state.barWidth - 4, state.zoneHeight);
    state.fishGraphics.clear();
    state.fishGraphics.fillStyle(8374527, 1);
    state.fishGraphics.fillCircle(barX + state.barWidth / 2, barY + state.fishY, 6);
    state.fishGraphics.lineStyle(1, 16777215, 0.8);
    state.fishGraphics.strokeCircle(barX + state.barWidth / 2, barY + state.fishY, 6);
    state.progressBgGraphics.clear();
    state.progressBgGraphics.fillStyle(856344, 0.95);
    state.progressBgGraphics.fillRect(progressX, barY, 12, state.barHeight);
    state.progressBgGraphics.lineStyle(2, 16777215, 0.9);
    state.progressBgGraphics.strokeRect(progressX, barY, 12, state.barHeight);
    const fillHeight = state.progress / 100 * state.barHeight;
    state.progressFillGraphics.clear();
    state.progressFillGraphics.fillStyle(16765773, 1);
    state.progressFillGraphics.fillRect(progressX + 2, barY + state.barHeight - fillHeight + 2, 8, Math.max(0, fillHeight - 4));
  }
  getZoneHeight(difficulty) {
    switch (difficulty) {
      case "easy" /* EASY */:
        return 80;
      case "medium" /* MEDIUM */:
        return 60;
      case "hard" /* HARD */:
        return 40;
    }
  }
  getFillRate(difficulty) {
    switch (difficulty) {
      case "easy" /* EASY */:
        return 36;
      case "medium" /* MEDIUM */:
        return 30;
      case "hard" /* HARD */:
        return 24;
    }
  }
  getDrainRate(difficulty) {
    switch (difficulty) {
      case "easy" /* EASY */:
        return 20;
      case "medium" /* MEDIUM */:
        return 26;
      case "hard" /* HARD */:
        return 34;
    }
  }
  getFishSpeed(difficulty) {
    switch (difficulty) {
      case "easy" /* EASY */:
        return 150;
      case "medium" /* MEDIUM */:
        return 200;
      case "hard" /* HARD */:
        return 260;
    }
  }
  rollQuality() {
    const roll = phaser_shim_default.Math.FloatBetween(0, 1);
    if (roll < 0.1) {
      return 3 /* GOLD */;
    }
    if (roll < 0.35) {
      return 2 /* SILVER */;
    }
    return 1 /* NORMAL */;
  }
  cleanupMinigame() {
    this.scene.events.off("update", this.updateCatchMinigame, this);
    if (this.minigameState) {
      this.minigameState.container.destroy(true);
      this.minigameState = null;
    }
    if (this.spaceKey) {
      this.spaceKey.destroy();
      this.spaceKey = null;
    }
  }
  clearCastGraphics() {
    if (this.castGraphics) {
      this.castGraphics.destroy();
      this.castGraphics = null;
    }
  }
  cleanup() {
    if (this.biteTimer) {
      this.biteTimer.remove(false);
      this.biteTimer = null;
    }
    this.clearCastGraphics();
    this.cleanupMinigame();
  }
};

// src/systems/mining.ts
var _MiningSystem = class _MiningSystem {
  constructor(scene) {
    this.scene = scene;
    this.tilePixels = TILE_SIZE * SCALE;
  }
  generateFloor(floor) {
    const rng = this.createSeededRng(floor);
    const tiles = Array.from(
      { length: _MiningSystem.HEIGHT },
      () => Array.from({ length: _MiningSystem.WIDTH }, () => rng() < 0.12 ? 1 : 0)
    );
    const occupied = /* @__PURE__ */ new Set();
    const rocks = [];
    const monsters = [];
    const rockCount = this.randomInt(rng, 8, 15);
    for (let i = 0; i < rockCount; i += 1) {
      const pos = this.pickFreeTile(rng, occupied);
      if (!pos)
        break;
      const oreId = this.rollOreForFloor(rng, floor);
      const hp = this.getRockHp(oreId, floor);
      rocks.push({ x: pos.x, y: pos.y, oreId, hp });
      occupied.add(this.key(pos.x, pos.y));
    }
    const monsterCount = this.randomInt(rng, 2, 5);
    const monsterType = this.getMonsterTypeForFloor(floor);
    for (let i = 0; i < monsterCount; i += 1) {
      const pos = this.pickFreeTile(rng, occupied);
      if (!pos)
        break;
      const stats = this.getMonsterStats(monsterType, floor);
      monsters.push({
        x: pos.x,
        y: pos.y,
        type: monsterType,
        hp: stats.hp,
        maxHp: stats.hp,
        damage: stats.damage,
        speed: stats.speed
      });
      occupied.add(this.key(pos.x, pos.y));
    }
    const ladderPos = this.pickFreeTile(rng, occupied) ?? { x: 1, y: 1 };
    const floorData = {
      floor,
      tiles,
      rocks,
      monsters,
      ladderX: ladderPos.x,
      ladderY: ladderPos.y,
      hasElevator: floor % 5 === 0
    };
    this.activeFloorData = floorData;
    this.scene.events.emit(Events.ENTER_MINE, { floor });
    return floorData;
  }
  renderFloor(floorData, container) {
    container.removeAll(true);
    this.ensureFallbackTextures();
    const graphics = this.scene.add.graphics();
    for (let y = 0; y < _MiningSystem.HEIGHT; y += 1) {
      for (let x = 0; x < _MiningSystem.WIDTH; x += 1) {
        const shade = floorData.tiles[y]?.[x] === 1 ? 1644825 : 2236962;
        graphics.fillStyle(shade, 1);
        graphics.fillRect(
          x * this.tilePixels,
          y * this.tilePixels,
          this.tilePixels,
          this.tilePixels
        );
      }
    }
    container.add(graphics);
    for (const rock of floorData.rocks) {
      const world = this.tileToWorld(rock.x, rock.y);
      const sprite = this.scene.add.sprite(world.x, world.y, "mine_rock");
      sprite.setDisplaySize(this.tilePixels * 0.75, this.tilePixels * 0.75);
      rock.sprite = sprite;
      container.add(sprite);
    }
    for (const monster of floorData.monsters) {
      const world = this.tileToWorld(monster.x, monster.y);
      const sprite = this.scene.add.sprite(world.x, world.y, "mine_monster");
      sprite.setDisplaySize(this.tilePixels * 0.75, this.tilePixels * 0.75);
      monster.sprite = sprite;
      monster.x = world.x;
      monster.y = world.y;
      container.add(sprite);
    }
    const ladderWorld = this.tileToWorld(floorData.ladderX, floorData.ladderY);
    this.ladderSprite = this.scene.add.sprite(ladderWorld.x, ladderWorld.y, "mine_ladder");
    this.ladderSprite.setDisplaySize(this.tilePixels * 0.8, this.tilePixels * 0.8);
    if (floorData.hasElevator) {
      this.ladderSprite.setTint(6737151);
    } else {
      this.ladderSprite.clearTint();
    }
    container.add(this.ladderSprite);
    this.activeFloorData = floorData;
    return container;
  }
  hitRock(rock, toolLevel) {
    const damage = Math.max(1, 1 + toolLevel);
    rock.hp -= damage;
    if (rock.hp > 0) {
      return { destroyed: false, drops: [] };
    }
    if (rock.sprite) {
      rock.sprite.destroy();
      rock.sprite = void 0;
    }
    const drops = [];
    const isGem = rock.oreId.endsWith("_gem");
    if (isGem) {
      drops.push({ itemId: rock.oreId, qty: 1 });
      if (Math.random() < 0.15) {
        drops.push({ itemId: rock.oreId, qty: 1 });
      }
    } else {
      drops.push({ itemId: rock.oreId, qty: phaser_shim_default.Math.Between(1, 2) });
      if (Math.random() < 0.2) {
        drops.push({ itemId: "coal", qty: 1 });
      }
    }
    this.tryEmitFloorClear();
    return { destroyed: true, drops };
  }
  updateMonsters(delta, playerX, playerY) {
    const floorData = this.activeFloorData;
    if (!floorData)
      return null;
    let collision = null;
    for (const monster of floorData.monsters) {
      if (monster.hp <= 0)
        continue;
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
      if (dist > 1e-3) {
        const step = Math.min(dist, monster.speed * (delta / 1e3));
        mx += dx / dist * step;
        my += dy / dist * step;
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
  attackMonster(monster, damage) {
    monster.hp -= Math.max(1, damage);
    if (monster.hp > 0) {
      return { killed: false };
    }
    monster.hp = 0;
    if (monster.sprite) {
      monster.sprite.destroy();
      monster.sprite = void 0;
    }
    this.scene.events.emit(Events.MONSTER_KILLED, {
      monsterId: monster.type
    });
    this.tryEmitFloorClear();
    return { killed: true };
  }
  tryEmitFloorClear() {
    if (!this.activeFloorData)
      return;
    const monstersAlive = this.activeFloorData.monsters.some((m) => m.hp > 0);
    const rocksLeft = this.activeFloorData.rocks.some((r) => r.hp > 0);
    if (!monstersAlive && !rocksLeft) {
      this.scene.events.emit(Events.FLOOR_CLEAR, { floor: this.activeFloorData.floor });
    }
  }
  rollOreForFloor(rng, floor) {
    const gemChance = 0.08 + Math.min(0.12, floor * 1e-3);
    if (rng() < gemChance) {
      const gems = ["amethyst_gem", "topaz_gem", "emerald_gem", "ruby_gem"];
      return gems[this.randomInt(rng, 0, gems.length - 1)];
    }
    if (floor >= 80)
      return "gold_ore";
    if (floor >= 40)
      return "iron_ore";
    return "copper_ore";
  }
  getRockHp(oreId, floor) {
    const base = oreId.endsWith("_gem") ? 4 : 3;
    return base + Math.floor(floor / 25);
  }
  getMonsterTypeForFloor(floor) {
    if (floor >= 80)
      return "golem";
    if (floor >= 40)
      return "bat";
    return "slime";
  }
  getMonsterStats(type, floor) {
    let baseHp = 16;
    let baseDamage = 4;
    let baseSpeed = 42;
    if (type === "bat") {
      baseHp = 13;
      baseDamage = 5;
      baseSpeed = 68;
    } else if (type === "golem") {
      baseHp = 28;
      baseDamage = 8;
      baseSpeed = 34;
    }
    const scale = 1 + floor * 0.04;
    return {
      hp: Math.max(1, Math.round(baseHp * scale)),
      damage: Math.max(1, Math.round(baseDamage + floor * 0.12)),
      speed: Math.round(baseSpeed + floor * 0.3)
    };
  }
  pickFreeTile(rng, occupied) {
    for (let i = 0; i < 200; i += 1) {
      const x = this.randomInt(rng, 0, _MiningSystem.WIDTH - 1);
      const y = this.randomInt(rng, 0, _MiningSystem.HEIGHT - 1);
      const posKey = this.key(x, y);
      if (!occupied.has(posKey)) {
        return { x, y };
      }
    }
    for (let y = 0; y < _MiningSystem.HEIGHT; y += 1) {
      for (let x = 0; x < _MiningSystem.WIDTH; x += 1) {
        const posKey = this.key(x, y);
        if (!occupied.has(posKey)) {
          return { x, y };
        }
      }
    }
    return null;
  }
  key(x, y) {
    return `${x},${y}`;
  }
  tileToWorld(tileX, tileY) {
    return {
      x: tileX * this.tilePixels + this.tilePixels * 0.5,
      y: tileY * this.tilePixels + this.tilePixels * 0.5
    };
  }
  randomInt(rng, min, max) {
    return Math.floor(rng() * (max - min + 1)) + min;
  }
  createSeededRng(seed) {
    let state = seed >>> 0;
    return () => {
      state += 1831565813;
      let t = state;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  ensureFallbackTextures() {
    this.ensureSolidTexture("mine_rock", 7829367);
    this.ensureSolidTexture("mine_monster", 10431018);
    this.ensureSolidTexture("mine_ladder", 12755822);
  }
  ensureSolidTexture(key, color) {
    if (this.scene.textures.exists(key))
      return;
    const graphics = this.scene.add.graphics();
    graphics.fillStyle(color, 1);
    graphics.fillRect(0, 0, 16, 16);
    graphics.generateTexture(key, 16, 16);
    graphics.destroy();
  }
};
_MiningSystem.WIDTH = 20;
_MiningSystem.HEIGHT = 15;
var MiningSystem = _MiningSystem;

// src/systems/shop.ts
var ShopSystem = class {
  constructor(scene) {
    this.currentSeason = "spring" /* SPRING */;
    this.currentGold = 0;
    this.currentInventory = [];
    this.shopInventory = [];
    this.shopViewportTopY = 0;
    this.playerViewportTopY = 0;
    this.shopViewportHeight = 0;
    this.playerViewportHeight = 0;
    this.shopContentHeight = 0;
    this.playerContentHeight = 0;
    this.dragList = null;
    this.dragStartPointerY = 0;
    this.dragStartContentY = 0;
    this.scene = scene;
  }
  getShopInventory(season) {
    const seasonalSeedIds = new Set(
      CROPS.filter((crop) => crop.seasons.includes(season)).map((crop) => crop.seedId)
    );
    const seasonalSeeds = ITEMS.filter((item) => item.category === "seed" /* SEED */ && seasonalSeedIds.has(item.id)).map((itemDef) => ({
      itemDef,
      buyPrice: itemDef.sellPrice * 2,
      stock: 99
    }));
    const alwaysAvailable = ITEMS.filter(
      (item) => item.category === "tool" /* TOOL */ || item.category === "food" /* FOOD */
    ).map((itemDef) => ({
      itemDef,
      buyPrice: itemDef.sellPrice * 2,
      stock: 99
    }));
    return [...seasonalSeeds, ...alwaysAvailable];
  }
  openShop(season, playerGold, playerInventory) {
    this.closeShop();
    this.currentSeason = season;
    this.currentGold = playerGold;
    this.currentInventory = this.cloneInventory(playerInventory);
    this.shopInventory = this.getShopInventory(season);
    const cam = this.scene.cameras.main;
    const panelW = 500;
    const panelH = 400;
    const listW = 220;
    const listH = 255;
    this.shopContainer = this.scene.add.container(cam.centerX, cam.centerY).setDepth(1e3).setScrollFactor(0);
    const bg = this.scene.add.rectangle(0, 0, panelW, panelH, 1052688, 0.9);
    bg.setStrokeStyle(2, 3815994, 1);
    const title = this.scene.add.text(0, -panelH / 2 + 24, "General Store", {
      fontSize: "24px",
      color: "#f4f0d0"
    }).setOrigin(0.5);
    const closeBtn = this.scene.add.text(panelW / 2 - 16, -panelH / 2 + 16, "X", {
      fontSize: "20px",
      color: "#ff6666"
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on("pointerdown", () => this.closeShop());
    const leftPanelX = -panelW / 4;
    const rightPanelX = panelW / 4;
    const panelTopY = -panelH / 2 + 50;
    const leftPanel = this.scene.add.rectangle(leftPanelX, 10, listW + 20, listH + 70, 1907997, 0.95);
    leftPanel.setStrokeStyle(1, 5066061, 1);
    const rightPanel = this.scene.add.rectangle(rightPanelX, 10, listW + 20, listH + 70, 1907997, 0.95);
    rightPanel.setStrokeStyle(1, 5066061, 1);
    const shopLabel = this.scene.add.text(leftPanelX, panelTopY - 20, "Shop Stock", { fontSize: "16px", color: "#ffffff" }).setOrigin(0.5, 0);
    const invLabel = this.scene.add.text(rightPanelX, panelTopY - 20, "Your Items", { fontSize: "16px", color: "#ffffff" }).setOrigin(0.5, 0);
    const shopViewportX = leftPanelX - listW / 2;
    const playerViewportX = rightPanelX - listW / 2;
    const viewportY = panelTopY + 20;
    const shopViewportBg = this.scene.add.rectangle(leftPanelX, viewportY + listH / 2, listW, listH, 1118481, 0.85).setOrigin(0.5, 0.5).setInteractive({ useHandCursor: true });
    const playerViewportBg = this.scene.add.rectangle(rightPanelX, viewportY + listH / 2, listW, listH, 1118481, 0.85).setOrigin(0.5, 0.5).setInteractive({ useHandCursor: true });
    this.shopListContent = this.scene.add.container(shopViewportX, viewportY);
    this.playerListContent = this.scene.add.container(playerViewportX, viewportY);
    const shopMaskShape = this.scene.add.rectangle(shopViewportX, viewportY, listW, listH, 16777215, 0);
    shopMaskShape.setOrigin(0, 0);
    const playerMaskShape = this.scene.add.rectangle(playerViewportX, viewportY, listW, listH, 16777215, 0);
    playerMaskShape.setOrigin(0, 0);
    const shopMask = shopMaskShape.createGeometryMask();
    const playerMask = playerMaskShape.createGeometryMask();
    this.shopListContent.setMask(shopMask);
    this.playerListContent.setMask(playerMask);
    this.shopViewportTopY = viewportY;
    this.playerViewportTopY = viewportY;
    this.shopViewportHeight = listH;
    this.playerViewportHeight = listH;
    const shopUp = this.makeArrowButton(leftPanelX - 40, viewportY - 12, "\u25B2", () => this.scrollList("shop", -32));
    const shopDown = this.makeArrowButton(leftPanelX + 40, viewportY - 12, "\u25BC", () => this.scrollList("shop", 32));
    const playerUp = this.makeArrowButton(rightPanelX - 40, viewportY - 12, "\u25B2", () => this.scrollList("player", -32));
    const playerDown = this.makeArrowButton(rightPanelX + 40, viewportY - 12, "\u25BC", () => this.scrollList("player", 32));
    shopViewportBg.on("pointerdown", (pointer) => {
      this.dragList = "shop";
      this.dragStartPointerY = pointer.y;
      this.dragStartContentY = this.shopListContent?.y ?? this.shopViewportTopY;
    });
    playerViewportBg.on("pointerdown", (pointer) => {
      this.dragList = "player";
      this.dragStartPointerY = pointer.y;
      this.dragStartContentY = this.playerListContent?.y ?? this.playerViewportTopY;
    });
    this.onPointerMove = (pointer) => {
      if (!this.dragList)
        return;
      const deltaY = pointer.y - this.dragStartPointerY;
      const targetY = this.dragStartContentY + deltaY;
      this.setListY(this.dragList, targetY);
    };
    this.onPointerUp = () => {
      this.dragList = null;
    };
    this.scene.input.on("pointermove", this.onPointerMove);
    this.scene.input.on("pointerup", this.onPointerUp);
    this.scene.input.on("pointerupoutside", this.onPointerUp);
    this.goldText = this.scene.add.text(-panelW / 2 + 20, panelH / 2 - 28, `Gold: ${this.currentGold}g`, {
      fontSize: "20px",
      color: "#ffdd55"
    }).setOrigin(0, 0.5);
    this.shopContainer.add([
      bg,
      title,
      closeBtn,
      leftPanel,
      rightPanel,
      shopLabel,
      invLabel,
      shopViewportBg,
      playerViewportBg,
      shopMaskShape,
      playerMaskShape,
      this.shopListContent,
      this.playerListContent,
      shopUp,
      shopDown,
      playerUp,
      playerDown,
      this.goldText
    ]);
    this.rebuildShopList();
    this.rebuildPlayerList();
  }
  closeShop() {
    if (this.onPointerMove) {
      this.scene.input.off("pointermove", this.onPointerMove);
      this.onPointerMove = void 0;
    }
    if (this.onPointerUp) {
      this.scene.input.off("pointerup", this.onPointerUp);
      this.scene.input.off("pointerupoutside", this.onPointerUp);
      this.onPointerUp = void 0;
    }
    this.dragList = null;
    if (this.shopContainer) {
      this.shopContainer.destroy(true);
      this.shopContainer = void 0;
    }
    this.shopListContent = void 0;
    this.playerListContent = void 0;
    this.goldText = void 0;
  }
  refreshDisplay(gold, inventory) {
    this.currentGold = gold;
    this.currentInventory = this.cloneInventory(inventory);
    this.updateGoldText();
    this.rebuildPlayerList();
  }
  makeArrowButton(x, y, label, onClick) {
    const button = this.scene.add.text(x, y, label, { fontSize: "16px", color: "#d5d5d5" }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    button.on("pointerover", () => button.setColor("#ffffff"));
    button.on("pointerout", () => button.setColor("#d5d5d5"));
    button.on("pointerdown", onClick);
    return button;
  }
  rebuildShopList() {
    if (!this.shopListContent)
      return;
    this.shopListContent.removeAll(true);
    const rowH = 34;
    const rowW = 220;
    let y = 0;
    for (const entry of this.shopInventory) {
      const rowBg = this.scene.add.rectangle(rowW / 2, y + rowH / 2, rowW, rowH - 2, 2500134, 0.92);
      rowBg.setOrigin(0.5, 0.5);
      const nameText = this.scene.add.text(6, y + 9, entry.itemDef.name, {
        fontSize: "12px",
        color: "#ffffff"
      });
      const priceText = this.scene.add.text(105, y + 9, `${entry.buyPrice}g`, {
        fontSize: "12px",
        color: "#ffdd55"
      });
      const stockText = this.scene.add.text(150, y + 9, `x${entry.stock}`, {
        fontSize: "12px",
        color: "#a0d0ff"
      });
      const buyBtn = this.scene.add.text(190, y + 9, "Buy", { fontSize: "12px", color: "#87ff87" }).setOrigin(0.5, 0).setInteractive({ useHandCursor: true });
      buyBtn.on("pointerover", () => buyBtn.setColor("#c7ffc7"));
      buyBtn.on("pointerout", () => buyBtn.setColor("#87ff87"));
      buyBtn.on("pointerdown", () => this.handleBuy(entry.itemDef.id));
      this.shopListContent.add([rowBg, nameText, priceText, stockText, buyBtn]);
      y += rowH;
    }
    this.shopContentHeight = Math.max(y, this.shopViewportHeight);
    this.setListY("shop", this.shopListContent.y);
  }
  rebuildPlayerList() {
    if (!this.playerListContent)
      return;
    this.playerListContent.removeAll(true);
    const entries = [];
    for (let i = 0; i < this.currentInventory.length; i++) {
      const slot = this.currentInventory[i];
      if (!slot || slot.qty <= 0)
        continue;
      const itemDef = ITEMS.find((item) => item.id === slot.itemId);
      if (!itemDef)
        continue;
      entries.push({
        slotIndex: i,
        itemDef,
        qty: slot.qty,
        quality: slot.quality,
        sellValue: this.getSellValue(slot, itemDef)
      });
    }
    const rowH = 34;
    const rowW = 220;
    let y = 0;
    for (const entry of entries) {
      const rowBg = this.scene.add.rectangle(rowW / 2, y + rowH / 2, rowW, rowH - 2, 2500134, 0.92);
      rowBg.setOrigin(0.5, 0.5);
      const nameText = this.scene.add.text(6, y + 9, `${entry.itemDef.name} x${entry.qty}`, {
        fontSize: "12px",
        color: "#ffffff"
      });
      const qualityText = this.scene.add.text(112, y + 9, `Q${entry.quality}`, {
        fontSize: "12px",
        color: "#c0c0c0"
      });
      const priceText = this.scene.add.text(142, y + 9, `${entry.sellValue}g`, {
        fontSize: "12px",
        color: "#ffcc99"
      });
      const sellBtn = this.scene.add.text(194, y + 9, "Sell", { fontSize: "12px", color: "#ff9d9d" }).setOrigin(0.5, 0).setInteractive({ useHandCursor: true });
      sellBtn.on("pointerover", () => sellBtn.setColor("#ffd0d0"));
      sellBtn.on("pointerout", () => sellBtn.setColor("#ff9d9d"));
      sellBtn.on("pointerdown", () => this.handleSell(entry.slotIndex));
      this.playerListContent.add([rowBg, nameText, qualityText, priceText, sellBtn]);
      y += rowH;
    }
    if (entries.length === 0) {
      const emptyText = this.scene.add.text(8, 8, "No items to sell.", {
        fontSize: "13px",
        color: "#9a9a9a"
      });
      this.playerListContent.add(emptyText);
      y = 24;
    }
    this.playerContentHeight = Math.max(y, this.playerViewportHeight);
    this.setListY("player", this.playerListContent.y);
  }
  handleBuy(itemId) {
    const shopEntry = this.shopInventory.find((entry) => entry.itemDef.id === itemId);
    if (!shopEntry)
      return;
    if (shopEntry.stock <= 0)
      return;
    if (this.currentGold < shopEntry.buyPrice)
      return;
    const added = this.addToInventory(itemId, 1, 1 /* NORMAL */);
    if (!added)
      return;
    this.currentGold -= shopEntry.buyPrice;
    shopEntry.stock -= 1;
    this.scene.events.emit(Events.SHOP_BUY, {
      itemId,
      qty: 1,
      cost: shopEntry.buyPrice
    });
    this.updateGoldText();
    this.rebuildShopList();
    this.rebuildPlayerList();
  }
  handleSell(slotIndex) {
    const slot = this.currentInventory[slotIndex];
    if (!slot || slot.qty <= 0)
      return;
    const itemDef = ITEMS.find((item) => item.id === slot.itemId);
    if (!itemDef)
      return;
    const revenue = this.getSellValue(slot, itemDef);
    this.currentGold += revenue;
    slot.qty -= 1;
    if (slot.qty <= 0) {
      this.currentInventory[slotIndex] = null;
    }
    this.scene.events.emit(Events.SHOP_SELL, {
      itemId: itemDef.id,
      qty: 1,
      revenue
    });
    this.updateGoldText();
    this.rebuildPlayerList();
  }
  getSellValue(slot, itemDef) {
    const qualityMultiplier = Number(slot.quality) || 1;
    return Math.floor(itemDef.sellPrice * qualityMultiplier);
  }
  updateGoldText() {
    if (!this.goldText)
      return;
    this.goldText.setText(`Gold: ${this.currentGold}g`);
  }
  scrollList(kind, amount) {
    const currentY = this.getListContent(kind)?.y;
    if (currentY === void 0)
      return;
    this.setListY(kind, currentY + amount);
  }
  setListY(kind, y) {
    const content = this.getListContent(kind);
    if (!content)
      return;
    const viewportTopY = kind === "shop" ? this.shopViewportTopY : this.playerViewportTopY;
    const viewportHeight = kind === "shop" ? this.shopViewportHeight : this.playerViewportHeight;
    const contentHeight = kind === "shop" ? this.shopContentHeight : this.playerContentHeight;
    const minY = viewportTopY - Math.max(0, contentHeight - viewportHeight);
    const maxY = viewportTopY;
    content.y = phaser_shim_default.Math.Clamp(y, minY, maxY);
  }
  getListContent(kind) {
    return kind === "shop" ? this.shopListContent : this.playerListContent;
  }
  addToInventory(itemId, qty, quality) {
    let remaining = qty;
    for (let i = 0; i < this.currentInventory.length; i++) {
      const slot = this.currentInventory[i];
      if (!slot)
        continue;
      if (slot.itemId === itemId && slot.quality === quality) {
        slot.qty += remaining;
        return true;
      }
    }
    for (let i = 0; i < this.currentInventory.length; i++) {
      if (this.currentInventory[i] === null) {
        this.currentInventory[i] = { itemId, qty: remaining, quality };
        return true;
      }
    }
    return false;
  }
  cloneInventory(inventory) {
    return inventory.map((slot) => slot ? { ...slot } : null);
  }
};

// src/scenes/PlayScene.ts
var PlayScene = class extends phaser_shim_default.Scene {
  constructor() {
    super(Scenes.PLAY);
    this.farmTiles = [];
    this.shippingBin = { items: [] };
    this.relationships = {};
    this.quests = { activeQuests: [], completedQuests: [] };
    this.mine = { currentFloor: 1, maxFloor: 1, health: 100, maxHealth: 100, elevatorsUnlocked: [1] };
    this.animalState = { animals: [], hasCoopLevel: 0, hasBarnLevel: 0 };
    this.house = { tier: 0 };
    this.stats = { cropsHarvested: 0, fishCaught: 0, itemsShipped: 0, giftsGiven: 0, recipesCooked: 0, monstersKilled: 0, goldEarned: 0, daysPlayed: 0 };
    this.unlockedRecipes = [];
    this.toolLevels = {};
    this.npcSprites = /* @__PURE__ */ new Map();
    this.cropSprites = /* @__PURE__ */ new Map();
    this.isNewGame = false;
    this.tutorialStep = 0;
    this.tutorialActive = true;
    this.tutorialStartX = 0;
    this.tutorialStartY = 0;
    // Day timer
    this.dayTimer = 0;
    this.dayPaused = false;
  }
  init(data) {
    if (data?.loadSave) {
      this.isNewGame = false;
      this.loadGame();
    } else {
      this.isNewGame = true;
      this.initNewGame();
      if (data?.playerName)
        this.player.name = data.playerName;
    }
  }
  create() {
    this.scene.launch(Scenes.UI, { playScene: this });
    this.createFarmMap();
    this.playerSprite = this.add.sprite(this.player.x, this.player.y, "player", 0);
    this.playerSprite.setScale(SCALE);
    this.playerSprite.setDepth(ySortDepth(this.player.y));
    this.playerSprite.play("idle_down");
    this.tutorialStartX = this.player.x;
    this.tutorialStartY = this.player.y;
    this.cameras.main.startFollow(this.playerSprite, true, 0.1, 0.1);
    this.cameras.main.setZoom(1);
    this.cameras.main.setBounds(0, 0, FARM_WIDTH * SCALED_TILE, FARM_HEIGHT * SCALED_TILE);
    this.createWorldObjects();
    this.spawnNPCs();
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = {
      w: this.input.keyboard.addKey("W"),
      a: this.input.keyboard.addKey("A"),
      s: this.input.keyboard.addKey("S"),
      d: this.input.keyboard.addKey("D"),
      space: this.input.keyboard.addKey("SPACE"),
      // use tool
      e: this.input.keyboard.addKey("E"),
      // interact
      f: this.input.keyboard.addKey("F"),
      // eat/use item
      i: this.input.keyboard.addKey("I"),
      // inventory
      esc: this.input.keyboard.addKey("ESC"),
      // pause
      one: this.input.keyboard.addKey("ONE"),
      two: this.input.keyboard.addKey("TWO"),
      three: this.input.keyboard.addKey("THREE"),
      four: this.input.keyboard.addKey("FOUR"),
      five: this.input.keyboard.addKey("FIVE"),
      six: this.input.keyboard.addKey("SIX"),
      seven: this.input.keyboard.addKey("SEVEN"),
      eight: this.input.keyboard.addKey("EIGHT"),
      nine: this.input.keyboard.addKey("NINE"),
      zero: this.input.keyboard.addKey("ZERO")
    };
    this.proximityPrompt = this.add.text(0, 0, "", {
      fontFamily: "monospace",
      fontSize: "11px",
      color: "#ffffff",
      backgroundColor: "#000000aa",
      padding: { x: 6, y: 3 }
    }).setOrigin(0.5).setDepth(1e4).setVisible(false);
    this.setupEventListeners();
    this.fishingMinigame = new FishingMinigame(this);
    this.miningSystem = new MiningSystem(this);
    this.shopSystem = new ShopSystem(this);
    this.events.emit(Events.DAY_START, {
      day: this.calendar.day,
      season: this.calendar.season,
      year: this.calendar.year
    });
    this.cameras.main.fadeIn(1500, 0, 0, 0);
    if (this.isNewGame)
      this.updateTutorial();
  }
  update(time, delta) {
    this.handleMovement(delta);
    this.handleToolInput();
    this.handleInteractionInput();
    this.handleHotbarInput();
    const facing = facingTile(this.player.x, this.player.y, this.player.direction);
    const interaction = this.getInteractionAt(facing.x, facing.y);
    if (interaction) {
      const wp = gridToWorld(facing.x, facing.y);
      this.proximityPrompt.setPosition(wp.x, wp.y - SCALED_TILE);
      const kindLabels = {
        ["bed" /* BED */]: "Press E \u2014 Sleep",
        ["shipping_bin" /* SHIPPING_BIN */]: "Press E \u2014 Ship Item",
        ["crafting_bench" /* CRAFTING_BENCH */]: "Press E \u2014 Craft",
        ["kitchen" /* KITCHEN */]: "Press E \u2014 Cook",
        ["shop" /* SHOP */]: "Press E \u2014 Shop",
        ["door" /* DOOR */]: "Press E \u2014 Enter Mine",
        ["quest_board" /* QUEST_BOARD */]: "Press E \u2014 Quests",
        ["npc" /* NPC */]: "Press E \u2014 Talk"
      };
      this.proximityPrompt.setText(kindLabels[interaction.kind] || "Press E");
      this.proximityPrompt.setVisible(true);
    } else {
      this.proximityPrompt.setVisible(false);
    }
    this.updateDayTimer(delta);
    this.updateCropSprites();
    this.playerSprite.setDepth(ySortDepth(this.player.y));
    if (this.tutorialActive && this.tutorialStep === 0) {
      const dx = this.player.x - this.tutorialStartX;
      const dy = this.player.y - this.tutorialStartY;
      if (Math.sqrt(dx * dx + dy * dy) >= 200)
        this.advanceTutorial(1);
    }
    const uiScene = this.scene.get(Scenes.UI);
    if (uiScene?.touchControls) {
      uiScene.touchControls.consumeJustPressed();
    }
  }
  getTouchState() {
    const uiScene = this.scene.get(Scenes.UI);
    return uiScene?.touchControls?.state ?? null;
  }
  // ── Initialization ──
  initNewGame() {
    const spawn = gridToWorld(20, 12);
    this.player = {
      name: "Farmer",
      x: spawn.x,
      y: spawn.y,
      direction: "down" /* DOWN */,
      currentTool: "hoe" /* HOE */,
      stamina: MAX_STAMINA,
      maxStamina: MAX_STAMINA,
      gold: START_GOLD,
      selectedSlot: 0,
      inventory: new Array(INVENTORY_SIZE).fill(null),
      currentMap: "farm" /* FARM */
    };
    this.player.inventory[0] = { itemId: "tool_hoe", qty: 1, quality: 1 /* NORMAL */ };
    this.player.inventory[1] = { itemId: "parsnip_seeds", qty: 15, quality: 1 /* NORMAL */ };
    this.player.inventory[2] = { itemId: "tool_watering_can", qty: 1, quality: 1 /* NORMAL */ };
    this.player.inventory[3] = { itemId: "potato_seeds", qty: 5, quality: 1 /* NORMAL */ };
    this.calendar = { day: 1, season: "spring" /* SPRING */, year: 1, timeOfDay: 0, isPaused: false };
    this.farmTiles = [];
    for (let y = 0; y < FARM_HEIGHT; y++) {
      for (let x = 0; x < FARM_WIDTH; x++) {
        let type = 0 /* GRASS */;
        if (y === 4 && x >= 22 && x <= 35)
          type = 8 /* PATH */;
        if (x >= 34 && x <= 36 && y >= 3 && y <= 5)
          type = 5 /* STONE */;
        if (x >= 17 && x <= 24 && y >= 6 && y <= 9)
          type = 1 /* DIRT */;
        if ((x === 19 || x === 20) && y >= 8 && y <= 10)
          type = 8 /* PATH */;
        if (x >= 10 && x <= 28 && (y === 10 || y === 20) || y >= 10 && y <= 20 && (x === 10 || x === 28)) {
          type = 1 /* DIRT */;
        }
        if (x >= 18 && x <= 20 && y === 10)
          type = 8 /* PATH */;
        if (x >= 11 && x <= 27 && y >= 11 && y <= 19)
          type = 1 /* DIRT */;
        if ((x === 19 || x === 20) && y >= 10 && y <= 20)
          type = 8 /* PATH */;
        if (y >= 12 && y <= 14 && (x >= 12 && x <= 14 || x >= 16 && x <= 18 || x >= 21 && x <= 23 || x >= 25 && x <= 27)) {
          type = 2 /* TILLED */;
        }
        if (y === 21 && x >= 4 && x <= 35)
          type = 5 /* STONE */;
        if ((x === 19 || x === 20) && y >= 20 && y <= 24)
          type = 8 /* PATH */;
        if (x >= 30 && x <= 33 && y >= 15 && y <= 17)
          type = 8 /* PATH */;
        if (y >= 22 && y <= 25 && x >= 8 && x <= 32)
          type = 0 /* GRASS */;
        if (x >= 4 && x <= 8 && y >= 19 && y <= 22)
          type = 4 /* WATER */;
        if (type !== 4 /* WATER */ && x >= 3 && x <= 9 && y >= 18 && y <= 23)
          type = 7 /* SAND */;
        if (y >= 27 && x >= 33)
          type = 7 /* SAND */;
        this.farmTiles.push({ x, y, type, watered: false });
      }
    }
    for (const npc of NPCS) {
      this.relationships[npc.id] = { hearts: 0, relation: 0, talkedToday: false, giftedToday: false };
    }
    for (const t of Object.values(Tool)) {
      this.toolLevels[t] = 0;
    }
    this.unlockedRecipes = RECIPES.filter((r) => !r.isCooking).slice(0, 3).map((r) => r.id);
  }
  // ── Movement ──
  handleMovement(delta) {
    let vx = 0, vy = 0;
    const up = this.cursors.up?.isDown || this.keys.w.isDown;
    const down = this.cursors.down?.isDown || this.keys.s.isDown;
    const left = this.cursors.left?.isDown || this.keys.a.isDown;
    const right = this.cursors.right?.isDown || this.keys.d.isDown;
    if (up) {
      vy = -1;
      this.player.direction = "up" /* UP */;
    }
    if (down) {
      vy = 1;
      this.player.direction = "down" /* DOWN */;
    }
    if (left) {
      vx = -1;
      this.player.direction = "left" /* LEFT */;
    }
    if (right) {
      vx = 1;
      this.player.direction = "right" /* RIGHT */;
    }
    const touch = this.getTouchState();
    if (touch && (Math.abs(touch.dx) > 0.1 || Math.abs(touch.dy) > 0.1)) {
      vx = touch.dx;
      vy = touch.dy;
      if (Math.abs(vx) > Math.abs(vy)) {
        this.player.direction = vx < 0 ? "left" /* LEFT */ : "right" /* RIGHT */;
      } else {
        this.player.direction = vy < 0 ? "up" /* UP */ : "down" /* DOWN */;
      }
    }
    if (vx !== 0 && vy !== 0) {
      vx *= 0.707;
      vy *= 0.707;
    }
    const speed = PLAYER_SPEED * (delta / 1e3);
    this.player.x += vx * speed;
    this.player.y += vy * speed;
    this.player.x = clamp(this.player.x, SCALED_TILE / 2, FARM_WIDTH * SCALED_TILE - SCALED_TILE / 2);
    this.player.y = clamp(this.player.y, SCALED_TILE / 2, FARM_HEIGHT * SCALED_TILE - SCALED_TILE / 2);
    this.playerSprite.setPosition(this.player.x, this.player.y);
    const moving = vx !== 0 || vy !== 0;
    const animMap = {
      ["down" /* DOWN */]: { walk: "walk_down", idle: "idle_down" },
      ["up" /* UP */]: { walk: "walk_up", idle: "idle_up" },
      ["left" /* LEFT */]: { walk: "walk_left", idle: "idle_left" },
      ["right" /* RIGHT */]: { walk: "walk_right", idle: "idle_right" }
    };
    const anim = animMap[this.player.direction] || animMap["down" /* DOWN */];
    const targetAnim = moving ? anim.walk : anim.idle;
    if (this.playerSprite.anims.currentAnim?.key !== targetAnim) {
      this.playerSprite.play(targetAnim);
    }
  }
  // ── Tool Use ──
  handleToolInput() {
    const touch = this.getTouchState();
    const toolPressed = phaser_shim_default.Input.Keyboard.JustDown(this.keys.space) || !!touch?.toolJust;
    if (toolPressed) {
      const slot = this.player.inventory[this.player.selectedSlot];
      const itemDef = slot ? ITEMS.find((item) => item.id === slot.itemId) : void 0;
      if (slot && itemDef && (itemDef.category === "seed" || itemDef.edible)) {
        this.events.emit(Events.ITEM_USE, { itemId: slot.itemId, slotIndex: this.player.selectedSlot });
        return;
      }
      if (this.player.stamina <= 0) {
        this.events.emit(Events.TOAST, { message: "Too tired!", color: "#ff4444" });
        return;
      }
      const target = facingTile(this.player.x, this.player.y, this.player.direction);
      const tile = this.getFarmTile(target.x, target.y);
      if (!tile)
        return;
      this.events.emit(Events.TOOL_USE, {
        tool: this.player.currentTool,
        tileX: target.x,
        tileY: target.y,
        direction: this.player.direction
      });
    }
    if (phaser_shim_default.Input.Keyboard.JustDown(this.keys.f)) {
      const slot = this.player.inventory[this.player.selectedSlot];
      if (slot) {
        this.events.emit(Events.ITEM_USE, { itemId: slot.itemId, slotIndex: this.player.selectedSlot });
      }
    }
  }
  // ── Interaction ──
  handleInteractionInput() {
    const touch = this.getTouchState();
    const interactPressed = phaser_shim_default.Input.Keyboard.JustDown(this.keys.e) || !!touch?.interactJust;
    if (interactPressed) {
      const target = facingTile(this.player.x, this.player.y, this.player.direction);
      const interaction = this.getInteractionAt(target.x, target.y);
      if (interaction) {
        this.events.emit(Events.INTERACT, interaction);
      }
    }
    if (phaser_shim_default.Input.Keyboard.JustDown(this.keys.i)) {
      this.events.emit(Events.OPEN_INVENTORY);
    }
    if (phaser_shim_default.Input.Keyboard.JustDown(this.keys.esc)) {
      this.events.emit(Events.OPEN_PAUSE);
    }
  }
  // ── Hotbar ──
  handleHotbarInput() {
    const numKeys = [
      this.keys.one,
      this.keys.two,
      this.keys.three,
      this.keys.four,
      this.keys.five,
      this.keys.six,
      this.keys.seven,
      this.keys.eight,
      this.keys.nine,
      this.keys.zero
    ];
    for (let i = 0; i < numKeys.length; i++) {
      if (phaser_shim_default.Input.Keyboard.JustDown(numKeys[i])) {
        this.player.selectedSlot = i;
        const slot = this.player.inventory[i];
        if (slot) {
          const item = ITEMS.find((it) => it.id === slot.itemId);
          if (item?.category === "tool") {
            const toolMap = {
              "tool_hoe": "hoe" /* HOE */,
              "tool_watering_can": "watering_can" /* WATERING_CAN */,
              "tool_axe": "axe" /* AXE */,
              "tool_pickaxe": "pickaxe" /* PICKAXE */,
              "tool_fishing_rod": "fishing_rod" /* FISHING_ROD */,
              "tool_scythe": "scythe" /* SCYTHE */
            };
            if (toolMap[slot.itemId])
              this.player.currentTool = toolMap[slot.itemId];
          }
        }
        this.events.emit(Events.INVENTORY_CHANGE, { inventory: this.player.inventory });
      }
    }
  }
  // ── Day Timer ──
  updateDayTimer(delta) {
    if (this.calendar.isPaused || this.dayPaused)
      return;
    this.dayTimer += delta;
    this.calendar.timeOfDay = clamp(this.dayTimer / DAY_LENGTH_MS, 0, 1);
    this.events.emit(Events.TIME_TICK, { timeOfDay: this.calendar.timeOfDay });
    const t = this.calendar.timeOfDay;
    let tint = 16777215;
    if (t < 0.1)
      tint = 16766112;
    else if (t > 0.7)
      tint = 6715306;
    else if (t > 0.85)
      tint = 3359846;
    this.cameras.main.setBackgroundColor(tint);
    if (this.dayTimer >= DAY_LENGTH_MS) {
      this.endDay();
    }
  }
  endDay() {
    this.dayTimer = 0;
    this.calendar.timeOfDay = 0;
    let shipRevenue = 0;
    for (const item of this.shippingBin.items) {
      const def = ITEMS.find((i) => i.id === item.itemId);
      if (def) {
        const qualityMult = item.quality === 3 /* GOLD */ ? 1.5 : item.quality === 2 /* SILVER */ ? 1.25 : 1;
        shipRevenue += Math.floor(def.sellPrice * item.qty * qualityMult);
        this.stats.itemsShipped += item.qty;
      }
    }
    if (shipRevenue > 0) {
      this.player.gold += shipRevenue;
      this.stats.goldEarned += shipRevenue;
      this.events.emit(Events.GOLD_CHANGE, { amount: shipRevenue, newTotal: this.player.gold });
      this.events.emit(Events.TOAST, { message: `Shipped items for ${shipRevenue}g!`, color: "#ffdd44" });
    }
    this.shippingBin.items = [];
    this.events.emit(Events.DAY_END, {
      day: this.calendar.day,
      season: this.calendar.season,
      year: this.calendar.year
    });
    this.calendar.day++;
    this.stats.daysPlayed++;
    if (this.calendar.day > 28) {
      this.calendar.day = 1;
      const seasons = ["spring" /* SPRING */, "summer" /* SUMMER */, "fall" /* FALL */, "winter" /* WINTER */];
      const idx = seasons.indexOf(this.calendar.season);
      const oldSeason = this.calendar.season;
      if (idx >= 3) {
        this.calendar.season = "spring" /* SPRING */;
        this.calendar.year++;
      } else {
        this.calendar.season = seasons[idx + 1];
      }
      this.events.emit(Events.SEASON_CHANGE, { oldSeason, newSeason: this.calendar.season, year: this.calendar.year });
    }
    this.growCrops();
    for (const npcId of Object.keys(this.relationships)) {
      this.relationships[npcId].talkedToday = false;
      this.relationships[npcId].giftedToday = false;
    }
    this.player.stamina = this.player.maxStamina;
    this.saveGame();
    this.events.emit(Events.DAY_START, {
      day: this.calendar.day,
      season: this.calendar.season,
      year: this.calendar.year
    });
  }
  // ── Crop Growth ──
  growCrops() {
    for (const tile of this.farmTiles) {
      if (tile.cropId && tile.watered) {
        const cropDef = CROPS.find((c) => c.id === tile.cropId);
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
  setupEventListeners() {
    this.events.on(Events.TOOL_USE, (data) => {
      const tile = this.getFarmTile(data.tileX, data.tileY);
      if (!tile)
        return;
      switch (data.tool) {
        case "hoe" /* HOE */:
          if (tile.type === 0 /* GRASS */ || tile.type === 1 /* DIRT */) {
            tile.type = 2 /* TILLED */;
            this.player.stamina -= 2;
            this.events.emit(Events.SOIL_TILLED, { x: data.tileX, y: data.tileY });
            this.refreshTileSprite(tile);
          }
          break;
        case "watering_can" /* WATERING_CAN */:
          if (tile.type === 2 /* TILLED */ || tile.type === 3 /* WATERED */) {
            tile.type = 3 /* WATERED */;
            tile.watered = true;
            this.player.stamina -= 1;
            this.events.emit(Events.CROP_WATERED, { x: data.tileX, y: data.tileY });
            this.refreshTileSprite(tile);
          }
          break;
        case "axe" /* AXE */:
          if (tile.type === 6 /* WOOD */) {
            tile.type = 0 /* GRASS */;
            this.player.stamina -= 3;
            this.addToInventory("wood", 2);
            this.refreshTileSprite(tile);
          }
          break;
        case "pickaxe" /* PICKAXE */:
          if (tile.type === 5 /* STONE */) {
            tile.type = 0 /* GRASS */;
            this.player.stamina -= 3;
            this.addToInventory("stone", 2);
            this.refreshTileSprite(tile);
          }
          break;
        case "scythe" /* SCYTHE */:
          if (tile.cropId) {
            const cropDef = CROPS.find((c) => c.id === tile.cropId);
            if (cropDef && tile.cropStage !== void 0 && tile.cropStage >= cropDef.growthStages - 1) {
              const quality = Math.random() < 0.1 ? 3 /* GOLD */ : Math.random() < 0.3 ? 2 /* SILVER */ : 1 /* NORMAL */;
              const qty = 1;
              this.addToInventory(cropDef.harvestId, qty, quality);
              this.stats.cropsHarvested += qty;
              this.events.emit(Events.CROP_HARVESTED, { cropId: cropDef.id, qty, quality });
              this.events.emit(Events.STAT_INCREMENT, { stat: "cropsHarvested", amount: qty });
              if (cropDef.regrows) {
                tile.cropStage = cropDef.growthStages - 3;
                tile.growthDay = Math.max(0, (tile.growthDay ?? 0) - (cropDef.regrowDays ?? 3));
              } else {
                tile.cropId = void 0;
                tile.cropStage = void 0;
                tile.growthDay = void 0;
                tile.type = 2 /* TILLED */;
              }
              this.player.stamina -= 1;
              this.refreshTileSprite(tile);
            }
          }
          break;
      }
    });
    this.events.on(Events.ITEM_USE, (data) => {
      const itemDef = ITEMS.find((i) => i.id === data.itemId);
      if (!itemDef)
        return;
      if (itemDef.edible && itemDef.staminaRestore) {
        this.player.stamina = clamp(this.player.stamina + itemDef.staminaRestore, 0, this.player.maxStamina);
        this.removeFromSlot(data.slotIndex, 1);
        this.events.emit(Events.TOAST, { message: `Ate ${itemDef.name}! +${itemDef.staminaRestore} stamina`, color: "#44ff44" });
        return;
      }
      if (itemDef.category === "seed") {
        const target = facingTile(this.player.x, this.player.y, this.player.direction);
        const tile = this.getFarmTile(target.x, target.y);
        if (tile && (tile.type === 2 /* TILLED */ || tile.type === 3 /* WATERED */) && !tile.cropId) {
          const cropDef = CROPS.find((c) => c.seedId === data.itemId);
          if (cropDef && cropDef.seasons.includes(this.calendar.season)) {
            tile.cropId = cropDef.id;
            tile.cropStage = 0;
            tile.growthDay = 0;
            this.removeFromSlot(data.slotIndex, 1);
            this.events.emit(Events.CROP_PLANTED, { x: target.x, y: target.y, cropId: cropDef.id });
            this.refreshTileSprite(tile);
          } else {
            this.events.emit(Events.TOAST, { message: "Wrong season for this crop!", color: "#ff4444" });
          }
        }
      }
    });
    this.events.on(Events.INTERACT, (data) => {
      switch (data.kind) {
        case "shipping_bin" /* SHIPPING_BIN */: {
          const slot = this.player.inventory[this.player.selectedSlot];
          if (slot) {
            const itemDef = ITEMS.find((i) => i.id === slot.itemId);
            if (itemDef && itemDef.sellPrice > 0) {
              this.shippingBin.items.push({ itemId: slot.itemId, qty: 1, quality: slot.quality });
              this.removeFromSlot(this.player.selectedSlot, 1);
              this.events.emit(Events.ITEM_SHIPPED, { itemId: slot.itemId, qty: 1, quality: slot.quality });
              this.events.emit(Events.TOAST, { message: `Added ${itemDef.name} to shipping bin`, color: "#ffdd44" });
            }
          }
          if (this.tutorialActive && this.tutorialStep === 4)
            this.advanceTutorial(5);
          break;
        }
        case "crafting_bench" /* CRAFTING_BENCH */:
          this.events.emit(Events.OPEN_CRAFTING, { cooking: false });
          break;
        case "kitchen" /* KITCHEN */:
          if (this.house.tier >= 1) {
            this.events.emit(Events.OPEN_CRAFTING, { cooking: true });
          } else {
            this.events.emit(Events.TOAST, { message: "Upgrade your house first!", color: "#ff4444" });
          }
          break;
        case "bed" /* BED */:
          if (this.tutorialActive && this.tutorialStep === 5)
            this.advanceTutorial(6);
          this.endDay();
          break;
        case "npc" /* NPC */: {
          if (data.targetId) {
            this.handleNPCInteraction(data.targetId);
          }
          break;
        }
        case "shop" /* SHOP */:
          break;
        case "door" /* DOOR */:
          this.events.emit(Events.TOAST, { message: "Entering the mines...", color: "#aaccff" });
          this.events.emit(Events.ENTER_MINE, { floor: 1 });
          break;
        case "quest_board" /* QUEST_BOARD */:
          this.events.emit(Events.TOAST, { message: "Quest board: Check back soon!", color: "#ffaa44" });
          break;
      }
    });
    this.events.on(Events.CRAFT_ITEM, (data) => {
      const recipe = RECIPES.find((r) => r.id === data.recipeId);
      if (!recipe)
        return;
      const canCraft = recipe.ingredients.every((ing) => {
        return this.countItem(ing.itemId) >= ing.qty;
      });
      if (!canCraft) {
        this.events.emit(Events.TOAST, { message: "Missing ingredients!", color: "#ff4444" });
        return;
      }
      for (const ing of recipe.ingredients) {
        this.removeItem(ing.itemId, ing.qty);
      }
      this.addToInventory(recipe.resultId, recipe.resultQty);
      this.stats.recipesCooked += recipe.isCooking ? 1 : 0;
      this.events.emit(Events.TOAST, { message: `Crafted ${recipe.name}!`, color: "#44ffaa" });
    });
    this.events.on(Events.GIFT_GIVEN, (data) => {
      const rel = this.relationships[data.npcId];
      const npcDef = NPCS.find((n) => n.id === data.npcId);
      if (!rel || !npcDef)
        return;
      if (rel.giftedToday) {
        this.events.emit(Events.TOAST, { message: "Already gave a gift today.", color: "#aaaaaa" });
        return;
      }
      let points = 20;
      let reaction = "neutral";
      if (npcDef.lovedItems.includes(data.itemId)) {
        points = 80;
        reaction = "love";
      } else if (npcDef.likedItems.includes(data.itemId)) {
        points = 45;
        reaction = "like";
      } else if (npcDef.hatedItems.includes(data.itemId)) {
        points = -40;
        reaction = "hate";
      }
      rel.hearts = clamp(rel.hearts + points, 0, 1e3);
      rel.giftedToday = true;
      this.stats.giftsGiven++;
      this.events.emit(Events.RELATIONSHIP_UP, { npcId: data.npcId, newHearts: rel.hearts });
      this.events.emit(Events.TOAST, { message: `${npcDef.name} ${reaction}d the gift!`, color: reaction === "hate" ? "#ff4444" : "#ff88cc" });
    });
    this.events.on(Events.FISH_CAUGHT, (data) => {
      const added = this.addToInventory(data.fishId, 1, data.quality);
      if (!added)
        return;
      this.stats.fishCaught += 1;
      this.events.emit(Events.STAT_INCREMENT, { stat: "fishCaught", amount: 1 });
    });
    this.events.on(Events.SHOP_BUY, (data) => {
      if (data.cost > this.player.gold) {
        this.events.emit(Events.TOAST, { message: "Not enough gold!", color: "#ff4444" });
        return;
      }
      const added = this.addToInventory(data.itemId, data.qty);
      if (!added)
        return;
      this.player.gold -= data.cost;
      this.events.emit(Events.GOLD_CHANGE, { amount: -data.cost, newTotal: this.player.gold });
    });
    this.events.on(Events.SHOP_SELL, (data) => {
      if (this.countItem(data.itemId) < data.qty)
        return;
      this.removeItem(data.itemId, data.qty);
      this.player.gold += data.revenue;
      this.stats.goldEarned += data.revenue;
      this.events.emit(Events.GOLD_CHANGE, { amount: data.revenue, newTotal: this.player.gold });
    });
  }
  // ── NPC Interaction ──
  handleNPCInteraction(npcId) {
    const npcDef = NPCS.find((n) => n.id === npcId);
    const rel = this.relationships[npcId];
    if (!npcDef || !rel)
      return;
    const slot = this.player.inventory[this.player.selectedSlot];
    if (slot && slot.qty > 0) {
      const itemDef = ITEMS.find((i) => i.id === slot.itemId);
      if (itemDef && itemDef.category !== "tool") {
        this.events.emit(Events.GIFT_GIVEN, { npcId, itemId: slot.itemId });
        this.removeFromSlot(this.player.selectedSlot, 1);
        return;
      }
    }
    if (!rel.talkedToday) {
      rel.hearts = clamp(rel.hearts + 10, 0, 1e3);
      rel.talkedToday = true;
    }
    const heartBracket = Math.min(Math.floor(rel.hearts / 200), 4).toString();
    const pool = npcDef.dialoguePool[heartBracket] ?? npcDef.dialoguePool["0"] ?? ["..."];
    const line = pool[Math.floor(Math.random() * pool.length)];
    this.events.emit(Events.DIALOGUE_START, { npcId, text: line, portraitIndex: npcDef.portraitIndex });
    this.events.emit(Events.TOAST, { message: `${npcDef.name}: "${line}"`, duration: 3e3 });
  }
  // ── World Creation ──
  createFarmMap() {
    this.farmLayer = this.add.container(0, 0);
    for (const tile of this.farmTiles) {
      const pos = gridToWorld(tile.x, tile.y);
      const spr = this.add.sprite(pos.x, pos.y, "terrain", tile.type);
      spr.setScale(SCALE);
      spr.setData("tileRef", tile);
      this.farmLayer.add(spr);
    }
  }
  createWorldObjects() {
    this.objectLayer = this.add.container(0, 0);
    const housePos = gridToWorld(20, 7);
    const house = this.add.sprite(housePos.x, housePos.y - SCALED_TILE * 0.5, "house");
    house.setScale(SCALE * 1.8);
    house.setDepth(ySortDepth(housePos.y) - 1);
    this.objectLayer.add(house);
    this.addLabel(20, 5, "Home");
    const treePositions = [
      // Top edge
      [2, 1],
      [5, 0],
      [8, 1],
      [12, 0],
      [15, 1],
      [33, 0],
      [36, 1],
      [38, 0],
      // Bottom edge
      [2, 28],
      [6, 29],
      [10, 28],
      [14, 29],
      [33, 28],
      [36, 29],
      [38, 28],
      // Left edge
      [0, 5],
      [1, 10],
      [0, 16],
      [1, 22],
      // Right edge
      [39, 5],
      [38, 12],
      [39, 18],
      [38, 24],
      // Scattered decorative
      [5, 5],
      [7, 3],
      [34, 6],
      [36, 10]
    ];
    for (const [tx, ty] of treePositions) {
      const tPos = gridToWorld(tx, ty);
      const tree = this.add.sprite(tPos.x, tPos.y - SCALED_TILE * 0.6, "tree");
      tree.setScale(SCALE * 0.8);
      tree.setDepth(ySortDepth(tPos.y));
      this.objectLayer.add(tree);
    }
    for (let fx = 10; fx <= 28; fx++) {
      for (const fy of [10, 20]) {
        if (fx >= 18 && fx <= 20 && fy === 10)
          continue;
        const fPos = gridToWorld(fx, fy);
        const fence = this.add.sprite(fPos.x, fPos.y, "fence");
        fence.setScale(SCALE);
        fence.setDepth(ySortDepth(fPos.y));
        this.objectLayer.add(fence);
      }
    }
    for (let fy = 11; fy <= 19; fy++) {
      for (const fx of [10, 28]) {
        const fPos = gridToWorld(fx, fy);
        const fence = this.add.sprite(fPos.x, fPos.y, "fence");
        fence.setScale(SCALE);
        fence.setDepth(ySortDepth(fPos.y));
        this.objectLayer.add(fence);
      }
    }
    const farmCenter = gridToWorld(19, 15);
    this.add.text(farmCenter.x, farmCenter.y - SCALED_TILE, "\u{1F331} Farm Plot", {
      fontSize: "12px",
      color: "#a8d5a3",
      fontFamily: "monospace",
      backgroundColor: "#00000066",
      padding: { x: 4, y: 2 }
    }).setOrigin(0.5).setDepth(500);
    this.createInteractable(22, 8, 2, "bed" /* BED */);
    this.createInteractable(18, 8, 3, "kitchen" /* KITCHEN */);
    this.createInteractable(12, 16, 1, "crafting_bench" /* CRAFTING_BENCH */);
    this.createInteractable(27, 12, 0, "shipping_bin" /* SHIPPING_BIN */);
    this.createInteractable(28, 23, 4, "shop" /* SHOP */);
    this.createInteractable(35, 4, 5, "door" /* DOOR */);
    this.createInteractable(15, 23, 6, "quest_board" /* QUEST_BOARD */);
    this.addLabel(27, 12, "Shipping Bin");
    this.addLabel(12, 16, "Crafting Bench");
    this.addLabel(22, 8, "Bed");
    this.addLabel(18, 8, "Kitchen");
    this.addLabel(28, 23, "Shop");
    this.addLabel(35, 4, "Mine Entrance");
    this.addLabel(15, 23, "Quest Board");
  }
  createInteractable(tileX, tileY, frame, kind) {
    const pos = gridToWorld(tileX, tileY);
    const spr = this.add.sprite(pos.x, pos.y, "objects", frame);
    spr.setScale(SCALE);
    spr.setDepth(ySortDepth(pos.y));
    spr.setData("interaction", { kind, x: tileX, y: tileY });
    this.objectLayer.add(spr);
  }
  spawnNPCs() {
    const npcPositions = {
      elena: { x: 30, y: 23 },
      // near the shop in town
      owen: { x: 17, y: 23 },
      // near quest board in town
      lily: { x: 6, y: 20 },
      // near the pond
      marcus: { x: 35, y: 5 },
      // at the mine
      sage: { x: 20, y: 25 }
      // town square
    };
    for (const npc of NPCS) {
      const posDef = npcPositions[npc.id] ?? { x: 20, y: 20 };
      const x = posDef.x;
      const y = posDef.y;
      const pos = gridToWorld(x, y);
      const spr = this.add.sprite(pos.x, pos.y, "npcs", npc.spriteIndex);
      spr.setScale(SCALE);
      spr.setDepth(ySortDepth(pos.y));
      spr.setData("interaction", { kind: "npc" /* NPC */, targetId: npc.id, x, y });
      this.npcSprites.set(npc.id, spr);
      const label = this.add.text(pos.x, pos.y - SCALED_TILE * 0.7, npc.name, {
        fontSize: "9px",
        color: "#ffffff",
        fontFamily: "monospace",
        backgroundColor: "#00000088",
        padding: { x: 2, y: 1 }
      }).setOrigin(0.5).setDepth(ySortDepth(pos.y) + 1);
    }
  }
  addLabel(x, y, text) {
    const pos = gridToWorld(x, y);
    const label = this.add.text(pos.x, pos.y - SCALED_TILE * 0.8, text, {
      fontSize: "10px",
      color: "#ffffff",
      fontFamily: "monospace",
      backgroundColor: "#00000088",
      padding: { x: 3, y: 2 }
    }).setOrigin(0.5).setDepth(1e3);
    this.objectLayer.add(label);
  }
  updateTutorial() {
    this.tutorialActive = true;
    this.tutorialStep = 0;
    this.tutorialText = void 0;
    this.tutorialArrow = void 0;
    this.events.on(Events.SOIL_TILLED, () => {
      if (this.tutorialActive && this.tutorialStep === 1)
        this.advanceTutorial(2);
    });
    this.events.on(Events.CROP_PLANTED, () => {
      if (this.tutorialActive && this.tutorialStep === 2)
        this.advanceTutorial(3);
    });
    this.events.on(Events.CROP_WATERED, () => {
      if (this.tutorialActive && this.tutorialStep === 3)
        this.advanceTutorial(4);
    });
    this.time.delayedCall(0, () => this.advanceTutorial(0));
  }
  advanceTutorial(step) {
    this.tutorialStep = step;
    const emitState = (payload) => {
      this.events.emit("TUTORIAL_ADVANCE", payload);
    };
    switch (step) {
      case 0:
        emitState({
          active: true,
          step,
          text: "Welcome to your farm! Use WASD to walk around.",
          targetTile: { x: 16, y: 12 }
        });
        break;
      case 1:
        emitState({
          active: true,
          step,
          text: "Press 1-0 to select tools. Your Hoe is selected - face the dark soil and press SPACE to till it.",
          targetTile: { x: 12, y: 12 }
        });
        break;
      case 2:
        emitState({
          active: true,
          step,
          text: "Great! Now select your Parsnip Seeds (slot 2) and press SPACE to plant.",
          targetTile: { x: 15, y: 12 }
        });
        break;
      case 3:
        emitState({
          active: true,
          step,
          text: "Now switch to your Watering Can and press SPACE to water.",
          targetTile: { x: 15, y: 12 }
        });
        break;
      case 4:
        emitState({
          active: true,
          step,
          text: "Perfect! Your crop will grow overnight. Walk to the shipping bin (the brown box ->) and press E to interact.",
          targetTile: { x: 25, y: 8 }
        });
        break;
      case 5:
        emitState({
          active: true,
          step,
          text: "You can ship items here for gold. Walk to your bed and press E to sleep.",
          targetTile: { x: 20, y: 8 }
        });
        break;
      case 6:
        emitState({
          active: true,
          step,
          text: "Tutorial complete! Explore the farm, talk to villagers, and make Hearthfield flourish!"
        });
        this.time.delayedCall(3500, () => this.advanceTutorial(7));
        break;
      default:
        this.tutorialActive = false;
        emitState({ active: false, step: 7 });
    }
  }
  // ── Helpers ──
  getFarmTile(x, y) {
    return this.farmTiles.find((t) => t.x === x && t.y === y);
  }
  getInteractionAt(tileX, tileY) {
    const objs = this.objectLayer.getAll();
    for (const obj of objs) {
      const data = obj.getData("interaction");
      if (data && data.x === tileX && data.y === tileY) {
        return data;
      }
    }
    for (const [npcId, spr] of this.npcSprites) {
      const data = spr.getData("interaction");
      if (data && data.x === tileX && data.y === tileY) {
        return data;
      }
    }
    return null;
  }
  addToInventory(itemId, qty, quality = 1 /* NORMAL */) {
    for (let i = 0; i < this.player.inventory.length; i++) {
      const slot = this.player.inventory[i];
      if (slot && slot.itemId === itemId && slot.quality === quality) {
        slot.qty += qty;
        this.events.emit(Events.INVENTORY_CHANGE, { inventory: this.player.inventory });
        return true;
      }
    }
    for (let i = 0; i < this.player.inventory.length; i++) {
      if (!this.player.inventory[i]) {
        this.player.inventory[i] = { itemId, qty, quality };
        this.events.emit(Events.INVENTORY_CHANGE, { inventory: this.player.inventory });
        return true;
      }
    }
    this.events.emit(Events.TOAST, { message: "Inventory full!", color: "#ff4444" });
    return false;
  }
  removeFromSlot(slotIndex, qty) {
    const slot = this.player.inventory[slotIndex];
    if (!slot)
      return;
    slot.qty -= qty;
    if (slot.qty <= 0) {
      this.player.inventory[slotIndex] = null;
    }
    this.events.emit(Events.INVENTORY_CHANGE, { inventory: this.player.inventory });
  }
  removeItem(itemId, qty) {
    let remaining = qty;
    for (let i = 0; i < this.player.inventory.length && remaining > 0; i++) {
      const slot = this.player.inventory[i];
      if (slot && slot.itemId === itemId) {
        const take = Math.min(slot.qty, remaining);
        slot.qty -= take;
        remaining -= take;
        if (slot.qty <= 0)
          this.player.inventory[i] = null;
      }
    }
    this.events.emit(Events.INVENTORY_CHANGE, { inventory: this.player.inventory });
  }
  countItem(itemId) {
    return this.player.inventory.reduce((sum, slot) => {
      return sum + (slot && slot.itemId === itemId ? slot.qty : 0);
    }, 0);
  }
  refreshTileSprite(tile) {
    const children = this.farmLayer.getAll();
    for (const child of children) {
      const ref = child.getData("tileRef");
      if (ref && ref.x === tile.x && ref.y === tile.y) {
        child.setFrame(tile.type);
        break;
      }
    }
    if (tile.cropId && tile.cropStage !== void 0) {
      const key = `${tile.x},${tile.y}`;
      let cropSpr = this.cropSprites.get(key);
      const cropDef = CROPS.find((c) => c.id === tile.cropId);
      if (cropDef) {
        const pos = gridToWorld(tile.x, tile.y);
        if (!cropSpr) {
          cropSpr = this.add.sprite(pos.x, pos.y - 8, "crops");
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
      if (cropSpr)
        cropSpr.setVisible(false);
    }
  }
  updateCropSprites() {
  }
  // ── Save / Load ──
  saveGame() {
    const data = {
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
      toolLevels: this.toolLevels
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    this.events.emit(Events.TOAST, { message: "Game saved!", color: "#44aaff", duration: 1500 });
  }
  loadGame() {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) {
      this.initNewGame();
      return false;
    }
    try {
      const data = JSON.parse(raw);
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
};

// src/systems/touchControls.ts
var DPAD_RADIUS = 52;
var DPAD_CENTER_DEAD = 14;
var BTN_RADIUS = 28;
var ALPHA_REST = 0.35;
var ALPHA_ACTIVE = 0.65;
var TouchControls = class {
  constructor(scene) {
    this.allButtons = [];
    this.joystickPointerId = null;
    this.joystickOriginX = 0;
    this.joystickOriginY = 0;
    this.state = {
      dx: 0,
      dy: 0,
      toolJust: false,
      interactJust: false,
      inventoryJust: false,
      pauseJust: false
    };
    this.scene = scene;
    this.isTouchDevice = !!("ontouchstart" in window || navigator.maxTouchPoints > 0);
    this.container = scene.add.container(0, 0).setDepth(950).setScrollFactor(0);
    const w = scene.scale.width;
    const h = scene.scale.height;
    const padX = 80;
    const padY = h - 100;
    this.joystickBase = scene.add.circle(padX, padY, DPAD_RADIUS, 16777215, ALPHA_REST);
    this.joystickBase.setStrokeStyle(2, 16777215, ALPHA_REST + 0.1);
    this.joystickThumb = scene.add.circle(padX, padY, 20, 16777215, ALPHA_ACTIVE);
    this.container.add([this.joystickBase, this.joystickThumb]);
    this.btnTool = this.makeButton(w - 70, h - 130, "\u2694", 8965188);
    this.btnInteract = this.makeButton(w - 70, h - 68, "E", 4500223);
    this.btnInventory = this.makeButton(w - 44, 50, "\u25A4", 13404228);
    this.btnPause = this.makeButton(44, 50, "\u23F8", 8947848);
    this.container.add([this.btnTool, this.btnInteract, this.btnInventory, this.btnPause]);
    this.allButtons = [
      { container: this.btnTool, key: "toolJust" },
      { container: this.btnInteract, key: "interactJust" },
      { container: this.btnInventory, key: "inventoryJust" },
      { container: this.btnPause, key: "pauseJust" }
    ];
    this.container.setVisible(this.isTouchDevice);
    if (this.isTouchDevice) {
      this.wireTouch();
    }
  }
  makeButton(x, y, label, color) {
    const bg = this.scene.add.circle(0, 0, BTN_RADIUS, color, ALPHA_REST);
    bg.setStrokeStyle(2, 16777215, 0.3);
    const txt = this.scene.add.text(0, 0, label, {
      fontSize: "20px",
      color: "#ffffff",
      fontFamily: "monospace"
    }).setOrigin(0.5);
    const c = this.scene.add.container(x, y, [bg, txt]);
    return c;
  }
  wireTouch() {
    const scene = this.scene;
    scene.input.on("pointerdown", (p) => {
      for (const btn of this.allButtons) {
        const dist = phaser_shim_default.Math.Distance.Between(p.x, p.y, btn.container.x, btn.container.y);
        if (dist < BTN_RADIUS + 14)
          return;
      }
      if (p.x < scene.scale.width * 0.4 && p.y < scene.scale.height - 55 && this.joystickPointerId === null) {
        this.joystickPointerId = p.id;
        this.joystickOriginX = p.x;
        this.joystickOriginY = p.y;
        this.joystickBase.setPosition(p.x, p.y);
        this.joystickThumb.setPosition(p.x, p.y);
        this.joystickBase.setAlpha(ALPHA_ACTIVE);
      }
    });
    scene.input.on("pointermove", (p) => {
      if (p.id === this.joystickPointerId) {
        const dx = p.x - this.joystickOriginX;
        const dy = p.y - this.joystickOriginY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < DPAD_CENTER_DEAD) {
          this.state.dx = 0;
          this.state.dy = 0;
          this.joystickThumb.setPosition(this.joystickOriginX, this.joystickOriginY);
        } else {
          const clamped = Math.min(dist, DPAD_RADIUS);
          const nx = dx / dist;
          const ny = dy / dist;
          this.state.dx = nx * (clamped / DPAD_RADIUS);
          this.state.dy = ny * (clamped / DPAD_RADIUS);
          this.joystickThumb.setPosition(
            this.joystickOriginX + nx * clamped,
            this.joystickOriginY + ny * clamped
          );
        }
      }
    });
    const releaseJoystick = (p) => {
      if (p.id === this.joystickPointerId) {
        this.joystickPointerId = null;
        this.state.dx = 0;
        this.state.dy = 0;
        const padX = 80;
        const padY = scene.scale.height - 100;
        this.joystickBase.setPosition(padX, padY);
        this.joystickThumb.setPosition(padX, padY);
        this.joystickBase.setAlpha(ALPHA_REST);
      }
    };
    scene.input.on("pointerup", releaseJoystick);
    scene.input.on("pointerupoutside", releaseJoystick);
    scene.input.on("pointerdown", (p) => {
      if (p.id === this.joystickPointerId)
        return;
      for (const btn of this.allButtons) {
        const dist = phaser_shim_default.Math.Distance.Between(
          p.x,
          p.y,
          btn.container.x,
          btn.container.y
        );
        if (dist < BTN_RADIUS + 14) {
          this.state[btn.key] = true;
          const bg = btn.container.first;
          bg.setAlpha(ALPHA_ACTIVE);
          scene.time.delayedCall(120, () => {
            bg.setAlpha(ALPHA_REST);
          });
          break;
        }
      }
    });
  }
  /** Call at end of update() to reset single-fire flags */
  consumeJustPressed() {
    this.state.toolJust = false;
    this.state.interactJust = false;
    this.state.inventoryJust = false;
    this.state.pauseJust = false;
  }
  /** Gamepad polling — call every frame */
  pollGamepad() {
    const gp = this.scene.input.gamepad;
    if (!gp || !gp.pad1)
      return;
    const pad = gp.pad1;
    this.container.setVisible(true);
    const lx = pad.axes.length > 0 ? pad.axes[0].getValue() : 0;
    const ly = pad.axes.length > 1 ? pad.axes[1].getValue() : 0;
    const dead = 0.15;
    this.state.dx = Math.abs(lx) > dead ? lx : 0;
    this.state.dy = Math.abs(ly) > dead ? ly : 0;
    if (this.state.dx === 0 && this.state.dy === 0) {
      if (pad.left)
        this.state.dx = -1;
      if (pad.right)
        this.state.dx = 1;
      if (pad.up)
        this.state.dy = -1;
      if (pad.down)
        this.state.dy = 1;
    }
    if (pad.A && !pad._prevA)
      this.state.toolJust = true;
    if (pad.B && !pad._prevB)
      this.state.interactJust = true;
    pad._prevA = pad.A;
    pad._prevB = pad.B;
  }
  reposition() {
    const w = this.scene.scale.width;
    const h = this.scene.scale.height;
    this.joystickBase.setPosition(80, h - 100);
    this.joystickThumb.setPosition(80, h - 100);
    this.btnTool.setPosition(w - 70, h - 130);
    this.btnInteract.setPosition(w - 70, h - 68);
    this.btnInventory.setPosition(w - 44, 50);
    this.btnPause.setPosition(44, 50);
  }
};

// src/systems/inventoryPanel.ts
var InventoryPanel = class {
  constructor(scene) {
    this.isOpen = false;
    this.slotViews = [];
    this.currentInventory = [];
    this.onCloseCallback = null;
    this.onSwapCallback = null;
    this.selectedIndex = null;
    this.cols = 6;
    this.rows = 6;
    this.slotSize = 36;
    this.gap = 4;
    this.itemById = new Map(ITEMS.map((item) => [item.id, item]));
    this.scene = scene;
    const gridWidth = this.cols * this.slotSize + (this.cols - 1) * this.gap;
    const gridHeight = this.rows * this.slotSize + (this.rows - 1) * this.gap;
    const padding = 20;
    const headerHeight = 50;
    this.panelWidth = gridWidth + padding * 2;
    this.panelHeight = gridHeight + headerHeight + padding;
    this.container = this.scene.add.container(0, 0);
    this.container.setDepth(300);
    this.container.setScrollFactor(0);
    this.container.setVisible(false);
    const bg = this.scene.add.rectangle(0, 0, this.panelWidth, this.panelHeight, 1710638, 0.95);
    bg.setStrokeStyle(2, 8965188);
    this.container.add(bg);
    const titleY = -this.panelHeight / 2 + 24;
    const title = this.scene.add.text(0, titleY, "Inventory", {
      fontSize: "20px",
      color: "#88cc44"
    }).setOrigin(0.5);
    this.container.add(title);
    const closeBtn = this.scene.add.text(this.panelWidth / 2 - 16, titleY, "X", {
      fontSize: "20px",
      color: "#ff6666",
      fontStyle: "bold"
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on("pointerdown", () => this.close());
    this.container.add(closeBtn);
    const startX = -gridWidth / 2 + this.slotSize / 2;
    const startY = -this.panelHeight / 2 + headerHeight + this.slotSize / 2;
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const index = row * this.cols + col;
        const x = startX + col * (this.slotSize + this.gap);
        const y = startY + row * (this.slotSize + this.gap);
        const slotBg = this.scene.add.rectangle(x, y, this.slotSize, this.slotSize, 987168, 0.85).setStrokeStyle(1, 6710886).setInteractive({ useHandCursor: true });
        slotBg.on("pointerdown", () => this.handleSlotClick(index));
        const icon = this.scene.add.sprite(x, y, "items", 0).setScale(2).setVisible(false);
        const qtyText = this.scene.add.text(
          x + this.slotSize / 2 - 3,
          y + this.slotSize / 2 - 2,
          "",
          { fontSize: "12px", color: "#ffffff" }
        ).setOrigin(1, 1);
        this.slotViews.push({ bg: slotBg, icon, qty: qtyText });
        this.container.add([slotBg, icon, qtyText]);
      }
    }
    this.centerPanel();
    this.scene.scale.on("resize", () => this.centerPanel());
  }
  open(inventory, onClose, onSwap) {
    this.currentInventory = inventory;
    this.onCloseCallback = onClose;
    this.onSwapCallback = onSwap;
    this.selectedIndex = null;
    this.isOpen = true;
    this.container.setVisible(true);
    this.centerPanel();
    this.refreshSlots();
  }
  close() {
    if (!this.isOpen)
      return;
    this.isOpen = false;
    this.container.setVisible(false);
    this.selectedIndex = null;
    const callback = this.onCloseCallback;
    this.onCloseCallback = null;
    this.onSwapCallback = null;
    if (callback)
      callback();
  }
  handleSlotClick(index) {
    if (!this.isOpen)
      return;
    if (this.selectedIndex === null) {
      this.selectedIndex = index;
      this.refreshSlots();
      return;
    }
    if (this.selectedIndex === index) {
      this.selectedIndex = null;
      this.refreshSlots();
      return;
    }
    const from = this.selectedIndex;
    this.selectedIndex = null;
    if (this.onSwapCallback) {
      this.onSwapCallback(from, index);
    }
    this.refreshSlots();
  }
  refreshSlots() {
    const maxSlots = Math.min(INVENTORY_SIZE, this.slotViews.length);
    for (let i = 0; i < maxSlots; i++) {
      const view = this.slotViews[i];
      const slot = this.currentInventory[i];
      if (slot && slot.qty > 0) {
        const itemDef = this.itemById.get(slot.itemId);
        if (itemDef) {
          view.icon.setTexture("items", itemDef.spriteIndex);
          view.icon.setVisible(true);
        } else {
          view.icon.setVisible(false);
        }
        view.qty.setText(slot.qty > 1 ? `${slot.qty}` : "");
        view.bg.setStrokeStyle(1, this.getQualityColor(slot.quality));
      } else {
        view.icon.setVisible(false);
        view.qty.setText("");
        view.bg.setStrokeStyle(1, this.getQualityColor(1 /* NORMAL */));
      }
      if (this.selectedIndex === i) {
        view.bg.setStrokeStyle(2, 16768324);
      }
    }
  }
  getQualityColor(quality) {
    if (quality === 3 /* GOLD */)
      return 16766720;
    if (quality === 2 /* SILVER */)
      return 12632256;
    return 6710886;
  }
  centerPanel() {
    const width = this.scene.scale.width;
    const height = this.scene.scale.height;
    this.container.setPosition(width / 2, height / 2);
  }
};

// src/systems/shopPanel.ts
var ShopPanel = class {
  constructor(scene) {
    this.isOpen = false;
    this.activeTab = "buy";
    this.panelWidth = 620;
    this.panelHeight = 460;
    this.viewportWidth = 576;
    this.viewportHeight = 310;
    this.viewportTopY = -120;
    this.rowHeight = 42;
    this.buyScroll = 0;
    this.sellScroll = 0;
    this.buyContentHeight = 0;
    this.sellContentHeight = 0;
    this.inventory = [];
    this.playerGold = 0;
    this.onBuyCallback = null;
    this.onSellCallback = null;
    this.onCloseCallback = null;
    this.buyItems = ITEMS.filter(
      (item) => item.category === "seed" /* SEED */ || item.category === "tool" /* TOOL */
    );
    this.scene = scene;
    this.container = this.scene.add.container(0, 0);
    this.container.setDepth(300);
    this.container.setVisible(false);
    const bg = this.scene.add.rectangle(0, 0, this.panelWidth, this.panelHeight, 1710638, 0.95);
    bg.setStrokeStyle(2, 8965188, 1);
    this.container.add(bg);
    const titleY = -this.panelHeight / 2 + 24;
    const title = this.scene.add.text(0, titleY, "Shop", {
      fontSize: "20px",
      color: "#88cc44",
      fontStyle: "bold"
    }).setOrigin(0.5);
    this.container.add(title);
    this.goldText = this.scene.add.text(this.panelWidth / 2 - 46, titleY, "Gold: 0g", {
      fontSize: "16px",
      color: "#ffdd44"
    }).setOrigin(1, 0.5);
    this.container.add(this.goldText);
    const closeBtn = this.scene.add.text(this.panelWidth / 2 - 16, titleY, "X", {
      fontSize: "20px",
      color: "#ff6666",
      fontStyle: "bold"
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on("pointerdown", () => this.close());
    this.container.add(closeBtn);
    this.tabBuyText = this.scene.add.text(-48, -174, "Buy", {
      fontSize: "18px",
      color: "#ffffff",
      fontStyle: "bold"
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.tabBuyText.on("pointerdown", () => this.switchTab("buy"));
    this.tabSellText = this.scene.add.text(48, -174, "Sell", {
      fontSize: "18px",
      color: "#aaaaaa",
      fontStyle: "bold"
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.tabSellText.on("pointerdown", () => this.switchTab("sell"));
    this.container.add([this.tabBuyText, this.tabSellText]);
    const viewportFrame = this.scene.add.rectangle(0, this.viewportTopY + this.viewportHeight / 2, this.viewportWidth, this.viewportHeight, 987168, 0.8);
    viewportFrame.setStrokeStyle(1, 3364147, 1);
    this.container.add(viewportFrame);
    this.buyContent = this.scene.add.container(0, this.viewportTopY);
    this.sellContent = this.scene.add.container(0, this.viewportTopY);
    this.container.add([this.buyContent, this.sellContent]);
    const buyMaskGraphics = this.scene.add.graphics();
    buyMaskGraphics.fillStyle(16777215, 1);
    buyMaskGraphics.fillRect(
      -this.viewportWidth / 2,
      this.viewportTopY,
      this.viewportWidth,
      this.viewportHeight
    );
    buyMaskGraphics.setVisible(false);
    this.container.add(buyMaskGraphics);
    this.buyContent.setMask(buyMaskGraphics.createGeometryMask());
    const sellMaskGraphics = this.scene.add.graphics();
    sellMaskGraphics.fillStyle(16777215, 1);
    sellMaskGraphics.fillRect(
      -this.viewportWidth / 2,
      this.viewportTopY,
      this.viewportWidth,
      this.viewportHeight
    );
    sellMaskGraphics.setVisible(false);
    this.container.add(sellMaskGraphics);
    this.sellContent.setMask(sellMaskGraphics.createGeometryMask());
    this.centerPanel();
    this.scene.scale.on("resize", this.centerPanel, this);
    this.scene.input.on("wheel", this.onMouseWheel, this);
    this.scene.events.once(phaser_shim_default.Scenes.Events.SHUTDOWN, this.destroy, this);
  }
  open(inventory, playerGold, onBuy, onSell, onClose) {
    this.inventory = inventory;
    this.playerGold = playerGold;
    this.onBuyCallback = onBuy;
    this.onSellCallback = onSell;
    this.onCloseCallback = onClose;
    this.buyScroll = 0;
    this.sellScroll = 0;
    this.buildBuyRows();
    this.buildSellRows();
    this.switchTab("buy");
    this.goldText.setText(`Gold: ${playerGold}g`);
    this.isOpen = true;
    this.container.setVisible(true);
    this.centerPanel();
  }
  close() {
    if (!this.isOpen)
      return;
    this.isOpen = false;
    this.container.setVisible(false);
    const cb = this.onCloseCallback;
    this.onBuyCallback = null;
    this.onSellCallback = null;
    this.onCloseCallback = null;
    if (cb)
      cb();
  }
  switchTab(tab) {
    this.activeTab = tab;
    const buyActive = tab === "buy";
    this.buyContent.setVisible(buyActive);
    this.sellContent.setVisible(!buyActive);
    this.tabBuyText.setColor(buyActive ? "#ffffff" : "#888888");
    this.tabSellText.setColor(buyActive ? "#888888" : "#ffffff");
    this.tabBuyText.setScale(buyActive ? 1.05 : 1);
    this.tabSellText.setScale(buyActive ? 1 : 1.05);
    this.applyScroll();
  }
  buildBuyRows() {
    this.buyContent.removeAll(true);
    let y = this.rowHeight / 2;
    for (const item of this.buyItems) {
      const price = this.getBuyPrice(item.sellPrice);
      const row = this.createRowBase(y);
      const icon = this.scene.add.sprite(-this.viewportWidth / 2 + 22, y, "items", item.spriteIndex).setScale(2);
      const name = this.scene.add.text(-this.viewportWidth / 2 + 46, y - 10, item.name, {
        fontSize: "14px",
        color: "#ffffff"
      });
      const priceText = this.scene.add.text(this.viewportWidth / 2 - 140, y - 10, `${price}g`, {
        fontSize: "14px",
        color: "#ffdd44"
      });
      const canAfford = this.playerGold >= price;
      const buyBtn = this.scene.add.text(this.viewportWidth / 2 - 42, y, "Buy", {
        fontSize: "13px",
        color: canAfford ? "#88ccff" : "#666666",
        backgroundColor: canAfford ? "#224455" : "#222222",
        padding: { left: 8, right: 8, top: 3, bottom: 3 }
      }).setOrigin(0.5);
      if (canAfford) {
        buyBtn.setInteractive({ useHandCursor: true });
        buyBtn.on("pointerover", () => buyBtn.setColor("#ffffff"));
        buyBtn.on("pointerout", () => buyBtn.setColor("#88ccff"));
        buyBtn.on("pointerdown", () => this.onBuyCallback?.(item.id, 1));
      }
      this.buyContent.add([row, icon, name, priceText, buyBtn]);
      y += this.rowHeight;
    }
    this.buyContentHeight = Math.max(this.viewportHeight, this.buyItems.length * this.rowHeight);
  }
  buildSellRows() {
    this.sellContent.removeAll(true);
    const sellRows = [];
    for (let i = 0; i < this.inventory.length; i++) {
      const slot = this.inventory[i];
      if (!slot || slot.qty <= 0)
        continue;
      const item = ITEMS.find((entry) => entry.id === slot.itemId);
      if (!item || item.sellPrice <= 0)
        continue;
      sellRows.push({ slotIndex: i, slot });
    }
    if (sellRows.length === 0) {
      const empty = this.scene.add.text(0, this.rowHeight, "No sellable items in inventory.", {
        fontSize: "14px",
        color: "#aaaaaa"
      }).setOrigin(0.5, 0);
      this.sellContent.add(empty);
      this.sellContentHeight = this.viewportHeight;
      return;
    }
    let y = this.rowHeight / 2;
    for (const rowData of sellRows) {
      const item = ITEMS.find((entry) => entry.id === rowData.slot.itemId);
      if (!item)
        continue;
      const sellPrice = this.getSellPrice(rowData.slot, item.sellPrice);
      const row = this.createRowBase(y);
      const icon = this.scene.add.sprite(-this.viewportWidth / 2 + 22, y, "items", item.spriteIndex).setScale(2);
      const name = this.scene.add.text(-this.viewportWidth / 2 + 46, y - 10, `${item.name} x${rowData.slot.qty}`, {
        fontSize: "14px",
        color: "#ffffff"
      });
      const priceText = this.scene.add.text(this.viewportWidth / 2 - 140, y - 10, `${sellPrice}g`, {
        fontSize: "14px",
        color: "#ffdd44"
      });
      const sellBtn = this.scene.add.text(this.viewportWidth / 2 - 42, y, "Sell", {
        fontSize: "13px",
        color: "#ffcc88",
        backgroundColor: "#553b22",
        padding: { left: 8, right: 8, top: 3, bottom: 3 }
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      sellBtn.on("pointerover", () => sellBtn.setColor("#ffffff"));
      sellBtn.on("pointerout", () => sellBtn.setColor("#ffcc88"));
      sellBtn.on("pointerdown", () => this.onSellCallback?.(rowData.slotIndex, 1));
      this.sellContent.add([row, icon, name, priceText, sellBtn]);
      y += this.rowHeight;
    }
    this.sellContentHeight = Math.max(this.viewportHeight, sellRows.length * this.rowHeight);
  }
  createRowBase(y) {
    const row = this.scene.add.rectangle(0, y, this.viewportWidth - 8, this.rowHeight - 4, 1120295, 0.9);
    row.setStrokeStyle(1, 3096134, 1);
    return row;
  }
  getBuyPrice(baseSellPrice) {
    return Math.max(25, baseSellPrice * 2);
  }
  getSellPrice(slot, baseSellPrice) {
    const qualityMultiplier = Number(slot.quality) || Number(1 /* NORMAL */);
    return Math.floor(baseSellPrice * qualityMultiplier);
  }
  onMouseWheel(pointer, _currentlyOver, _deltaX, deltaY) {
    if (!this.isOpen)
      return;
    if (!this.pointerInsideViewport(pointer))
      return;
    const step = deltaY > 0 ? -24 : 24;
    if (this.activeTab === "buy") {
      this.buyScroll += step;
    } else {
      this.sellScroll += step;
    }
    this.applyScroll();
  }
  pointerInsideViewport(pointer) {
    const localX = pointer.worldX - this.container.x;
    const localY = pointer.worldY - this.container.y;
    const left = -this.viewportWidth / 2;
    const right = this.viewportWidth / 2;
    const top = this.viewportTopY;
    const bottom = this.viewportTopY + this.viewportHeight;
    return localX >= left && localX <= right && localY >= top && localY <= bottom;
  }
  applyScroll() {
    const buyMin = Math.min(0, this.viewportHeight - this.buyContentHeight);
    const sellMin = Math.min(0, this.viewportHeight - this.sellContentHeight);
    this.buyScroll = phaser_shim_default.Math.Clamp(this.buyScroll, buyMin, 0);
    this.sellScroll = phaser_shim_default.Math.Clamp(this.sellScroll, sellMin, 0);
    this.buyContent.setY(this.viewportTopY + this.buyScroll);
    this.sellContent.setY(this.viewportTopY + this.sellScroll);
  }
  centerPanel() {
    this.container.setPosition(this.scene.scale.width / 2, this.scene.scale.height / 2);
  }
  destroy() {
    this.scene.scale.off("resize", this.centerPanel, this);
    this.scene.input.off("wheel", this.onMouseWheel, this);
    this.container.destroy(true);
  }
};

// src/systems/dialogueBox.ts
var DialogueBox = class {
  constructor(scene) {
    this.isVisible = false;
    this.fullText = "";
    this.charIndex = 0;
    this.handlePointerAdvance = () => {
      this.handleAdvanceInput();
    };
    this.handleSpaceAdvance = () => {
      this.handleAdvanceInput();
    };
    this.handleEAdvance = () => {
      this.handleAdvanceInput();
    };
    this.scene = scene;
    const sceneWidth = this.scene.scale.width;
    const sceneHeight = this.scene.scale.height;
    const boxWidth = 700;
    const boxHeight = 120;
    this.container = this.scene.add.container(sceneWidth / 2, sceneHeight - 100).setDepth(300).setScrollFactor(0).setVisible(false);
    const background = this.scene.add.rectangle(0, 0, boxWidth, boxHeight, 986895, 0.92);
    background.setStrokeStyle(3, 4868682, 1);
    this.portrait = this.scene.add.sprite(-boxWidth / 2 + 62, 0, "portraits", 0).setDisplaySize(48, 48);
    this.nameText = this.scene.add.text(-boxWidth / 2 + 100, -34, "", {
      fontSize: "16px",
      color: "#88cc44",
      fontStyle: "bold"
    });
    this.dialogueText = this.scene.add.text(-boxWidth / 2 + 100, -10, "", {
      fontSize: "14px",
      color: "#ffffff",
      wordWrap: { width: 550 },
      lineSpacing: 2
    });
    this.container.add([background, this.portrait, this.nameText, this.dialogueText]);
    this.scene.input.on("pointerdown", this.handlePointerAdvance);
    const keyboard = this.scene.input.keyboard;
    if (keyboard) {
      keyboard.on("keydown-SPACE", this.handleSpaceAdvance);
      keyboard.on("keydown-E", this.handleEAdvance);
    }
    this.scene.events.once(phaser_shim_default.Scenes.Events.SHUTDOWN, () => {
      this.destroy();
    });
  }
  show(npcName, portraitIndex, text, onAdvance) {
    this.stopTypewriter();
    this.isVisible = true;
    this.onAdvance = onAdvance;
    this.fullText = text;
    this.charIndex = 0;
    this.portrait.setFrame(portraitIndex);
    this.nameText.setText(npcName);
    this.dialogueText.setText("");
    this.container.setVisible(true);
    if (text.length === 0) {
      return;
    }
    this.typewriterEvent = this.scene.time.addEvent({
      delay: 30,
      repeat: text.length - 1,
      callback: () => {
        this.charIndex += 1;
        this.dialogueText.setText(this.fullText.slice(0, this.charIndex));
        if (this.charIndex >= this.fullText.length) {
          this.stopTypewriter();
        }
      }
    });
  }
  hide() {
    this.stopTypewriter();
    this.isVisible = false;
    this.onAdvance = void 0;
    this.container.setVisible(false);
  }
  // Compatibility wrappers for current call sites.
  open(args) {
    this.show(args.npcId, args.portraitIndex, args.text, args.onAdvance);
  }
  close(_triggerCallback = false) {
    this.hide();
  }
  handleAdvanceInput() {
    if (!this.isVisible)
      return;
    if (this.typewriterEvent) {
      this.stopTypewriter();
      this.charIndex = this.fullText.length;
      this.dialogueText.setText(this.fullText);
      return;
    }
    this.onAdvance?.();
  }
  stopTypewriter() {
    if (this.typewriterEvent) {
      this.typewriterEvent.remove(false);
      this.typewriterEvent = void 0;
    }
  }
  destroy() {
    this.stopTypewriter();
    this.scene.input.off("pointerdown", this.handlePointerAdvance);
    const keyboard = this.scene.input.keyboard;
    if (keyboard) {
      keyboard.off("keydown-SPACE", this.handleSpaceAdvance);
      keyboard.off("keydown-E", this.handleEAdvance);
    }
    this.container.destroy(true);
  }
};

// src/scenes/UIScene.ts
var UIScene = class extends phaser_shim_default.Scene {
  constructor() {
    super(Scenes.UI);
    this.hotbarSlots = [];
    this.hotbarIcons = [];
    this.hotbarQtys = [];
    this.toastTimer = 0;
    this.tutorialVisible = false;
    this.craftingRows = [];
    this.craftingCookingMode = false;
    this.isCraftingOpen = false;
    this.isInventoryOpen = false;
    this.isShopOpen = false;
    this.isDialogueOpen = false;
    this.pauseToggled = false;
  }
  init(data) {
    this.playScene = data.playScene;
  }
  create() {
    this.inventoryPanel = new InventoryPanel(this);
    this.shopPanel = new ShopPanel(this);
    this.dialogueBox = new DialogueBox(this);
    this.createHotbar();
    this.createHud();
    this.createToast();
    this.createTutorialOverlay();
    this.createCraftingPanel();
    this.touchControls = new TouchControls(this);
    this.setupInput();
    this.wirePlayEvents();
    this.refreshHotbar();
    this.refreshGold();
    this.refreshDay();
    this.refreshTime();
    this.events.once(phaser_shim_default.Scenes.Events.SHUTDOWN, () => {
      this.inventoryPanel.close();
      this.shopPanel.close();
      this.dialogueBox.close(false);
    });
  }
  update(_time, delta) {
    this.touchControls.pollGamepad();
    const ts = this.touchControls.state;
    if (ts.inventoryJust)
      this.openInventory();
    if (ts.pauseJust)
      this.togglePause();
    const slotSize = 40;
    const gap = 4;
    const totalW = HOTBAR_SIZE * (slotSize + gap) - gap;
    const startX = -totalW / 2;
    const selected = phaser_shim_default.Math.Clamp(this.playScene.player.selectedSlot, 0, HOTBAR_SIZE - 1);
    this.selectorRect.setPosition(startX + selected * (slotSize + gap) + slotSize / 2, 0);
    const ratio = phaser_shim_default.Math.Clamp(this.playScene.player.stamina / this.playScene.player.maxStamina, 0, 1);
    this.staminaBar.width = 120 * ratio;
    if (ratio > 0.5)
      this.staminaBar.setFillStyle(4508740);
    else if (ratio > 0.25)
      this.staminaBar.setFillStyle(13421636);
    else
      this.staminaBar.setFillStyle(13386820);
    if (this.toastText.visible) {
      this.toastTimer -= delta;
      if (this.toastTimer <= 0) {
        this.toastText.setVisible(false);
      } else if (this.toastTimer < 350) {
        this.toastText.setAlpha(this.toastTimer / 350);
      }
    }
    if (this.tutorialVisible && this.tutorialTargetTile) {
      const world = gridToWorld(this.tutorialTargetTile.x, this.tutorialTargetTile.y);
      const cam = this.playScene.cameras.main;
      const x = world.x - cam.worldView.x;
      const y = world.y - cam.worldView.y - 40;
      this.tutorialArrow.setPosition(x, y + Math.sin(this.time.now * 8e-3) * 4);
      this.tutorialArrow.setVisible(x >= -30 && x <= this.cameras.main.width + 30 && y >= -50 && y <= this.cameras.main.height + 30);
    }
  }
  createHotbar() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    this.hotbarContainer = this.add.container(w / 2, h - 30).setDepth(120);
    const slotSize = 40;
    const gap = 4;
    const totalW = HOTBAR_SIZE * (slotSize + gap) - gap;
    const startX = -totalW / 2;
    for (let i = 0; i < HOTBAR_SIZE; i += 1) {
      const x = startX + i * (slotSize + gap) + slotSize / 2;
      const bg = this.add.rectangle(x, 0, slotSize, slotSize, 2236962, 0.85);
      bg.setStrokeStyle(1, 6710886, 1);
      bg.setInteractive({ useHandCursor: true });
      bg.on("pointerdown", () => this.selectHotbarSlot(i));
      this.hotbarSlots.push(bg);
      this.hotbarContainer.add(bg);
      const icon = this.add.sprite(x, 0, "items", 0).setScale(2).setVisible(false);
      this.hotbarIcons.push(icon);
      this.hotbarContainer.add(icon);
      const qty = this.add.text(x + 12, 10, "", { fontSize: "10px", color: "#ffffff" }).setOrigin(1, 1);
      this.hotbarQtys.push(qty);
      this.hotbarContainer.add(qty);
    }
    this.selectorRect = this.add.rectangle(startX + slotSize / 2, 0, slotSize + 4, slotSize + 4);
    this.selectorRect.setStrokeStyle(2, 16768324, 1);
    this.selectorRect.setFillStyle(16768324, 0.08);
    this.hotbarContainer.add(this.selectorRect);
  }
  createHud() {
    const w = this.cameras.main.width;
    this.add.rectangle(w / 2, 18, w, 36, 0, 0.5).setDepth(110);
    this.goldText = this.add.text(10, 6, "500g", { fontSize: "16px", color: "#ffdd44" }).setDepth(111);
    this.dayText = this.add.text(w / 2, 6, "Spring Day 1 Year 1", { fontSize: "16px", color: "#88cc44" }).setOrigin(0.5, 0).setDepth(111);
    this.timeText = this.add.text(w - 10, 6, "6:00 AM", { fontSize: "16px", color: "#aaccff" }).setOrigin(1, 0).setDepth(111);
    this.staminaBarBg = this.add.rectangle(10, 32, 120, 8, 3355443).setOrigin(0, 0.5).setDepth(111);
    this.staminaBar = this.add.rectangle(10, 32, 120, 8, 4508740).setOrigin(0, 0.5).setDepth(112);
  }
  createToast() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    this.toastText = this.add.text(w / 2, h / 2, "", {
      fontSize: "16px",
      color: "#ffffff",
      backgroundColor: "#000000aa",
      padding: { left: 10, right: 10, top: 6, bottom: 6 }
    }).setOrigin(0.5).setVisible(false).setDepth(1e3);
  }
  createTutorialOverlay() {
    const w = this.cameras.main.width;
    this.tutorialBox = this.add.rectangle(w / 2, 60, 760, 52, 0, 0.7).setDepth(980).setVisible(false);
    this.tutorialBox.setStrokeStyle(2, 16777215, 0.18);
    this.tutorialText = this.add.text(w / 2, 60, "", {
      fontSize: "14px",
      fontFamily: "monospace",
      color: "#ffffff",
      align: "center",
      wordWrap: { width: 730 }
    }).setOrigin(0.5).setDepth(981).setVisible(false);
    this.tutorialArrow = this.add.text(0, 0, "\u25BC", {
      fontSize: "22px",
      color: "#fff3a5",
      fontFamily: "monospace"
    }).setOrigin(0.5).setDepth(981).setVisible(false);
  }
  createCraftingPanel() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    this.craftingPanel = this.add.container(w / 2, h / 2).setVisible(false).setDepth(910);
    const bg = this.add.rectangle(0, 0, 440, 320, 1710638, 0.95);
    bg.setStrokeStyle(2, 8965188, 1);
    this.craftingTitle = this.add.text(0, -138, "Crafting", { fontSize: "20px", color: "#88cc44" }).setOrigin(0.5);
    const closeBtn = this.add.text(202, -138, "X", { fontSize: "20px", color: "#ff6666" }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on("pointerdown", () => this.closeCrafting());
    this.craftingPanel.add([bg, this.craftingTitle, closeBtn]);
  }
  setupInput() {
    const keyboard = this.input.keyboard;
    if (keyboard) {
      const keyCodes = [
        phaser_shim_default.Input.Keyboard.KeyCodes.ONE,
        phaser_shim_default.Input.Keyboard.KeyCodes.TWO,
        phaser_shim_default.Input.Keyboard.KeyCodes.THREE,
        phaser_shim_default.Input.Keyboard.KeyCodes.FOUR,
        phaser_shim_default.Input.Keyboard.KeyCodes.FIVE,
        phaser_shim_default.Input.Keyboard.KeyCodes.SIX,
        phaser_shim_default.Input.Keyboard.KeyCodes.SEVEN,
        phaser_shim_default.Input.Keyboard.KeyCodes.EIGHT,
        phaser_shim_default.Input.Keyboard.KeyCodes.NINE,
        phaser_shim_default.Input.Keyboard.KeyCodes.ZERO
      ];
      keyCodes.forEach((code, index) => {
        const key = keyboard.addKey(code);
        key.on("down", () => this.selectHotbarSlot(index));
      });
    }
    this.input.on("wheel", (_pointer, _objects, _dx, dy) => {
      if (dy === 0)
        return;
      const delta = dy > 0 ? 1 : -1;
      const current = this.playScene.player.selectedSlot;
      const next = (current + delta + HOTBAR_SIZE) % HOTBAR_SIZE;
      this.selectHotbarSlot(next);
    });
  }
  wirePlayEvents() {
    const ps = this.playScene;
    ps.events.on(Events.INVENTORY_CHANGE, () => {
      this.refreshHotbar();
      if (this.isCraftingOpen)
        this.populateCraftingRows();
    });
    ps.events.on(Events.GOLD_CHANGE, () => this.refreshGold());
    ps.events.on(Events.TIME_TICK, () => this.refreshTime());
    ps.events.on(Events.DAY_START, () => this.refreshDay());
    ps.events.on(Events.TOAST, (data) => {
      this.showToast(data.message, data.duration ?? 2e3, data.color ?? "#ffffff");
    });
    ps.events.on(Events.OPEN_CRAFTING, (data) => this.openCrafting(data.cooking));
    ps.events.on(Events.CLOSE_CRAFTING, () => this.closeCrafting());
    ps.events.on(Events.OPEN_PAUSE, () => this.togglePause());
    ps.events.on(Events.OPEN_INVENTORY, () => this.openInventory());
    ps.events.on(Events.DIALOGUE_START, (data) => this.showDialogue(data));
    ps.events.on(Events.INTERACT, (data) => {
      if (data.kind === "shop" /* SHOP */) {
        this.openShop();
      }
    });
    ps.events.on(Events.ACHIEVEMENT, (data) => {
      const label = data.name || data.achievementId;
      this.showToast(`Achievement Unlocked: ${label}`, 2200, "#ffdd55");
    });
    ps.events.on("TUTORIAL_ADVANCE", (data) => {
      this.tutorialVisible = data.active;
      this.tutorialTargetTile = data.targetTile;
      this.tutorialBox.setVisible(data.active);
      this.tutorialText.setVisible(data.active);
      this.tutorialArrow.setVisible(data.active && Boolean(data.targetTile));
      this.tutorialText.setText(data.text ?? "");
    });
  }
  selectHotbarSlot(slotIndex) {
    this.playScene.player.selectedSlot = phaser_shim_default.Math.Clamp(slotIndex, 0, HOTBAR_SIZE - 1);
    this.playScene.events.emit(Events.INVENTORY_CHANGE, { inventory: this.playScene.player.inventory });
  }
  refreshHotbar() {
    for (let i = 0; i < HOTBAR_SIZE; i += 1) {
      const slot = this.playScene.player.inventory[i];
      if (slot && slot.qty > 0) {
        const itemDef = ITEMS.find((item) => item.id === slot.itemId);
        if (!itemDef) {
          this.hotbarIcons[i].setVisible(false);
          this.hotbarQtys[i].setText("");
          this.hotbarSlots[i].setStrokeStyle(1, 6710886, 1);
          continue;
        }
        this.hotbarIcons[i].setTexture("items", itemDef.spriteIndex).setVisible(true);
        this.hotbarQtys[i].setText(slot.qty > 1 ? `${slot.qty}` : "");
        if (slot.quality === 3 /* GOLD */)
          this.hotbarSlots[i].setStrokeStyle(1, 16766720, 1);
        else if (slot.quality === 2 /* SILVER */)
          this.hotbarSlots[i].setStrokeStyle(1, 12632256, 1);
        else
          this.hotbarSlots[i].setStrokeStyle(1, 6710886, 1);
      } else {
        this.hotbarIcons[i].setVisible(false);
        this.hotbarQtys[i].setText("");
        this.hotbarSlots[i].setStrokeStyle(1, 6710886, 1);
      }
    }
  }
  refreshGold() {
    this.goldText.setText(`${this.playScene.player.gold}g`);
  }
  refreshDay() {
    const seasonNames = {
      ["spring" /* SPRING */]: "Spring",
      ["summer" /* SUMMER */]: "Summer",
      ["fall" /* FALL */]: "Fall",
      ["winter" /* WINTER */]: "Winter"
    };
    const c = this.playScene.calendar;
    this.dayText.setText(`${seasonNames[c.season]} Day ${c.day} Year ${c.year}`);
  }
  refreshTime() {
    const t = this.playScene.calendar.timeOfDay;
    const totalMinutes = Math.floor(t * 20 * 60);
    const absoluteHour = 6 + Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;
    const normalizedHour = absoluteHour % 24;
    const isPm = normalizedHour >= 12;
    const hour12 = normalizedHour === 0 ? 12 : normalizedHour > 12 ? normalizedHour - 12 : normalizedHour;
    const ampm = isPm ? "PM" : "AM";
    this.timeText.setText(`${hour12}:${minute.toString().padStart(2, "0")} ${ampm}`);
  }
  showToast(message, duration, color = "#ffffff") {
    this.toastText.setText(message);
    this.toastText.setColor(color);
    this.toastText.setVisible(true);
    this.toastText.setAlpha(1);
    this.toastTimer = duration;
  }
  openInventory() {
    if (this.isInventoryOpen) {
      this.closeInventory();
      return;
    }
    this.isInventoryOpen = true;
    this.applyPauseState();
    this.inventoryPanel.open(
      this.playScene.player.inventory,
      () => this.closeInventory(),
      (fromIndex, toIndex) => {
        const inv = this.playScene.player.inventory;
        const temp = inv[fromIndex];
        inv[fromIndex] = inv[toIndex];
        inv[toIndex] = temp;
        this.playScene.events.emit(Events.INVENTORY_CHANGE, { inventory: inv });
      }
    );
  }
  closeInventory() {
    if (!this.isInventoryOpen)
      return;
    this.isInventoryOpen = false;
    this.inventoryPanel.close();
    this.applyPauseState();
  }
  openCrafting(cooking) {
    this.isCraftingOpen = true;
    this.craftingCookingMode = cooking;
    this.craftingPanel.setVisible(true);
    this.applyPauseState();
    this.craftingTitle.setText(cooking ? "Cooking" : "Crafting");
    this.populateCraftingRows();
  }
  populateCraftingRows() {
    this.craftingRows.forEach((obj) => obj.destroy());
    this.craftingRows = [];
    const recipes = RECIPES.filter((recipe) => {
      if (recipe.isCooking !== this.craftingCookingMode)
        return false;
      return this.playScene.unlockedRecipes.includes(recipe.id);
    });
    let y = -98;
    for (const recipe of recipes.slice(0, 7)) {
      const canCraft = recipe.ingredients.every((ing) => this.playScene.countItem(ing.itemId) >= ing.qty);
      const ingredientsLabel = recipe.ingredients.map((ing) => {
        const def = ITEMS.find((item) => item.id === ing.itemId);
        return `${def?.name ?? ing.itemId}x${ing.qty}`;
      }).join(", ");
      const color = canCraft ? "#ffffff" : "#666666";
      const btn = this.add.text(-200, y, `${recipe.name} (${ingredientsLabel})`, {
        fontSize: "13px",
        color,
        wordWrap: { width: 392 }
      }).setInteractive({ useHandCursor: canCraft });
      if (canCraft) {
        btn.on("pointerover", () => btn.setColor("#ffdd44"));
        btn.on("pointerout", () => btn.setColor("#ffffff"));
        btn.on("pointerdown", () => {
          this.playScene.events.emit(Events.CRAFT_ITEM, { recipeId: recipe.id });
        });
      }
      this.craftingPanel.add(btn);
      this.craftingRows.push(btn);
      y += 38;
    }
  }
  closeCrafting() {
    if (!this.isCraftingOpen)
      return;
    this.isCraftingOpen = false;
    this.craftingPanel.setVisible(false);
    this.craftingRows.forEach((obj) => obj.destroy());
    this.craftingRows = [];
    this.applyPauseState();
  }
  openShop() {
    if (this.isShopOpen)
      return;
    this.isShopOpen = true;
    this.applyPauseState();
    this.shopPanel.open(
      this.playScene.player.inventory,
      this.playScene.player.gold,
      (itemId, qty) => {
        const item = ITEMS.find((entry) => entry.id === itemId);
        if (!item)
          return;
        const cost = Math.max(25, item.sellPrice * 2) * qty;
        this.playScene.events.emit(Events.SHOP_BUY, { itemId, qty, cost });
      },
      (slotIndex, qty) => {
        const slot = this.playScene.player.inventory[slotIndex];
        if (!slot)
          return;
        const item = ITEMS.find((entry) => entry.id === slot.itemId);
        if (!item)
          return;
        const revenue = Math.floor(item.sellPrice * (Number(slot.quality) || 1)) * qty;
        this.playScene.events.emit(Events.SHOP_SELL, { itemId: slot.itemId, qty, revenue });
      },
      () => {
        this.isShopOpen = false;
        this.applyPauseState();
      }
    );
  }
  showDialogue(data) {
    const npc = NPCS.find((entry) => entry.id === data.npcId);
    const text = data.text ?? npc?.dialoguePool["0"]?.[0] ?? "...";
    const portraitIndex = data.portraitIndex ?? npc?.portraitIndex ?? 0;
    this.isDialogueOpen = true;
    this.applyPauseState();
    this.dialogueBox.open({
      npcId: data.npcId,
      text,
      portraitIndex,
      onAdvance: () => {
        this.isDialogueOpen = false;
        this.dialogueBox.close(false);
        this.playScene.events.emit(Events.DIALOGUE_END, { npcId: data.npcId });
        this.applyPauseState();
      }
    });
  }
  togglePause() {
    this.pauseToggled = !this.pauseToggled;
    this.applyPauseState();
    if (this.pauseToggled) {
      this.showToast("PAUSED", 1e3, "#ffdd55");
    }
  }
  applyPauseState() {
    const panelPaused = this.isInventoryOpen || this.isCraftingOpen || this.isShopOpen || this.isDialogueOpen;
    this.playScene.dayPaused = this.pauseToggled || panelPaused;
  }
};

// src/scenes/ShopScene.ts
var TOOL_ITEM_TO_TOOL = {
  tool_hoe: "hoe" /* HOE */,
  tool_watering_can: "watering_can" /* WATERING_CAN */
};
var ShopScene = class extends phaser_shim_default.Scene {
  constructor() {
    super("ShopScene");
    this.shopType = "general";
    this.listings = [];
    this.wasDayPaused = false;
  }
  init(data) {
    this.playScene = data.playScene;
    this.shopType = data.shopType;
  }
  create() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    this.wasDayPaused = this.playScene.dayPaused;
    this.playScene.dayPaused = true;
    const backdrop = this.add.rectangle(w / 2, h / 2, w, h, 0, 0.7).setInteractive({ useHandCursor: false });
    backdrop.on("pointerdown", () => this.closeShop());
    this.panel = this.add.rectangle(w / 2, h / 2, 620, 470, 1710638, 0.96);
    this.panel.setStrokeStyle(2, 8965188);
    const shopTitle = this.shopType.charAt(0).toUpperCase() + this.shopType.slice(1);
    this.add.text(w / 2, h / 2 - 210, `${shopTitle} Shop`, {
      fontSize: "24px",
      color: "#88cc44"
    }).setOrigin(0.5);
    this.goldText = this.add.text(w / 2 - 290, h / 2 - 210, `Gold: ${this.playScene.player.gold}g`, {
      fontSize: "16px",
      color: "#ffdd44"
    });
    const closeBtn = this.add.text(w / 2 + 290, h / 2 - 210, "X", {
      fontSize: "22px",
      color: "#ff6666"
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true });
    closeBtn.on("pointerover", () => closeBtn.setColor("#ffffff"));
    closeBtn.on("pointerout", () => closeBtn.setColor("#ff6666"));
    closeBtn.on("pointerdown", () => this.closeShop());
    this.listings = this.buildListings();
    let rowY = h / 2 - 165;
    for (const listing of this.listings) {
      this.createListingRow(w / 2, rowY, listing);
      rowY += 42;
    }
    if (this.listings.length === 0) {
      this.add.text(w / 2, h / 2, "Nothing to sell right now.", {
        fontSize: "16px",
        color: "#cccccc"
      }).setOrigin(0.5);
    }
    this.input.keyboard?.on("keydown-ESC", this.closeShop, this);
    this.events.once(phaser_shim_default.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.off("keydown-ESC", this.closeShop, this);
      this.playScene.dayPaused = this.wasDayPaused;
    });
  }
  buildListings() {
    if (this.shopType === "seeds") {
      return ITEMS.filter((item) => item.category === "seed" /* SEED */).map((item) => ({
        kind: "item",
        itemId: item.id,
        name: item.name,
        price: item.sellPrice * 2,
        spriteIndex: item.spriteIndex,
        qty: 1
      }));
    }
    if (this.shopType === "tools") {
      return ITEMS.filter((item) => item.category === "tool" /* TOOL */ && TOOL_ITEM_TO_TOOL[item.id]).flatMap((item) => {
        const tool = TOOL_ITEM_TO_TOOL[item.id];
        const nextLevel = (this.playScene.toolLevels[tool] ?? 0) + 1;
        if (nextLevel > 4)
          return [];
        return [{
          kind: "tool",
          tool,
          itemId: item.id,
          name: `${item.name} Upgrade Lv.${nextLevel}`,
          price: 2e3 * nextLevel,
          spriteIndex: item.spriteIndex,
          level: nextLevel
        }];
      });
    }
    const generalIds = ["wood", "stone", "fiber", "coal", "wild_berries", "mushroom"];
    return generalIds.map((id) => ITEMS.find((item) => item.id === id)).filter((item) => !!item).map((item) => ({
      kind: "item",
      itemId: item.id,
      name: item.name,
      price: item.sellPrice * 2,
      spriteIndex: item.spriteIndex,
      qty: 1
    }));
  }
  createListingRow(centerX, y, listing) {
    const rowBg = this.add.rectangle(centerX, y, 580, 34, 2236962, 0.85);
    rowBg.setStrokeStyle(1, 4473924);
    this.add.sprite(centerX - 265, y, "items", listing.spriteIndex).setScale(2);
    this.add.text(centerX - 240, y - 10, listing.name, {
      fontSize: "15px",
      color: "#ffffff"
    });
    this.add.text(centerX + 120, y - 10, `${listing.price}g`, {
      fontSize: "15px",
      color: "#ffdd44"
    });
    const buyButton = this.add.rectangle(centerX + 245, y, 70, 24, 4164677, 1).setStrokeStyle(1, 10413728).setInteractive({ useHandCursor: true });
    const buyLabel = this.add.text(centerX + 245, y, "Buy", {
      fontSize: "13px",
      color: "#ffffff"
    }).setOrigin(0.5);
    buyButton.on("pointerover", () => buyButton.setFillStyle(5285978));
    buyButton.on("pointerout", () => buyButton.setFillStyle(4164677));
    buyButton.on("pointerdown", () => this.buyListing(listing));
  }
  buyListing(listing) {
    if (this.playScene.player.gold < listing.price) {
      this.playScene.events.emit(Events.TOAST, {
        message: "Not enough gold!",
        color: "#ff4444"
      });
      return;
    }
    const added = this.playScene.addToInventory(listing.itemId, 1, 1 /* NORMAL */);
    if (!added)
      return;
    this.playScene.player.gold -= listing.price;
    if (listing.kind === "tool") {
      this.playScene.toolLevels[listing.tool] = listing.level;
      this.playScene.events.emit(Events.TOOL_UPGRADE, {
        tool: listing.tool,
        newLevel: listing.level
      });
    }
    this.playScene.events.emit(Events.GOLD_CHANGE, {
      amount: -listing.price,
      newTotal: this.playScene.player.gold
    });
    this.playScene.events.emit(Events.INVENTORY_CHANGE, {
      inventory: this.playScene.player.inventory
    });
    this.playScene.events.emit(Events.SHOP_BUY, {
      itemId: listing.itemId,
      qty: 1,
      cost: listing.price
    });
    this.playScene.events.emit(Events.TOAST, {
      message: `Bought ${listing.name}`,
      color: "#44ffaa"
    });
    this.goldText.setText(`Gold: ${this.playScene.player.gold}g`);
    if (this.shopType === "tools") {
      this.scene.restart({ playScene: this.playScene, shopType: this.shopType });
    }
  }
  closeShop() {
    this.playScene.dayPaused = this.wasDayPaused;
    this.scene.stop();
  }
};

// src/game.ts
var config = {
  type: phaser_shim_default.AUTO,
  width: 800,
  height: 600,
  pixelArt: true,
  roundPixels: true,
  backgroundColor: "#1a1a2e",
  input: {
    keyboard: true,
    gamepad: true,
    touch: true
  },
  scale: {
    mode: phaser_shim_default.Scale.FIT,
    autoCenter: phaser_shim_default.Scale.CENTER_BOTH
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  scene: [BootScene, MenuScene, IntroScene, PlayScene, UIScene, ShopScene]
};
new phaser_shim_default.Game(config);
//# sourceMappingURL=game.js.map
