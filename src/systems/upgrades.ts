/**
 * Upgrade System — tool upgrades (blacksmith), house upgrades (carpenter), buildings
 * NEW FILE — does not modify any existing files
 */
import Phaser from 'phaser';
import { Events, Tool, HouseState } from '../types';

export interface ToolLevel { tool: Tool; level: number; } // 0=base, 1=copper, 2=iron, 3=gold

export interface UpgradeState {
  tools: Record<string, number>;  // Tool -> level (0-3)
  pendingUpgrade?: { tool: string; readyDay: number; readySeason: string; readyYear: number };
  houseUpgradePending?: { readyDay: number; readySeason: string; readyYear: number };
}

interface ToolUpgradeDef {
  level: number;
  name: string;
  cost: number;
  materialId: string;
  materialQty: number;
  daysToComplete: number;
}

const TOOL_UPGRADES: ToolUpgradeDef[] = [
  { level: 1, name: 'Copper', cost: 2000, materialId: 'copper_bar', materialQty: 5, daysToComplete: 2 },
  { level: 2, name: 'Iron', cost: 5000, materialId: 'iron_bar', materialQty: 5, daysToComplete: 3 },
  { level: 3, name: 'Gold', cost: 10000, materialId: 'gold_bar', materialQty: 5, daysToComplete: 4 },
];

interface HouseUpgradeDef {
  tier: number;
  name: string;
  cost: number;
  materialId: string;
  materialQty: number;
  description: string;
  daysToComplete: number;
}

const HOUSE_UPGRADES: HouseUpgradeDef[] = [
  { tier: 1, name: 'Kitchen Upgrade', cost: 10000, materialId: 'wood', materialQty: 450, description: 'Adds a kitchen for cooking.', daysToComplete: 3 },
  { tier: 2, name: 'Second Floor', cost: 50000, materialId: 'wood', materialQty: 150, description: 'Adds a second floor with nursery.', daysToComplete: 5 },
  { tier: 3, name: 'Cellar', cost: 100000, materialId: 'stone', materialQty: 100, description: 'Adds a cellar for aging goods.', daysToComplete: 7 },
];

const BUILDING_DEFS = [
  { id: 'coop', name: 'Chicken Coop', cost: 4000, materialId: 'wood', materialQty: 300, description: 'Houses up to 4 chickens.' },
  { id: 'barn', name: 'Barn', cost: 6000, materialId: 'wood', materialQty: 350, description: 'Houses up to 4 cows.' },
  { id: 'silo', name: 'Silo', cost: 100, materialId: 'stone', materialQty: 100, description: 'Stores animal feed.' },
  { id: 'well', name: 'Well', cost: 1000, materialId: 'stone', materialQty: 75, description: 'Refill watering can anywhere on farm.' },
];

export class UpgradeSystem {
  private scene: Phaser.Scene;
  private state: UpgradeState;

  constructor(scene: Phaser.Scene, savedState?: UpgradeState) {
    this.scene = scene;
    this.state = savedState ?? { tools: {} };
  }

  getToolLevel(tool: Tool): number { return this.state.tools[tool] ?? 0; }

  /** Get efficiency multiplier for upgraded tools */
  getToolEfficiency(tool: Tool): number {
    const level = this.getToolLevel(tool);
    return 1 + level * 0.5; // 1x, 1.5x, 2x, 2.5x
  }

  /** Get stamina cost reduction for upgraded tools */
  getStaminaReduction(tool: Tool): number {
    const level = this.getToolLevel(tool);
    return Math.max(0.25, 1 - level * 0.25); // 1x, 0.75x, 0.5x, 0.25x
  }

  /** Start tool upgrade — returns cost, or null if not possible */
  startToolUpgrade(tool: Tool, gold: number, hasItem: (id: string, qty: number) => boolean):
    { cost: number; materialId: string; materialQty: number; daysToComplete: number } | null {
    if (this.state.pendingUpgrade) return null;
    const currentLevel = this.getToolLevel(tool);
    const upgrade = TOOL_UPGRADES.find(u => u.level === currentLevel + 1);
    if (!upgrade) return null;
    if (gold < upgrade.cost) return null;
    if (!hasItem(upgrade.materialId, upgrade.materialQty)) return null;

    this.state.pendingUpgrade = {
      tool,
      readyDay: 0, readySeason: '', readyYear: 0, // Set by caller based on calendar
    };

    this.scene.events.emit(Events.TOAST, {
      message: `${upgrade.name} ${tool} upgrade started! ${upgrade.daysToComplete} days.`,
      color: '#ffaa44',
    });

    return {
      cost: upgrade.cost,
      materialId: upgrade.materialId,
      materialQty: upgrade.materialQty,
      daysToComplete: upgrade.daysToComplete,
    };
  }

  /** Check if upgrade is ready and complete it */
  checkPendingUpgrade(day: number, season: string, year: number): boolean {
    const p = this.state.pendingUpgrade;
    if (!p) return false;
    if (year > p.readyYear || (year === p.readyYear && season > p.readySeason) ||
        (year === p.readyYear && season === p.readySeason && day >= p.readyDay)) {
      const tool = p.tool as Tool;
      this.state.tools[tool] = (this.state.tools[tool] ?? 0) + 1;
      this.state.pendingUpgrade = undefined;
      this.scene.events.emit(Events.TOOL_UPGRADE, { tool, newLevel: this.state.tools[tool] });
      this.scene.events.emit(Events.TOAST, {
        message: `Your ${tool} has been upgraded!`, color: '#ffdd44',
      });
      return true;
    }
    return false;
  }

  /** Get next house upgrade info */
  getNextHouseUpgrade(currentTier: number): HouseUpgradeDef | null {
    return HOUSE_UPGRADES.find(u => u.tier === currentTier + 1) ?? null;
  }

  /** Start house upgrade */
  startHouseUpgrade(currentTier: number, gold: number, hasItem: (id: string, qty: number) => boolean):
    { cost: number; materialId: string; materialQty: number } | null {
    if (this.state.houseUpgradePending) return null;
    const upgrade = HOUSE_UPGRADES.find(u => u.tier === currentTier + 1);
    if (!upgrade) return null;
    if (gold < upgrade.cost) return null;
    if (!hasItem(upgrade.materialId, upgrade.materialQty)) return null;

    this.state.houseUpgradePending = { readyDay: 0, readySeason: '', readyYear: 0 };
    this.scene.events.emit(Events.TOAST, {
      message: `House upgrade started! ${upgrade.daysToComplete} days.`, color: '#ffaa44',
    });
    return { cost: upgrade.cost, materialId: upgrade.materialId, materialQty: upgrade.materialQty };
  }

  /** Check pending house upgrade */
  checkHouseUpgrade(day: number, season: string, year: number): number | null {
    const p = this.state.houseUpgradePending;
    if (!p) return null;
    if (year > p.readyYear || (year === p.readyYear && season > p.readySeason) ||
        (year === p.readyYear && season === p.readySeason && day >= p.readyDay)) {
      this.state.houseUpgradePending = undefined;
      return 1; // signal to increment house tier
    }
    return null;
  }

  getToolUpgradeInfo(tool: Tool): ToolUpgradeDef | null {
    const currentLevel = this.getToolLevel(tool);
    return TOOL_UPGRADES.find(u => u.level === currentLevel + 1) ?? null;
  }

  getBuildingDefs() { return BUILDING_DEFS; }
  getState(): UpgradeState { return this.state; }
}
