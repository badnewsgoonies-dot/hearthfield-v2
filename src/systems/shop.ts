import Phaser from 'phaser';
import {
  Events,
  InventorySlot,
  ItemCategory,
  ItemDef,
  Quality,
  Season,
} from '../types';
import { CROPS, ITEMS } from '../data/registry';

export interface ShopItem {
  itemDef: ItemDef;
  buyPrice: number;
  stock: number;
}

type ScrollListKind = 'shop' | 'player';

export class ShopSystem {
  private scene: Phaser.Scene;
  private shopContainer?: Phaser.GameObjects.Container;

  private currentSeason: Season = Season.SPRING;
  private currentGold = 0;
  private currentInventory: (InventorySlot | null)[] = [];
  private shopInventory: ShopItem[] = [];

  private goldText?: Phaser.GameObjects.Text;

  private shopListContent?: Phaser.GameObjects.Container;
  private playerListContent?: Phaser.GameObjects.Container;

  private shopViewportTopY = 0;
  private playerViewportTopY = 0;
  private shopViewportHeight = 0;
  private playerViewportHeight = 0;

  private shopContentHeight = 0;
  private playerContentHeight = 0;

  private dragList: ScrollListKind | null = null;
  private dragStartPointerY = 0;
  private dragStartContentY = 0;

  private onPointerMove?: (pointer: Phaser.Input.Pointer) => void;
  private onPointerUp?: () => void;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  getShopInventory(season: Season): ShopItem[] {
    const seasonalSeedIds = new Set(
      CROPS.filter((crop) => crop.seasons.includes(season)).map((crop) => crop.seedId)
    );

    const seasonalSeeds: ShopItem[] = ITEMS
      .filter((item) => item.category === ItemCategory.SEED && seasonalSeedIds.has(item.id))
      .map((itemDef) => ({
        itemDef,
        buyPrice: itemDef.sellPrice * 2,
        stock: 99,
      }));

    const alwaysAvailable: ShopItem[] = ITEMS
      .filter(
        (item) => item.category === ItemCategory.TOOL || item.category === ItemCategory.FOOD
      )
      .map((itemDef) => ({
        itemDef,
        buyPrice: itemDef.sellPrice * 2,
        stock: 99,
      }));

    return [...seasonalSeeds, ...alwaysAvailable];
  }

