/**
 * Machine System — sprinkler auto-watering, furnace smelting, bee house honey
 * NEW FILE — does not modify any existing files
 */
import Phaser from 'phaser';
import { Events, Quality } from '../types';

export interface PlacedMachine {
  id: string;
  type: 'sprinkler' | 'quality_sprinkler' | 'iridium_sprinkler' | 'furnace' | 'bee_house' | 'chest' | 'scarecrow';
  tileX: number;
  tileY: number;
  inputItemId?: string;
  inputQty?: number;
  processingDaysLeft?: number;
  outputItemId?: string;
  outputQty?: number;
}

export interface MachineState {
  placed: PlacedMachine[];
}

interface MachineRecipe {
  inputId: string;
  inputQty: number;
  outputId: string;
  outputQty: number;
  processingDays: number;
}

const FURNACE_RECIPES: MachineRecipe[] = [
  { inputId: 'copper_ore', inputQty: 5, outputId: 'copper_bar', outputQty: 1, processingDays: 1 },
  { inputId: 'iron_ore', inputQty: 5, outputId: 'iron_bar', outputQty: 1, processingDays: 1 },
  { inputId: 'gold_ore', inputQty: 5, outputId: 'gold_bar', outputQty: 1, processingDays: 1 },
];

export class MachineSystem {
  private scene: Phaser.Scene;
  private state: MachineState;

  constructor(scene: Phaser.Scene, savedState?: MachineState) {
    this.scene = scene;
    this.state = savedState ?? { placed: [] };
  }

  /** Place a machine on the farm */
  placeMachine(type: PlacedMachine['type'], tileX: number, tileY: number): PlacedMachine | null {
    // Check not already occupied
    if (this.state.placed.some(m => m.tileX === tileX && m.tileY === tileY)) return null;

    const machine: PlacedMachine = {
      id: `${type}_${Date.now()}`,
      type, tileX, tileY,
    };
    this.state.placed.push(machine);
    return machine;
  }

  /** Remove a machine */
  removeMachine(tileX: number, tileY: number): PlacedMachine | null {
    const idx = this.state.placed.findIndex(m => m.tileX === tileX && m.tileY === tileY);
    if (idx === -1) return null;
    return this.state.placed.splice(idx, 1)[0];
  }

  /** Load furnace with input */
  loadFurnace(machineId: string, itemId: string, qty: number): boolean {
    const machine = this.state.placed.find(m => m.id === machineId && m.type === 'furnace');
    if (!machine || machine.processingDaysLeft) return false;

    const recipe = FURNACE_RECIPES.find(r => r.inputId === itemId);
    if (!recipe || qty < recipe.inputQty) return false;

    machine.inputItemId = recipe.inputId;
    machine.inputQty = recipe.inputQty;
    machine.outputItemId = recipe.outputId;
    machine.outputQty = recipe.outputQty;
    machine.processingDaysLeft = recipe.processingDays;
    return true;
  }

  /** Collect output from a machine */
  collectOutput(machineId: string): { itemId: string; qty: number } | null {
    const machine = this.state.placed.find(m => m.id === machineId);
    if (!machine || !machine.outputItemId || (machine.processingDaysLeft ?? 0) > 0) return null;

    const result = { itemId: machine.outputItemId, qty: machine.outputQty ?? 1 };
    machine.inputItemId = undefined;
    machine.inputQty = undefined;
    machine.outputItemId = undefined;
    machine.outputQty = undefined;
    machine.processingDaysLeft = undefined;
    return result;
  }

  /** Get tiles auto-watered by sprinklers */
  getSprinklerTiles(): Array<{ x: number; y: number }> {
    const tiles: Array<{ x: number; y: number }> = [];
    for (const m of this.state.placed) {
      if (m.type === 'sprinkler') {
        // Basic: 4 adjacent tiles
        tiles.push({ x: m.tileX - 1, y: m.tileY }, { x: m.tileX + 1, y: m.tileY },
                    { x: m.tileX, y: m.tileY - 1 }, { x: m.tileX, y: m.tileY + 1 });
      } else if (m.type === 'quality_sprinkler') {
        // 3x3 around
        for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
          if (dx === 0 && dy === 0) continue;
          tiles.push({ x: m.tileX + dx, y: m.tileY + dy });
        }
      } else if (m.type === 'iridium_sprinkler') {
        // 5x5 around
        for (let dx = -2; dx <= 2; dx++) for (let dy = -2; dy <= 2; dy++) {
          if (dx === 0 && dy === 0) continue;
          tiles.push({ x: m.tileX + dx, y: m.tileY + dy });
        }
      }
    }
    return tiles;
  }

  /** Get scarecrow protection tiles */
  getScarecrowTiles(): Array<{ x: number; y: number }> {
    const tiles: Array<{ x: number; y: number }> = [];
    for (const m of this.state.placed) {
      if (m.type === 'scarecrow') {
        // 8-tile radius
        for (let dx = -8; dx <= 8; dx++) for (let dy = -8; dy <= 8; dy++) {
          if (Math.sqrt(dx * dx + dy * dy) <= 8) {
            tiles.push({ x: m.tileX + dx, y: m.tileY + dy });
          }
        }
      }
    }
    return tiles;
  }

  /** Daily processing tick */
  onDayStart() {
    for (const m of this.state.placed) {
      // Furnace processing
      if (m.type === 'furnace' && m.processingDaysLeft && m.processingDaysLeft > 0) {
        m.processingDaysLeft--;
        if (m.processingDaysLeft === 0) {
          this.scene.events.emit(Events.TOAST, { message: 'Furnace finished smelting!', color: '#ff8844' });
        }
      }

      // Bee house produces honey
      if (m.type === 'bee_house') {
        m.outputItemId = 'honey';
        m.outputQty = 1;
        m.processingDaysLeft = 0;
      }
    }
  }

  getMachineAt(tileX: number, tileY: number): PlacedMachine | undefined {
    return this.state.placed.find(m => m.tileX === tileX && m.tileY === tileY);
  }

  getState(): MachineState { return this.state; }
}
