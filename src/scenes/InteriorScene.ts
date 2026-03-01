/**
 * InteriorScene — renders building interiors (house, coop, barn)
 * Launched from PlayScene when player enters a building door.
 * Uses same movement system (WASD), smaller grid, own interactables.
 */
import Phaser from 'phaser';
import { Events, InteractionKind, Quality, Season, Tool } from '../types';
import { PlayScene } from './PlayScene';
import { ITEMS } from '../data/registry';
import { ANIMAL_DEFS } from '../data/animalData';

const T = 48; // tile size matches overworld

export type BuildingType = 'house' | 'coop' | 'barn';

interface InteriorInitData {
  playScene: PlayScene;
  building: BuildingType;
}

// Tile types for interior rendering
const enum ITile {
  FLOOR = 0,
  WALL = 1,
  DOOR_EXIT = 2,
  FURNITURE = 3,
  FLOOR_RUG = 4,
  FLOOR_HAY = 5,
  FLOOR_WOOD = 6,
}

interface BuildingLayout {
  width: number;
  height: number;
  grid: ITile[][];
  objects: Array<{ x: number; y: number; label: string; kind: InteractionKind; frame?: number; data?: any }>;
  animalBuilding?: 'coop' | 'barn';
  floorTint: number;
  wallTint: number;
  name: string;
}

const HOUSE_LAYOUT: BuildingLayout = {
  width: 12, height: 10, name: 'Home',
  floorTint: 0xc4956a, wallTint: 0x8b6914,
  grid: [
    [1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,3,0,0,4,4,4,4,0,0,3,1],
    [1,0,0,0,4,4,4,4,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,3,0,0,0,0,0,0,0,0,3,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,2,2,1,1,1,1,1],
  ],
  objects: [
    { x: 1, y: 2, label: 'Bed', kind: InteractionKind.BED },
    { x: 10, y: 2, label: 'Kitchen', kind: InteractionKind.KITCHEN },
    { x: 1, y: 5, label: 'Bookshelf', kind: InteractionKind.CHEST, data: { msg: 'Your grandfather\'s old journals...' } },
    { x: 10, y: 5, label: 'Fireplace', kind: InteractionKind.CHEST, data: { msg: 'The fire crackles warmly.' } },
  ],
};

const COOP_LAYOUT: BuildingLayout = {
  width: 8, height: 8, name: 'Chicken Coop',
  floorTint: 0xc4a84a, wallTint: 0x8b4513,
  animalBuilding: 'coop',
  grid: [
    [1,1,1,1,1,1,1,1],
    [1,5,5,5,5,5,5,1],
    [1,5,5,5,5,5,5,1],
    [1,5,5,5,5,5,5,1],
    [1,5,5,5,5,5,5,1],
    [1,5,5,5,5,5,5,1],
    [1,5,5,5,5,5,5,1],
    [1,1,1,2,2,1,1,1],
  ],
  objects: [
    { x: 1, y: 1, label: 'Nesting Box', kind: InteractionKind.CHEST, data: { msg: 'Collect eggs here when chickens are happy.' } },
    { x: 6, y: 1, label: 'Feed Trough', kind: InteractionKind.CHEST, data: { msg: 'Chickens eat fiber. Keep them fed daily!' } },
    { x: 6, y: 5, label: 'Buy Chicken (800g)', kind: InteractionKind.CHEST, data: { buyAnimal: 'chicken' } },
  ],
};

