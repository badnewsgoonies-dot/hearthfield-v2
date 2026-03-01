/**
 * Foraging System — spawns seasonal forageables on the map
 * NEW FILE — does not modify any existing files
 */
import { Season } from '../types';
import { FORAGE_SPAWNS, ForageSpawnDef } from '../data/forageData';

export interface ForageItem {
  id: string;
  itemId: string;
  tileX: number;
  tileY: number;
}

export interface ForagingState {
  items: ForageItem[];
}

export class ForagingSystem {
  private state: ForagingState;

  constructor(savedState?: ForagingState) {
    this.state = savedState ?? { items: [] };
  }

  /** Spawn new forageables for the day */
  onDayStart(season: Season, farmWidth: number, farmHeight: number, isOccupied: (x: number, y: number) => boolean) {
    // Remove collected items (already removed when picked up)
    // Add 1-3 new forageables per day
    const count = Math.floor(Math.random() * 3) + 1;
    const available = FORAGE_SPAWNS.filter(f => f.seasons.includes(season));

    for (let i = 0; i < count; i++) {
      if (this.state.items.length >= 10) break; // max 10 on map
      if (available.length === 0) break;

      // Pick random spawn
      const def = available[Math.floor(Math.random() * available.length)];
      if (Math.random() > def.rarity) continue;

      // Find random empty tile (try 20 times)
      for (let attempt = 0; attempt < 20; attempt++) {
        const x = Math.floor(Math.random() * farmWidth);
        const y = Math.floor(Math.random() * farmHeight);
        if (isOccupied(x, y)) continue;
        if (this.state.items.some(f => f.tileX === x && f.tileY === y)) continue;

        this.state.items.push({
          id: `forage_${Date.now()}_${i}`,
          itemId: def.itemId,
          tileX: x, tileY: y,
        });
        break;
      }
    }
  }

  /** Remove on season change */
  onSeasonChange() {
    this.state.items = [];
  }

  /** Collect forageable at position */
  collect(tileX: number, tileY: number): string | null {
    const idx = this.state.items.findIndex(f => f.tileX === tileX && f.tileY === tileY);
    if (idx === -1) return null;
    const item = this.state.items.splice(idx, 1)[0];
    return item.itemId;
  }

  /** Get forageable at position */
  getAt(tileX: number, tileY: number): ForageItem | undefined {
    return this.state.items.find(f => f.tileX === tileX && f.tileY === tileY);
  }

  getItems(): ForageItem[] { return this.state.items; }
  getState(): ForagingState { return this.state; }
}
