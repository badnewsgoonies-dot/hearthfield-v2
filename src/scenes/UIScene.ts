import Phaser from 'phaser';
import {
  Scenes, Events, HOTBAR_SIZE, TILE_SIZE, SCALE,
  InventorySlot, Quality, CalendarState, Season
} from '../types';
import { ITEMS, RECIPES } from '../data/registry';
import { PlayScene } from './PlayScene';

export class UIScene extends Phaser.Scene {
  playScene!: PlayScene;
  hotbarContainer!: Phaser.GameObjects.Container;
  hotbarSlots: Phaser.GameObjects.Rectangle[] = [];
  hotbarIcons: Phaser.GameObjects.Sprite[] = [];
  hotbarQtys: Phaser.GameObjects.Text[] = [];
  selectorRect!: Phaser.GameObjects.Rectangle;

  // HUD elements
  goldText!: Phaser.GameObjects.Text;
  staminaBar!: Phaser.GameObjects.Rectangle;
  staminaBarBg!: Phaser.GameObjects.Rectangle;
  dayText!: Phaser.GameObjects.Text;
  timeText!: Phaser.GameObjects.Text;
  toastText!: Phaser.GameObjects.Text;
  toastTimer = 0;

  // Dialogue
  dialogueBox!: Phaser.GameObjects.Container;
  dialogueText!: Phaser.GameObjects.Text;

  // Crafting panel
  craftingPanel!: Phaser.GameObjects.Container;
  isCraftingOpen = false;

  constructor() { super(Scenes.UI); }

  init(data: { playScene: PlayScene }) {
    this.playScene = data.playScene;
  }

  create() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    // ── Hotbar ──
    this.hotbarContainer = this.add.container(w / 2, h - 30);
    const slotSize = 40;
    const gap = 4;
    const totalW = HOTBAR_SIZE * (slotSize + gap) - gap;
    const startX = -totalW / 2;

    for (let i = 0; i < HOTBAR_SIZE; i++) {
      const x = startX + i * (slotSize + gap) + slotSize / 2;
      const bg = this.add.rectangle(x, 0, slotSize, slotSize, 0x222222, 0.8);
      bg.setStrokeStyle(1, 0x666666);
      this.hotbarSlots.push(bg);
      this.hotbarContainer.add(bg);

      const icon = this.add.sprite(x, 0, 'items', 0).setScale(2).setVisible(false);
      this.hotbarIcons.push(icon);
      this.hotbarContainer.add(icon);

      const qty = this.add.text(x + 12, 10, '', { fontSize: '10px', color: '#ffffff' }).setOrigin(1, 1);
      this.hotbarQtys.push(qty);
      this.hotbarContainer.add(qty);
    }

    this.selectorRect = this.add.rectangle(
      startX + slotSize / 2, 0, slotSize + 4, slotSize + 4
    );
    this.selectorRect.setStrokeStyle(2, 0xffdd44);
    this.selectorRect.setFillStyle(0xffdd44, 0.1);
    this.hotbarContainer.add(this.selectorRect);

    // ── HUD Top Bar ──
    const hudBg = this.add.rectangle(w / 2, 18, w, 36, 0x000000, 0.5);

    this.goldText = this.add.text(10, 6, '💰 500g', { fontSize: '16px', color: '#ffdd44' });
    this.dayText = this.add.text(w / 2, 6, 'Spring 1, Year 1', { fontSize: '16px', color: '#88cc44' }).setOrigin(0.5, 0);
    this.timeText = this.add.text(w - 10, 6, '6:00 AM', { fontSize: '16px', color: '#aaccff' }).setOrigin(1, 0);

    // Stamina bar
    this.staminaBarBg = this.add.rectangle(10, 32, 120, 8, 0x333333);
    this.staminaBarBg.setOrigin(0, 0.5);
    this.staminaBar = this.add.rectangle(10, 32, 120, 8, 0x44cc44);
    this.staminaBar.setOrigin(0, 0.5);

    // Toast
    this.toastText = this.add.text(w / 2, h - 80, '', {
      fontSize: '14px', color: '#ffffff', backgroundColor: '#00000088',
      padding: { x: 8, y: 4 }
    }).setOrigin(0.5).setVisible(false).setDepth(100);

    // Crafting panel (hidden initially)
    this.createCraftingPanel();

    // ── Listen to events from PlayScene ──
    const ps = this.playScene;

    ps.events.on(Events.INVENTORY_CHANGE, () => this.refreshHotbar());
    ps.events.on(Events.GOLD_CHANGE, () => this.refreshGold());
    ps.events.on(Events.TIME_TICK, () => this.refreshTime());
    ps.events.on(Events.DAY_START, () => this.refreshDay());

    ps.events.on(Events.TOAST, (data: { message: string; duration?: number; color?: string }) => {
      this.showToast(data.message, data.duration ?? 2000, data.color ?? '#ffffff');
    });

    ps.events.on(Events.OPEN_CRAFTING, (data: { cooking: boolean }) => {
      this.openCrafting(data.cooking);
    });
    ps.events.on(Events.CLOSE_CRAFTING, () => this.closeCrafting());

    ps.events.on(Events.OPEN_PAUSE, () => {
      ps.dayPaused = !ps.dayPaused;
      this.showToast(ps.dayPaused ? 'PAUSED' : 'Resumed', 1000);
    });