const BARN_LAYOUT: BuildingLayout = {
  width: 10, height: 10, name: 'Barn',
  floorTint: 0x9e8b6e, wallTint: 0x6b3a2a,
  animalBuilding: 'barn',
  grid: [
    [1,1,1,1,1,1,1,1,1,1],
    [1,6,6,6,6,6,6,6,6,1],
    [1,6,6,6,6,6,6,6,6,1],
    [1,6,6,6,6,6,6,6,6,1],
    [1,6,6,6,6,6,6,6,6,1],
    [1,6,6,6,6,6,6,6,6,1],
    [1,6,6,6,6,6,6,6,6,1],
    [1,6,6,6,6,6,6,6,6,1],
    [1,6,6,6,6,6,6,6,6,1],
    [1,1,1,1,2,2,1,1,1,1],
  ],
  objects: [
    { x: 1, y: 1, label: 'Hay Bale', kind: InteractionKind.CHEST, data: { msg: 'Fresh hay for the animals.' } },
    { x: 8, y: 1, label: 'Feed Trough', kind: InteractionKind.CHEST, data: { msg: 'Cows eat fiber. Keep them fed daily!' } },
    { x: 1, y: 5, label: 'Milking Station', kind: InteractionKind.CHEST, data: { msg: 'Milk cows here when they\'re happy.' } },
    { x: 8, y: 5, label: 'Buy Cow (1500g)', kind: InteractionKind.CHEST, data: { buyAnimal: 'cow' } },
  ],
};

const LAYOUTS: Record<BuildingType, BuildingLayout> = {
  house: HOUSE_LAYOUT,
  coop: COOP_LAYOUT,
  barn: BARN_LAYOUT,
};

export class InteriorScene extends Phaser.Scene {
  private playScene!: PlayScene;
  private building!: BuildingType;
  private layout!: BuildingLayout;
  private player!: Phaser.GameObjects.Sprite;
  private solidTiles = new Set<string>();
  private exitTiles = new Set<string>();
  private interactables: Array<{ x: number; y: number; label: string; kind: InteractionKind; sprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.Rectangle; data?: any }> = [];
  private animalSprites: Phaser.GameObjects.Sprite[] = [];
  private keys!: { up: Phaser.Input.Keyboard.Key; down: Phaser.Input.Keyboard.Key; left: Phaser.Input.Keyboard.Key; right: Phaser.Input.Keyboard.Key; interact: Phaser.Input.Keyboard.Key; esc: Phaser.Input.Keyboard.Key };
  private direction: 'up' | 'down' | 'left' | 'right' = 'down';
  private promptText!: Phaser.GameObjects.Text;
  private nameText!: Phaser.GameObjects.Text;
  private canExit = false;

  constructor() {
    super('InteriorScene');
  }

  init(data: InteriorInitData) {
    this.playScene = data.playScene;
    this.building = data.building;
    this.layout = LAYOUTS[data.building];
    this.interactables = [];
    this.animalSprites = [];
    this.canExit = false;
  }

