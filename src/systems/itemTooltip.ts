import Phaser from 'phaser';
import { ItemDef, ItemCategory, Quality } from '../types';

const TOOLTIP_WIDTH = 180;
const PADDING = 10;
const LINE_GAP = 4;
const BG_COLOR = 0x1a1a2e;
const BORDER_COLOR = 0x4a4a6a;

function qualityColor(quality: number): number {
  if (quality >= Quality.GOLD) return 0xffdd44;
  if (quality >= Quality.SILVER) return 0xaaaaff;
  return 0xffffff;
}

function categoryLabel(category: ItemCategory): string {
  const map: Partial<Record<ItemCategory, string>> = {
    [ItemCategory.SEED]: 'Seed',
    [ItemCategory.CROP]: 'Crop',
    [ItemCategory.FISH]: 'Fish',
    [ItemCategory.ORE]: 'Ore',
    [ItemCategory.GEM]: 'Gem',
    [ItemCategory.BAR]: 'Bar',
    [ItemCategory.FORAGE]: 'Forage',
    [ItemCategory.ARTISAN]: 'Artisan',
    [ItemCategory.ANIMAL_PRODUCT]: 'Animal Product',
    [ItemCategory.FOOD]: 'Food',
    [ItemCategory.TOOL]: 'Tool',
    [ItemCategory.CRAFTABLE]: 'Craftable',
    [ItemCategory.MACHINE]: 'Machine',
    [ItemCategory.GIFT]: 'Gift',
    [ItemCategory.RESOURCE]: 'Resource',
    [ItemCategory.SPECIAL]: 'Special',
  };
  return map[category] ?? category;
}

export class ItemTooltip {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.container = scene.add.container(0, 0);
    this.container.setDepth(9999);
    this.container.setVisible(false);
    this.container.setAlpha(0);
  }

  show(item: ItemDef, quantity: number, quality: number, screenX: number, screenY: number): void {
    // Clear previous contents
    this.container.removeAll(true);

    const texts: Phaser.GameObjects.Text[] = [];

    // Name
    const nameText = this.scene.add.text(PADDING, PADDING, item.name, {
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#' + qualityColor(quality).toString(16).padStart(6, '0'),
      wordWrap: { width: TOOLTIP_WIDTH - PADDING * 2 },
    });
    texts.push(nameText);

    let curY = PADDING + nameText.height + LINE_GAP;

    // Category tag
    const catText = this.scene.add.text(PADDING, curY, categoryLabel(item.category), {
      fontSize: '10px',
      color: '#888888',
    });
    texts.push(catText);
    curY += catText.height + LINE_GAP;

    // Divider
    const divider = this.scene.add.graphics();
    divider.lineStyle(1, BORDER_COLOR, 1);
    divider.beginPath();
    divider.moveTo(PADDING, curY);
    divider.lineTo(TOOLTIP_WIDTH - PADDING, curY);
    divider.strokePath();
    curY += 6;

    // Description
    const descText = this.scene.add.text(PADDING, curY, item.description, {
      fontSize: '11px',
      color: '#cccccc',
      wordWrap: { width: 160 },
    });
    texts.push(descText);
    curY += descText.height + LINE_GAP;

    // Sell price
    const sellText = this.scene.add.text(PADDING, curY, `Sells: ${item.sellPrice}g`, {
      fontSize: '11px',
      color: '#ffdd44',
    });
    texts.push(sellText);
    curY += sellText.height + LINE_GAP;

    // Edible
    if (item.edible && item.staminaRestore !== undefined) {
      const staminaText = this.scene.add.text(PADDING, curY, `Restores ${item.staminaRestore} stamina`, {
        fontSize: '11px',
        color: '#44ff44',
      });
      texts.push(staminaText);
      curY += staminaText.height + LINE_GAP;
    }

    // Buff
    if (item.buff && item.buffDuration !== undefined) {
      const buffText = this.scene.add.text(PADDING, curY, `Buff: ${item.buff} (${item.buffDuration}s)`, {
        fontSize: '11px',
        color: '#44aaff',
      });
      texts.push(buffText);
      curY += buffText.height + LINE_GAP;
    }

    // Quantity
    const qtyText = this.scene.add.text(PADDING, curY, `x${quantity}`, {
      fontSize: '11px',
      color: '#aaaaaa',
    });
    texts.push(qtyText);
    curY += qtyText.height + PADDING;

    const tooltipHeight = curY;

    // Background
    const bg = this.scene.add.graphics();
    bg.fillStyle(BG_COLOR, 1);
    bg.lineStyle(1, BORDER_COLOR, 1);
    bg.fillRoundedRect(0, 0, TOOLTIP_WIDTH, tooltipHeight, 4);
    bg.strokeRoundedRect(0, 0, TOOLTIP_WIDTH, tooltipHeight, 4);

    this.container.add(bg);
    this.container.add(divider);
    for (const t of texts) {
      this.container.add(t);
    }

    // Position: above cursor, clamped to screen
    const { width: camW, height: camH } = this.scene.scale;
    const margin = 8;
    let tx = screenX - TOOLTIP_WIDTH / 2;
    let ty = screenY - tooltipHeight - margin;

    tx = Phaser.Math.Clamp(tx, margin, camW - TOOLTIP_WIDTH - margin);
    ty = Phaser.Math.Clamp(ty, margin, camH - tooltipHeight - margin);

    this.container.setPosition(tx, ty);
    this.container.setVisible(true);

    // Fade in
    this.scene.tweens.add({
      targets: this.container,
      alpha: 1,
      duration: 100,
      ease: 'Linear',
    });
  }

  hide(): void {
    this.scene.tweens.killTweensOf(this.container);
    this.container.setAlpha(0);
    this.container.setVisible(false);
  }

  destroy(): void {
    this.scene.tweens.killTweensOf(this.container);
    this.container.destroy();
  }
}
