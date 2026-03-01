import Phaser from 'phaser';
import { Events, ItemCategory, Quality, Tool } from '../types';
import { ITEMS } from '../data/registry';
import { PlayScene } from './PlayScene';

type ShopType = 'seeds' | 'tools' | 'general';

interface ShopInitData {
  playScene: PlayScene;
  shopType: ShopType;
}

type ItemListing = {
  kind: 'item';
  itemId: string;
  name: string;
  price: number;
  spriteIndex: number;
  qty: number;
};

type ToolListing = {
  kind: 'tool';
  tool: Tool;
  itemId: string;
  name: string;
  price: number;
  spriteIndex: number;
  level: number;
};

type ShopListing = ItemListing | ToolListing;

const TOOL_ITEM_TO_TOOL: Record<string, Tool> = {
  tool_hoe: Tool.HOE,
  tool_watering_can: Tool.WATERING_CAN,
};

export class ShopScene extends Phaser.Scene {
  playScene!: PlayScene;
  shopType: ShopType = 'general';
  panel!: Phaser.GameObjects.Rectangle;
  goldText!: Phaser.GameObjects.Text;
  listings: ShopListing[] = [];
  private wasDayPaused = false;

  constructor() {
    super('ShopScene');
  }

  init(data: ShopInitData) {
    this.playScene = data.playScene;
    this.shopType = data.shopType;
  }

  create() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    this.wasDayPaused = this.playScene.dayPaused;
    this.playScene.dayPaused = true;

    const backdrop = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.7)
      .setInteractive({ useHandCursor: false });
    backdrop.on('pointerdown', () => this.closeShop());

    this.panel = this.add.rectangle(w / 2, h / 2, 620, 470, 0x1a1a2e, 0.96);
    this.panel.setStrokeStyle(2, 0x88cc44);

    const shopTitle = this.shopType.charAt(0).toUpperCase() + this.shopType.slice(1);
    this.add.text(w / 2, h / 2 - 210, `${shopTitle} Shop`, {
      fontSize: '24px',
      color: '#88cc44',
    }).setOrigin(0.5);

    this.goldText = this.add.text(w / 2 - 290, h / 2 - 210, `Gold: ${this.playScene.player.gold}g`, {
      fontSize: '16px',
      color: '#ffdd44',
    });

    const closeBtn = this.add.text(w / 2 + 290, h / 2 - 210, 'X', {
      fontSize: '22px',
      color: '#ff6666',
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true });

    closeBtn.on('pointerover', () => closeBtn.setColor('#ffffff'));
    closeBtn.on('pointerout', () => closeBtn.setColor('#ff6666'));
    closeBtn.on('pointerdown', () => this.closeShop());

    this.listings = this.buildListings();

    let rowY = h / 2 - 165;
    for (const listing of this.listings) {
      this.createListingRow(w / 2, rowY, listing);
      rowY += 42;
    }

    if (this.listings.length === 0) {
      this.add.text(w / 2, h / 2, 'Nothing to sell right now.', {
        fontSize: '16px',
        color: '#cccccc',
      }).setOrigin(0.5);
    }

    this.input.keyboard?.on('keydown-ESC', this.closeShop, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.off('keydown-ESC', this.closeShop, this);
      this.playScene.dayPaused = this.wasDayPaused;
    });
  }

  private buildListings(): ShopListing[] {
    if (this.shopType === 'seeds') {
      return ITEMS
        .filter(item => item.category === ItemCategory.SEED)
        .map(item => ({
          kind: 'item' as const,
          itemId: item.id,
          name: item.name,
          price: item.sellPrice * 2,
          spriteIndex: item.spriteIndex,
          qty: 1,
        }));
    }

    if (this.shopType === 'tools') {
      return ITEMS
        .filter(item => item.category === ItemCategory.TOOL && TOOL_ITEM_TO_TOOL[item.id])
        .flatMap(item => {
          const tool = TOOL_ITEM_TO_TOOL[item.id];
          const nextLevel = (this.playScene.toolLevels[tool] ?? 0) + 1;
          if (nextLevel > 4) return [];

          return [{
            kind: 'tool' as const,
            tool,
            itemId: item.id,
            name: `${item.name} Upgrade Lv.${nextLevel}`,
            price: 2000 * nextLevel,
            spriteIndex: item.spriteIndex,
            level: nextLevel,
          }];
        });
    }

    const generalIds = ['wood', 'stone', 'fiber', 'coal', 'wild_berries', 'mushroom'];
    return generalIds
      .map(id => ITEMS.find(item => item.id === id))
      .filter((item): item is NonNullable<typeof item> => !!item)
      .map(item => ({
        kind: 'item' as const,
        itemId: item.id,
        name: item.name,
        price: item.sellPrice * 2,
        spriteIndex: item.spriteIndex,
        qty: 1,
      }));
  }

  private createListingRow(centerX: number, y: number, listing: ShopListing) {
    const rowBg = this.add.rectangle(centerX, y, 580, 34, 0x222222, 0.85);
    rowBg.setStrokeStyle(1, 0x444444);

    this.add.sprite(centerX - 265, y, 'items', listing.spriteIndex).setScale(2);

    this.add.text(centerX - 240, y - 10, listing.name, {
      fontSize: '15px',
      color: '#ffffff',
    });

    this.add.text(centerX + 120, y - 10, `${listing.price}g`, {
      fontSize: '15px',
      color: '#ffdd44',
    });

    const buyButton = this.add.rectangle(centerX + 245, y, 70, 24, 0x3f8c45, 1)
      .setStrokeStyle(1, 0x9ee6a0)
      .setInteractive({ useHandCursor: true });

    const buyLabel = this.add.text(centerX + 245, y, 'Buy', {
      fontSize: '13px',
      color: '#ffffff',
    }).setOrigin(0.5);

    buyButton.on('pointerover', () => buyButton.setFillStyle(0x50a85a));
    buyButton.on('pointerout', () => buyButton.setFillStyle(0x3f8c45));
    buyButton.on('pointerdown', () => this.buyListing(listing));
  }

  private buyListing(listing: ShopListing) {
    if (this.playScene.player.gold < listing.price) {
      this.playScene.events.emit(Events.TOAST, {
        message: 'Not enough gold!',
        color: '#ff4444',
      });
      return;
    }

    const added = this.playScene.addToInventory(listing.itemId, 1, Quality.NORMAL);
    if (!added) return;

    this.playScene.player.gold -= listing.price;

    if (listing.kind === 'tool') {
      this.playScene.toolLevels[listing.tool] = listing.level;
      this.playScene.events.emit(Events.TOOL_UPGRADE, {
        tool: listing.tool,
        newLevel: listing.level,
      });
    }

    this.playScene.events.emit(Events.GOLD_CHANGE, {
      amount: -listing.price,
      newTotal: this.playScene.player.gold,
    });

    this.playScene.events.emit(Events.INVENTORY_CHANGE, {
      inventory: this.playScene.player.inventory,
    });

    this.playScene.events.emit(Events.SHOP_BUY, {
      itemId: listing.itemId,
      qty: 1,
      cost: listing.price,
    });

    this.playScene.events.emit(Events.TOAST, {
      message: `Bought ${listing.name}`,
      color: '#44ffaa',
    });

    this.goldText.setText(`Gold: ${this.playScene.player.gold}g`);

    if (this.shopType === 'tools') {
      this.scene.restart({ playScene: this.playScene, shopType: this.shopType });
    }
  }

  private closeShop() {
    this.playScene.dayPaused = this.wasDayPaused;
    this.scene.stop();
  }
}