  create() {
    const { width: gw, height: gh, grid, floorTint, wallTint, name } = this.layout;
    
    // Center the interior in the camera
    const camW = this.cameras.main.width;
    const camH = this.cameras.main.height;
    const offsetX = Math.floor((camW - gw * T) / 2);
    const offsetY = Math.floor((camH - gh * T) / 2);
    
    // Black background
    this.cameras.main.setBackgroundColor('#0a0a1a');
    
    this.solidTiles.clear();
    this.exitTiles.clear();
    
    // Render tiles
    for (let y = 0; y < gh; y++) {
      for (let x = 0; x < gw; x++) {
        const tile = grid[y][x];
        const px = offsetX + x * T;
        const py = offsetY + y * T;
        
        let color = 0x0a0a1a;
        switch (tile) {
          case ITile.FLOOR:
            color = floorTint;
            break;
          case ITile.WALL:
            color = wallTint;
            this.solidTiles.add(`${x},${y}`);
            break;
          case ITile.DOOR_EXIT:
            color = 0x443322;
            this.exitTiles.add(`${x},${y}`);
            break;
          case ITile.FURNITURE:
            color = Phaser.Display.Color.IntegerToColor(floorTint).brighten(10).color;
            break;
          case ITile.FLOOR_RUG:
            color = 0x884433;
            break;
          case ITile.FLOOR_HAY:
            color = 0xc4a84a;
            break;
          case ITile.FLOOR_WOOD:
            color = 0x9e7b5e;
            break;
        }
        
        const rect = this.add.rectangle(px + T/2, py + T/2, T - 1, T - 1, color).setDepth(0);
        
        // Add wall detail (darker border)
        if (tile === ITile.WALL) {
          this.add.rectangle(px + T/2, py + T/2, T - 1, T - 1)
            .setStrokeStyle(1, 0x000000, 0.3).setDepth(1);
        }
        // Add rug pattern
        if (tile === ITile.FLOOR_RUG) {
          this.add.rectangle(px + T/2, py + T/2, T - 4, T - 4)
            .setStrokeStyle(1, 0xaa6644, 0.5).setDepth(1);
        }
        // Door marker
        if (tile === ITile.DOOR_EXIT) {
          this.add.text(px + T/2, py + T/2, '▼', {
            fontSize: '16px', color: '#ffdd88',
          }).setOrigin(0.5).setDepth(2);
        }
      }
    }
    
    // Place interactable objects
    for (const obj of this.layout.objects) {
      const px = offsetX + obj.x * T + T/2;
      const py = offsetY + obj.y * T + T/2;
      
      // Furniture sprite (colored rectangle with icon)
      let color = 0x665544;
      let icon = '📦';
      if (obj.kind === InteractionKind.BED) { color = 0x4455aa; icon = '🛏'; }
      else if (obj.kind === InteractionKind.KITCHEN) { color = 0x886644; icon = '🍳'; }
      else if (obj.label === 'Bookshelf') { color = 0x554433; icon = '📚'; }
      else if (obj.label === 'Fireplace') { color = 0x883322; icon = '🔥'; }
      else if (obj.label.includes('Feed')) { color = 0x887744; icon = '🌾'; }
      else if (obj.label.includes('Nesting')) { color = 0x998866; icon = '🥚'; }
      else if (obj.label.includes('Hay')) { color = 0xaa9944; icon = '🌿'; }
      else if (obj.label.includes('Milking')) { color = 0x667788; icon = '🥛'; }
      else if (obj.label.includes('Buy')) { color = 0x448844; icon = '💰'; }
      
      const furnitureRect = this.add.rectangle(px, py, T - 4, T - 4, color).setDepth(3);
      this.add.rectangle(px, py, T - 4, T - 4).setStrokeStyle(1, 0x000000, 0.4).setDepth(3);
      this.add.text(px, py, icon, { fontSize: '20px' }).setOrigin(0.5).setDepth(4);
      this.add.text(px, py - T/2 + 4, obj.label, {
        fontSize: '8px', color: '#ccccaa', fontFamily: 'monospace',
      }).setOrigin(0.5, 0).setDepth(5);
      
      this.solidTiles.add(`${obj.x},${obj.y}`);
      this.interactables.push({ x: obj.x, y: obj.y, label: obj.label, kind: obj.kind, sprite: furnitureRect, data: obj.data });
    }
    
    // Place animals if this is coop/barn
    if (this.layout.animalBuilding) {
      this.placeAnimals(offsetX, offsetY);
    }
    
    // Player — spawn at door (first exit tile, one row up)
    const firstExit = [...this.exitTiles][0];
    const [doorX, doorY] = firstExit.split(',').map(Number);
    const playerStartX = offsetX + doorX * T + T/2;
    const playerStartY = offsetY + (doorY - 1) * T + T/2;
    
    this.player = this.add.sprite(playerStartX, playerStartY, 'player', 0).setDepth(10);
    
    // Building name label
    this.nameText = this.add.text(camW / 2, offsetY - 10, `🏠 ${name}`, {
      fontSize: '16px', color: '#ffdd88', fontFamily: 'monospace',
    }).setOrigin(0.5, 1).setDepth(20);
    
    // Interaction prompt
    this.promptText = this.add.text(camW / 2, camH - 30, '', {
      fontSize: '12px', color: '#ffdd88', fontFamily: 'monospace',
      backgroundColor: '#00000088', padding: { x: 6, y: 3 },
    }).setOrigin(0.5).setDepth(20).setVisible(false);
    
    // Exit hint
    this.add.text(offsetX + doorX * T + T, offsetY + gh * T - 6, 'Exit ▼', {
      fontSize: '10px', color: '#aaaaaa', fontFamily: 'monospace',
    }).setOrigin(0.5, 1).setDepth(5);
    
    // Keys
    this.keys = {
      up: this.input.keyboard!.addKey('W'),
      down: this.input.keyboard!.addKey('S'),
      left: this.input.keyboard!.addKey('A'),
      right: this.input.keyboard!.addKey('D'),
      interact: this.input.keyboard!.addKey('E'),
      esc: this.input.keyboard!.addKey('ESC'),
    };
    
    // Fade in
    this.cameras.main.fadeIn(300, 0, 0, 0);
    
    // Delay exit to prevent instant re-exit
    this.time.delayedCall(500, () => { this.canExit = true; });
  }
  
