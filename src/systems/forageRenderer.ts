/**
 * Forage Renderer — draws forage items on the overworld map
 * NEW FILE — does not modify any existing files
 */
import Phaser from 'phaser';
import { Season, SCALED_TILE } from '../types';
import { ForageItem } from './foraging';

interface RenderedForage {
  container: Phaser.GameObjects.Container;
  item: ForageItem;
  tween: Phaser.Tweens.Tween;
}

// Color + shape mapping per item prefix/category
function getForageVisual(itemId: string): { colors: number[]; shape: 'flower' | 'berry' | 'root' | 'mushroom' | 'crystal' } {
  if (['daffodil', 'dandelion'].includes(itemId)) return { colors: [0xffdd44, 0x44aa44], shape: 'flower' };
  if (['sweet_pea'].includes(itemId)) return { colors: [0xff88cc, 0x44aa44], shape: 'flower' };
  if (['crocus'].includes(itemId)) return { colors: [0xcc88ff, 0x44aa44], shape: 'flower' };
  if (['grape', 'blackberry', 'spice_berry'].includes(itemId)) return { colors: [0x8844aa, 0x44aa44], shape: 'berry' };
  if (['wild_plum'].includes(itemId)) return { colors: [0xaa4466, 0x44aa44], shape: 'berry' };
  if (['common_mushroom'].includes(itemId)) return { colors: [0xbb8855, 0xeeddcc], shape: 'mushroom' };
  if (['crystal_fruit'].includes(itemId)) return { colors: [0x88ccff, 0xeeffff], shape: 'crystal' };
  if (['snow_yam', 'winter_root'].includes(itemId)) return { colors: [0xddccbb, 0x886644], shape: 'root' };
  if (['hazelnut'].includes(itemId)) return { colors: [0x996633, 0x664422], shape: 'berry' };
  // Default: root vegetables (horseradish, leek, etc.)
  return { colors: [0x88aa44, 0x665533], shape: 'root' };
}

export class ForageRenderer {
  private scene: Phaser.Scene;
  private rendered: Map<string, RenderedForage> = new Map();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  renderItems(items: ForageItem[], _season: Season): void {
    this.clear();
    const sz = SCALED_TILE * 0.6;
    for (const item of items) {
      const px = item.tileX * SCALED_TILE + SCALED_TILE / 2;
      const py = item.tileY * SCALED_TILE + SCALED_TILE / 2;
      const vis = getForageVisual(item.itemId);
      const g = this.scene.add.graphics();

      const half = sz / 2;
      switch (vis.shape) {
        case 'flower': {
          // Stem
          g.lineStyle(2, vis.colors[1], 1);
          g.lineBetween(0, half * 0.3, 0, half);
          // Petals (5 circles around center)
          const petalR = half * 0.3;
          for (let i = 0; i < 5; i++) {
            const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
            g.fillStyle(vis.colors[0], 1);
            g.fillCircle(Math.cos(a) * petalR, Math.sin(a) * petalR - half * 0.2, petalR * 0.6);
          }
          // Center
          g.fillStyle(0xffee88, 1);
          g.fillCircle(0, -half * 0.2, petalR * 0.35);
          break;
        }
        case 'berry': {
          // Stem
          g.lineStyle(2, vis.colors[1], 1);
          g.lineBetween(0, -half * 0.5, 0, half * 0.2);
          // Berry cluster
          const br = half * 0.25;
          g.fillStyle(vis.colors[0], 1);
          g.fillCircle(-br, 0, br);
          g.fillCircle(br, 0, br);
          g.fillCircle(0, -br * 0.8, br);
          g.fillCircle(0, br * 0.5, br * 0.8);
          // Highlight
          g.fillStyle(0xffffff, 0.2);
          g.fillCircle(-br * 0.3, -br * 0.3, br * 0.3);
          break;
        }
        case 'mushroom': {
          // Stem
          g.fillStyle(vis.colors[1], 1);
          g.fillRect(-half * 0.15, 0, half * 0.3, half * 0.5);
          // Cap
          g.fillStyle(vis.colors[0], 1);
          g.fillEllipse(0, -half * 0.05, half * 0.8, half * 0.45);
          // Spots
          g.fillStyle(0xffffff, 0.4);
          g.fillCircle(-half * 0.15, -half * 0.1, half * 0.08);
          g.fillCircle(half * 0.1, -half * 0.15, half * 0.06);
          break;
        }
        case 'crystal': {
          // Diamond shape
          g.fillStyle(vis.colors[0], 0.8);
          g.fillTriangle(0, -half * 0.6, -half * 0.35, 0, half * 0.35, 0);
          g.fillTriangle(0, half * 0.4, -half * 0.35, 0, half * 0.35, 0);
          // Sparkle
          g.fillStyle(vis.colors[1], 0.6);
          g.fillCircle(half * 0.1, -half * 0.2, half * 0.08);
          g.lineStyle(1, 0xffffff, 0.5);
          g.lineBetween(-half * 0.15, -half * 0.3, half * 0.05, -half * 0.1);
          break;
        }
        case 'root':
        default: {
          // Root body
          g.fillStyle(vis.colors[0], 1);
          g.fillEllipse(0, 0, half * 0.5, half * 0.7);
          // Leaf on top
          g.fillStyle(0x44aa44, 1);
          g.fillTriangle(0, -half * 0.7, -half * 0.2, -half * 0.3, half * 0.2, -half * 0.3);
          // Root lines
          g.lineStyle(1, vis.colors[1], 0.5);
          g.lineBetween(0, half * 0.3, -half * 0.15, half * 0.6);
          g.lineBetween(0, half * 0.3, half * 0.1, half * 0.55);
          break;
        }
      }

      const container = this.scene.add.container(px, py, [g]);
      container.setDepth(4);
      container.setSize(sz, sz);

      const tween = this.scene.tweens.add({
        targets: container,
        y: py - 2,
        duration: 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      this.rendered.set(item.id, { container, item, tween });
    }
  }

  removeItem(itemId: string): { x: number; y: number } | null {
    const entry = this.rendered.get(itemId);
    if (!entry) return null;
    const pos = { x: entry.container.x, y: entry.container.y };
    entry.tween.stop();
    entry.container.destroy();
    this.rendered.delete(itemId);
    return pos;
  }

  clear(): void {
    for (const entry of this.rendered.values()) {
      entry.tween.stop();
      entry.container.destroy();
    }
    this.rendered.clear();
  }

  getItemAtTile(tileX: number, tileY: number): ForageItem | null {
    for (const entry of this.rendered.values()) {
      if (entry.item.tileX === tileX && entry.item.tileY === tileY) return entry.item;
    }
    return null;
  }
}