  openShop(
    season: Season,
    playerGold: number,
    playerInventory: (InventorySlot | null)[]
  ): void {
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

    this.shopContainer = this.scene.add
      .container(cam.centerX, cam.centerY)
      .setDepth(1000)
      .setScrollFactor(0);

    const bg = this.scene.add.rectangle(0, 0, panelW, panelH, 0x101010, 0.9);
    bg.setStrokeStyle(2, 0x3a3a3a, 1);

    const title = this.scene.add
      .text(0, -panelH / 2 + 24, 'General Store', {
        fontSize: '24px',
        color: '#f4f0d0',
      })
      .setOrigin(0.5);

    const closeBtn = this.scene.add
      .text(panelW / 2 - 16, -panelH / 2 + 16, 'X', {
        fontSize: '20px',
        color: '#ff6666',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    closeBtn.on('pointerdown', () => this.closeShop());

    const leftPanelX = -panelW / 4;
    const rightPanelX = panelW / 4;
    const panelTopY = -panelH / 2 + 50;

    const leftPanel = this.scene.add.rectangle(leftPanelX, 10, listW + 20, listH + 70, 0x1d1d1d, 0.95);
    leftPanel.setStrokeStyle(1, 0x4d4d4d, 1);
    const rightPanel = this.scene.add.rectangle(rightPanelX, 10, listW + 20, listH + 70, 0x1d1d1d, 0.95);
    rightPanel.setStrokeStyle(1, 0x4d4d4d, 1);

    const shopLabel = this.scene.add
      .text(leftPanelX, panelTopY - 20, 'Shop Stock', { fontSize: '16px', color: '#ffffff' })
      .setOrigin(0.5, 0);

    const invLabel = this.scene.add
      .text(rightPanelX, panelTopY - 20, 'Your Items', { fontSize: '16px', color: '#ffffff' })
      .setOrigin(0.5, 0);

    const shopViewportX = leftPanelX - listW / 2;
    const playerViewportX = rightPanelX - listW / 2;
    const viewportY = panelTopY + 20;

    const shopViewportBg = this.scene.add
      .rectangle(leftPanelX, viewportY + listH / 2, listW, listH, 0x111111, 0.85)
      .setOrigin(0.5, 0.5)
      .setInteractive({ useHandCursor: true });
    const playerViewportBg = this.scene.add
      .rectangle(rightPanelX, viewportY + listH / 2, listW, listH, 0x111111, 0.85)
      .setOrigin(0.5, 0.5)
      .setInteractive({ useHandCursor: true });

    this.shopListContent = this.scene.add.container(shopViewportX, viewportY);
    this.playerListContent = this.scene.add.container(playerViewportX, viewportY);

    const shopMaskShape = this.scene.add.rectangle(shopViewportX, viewportY, listW, listH, 0xffffff, 0);
    shopMaskShape.setOrigin(0, 0);
    const playerMaskShape = this.scene.add.rectangle(playerViewportX, viewportY, listW, listH, 0xffffff, 0);
    playerMaskShape.setOrigin(0, 0);

    const shopMask = shopMaskShape.createGeometryMask();
    const playerMask = playerMaskShape.createGeometryMask();
    this.shopListContent.setMask(shopMask);
    this.playerListContent.setMask(playerMask);

    this.shopViewportTopY = viewportY;
    this.playerViewportTopY = viewportY;
    this.shopViewportHeight = listH;
    this.playerViewportHeight = listH;

    const shopUp = this.makeArrowButton(leftPanelX - 40, viewportY - 12, '▲', () => this.scrollList('shop', -32));
    const shopDown = this.makeArrowButton(leftPanelX + 40, viewportY - 12, '▼', () => this.scrollList('shop', 32));
    const playerUp = this.makeArrowButton(rightPanelX - 40, viewportY - 12, '▲', () => this.scrollList('player', -32));
    const playerDown = this.makeArrowButton(rightPanelX + 40, viewportY - 12, '▼', () => this.scrollList('player', 32));

    shopViewportBg.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.dragList = 'shop';
      this.dragStartPointerY = pointer.y;
      this.dragStartContentY = this.shopListContent?.y ?? this.shopViewportTopY;
    });

    playerViewportBg.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.dragList = 'player';
      this.dragStartPointerY = pointer.y;
      this.dragStartContentY = this.playerListContent?.y ?? this.playerViewportTopY;
    });

    this.onPointerMove = (pointer: Phaser.Input.Pointer) => {
      if (!this.dragList) return;
      const deltaY = pointer.y - this.dragStartPointerY;
      const targetY = this.dragStartContentY + deltaY;
      this.setListY(this.dragList, targetY);
    };

    this.onPointerUp = () => {
      this.dragList = null;
    };

    this.scene.input.on('pointermove', this.onPointerMove);
    this.scene.input.on('pointerup', this.onPointerUp);
    this.scene.input.on('pointerupoutside', this.onPointerUp);

    this.goldText = this.scene.add
      .text(-panelW / 2 + 20, panelH / 2 - 28, `Gold: ${this.currentGold}g`, {
        fontSize: '20px',
        color: '#ffdd55',
      })
      .setOrigin(0, 0.5);

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
      this.goldText,
    ]);

    this.rebuildShopList();
    this.rebuildPlayerList();
  }

  closeShop(): void {
    if (this.onPointerMove) {
      this.scene.input.off('pointermove', this.onPointerMove);
      this.onPointerMove = undefined;
    }
    if (this.onPointerUp) {
      this.scene.input.off('pointerup', this.onPointerUp);
      this.scene.input.off('pointerupoutside', this.onPointerUp);
      this.onPointerUp = undefined;
    }

    this.dragList = null;

    if (this.shopContainer) {
      this.shopContainer.destroy(true);
      this.shopContainer = undefined;
    }

    this.shopListContent = undefined;
    this.playerListContent = undefined;
    this.goldText = undefined;
  }

  refreshDisplay(gold: number, inventory: (InventorySlot | null)[]): void {
    this.currentGold = gold;
    this.currentInventory = this.cloneInventory(inventory);
    this.updateGoldText();
    this.rebuildPlayerList();
  }

  private makeArrowButton(
    x: number,
    y: number,
    label: string,
    onClick: () => void
  ): Phaser.GameObjects.Text {
    const button = this.scene.add
      .text(x, y, label, { fontSize: '16px', color: '#d5d5d5' })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    button.on('pointerover', () => button.setColor('#ffffff'));
    button.on('pointerout', () => button.setColor('#d5d5d5'));
    button.on('pointerdown', onClick);

    return button;
  }

  private rebuildShopList(): void {
    if (!this.shopListContent) return;

    this.shopListContent.removeAll(true);

    const rowH = 34;
    const rowW = 220;

    let y = 0;
    for (const entry of this.shopInventory) {
      const rowBg = this.scene.add.rectangle(rowW / 2, y + rowH / 2, rowW, rowH - 2, 0x262626, 0.92);
      rowBg.setOrigin(0.5, 0.5);

      const nameText = this.scene.add.text(6, y + 9, entry.itemDef.name, {
        fontSize: '12px',
        color: '#ffffff',
      });

      const priceText = this.scene.add.text(105, y + 9, `${entry.buyPrice}g`, {
        fontSize: '12px',
        color: '#ffdd55',
      });

      const stockText = this.scene.add.text(150, y + 9, `x${entry.stock}`, {
        fontSize: '12px',
        color: '#a0d0ff',
      });

      const buyBtn = this.scene.add
        .text(190, y + 9, 'Buy', { fontSize: '12px', color: '#87ff87' })
        .setOrigin(0.5, 0)
        .setInteractive({ useHandCursor: true });

      buyBtn.on('pointerover', () => buyBtn.setColor('#c7ffc7'));
      buyBtn.on('pointerout', () => buyBtn.setColor('#87ff87'));
      buyBtn.on('pointerdown', () => this.handleBuy(entry.itemDef.id));

      this.shopListContent.add([rowBg, nameText, priceText, stockText, buyBtn]);
      y += rowH;
    }

    this.shopContentHeight = Math.max(y, this.shopViewportHeight);
    this.setListY('shop', this.shopListContent.y);
  }

  private rebuildPlayerList(): void {
    if (!this.playerListContent) return;

    this.playerListContent.removeAll(true);

    const entries: Array<{
      slotIndex: number;
      itemDef: ItemDef;
      qty: number;
      quality: Quality;
      sellValue: number;
    }> = [];

    for (let i = 0; i < this.currentInventory.length; i++) {
      const slot = this.currentInventory[i];
      if (!slot || slot.qty <= 0) continue;
      const itemDef = ITEMS.find((item) => item.id === slot.itemId);
      if (!itemDef) continue;
      entries.push({
        slotIndex: i,
        itemDef,
        qty: slot.qty,
        quality: slot.quality,
        sellValue: this.getSellValue(slot, itemDef),
      });
    }

    const rowH = 34;
    const rowW = 220;

    let y = 0;
    for (const entry of entries) {
      const rowBg = this.scene.add.rectangle(rowW / 2, y + rowH / 2, rowW, rowH - 2, 0x262626, 0.92);
      rowBg.setOrigin(0.5, 0.5);

      const nameText = this.scene.add.text(6, y + 9, `${entry.itemDef.name} x${entry.qty}`, {
        fontSize: '12px',
        color: '#ffffff',
      });

      const qualityText = this.scene.add.text(112, y + 9, `Q${entry.quality}`, {
        fontSize: '12px',
        color: '#c0c0c0',
      });

      const priceText = this.scene.add.text(142, y + 9, `${entry.sellValue}g`, {
        fontSize: '12px',
        color: '#ffcc99',
      });

      const sellBtn = this.scene.add
        .text(194, y + 9, 'Sell', { fontSize: '12px', color: '#ff9d9d' })
        .setOrigin(0.5, 0)
        .setInteractive({ useHandCursor: true });

      sellBtn.on('pointerover', () => sellBtn.setColor('#ffd0d0'));
      sellBtn.on('pointerout', () => sellBtn.setColor('#ff9d9d'));
      sellBtn.on('pointerdown', () => this.handleSell(entry.slotIndex));

      this.playerListContent.add([rowBg, nameText, qualityText, priceText, sellBtn]);
      y += rowH;
    }

    if (entries.length === 0) {
      const emptyText = this.scene.add.text(8, 8, 'No items to sell.', {
        fontSize: '13px',
        color: '#9a9a9a',
      });
      this.playerListContent.add(emptyText);
      y = 24;
    }

    this.playerContentHeight = Math.max(y, this.playerViewportHeight);
    this.setListY('player', this.playerListContent.y);
  }

  private handleBuy(itemId: string): void {
    const shopEntry = this.shopInventory.find((entry) => entry.itemDef.id === itemId);
    if (!shopEntry) return;
    if (shopEntry.stock <= 0) return;
    if (this.currentGold < shopEntry.buyPrice) return;

    const added = this.addToInventory(itemId, 1, Quality.NORMAL);
    if (!added) return;

    this.currentGold -= shopEntry.buyPrice;
    shopEntry.stock -= 1;

    this.scene.events.emit(Events.SHOP_BUY, {
      itemId,
      qty: 1,
      cost: shopEntry.buyPrice,
    });

    this.updateGoldText();
    this.rebuildShopList();
    this.rebuildPlayerList();
  }

  private handleSell(slotIndex: number): void {
    const slot = this.currentInventory[slotIndex];
    if (!slot || slot.qty <= 0) return;

    const itemDef = ITEMS.find((item) => item.id === slot.itemId);
    if (!itemDef) return;

    const revenue = this.getSellValue(slot, itemDef);
    this.currentGold += revenue;

    slot.qty -= 1;
    if (slot.qty <= 0) {
      this.currentInventory[slotIndex] = null;
    }

    this.scene.events.emit(Events.SHOP_SELL, {
      itemId: itemDef.id,
      qty: 1,
      revenue,
    });

    this.updateGoldText();
    this.rebuildPlayerList();
  }

  private getSellValue(slot: InventorySlot, itemDef: ItemDef): number {
    const qualityMultiplier = Number(slot.quality) || 1;
    return Math.floor(itemDef.sellPrice * qualityMultiplier);
  }

  private updateGoldText(): void {
    if (!this.goldText) return;
    this.goldText.setText(`Gold: ${this.currentGold}g`);
  }

  private scrollList(kind: ScrollListKind, amount: number): void {
    const currentY = this.getListContent(kind)?.y;
    if (currentY === undefined) return;
    this.setListY(kind, currentY + amount);
  }

  private setListY(kind: ScrollListKind, y: number): void {
    const content = this.getListContent(kind);
    if (!content) return;

    const viewportTopY = kind === 'shop' ? this.shopViewportTopY : this.playerViewportTopY;
    const viewportHeight = kind === 'shop' ? this.shopViewportHeight : this.playerViewportHeight;
    const contentHeight = kind === 'shop' ? this.shopContentHeight : this.playerContentHeight;

    const minY = viewportTopY - Math.max(0, contentHeight - viewportHeight);
    const maxY = viewportTopY;

    content.y = Phaser.Math.Clamp(y, minY, maxY);
  }

  private getListContent(kind: ScrollListKind): Phaser.GameObjects.Container | undefined {
    return kind === 'shop' ? this.shopListContent : this.playerListContent;
  }

  private addToInventory(itemId: string, qty: number, quality: Quality): boolean {
    let remaining = qty;

    for (let i = 0; i < this.currentInventory.length; i++) {
      const slot = this.currentInventory[i];
      if (!slot) continue;
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

  private cloneInventory(inventory: (InventorySlot | null)[]): (InventorySlot | null)[] {
    return inventory.map((slot) => (slot ? { ...slot } : null));
  }
}