  private placeAnimals(offsetX: number, offsetY: number) {
    if (!this.playScene.animalSystem) return;
    const animalState = this.playScene.animalSystem.getState();
    const buildingType = this.layout.animalBuilding!;
    const animals = animalState.animals.filter(a => {
      const def = ANIMAL_DEFS.find(d => d.id === a.type);
      return def?.building === buildingType;
    });
    
    // Place animals in grid positions (avoid walls and objects)
    const slots = this.getAnimalSlots();
    for (let i = 0; i < Math.min(animals.length, slots.length); i++) {
      const animal = animals[i];
      const slot = slots[i];
      const px = offsetX + slot.x * T + T/2;
      const py = offsetY + slot.y * T + T/2;
      
      const def = ANIMAL_DEFS.find(d => d.id === animal.type);
      const isChicken = def?.type === 'chicken';
      
      // Draw animal as colored sprite
      const color = isChicken ? 0xffffff : 0xccaa88;
      const animalRect = this.add.rectangle(px, py, T * 0.6, T * 0.6, color).setDepth(8);
      this.add.rectangle(px, py, T * 0.6, T * 0.6).setStrokeStyle(1, 0x000000, 0.3).setDepth(8);
      
      // Animal icon
      const icon = isChicken ? '🐔' : '🐄';
      this.add.text(px, py, icon, { fontSize: '20px' }).setOrigin(0.5).setDepth(9);
      
      // Name
      this.add.text(px, py - T * 0.4, animal.name, {
        fontSize: '7px', color: '#ffeecc', fontFamily: 'monospace',
      }).setOrigin(0.5).setDepth(9);
      
      // Happiness indicator
      const hearts = animal.happiness > 200 ? '❤️' : animal.happiness > 100 ? '💛' : '🖤';
      this.add.text(px + T * 0.3, py - T * 0.3, hearts, { fontSize: '8px' }).setOrigin(0.5).setDepth(9);
      
      // Product indicator
      if (animal.productReady) {
        this.add.text(px, py + T * 0.35, '✨', { fontSize: '10px' }).setOrigin(0.5).setDepth(9);
      }
      
      // Make animal interactable
      this.interactables.push({
        x: slot.x, y: slot.y, label: animal.name,
        kind: InteractionKind.ANIMAL,
        sprite: animalRect,
        data: { animalId: animal.id },
      });
    }
    
    // Show capacity
    const capacity = buildingType === 'coop' ? 
      Math.max(4, (animalState.coopLevel + 1) * 4) :
      Math.max(4, (animalState.barnLevel + 1) * 4);
    this.add.text(
      this.cameras.main.width / 2, this.cameras.main.height - 8,
      `${animals.length}/${capacity} ${buildingType === 'coop' ? 'chickens' : 'cows'}`,
      { fontSize: '10px', color: '#aaaaaa', fontFamily: 'monospace' }
    ).setOrigin(0.5, 1).setDepth(20);
  }
  
  private getAnimalSlots(): Array<{ x: number; y: number }> {
    const slots: Array<{ x: number; y: number }> = [];
    const { width, height, grid } = this.layout;
    // Walk interior tiles, skip walls/doors/objects
    const objectPositions = new Set(this.layout.objects.map(o => `${o.x},${o.y}`));
    for (let y = 2; y < height - 2; y++) {
      for (let x = 2; x < width - 2; x++) {
        if (grid[y][x] !== ITile.WALL && grid[y][x] !== ITile.DOOR_EXIT && !objectPositions.has(`${x},${y}`)) {
          slots.push({ x, y });
        }
      }
    }
    return slots;
  }
  
