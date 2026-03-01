import Phaser from 'phaser';
import { InventorySlot, Quality, ItemCategory, Events } from '../types';
import { ITEMS } from '../data/registry';

type ShopTab = 'buy' | 'sell';

interface SellRow {
  slotIndex: number;
  slot: InventorySlot;
}

export class ShopPanel {
  public isOpen = false;

  private readonly scene: Phaser.Scene;
  private readonly container: Phaser.GameObjects.Container;
  private readonly buyContent: Phaser.GameObjects.Container;
  private readonly sellContent: Phaser.GameObjects.Container;
  private readonly tabBuyText: Phaser.GameObjects.Text;
  private readonly tabSellText: Phaser.GameObjects.Text;
  private readonly goldText: Phaser.GameObjects.Text;

  private activeTab: ShopTab = 'buy';

  private readonly panelWidth = 620;
  private readonly panelHeight = 460;
  private readonly viewportWidth = 576;
  private readonly viewportHeight = 310;
  private readonly viewportTopY = -120;
  private readonly rowHeight = 42;

  private buyScroll = 0;
  private sellScroll = 0;
  private buyContentHeight = 0;
  private sellContentHeight = 0;

  private inventory: (InventorySlot | null)[] = [];
  private playerGold = 0;
  private onBuyCallback: ((itemId: string, qty: number) => void) | null = null;
  private onSellCallback: ((slotIndex: number, qty: number) => void) | null = null;
  private onCloseCallback: (() => void) | null = null;

  private readonly buyItems = ITEMS.filter(
    (item) => item.category === ItemCategory.SEED || item.category === ItemCategory.TOOL
  );

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    this.container = this.scene.add.container(0, 0);
    this.container.setDepth(300);
    this.container.setVisible(false);

    const bg = this.scene.add.rectangle(0, 0, this.panelWidth, this.panelHeight, 0x1a1a2e, 0.95);
    bg.setStrokeStyle(2, 0x88cc44, 1);
    this.container.add(bg);