    // Initial refresh
    this.refreshHotbar();
    this.refreshGold();
    this.refreshDay();
  }

  update(time: number, delta: number) {
    // Update selector position
    const slotSize = 40, gap = 4;
    const totalW = HOTBAR_SIZE * (slotSize + gap) - gap;
    const startX = -totalW / 2;
    const sel = this.playScene.player.selectedSlot;
    this.selectorRect.setPosition(startX + sel * (slotSize + gap) + slotSize / 2, 0);

    // Stamina bar
    const ratio = this.playScene.player.stamina / this.playScene.player.maxStamina;
    this.staminaBar.width = 120 * ratio;
    const color = ratio > 0.5 ? 0x44cc44 : ratio > 0.25 ? 0xcccc44 : 0xcc4444;
    this.staminaBar.setFillStyle(color);

    // Toast fade
    if (this.toastText.visible) {
      this.toastTimer -= delta;
      if (this.toastTimer <= 0) this.toastText.setVisible(false);
      else if (this.toastTimer < 500) this.toastText.setAlpha(this.toastTimer / 500);
    }
  }

  private refreshHotbar() {
    for (let i = 0; i < HOTBAR_SIZE; i++) {
      const slot = this.playScene.player.inventory[i];
      if (slot && slot.qty > 0) {
        const itemDef = ITEMS.find(it => it.id === slot.itemId);
        if (itemDef) {
          this.hotbarIcons[i].setTexture('items', itemDef.spriteIndex);
          this.hotbarIcons[i].setVisible(true);
          this.hotbarQtys[i].setText(slot.qty > 1 ? `${slot.qty}` : '');
          // Quality tint
          if (slot.quality === Quality.GOLD) this.hotbarSlots[i].setStrokeStyle(1, 0xffd700);
          else if (slot.quality === Quality.SILVER) this.hotbarSlots[i].setStrokeStyle(1, 0xc0c0c0);
          else this.hotbarSlots[i].setStrokeStyle(1, 0x666666);
        }
      } else {
        this.hotbarIcons[i].setVisible(false);
        this.hotbarQtys[i].setText('');
        this.hotbarSlots[i].setStrokeStyle(1, 0x666666);
      }
    }
  }

  private refreshGold() {
    this.goldText.setText(`💰 ${this.playScene.player.gold}g`);
  }

  private refreshDay() {
    const c = this.playScene.calendar;
    const seasonNames = { spring: 'Spring', summer: 'Summer', fall: 'Fall', winter: 'Winter' };
    this.dayText.setText(`${seasonNames[c.season]} ${c.day}, Year ${c.year}`);
  }

  private refreshTime() {
    const t = this.playScene.calendar.timeOfDay;
    // 0 = 6am, 1 = 2am next day (20 hour span)
    const totalMinutes = Math.floor(t * 20 * 60); // 20 game hours
    const hour = 6 + Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    const ampm = hour >= 12 && hour < 24 ? 'PM' : 'AM';
    this.timeText.setText(`${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`);
  }

  private showToast(message: string, duration: number, color = '#ffffff') {
    this.toastText.setText(message);
    this.toastText.setColor(color);
    this.toastText.setVisible(true);
    this.toastText.setAlpha(1);
    this.toastTimer = duration;
  }

  private createCraftingPanel() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    this.craftingPanel = this.add.container(w / 2, h / 2).setVisible(false).setDepth(200);

    const bg = this.add.rectangle(0, 0, 400, 300, 0x1a1a2e, 0.95);
    bg.setStrokeStyle(2, 0x88cc44);
    this.craftingPanel.add(bg);

    const title = this.add.text(0, -130, 'Crafting', { fontSize: '20px', color: '#88cc44' }).setOrigin(0.5);
    this.craftingPanel.add(title);

    const closeBtn = this.add.text(180, -130, '✕', { fontSize: '20px', color: '#ff4444' })
      .setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.closeCrafting());
    this.craftingPanel.add(closeBtn);
  }

  private openCrafting(cooking: boolean) {
    this.isCraftingOpen = true;
    this.craftingPanel.setVisible(true);
    this.playScene.dayPaused = true;

    // Clear old recipe buttons
    const children = this.craftingPanel.getAll();
    for (let i = children.length - 1; i >= 3; i--) {
      (children[i] as Phaser.GameObjects.GameObject).destroy();
    }

    // Populate available recipes
    const available = RECIPES.filter(r => {
      if (cooking && !r.isCooking) return false;
      if (!cooking && r.isCooking) return false;
      return this.playScene.unlockedRecipes.includes(r.id);
    });

    let y = -90;
    for (const recipe of available.slice(0, 6)) {
      const canCraft = recipe.ingredients.every(ing =>
        this.playScene.countItem(ing.itemId) >= ing.qty
      );
      const color = canCraft ? '#ffffff' : '#666666';
      const ingText = recipe.ingredients.map(i => {
        const def = ITEMS.find(it => it.id === i.itemId);
        return `${def?.name ?? i.itemId}×${i.qty}`;
      }).join(', ');

      const btn = this.add.text(-180, y, `${recipe.name} (${ingText})`, {
        fontSize: '13px', color, wordWrap: { width: 360 }
      }).setInteractive({ useHandCursor: canCraft });

      if (canCraft) {
        btn.on('pointerover', () => btn.setColor('#ffdd44'));
        btn.on('pointerout', () => btn.setColor('#ffffff'));
        btn.on('pointerdown', () => {
          this.playScene.events.emit(Events.CRAFT_ITEM, { recipeId: recipe.id });
          this.openCrafting(cooking); // refresh
        });
      }

      this.craftingPanel.add(btn);
      y += 35;
    }
  }

  private closeCrafting() {
    this.isCraftingOpen = false;
    this.craftingPanel.setVisible(false);
    this.playScene.dayPaused = false;
    this.playScene.events.emit(Events.CLOSE_CRAFTING);
  }
}