  update() {
    const speed = 120;
    const dt = this.game.loop.delta / 1000;
    
    let vx = 0, vy = 0;
    if (this.keys.left.isDown) { vx = -speed; this.direction = 'left'; }
    else if (this.keys.right.isDown) { vx = speed; this.direction = 'right'; }
    if (this.keys.up.isDown) { vy = -speed; this.direction = 'up'; }
    else if (this.keys.down.isDown) { vy = speed; this.direction = 'down'; }
    
    if (vx !== 0 || vy !== 0) {
      // Collision check
      const camW = this.cameras.main.width;
      const camH = this.cameras.main.height;
      const { width: gw, height: gh } = this.layout;
      const offX = Math.floor((camW - gw * T) / 2);
      const offY = Math.floor((camH - gh * T) / 2);
      
      const halfBody = T * 0.3;
      const newX = this.player.x + vx * dt;
      const newY = this.player.y + vy * dt;
      
      // Test X
      const testXCorners = [
        this.toGrid(newX - halfBody, this.player.y - halfBody, offX, offY),
        this.toGrid(newX + halfBody, this.player.y - halfBody, offX, offY),
        this.toGrid(newX - halfBody, this.player.y + halfBody, offX, offY),
        this.toGrid(newX + halfBody, this.player.y + halfBody, offX, offY),
      ];
      const xBlocked = testXCorners.some(([gx, gy]) => this.solidTiles.has(`${gx},${gy}`));
      if (!xBlocked) this.player.x = newX;
      
      // Test Y
      const finalX = this.player.x;
      const testYCorners = [
        this.toGrid(finalX - halfBody, newY - halfBody, offX, offY),
        this.toGrid(finalX + halfBody, newY - halfBody, offX, offY),
        this.toGrid(finalX - halfBody, newY + halfBody, offX, offY),
        this.toGrid(finalX + halfBody, newY + halfBody, offX, offY),
      ];
      const yBlocked = testYCorners.some(([gx, gy]) => this.solidTiles.has(`${gx},${gy}`));
      if (!yBlocked) this.player.y = newY;
    }
    
    // Check if on exit tile
    const camW = this.cameras.main.width;
    const camH = this.cameras.main.height;
    const { width: gw, height: gh } = this.layout;
    const offX = Math.floor((camW - gw * T) / 2);
    const offY = Math.floor((camH - gh * T) / 2);
    const [pgx, pgy] = this.toGrid(this.player.x, this.player.y, offX, offY);
    
    if (this.canExit && this.exitTiles.has(`${pgx},${pgy}`)) {
      this.exitBuilding();
      return;
    }
    
    // ESC to exit
    if (this.canExit && Phaser.Input.Keyboard.JustDown(this.keys.esc)) {
      this.exitBuilding();
      return;
    }
    
    // Check nearby interactable
    this.promptText.setVisible(false);
    let nearestInteractable: typeof this.interactables[0] | null = null;
    let nearestDist = Infinity;
    
    for (const obj of this.interactables) {
      const objPx = offX + obj.x * T + T/2;
      const objPy = offY + obj.y * T + T/2;
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, objPx, objPy);
      if (dist < T * 1.5 && dist < nearestDist) {
        nearestDist = dist;
        nearestInteractable = obj;
      }
    }
    