    const titleY = -this.panelHeight / 2 + 24;
    const title = this.scene.add.text(0, titleY, 'Shop', {
      fontSize: '20px',
      color: '#88cc44',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.container.add(title);

    this.goldText = this.scene.add.text(this.panelWidth / 2 - 46, titleY, 'Gold: 0g', {
      fontSize: '16px',
      color: '#ffdd44',
    }).setOrigin(1, 0.5);
    this.container.add(this.goldText);

    const closeBtn = this.scene.add.text(this.panelWidth / 2 - 16, titleY, 'X', {
      fontSize: '20px',
      color: '#ff6666',
      fontStyle: 'bold',
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.close());
    this.container.add(closeBtn);

    this.tabBuyText = this.scene.add.text(-48, -174, 'Buy', {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold',
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    this.tabBuyText.on('pointerdown', () => this.switchTab('buy'));

    this.tabSellText = this.scene.add.text(48, -174, 'Sell', {
      fontSize: '18px',
      color: '#aaaaaa',
      fontStyle: 'bold',
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    this.tabSellText.on('pointerdown', () => this.switchTab('sell'));

    this.container.add([this.tabBuyText, this.tabSellText]);

    const viewportFrame = this.scene.add.rectangle(0, this.viewportTopY + this.viewportHeight / 2, this.viewportWidth, this.viewportHeight, 0x0f1020, 0.8);
    viewportFrame.setStrokeStyle(1, 0x335533, 1);
    this.container.add(viewportFrame);

    this.buyContent = this.scene.add.container(0, this.viewportTopY);
    this.sellContent = this.scene.add.container(0, this.viewportTopY);
    this.container.add([this.buyContent, this.sellContent]);

    const buyMaskGraphics = this.scene.add.graphics();
    buyMaskGraphics.fillStyle(0xffffff, 1);
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
    sellMaskGraphics.fillStyle(0xffffff, 1);
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
    this.scene.scale.on('resize', this.centerPanel, this);
    this.scene.input.on('wheel', this.onMouseWheel, this);
    this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);

    void Events;
  }

  open(
    inventory: (InventorySlot | null)[],
    playerGold: number,
    onBuy: (itemId: string, qty: number) => void,
    onSell: (slotIndex: number, qty: number) => void,
    onClose: () => void
  ): void {
    this.inventory = inventory;
    this.playerGold = playerGold;
    this.onBuyCallback = onBuy;
    this.onSellCallback = onSell;
    this.onCloseCallback = onClose;

    this.buyScroll = 0;
    this.sellScroll = 0;
    this.buildBuyRows();
    this.buildSellRows();
    this.switchTab('buy');

    this.goldText.setText(`Gold: ${playerGold}g`);
    this.isOpen = true;
    this.container.setVisible(true);
    this.centerPanel();
  }

  close(): void {
    if (!this.isOpen) return;

    this.isOpen = false;
    this.container.setVisible(false);

    const cb = this.onCloseCallback;
    this.onBuyCallback = null;
    this.onSellCallback = null;
    this.onCloseCallback = null;

    if (cb) cb();
  }

  private switchTab(tab: ShopTab): void {
    this.activeTab = tab;

    const buyActive = tab === 'buy';
    this.buyContent.setVisible(buyActive);
    this.sellContent.setVisible(!buyActive);

    this.tabBuyText.setColor(buyActive ? '#ffffff' : '#888888');
    this.tabSellText.setColor(buyActive ? '#888888' : '#ffffff');
    this.tabBuyText.setScale(buyActive ? 1.05 : 1);
    this.tabSellText.setScale(buyActive ? 1 : 1.05);

    this.applyScroll();
  }

  private buildBuyRows(): void {
    this.buyContent.removeAll(true);

    let y = this.rowHeight / 2;
    for (const item of this.buyItems) {
      const price = this.getBuyPrice(item.sellPrice);
      const row = this.createRowBase(y);

      const icon = this.scene.add.sprite(-this.viewportWidth / 2 + 22, y, 'items', item.spriteIndex).setScale(2);
      const name = this.scene.add.text(-this.viewportWidth / 2 + 46, y - 10, item.name, {
        fontSize: '14px',
        color: '#ffffff',
      });
      const priceText = this.scene.add.text(this.viewportWidth / 2 - 140, y - 10, `${price}g`, {
        fontSize: '14px',
        color: '#ffdd44',
      });

      const canAfford = this.playerGold >= price;
      const buyBtn = this.scene.add.text(this.viewportWidth / 2 - 42, y, 'Buy', {
        fontSize: '13px',
        color: canAfford ? '#88ccff' : '#666666',
        backgroundColor: canAfford ? '#224455' : '#222222',
        padding: { left: 8, right: 8, top: 3, bottom: 3 },
      }).setOrigin(0.5);

      if (canAfford) {
        buyBtn.setInteractive({ useHandCursor: true });
        buyBtn.on('pointerover', () => buyBtn.setColor('#ffffff'));
        buyBtn.on('pointerout', () => buyBtn.setColor('#88ccff'));
        buyBtn.on('pointerdown', () => this.onBuyCallback?.(item.id, 1));
      }

      this.buyContent.add([row, icon, name, priceText, buyBtn]);
      y += this.rowHeight;
    }

    this.buyContentHeight = Math.max(this.viewportHeight, this.buyItems.length * this.rowHeight);
  }

  private buildSellRows(): void {
    this.sellContent.removeAll(true);

    const sellRows: SellRow[] = [];
    for (let i = 0; i < this.inventory.length; i++) {
      const slot = this.inventory[i];
      if (!slot || slot.qty <= 0) continue;
      const item = ITEMS.find((entry) => entry.id === slot.itemId);
      if (!item || item.sellPrice <= 0) continue;
      sellRows.push({ slotIndex: i, slot });
    }

    if (sellRows.length === 0) {
      const empty = this.scene.add.text(0, this.rowHeight, 'No sellable items in inventory.', {
        fontSize: '14px',
        color: '#aaaaaa',
      }).setOrigin(0.5, 0);
      this.sellContent.add(empty);
      this.sellContentHeight = this.viewportHeight;
      return;
    }

    let y = this.rowHeight / 2;
    for (const rowData of sellRows) {
      const item = ITEMS.find((entry) => entry.id === rowData.slot.itemId);
      if (!item) continue;

      const sellPrice = this.getSellPrice(rowData.slot, item.sellPrice);
      const row = this.createRowBase(y);

      const icon = this.scene.add.sprite(-this.viewportWidth / 2 + 22, y, 'items', item.spriteIndex).setScale(2);
      const name = this.scene.add.text(-this.viewportWidth / 2 + 46, y - 10, `${item.name} x${rowData.slot.qty}`, {
        fontSize: '14px',
        color: '#ffffff',
      });
      const priceText = this.scene.add.text(this.viewportWidth / 2 - 140, y - 10, `${sellPrice}g`, {
        fontSize: '14px',
        color: '#ffdd44',
      });
      const sellBtn = this.scene.add.text(this.viewportWidth / 2 - 42, y, 'Sell', {
        fontSize: '13px',
        color: '#ffcc88',
        backgroundColor: '#553b22',
        padding: { left: 8, right: 8, top: 3, bottom: 3 },
      })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
      sellBtn.on('pointerover', () => sellBtn.setColor('#ffffff'));
      sellBtn.on('pointerout', () => sellBtn.setColor('#ffcc88'));
      sellBtn.on('pointerdown', () => this.onSellCallback?.(rowData.slotIndex, 1));

      this.sellContent.add([row, icon, name, priceText, sellBtn]);
      y += this.rowHeight;
    }

    this.sellContentHeight = Math.max(this.viewportHeight, sellRows.length * this.rowHeight);
  }

  private createRowBase(y: number): Phaser.GameObjects.Rectangle {
    const row = this.scene.add.rectangle(0, y, this.viewportWidth - 8, this.rowHeight - 4, 0x111827, 0.9);
    row.setStrokeStyle(1, 0x2f3e46, 1);
    return row;
  }

  private getBuyPrice(baseSellPrice: number): number {
    return Math.max(25, baseSellPrice * 2);
  }

  private getSellPrice(slot: InventorySlot, baseSellPrice: number): number {
    const qualityMultiplier = Number(slot.quality) || Number(Quality.NORMAL);
    return Math.floor(baseSellPrice * qualityMultiplier);
  }

  private onMouseWheel(
    pointer: Phaser.Input.Pointer,
    _currentlyOver: Phaser.GameObjects.GameObject[],
    _deltaX: number,
    deltaY: number
  ): void {
    if (!this.isOpen) return;
    if (!this.pointerInsideViewport(pointer)) return;

    const step = deltaY > 0 ? -24 : 24;
    if (this.activeTab === 'buy') {
      this.buyScroll += step;
    } else {
      this.sellScroll += step;
    }

    this.applyScroll();
  }

  private pointerInsideViewport(pointer: Phaser.Input.Pointer): boolean {
    const localX = pointer.worldX - this.container.x;
    const localY = pointer.worldY - this.container.y;
    const left = -this.viewportWidth / 2;
    const right = this.viewportWidth / 2;
    const top = this.viewportTopY;
    const bottom = this.viewportTopY + this.viewportHeight;
    return localX >= left && localX <= right && localY >= top && localY <= bottom;
  }

  private applyScroll(): void {
    const buyMin = Math.min(0, this.viewportHeight - this.buyContentHeight);
    const sellMin = Math.min(0, this.viewportHeight - this.sellContentHeight);

    this.buyScroll = Phaser.Math.Clamp(this.buyScroll, buyMin, 0);
    this.sellScroll = Phaser.Math.Clamp(this.sellScroll, sellMin, 0);

    this.buyContent.setY(this.viewportTopY + this.buyScroll);
    this.sellContent.setY(this.viewportTopY + this.sellScroll);
  }

  private centerPanel(): void {
    this.container.setPosition(this.scene.scale.width / 2, this.scene.scale.height / 2);
  }

  private destroy(): void {
    this.scene.scale.off('resize', this.centerPanel, this);
    this.scene.input.off('wheel', this.onMouseWheel, this);
    this.container.destroy(true);
  }
}
