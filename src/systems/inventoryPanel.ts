import Phaser from 'phaser';
import { InventorySlot, Quality, INVENTORY_SIZE } from '../types';
import { ITEMS } from '../data/registry';

type SlotView = {
  bg: Phaser.GameObjects.Rectangle;
  icon: Phaser.GameObjects.Sprite;
  qty: Phaser.GameObjects.Text;
};

export class InventoryPanel {
  public isOpen = false;

  private readonly scene: Phaser.Scene;
  private readonly container: Phaser.GameObjects.Container;
  private readonly slotViews: SlotView[] = [];

  private currentInventory: (InventorySlot | null)[] = [];
  private onCloseCallback: (() => void) | null = null;
  private onSwapCallback: ((a: number, b: number) => void) | null = null;
  private selectedIndex: number | null = null;

  private readonly panelWidth: number;
  private readonly panelHeight: number;

  private readonly cols = 6;
  private readonly rows = 6;
  private readonly slotSize = 44;
  private readonly gap = 4;

  private readonly itemById = new Map(ITEMS.map((item) => [item.id, item]));

  constructor(scene: Phaser.Scene) {
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

    const bg = this.scene.add.rectangle(0, 0, this.panelWidth, this.panelHeight, 0x1a1a2e, 0.95);
    bg.setStrokeStyle(2, 0x88cc44);
    this.container.add(bg);

    const titleY = -this.panelHeight / 2 + 24;
    const title = this.scene.add.text(0, titleY, 'Inventory', {
      fontSize: '20px',
      color: '#88cc44',
    }).setOrigin(0.5);
    this.container.add(title);

    const closeBtn = this.scene.add.text(this.panelWidth / 2 - 16, titleY, 'X', {
      fontSize: '20px',
      color: '#ff6666',
      fontStyle: 'bold',
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.close());
    this.container.add(closeBtn);

    const startX = -gridWidth / 2 + this.slotSize / 2;
    const startY = -this.panelHeight / 2 + headerHeight + this.slotSize / 2;

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const index = row * this.cols + col;
        const x = startX + col * (this.slotSize + this.gap);
        const y = startY + row * (this.slotSize + this.gap);

        const slotBg = this.scene.add.rectangle(x, y, this.slotSize, this.slotSize, 0x0f1020, 0.85)
          .setStrokeStyle(1, 0x666666)
          .setInteractive({ useHandCursor: true });
        slotBg.on('pointerdown', () => this.handleSlotClick(index));

        const icon = this.scene.add.sprite(x, y, 'items', 0)
          .setScale(2)
          .setVisible(false);

        const qtyText = this.scene.add.text(
          x + this.slotSize / 2 - 3,
          y + this.slotSize / 2 - 2,
          '',
          { fontSize: '12px', color: '#ffffff' }
        ).setOrigin(1, 1);

        this.slotViews.push({ bg: slotBg, icon, qty: qtyText });
        this.container.add([slotBg, icon, qtyText]);
      }
    }

    this.centerPanel();
    this.scene.scale.on('resize', () => this.centerPanel());
  }

  open(
    inventory: (InventorySlot | null)[],
    onClose: () => void,
    onSwap: (a: number, b: number) => void
  ): void {
    this.currentInventory = inventory;
    this.onCloseCallback = onClose;
    this.onSwapCallback = onSwap;
    this.selectedIndex = null;

    this.isOpen = true;
    this.container.setVisible(true);
    this.centerPanel();
    this.refreshSlots();
  }

  close(): void {
    if (!this.isOpen) return;

    this.isOpen = false;
    this.container.setVisible(false);
    this.selectedIndex = null;

    const callback = this.onCloseCallback;
    this.onCloseCallback = null;
    this.onSwapCallback = null;
    if (callback) callback();
  }

  private handleSlotClick(index: number): void {
    if (!this.isOpen) return;

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

  private refreshSlots(): void {
    const maxSlots = Math.min(INVENTORY_SIZE, this.slotViews.length);

    for (let i = 0; i < maxSlots; i++) {
      const view = this.slotViews[i];
      const slot = this.currentInventory[i];

      if (slot && slot.qty > 0) {
        const itemDef = this.itemById.get(slot.itemId);
        if (itemDef) {
          view.icon.setTexture('items', itemDef.spriteIndex);
          view.icon.setVisible(true);
        } else {
          view.icon.setVisible(false);
        }
        view.qty.setText(slot.qty > 1 ? `${slot.qty}` : '');
        view.bg.setStrokeStyle(1, this.getQualityColor(slot.quality));
      } else {
        view.icon.setVisible(false);
        view.qty.setText('');
        view.bg.setStrokeStyle(1, this.getQualityColor(Quality.NORMAL));
      }

      if (this.selectedIndex === i) {
        view.bg.setStrokeStyle(2, 0xffdd44);
      }
    }
  }

  private getQualityColor(quality: Quality): number {
    if (quality === Quality.GOLD) return 0xffd700;
    if (quality === Quality.SILVER) return 0xc0c0c0;
    return 0x666666;
  }

  private centerPanel(): void {
    const width = this.scene.scale.width;
    const height = this.scene.scale.height;
    this.container.setPosition(width / 2, height / 2);
  }
}