    if (nearestInteractable) {
      let prompt = `Press E — ${nearestInteractable.label}`;
      if (nearestInteractable.kind === InteractionKind.ANIMAL) {
        prompt = `Press E — Pet/Feed ${nearestInteractable.label}`;
      }
      this.promptText.setText(prompt).setVisible(true);
      
      if (Phaser.Input.Keyboard.JustDown(this.keys.interact)) {
        this.handleInteraction(nearestInteractable);
      }
    }
  }
  
  private handleInteraction(obj: typeof this.interactables[0]) {
    switch (obj.kind) {
      case InteractionKind.BED: {
        // Sleep — same as PlayScene bed
        this.cameras.main.fadeOut(600, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.playScene.endDay();
          this.playScene.player.stamina = 100;
          const c = this.playScene.calendar;
          this.playScene.events.emit(Events.TOAST, {
            message: `☀️ Day ${c.day}, ${c.season} — Year ${c.year}`,
            color: '#ffdd44', duration: 3000,
          });
          // Return to overworld after sleep
          this.scene.resume('PlayScene');
          this.scene.stop();
        });
        break;
      }
      
      case InteractionKind.KITCHEN: {
        if (this.playScene.house.tier >= 1) {
          this.playScene.events.emit(Events.OPEN_CRAFTING, { cooking: true });
        } else {
          this.playScene.events.emit(Events.TOAST, { message: 'Upgrade your house first!', color: '#ff4444' });
        }
        break;
      }
      
      case InteractionKind.ANIMAL: {
        const animalId = obj.data?.animalId;
        if (!animalId) break;
        
        const animals = this.playScene.animalSystem.getState().animals;
        const animal = animals.find(a => a.id === animalId);
        if (!animal) break;
        
        // Feed + pet
        this.playScene.animalSystem.feedAnimal(animalId);
        this.playScene.animalSystem.petAnimal(animalId);
        
        // Collect product
        const product = this.playScene.animalSystem.collectProduct(animalId);
        if (product) {
          this.playScene.addToInventory(product.itemId, 1);
          this.playScene.events.emit(Events.TOAST, {
            message: `Collected ${product.itemId} from ${animal.name}! ❤️`,
            color: '#ffaacc',
          });
        } else {
          const happiness = animal.happiness > 200 ? 'very happy' : animal.happiness > 100 ? 'content' : 'needs attention';
          this.playScene.events.emit(Events.TOAST, {
            message: `${animal.name} is ${happiness}. ` + (animal.fed ? 'Already fed.' : 'Needs food!'),
            color: '#aaddff',
          });
        }
        break;
      }
      
      case InteractionKind.CHEST: {
        // Buy animal?
        if (obj.data?.buyAnimal) {
          const defId = obj.data.buyAnimal;
          const def = ANIMAL_DEFS.find(d => d.id === defId);
          if (!def) break;
          
          const names = defId === 'chicken' 
            ? ['Clucky', 'Peep', 'Nugget', 'Sunny', 'Daisy', 'Pepper', 'Coco', 'Maple']
            : ['Bessie', 'Daisy', 'Buttercup', 'Clover', 'Mocha', 'Patches', 'Belle', 'Rosie'];
          const existing = this.playScene.animalSystem.getState().animals;
          const usedNames = new Set(existing.map(a => a.name));
          const name = names.find(n => !usedNames.has(n)) || `${def.name} ${existing.length + 1}`;
          
          const result = this.playScene.animalSystem.purchaseAnimal(defId, name, this.playScene.player.gold);
          if (result) {
            this.playScene.player.gold -= result.cost;
            this.playScene.events.emit(Events.TOAST, {
              message: `Bought ${name} the ${def.name}! 🎉 (-${result.cost}g)`,
              color: '#ffaacc',
            });
            // Refresh scene to show new animal
            this.time.delayedCall(1000, () => {
              this.scene.restart({ playScene: this.playScene, building: this.building });
            });
          } else {
            if (this.playScene.player.gold < def.purchasePrice) {
              this.playScene.events.emit(Events.TOAST, {
                message: `Not enough gold! Need ${def.purchasePrice}g.`,
                color: '#ff4444',
              });
            } else {
              this.playScene.events.emit(Events.TOAST, {
                message: `${this.layout.name} is full!`,
                color: '#ff4444',
              });
            }
          }
          break;
        }
        // Generic info message
        const msg = obj.data?.msg || 'Nothing interesting here.';
        this.playScene.events.emit(Events.TOAST, { message: msg, color: '#ccccaa' });
        break;
      }
    }
  }
  
  private exitBuilding() {
    this.canExit = false;
    this.cameras.main.fadeOut(200, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.resume('PlayScene');
      this.scene.stop();
    });
  }
  
  private toGrid(px: number, py: number, offX: number, offY: number): [number, number] {
    return [Math.floor((px - offX) / T), Math.floor((py - offY) / T)];
  }
}
