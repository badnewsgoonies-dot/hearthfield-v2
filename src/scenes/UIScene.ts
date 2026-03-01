import Phaser from 'phaser';
import {
  Events,
  HOTBAR_SIZE,
  gridToWorld,
  InteractionKind,
  Quality,
  Scenes,
  Season,
} from '../types';
import { ITEMS, NPCS, RECIPES } from '../data/registry';
import { InventoryPanel } from '../systems/inventoryPanel';
import { ShopPanel } from '../systems/shopPanel';
import { DialogueBox } from '../systems/dialogueBox';
import { PlayScene } from './PlayScene';

interface CraftingOpenData {
  cooking: boolean;
}

interface ToastData {
  message: string;
  duration?: number;
  color?: string;
}

interface DialogueStartData {
  npcId: string;
  text?: string;
  portraitIndex?: number;
}

interface InteractData {
  kind: InteractionKind;
  targetId?: string;
  x: number;
  y: number;
}

interface AchievementData {
  achievementId: string;
  name: string;
}

interface TutorialAdvanceData {
  active: boolean;
  step: number;
  text?: string;
  targetTile?: { x: number; y: number };
}

export class UIScene extends Phaser.Scene {
  playScene!: PlayScene;

  private hotbarContainer!: Phaser.GameObjects.Container;
  private hotbarSlots: Phaser.GameObjects.Rectangle[] = [];
  private hotbarIcons: Phaser.GameObjects.Sprite[] = [];
  private hotbarQtys: Phaser.GameObjects.Text[] = [];
  private selectorRect!: Phaser.GameObjects.Rectangle;

  private goldText!: Phaser.GameObjects.Text;
  private staminaBar!: Phaser.GameObjects.Rectangle;
  private staminaBarBg!: Phaser.GameObjects.Rectangle;
  private dayText!: Phaser.GameObjects.Text;
  private timeText!: Phaser.GameObjects.Text;

  private toastText!: Phaser.GameObjects.Text;
  private toastTimer = 0;
  private tutorialBox!: Phaser.GameObjects.Rectangle;
  private tutorialText!: Phaser.GameObjects.Text;
  private tutorialArrow!: Phaser.GameObjects.Text;
  private tutorialTargetTile?: { x: number; y: number };
  private tutorialVisible = false;

  private craftingPanel!: Phaser.GameObjects.Container;
  private craftingTitle!: Phaser.GameObjects.Text;
  private craftingRows: Phaser.GameObjects.GameObject[] = [];
  private craftingCookingMode = false;
  private isCraftingOpen = false;

  private inventoryPanel!: InventoryPanel;
  private shopPanel!: ShopPanel;
  private dialogueBox!: DialogueBox;

  private isInventoryOpen = false;
  private isShopOpen = false;
  private isDialogueOpen = false;
  private pauseToggled = false;

  constructor() {
    super(Scenes.UI);
  }

  init(data: { playScene: PlayScene }): void {
    this.playScene = data.playScene;
  }

  create(): void {
    this.inventoryPanel = new InventoryPanel(this);
    this.shopPanel = new ShopPanel(this);
    this.dialogueBox = new DialogueBox(this);

    this.createHotbar();
    this.createHud();
    this.createToast();
    this.createTutorialOverlay();
    this.createCraftingPanel();
    this.setupInput();
    this.wirePlayEvents();

    this.refreshHotbar();
    this.refreshGold();
    this.refreshDay();
    this.refreshTime();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.inventoryPanel.close();
      this.shopPanel.close();
      this.dialogueBox.close(false);
    });
  }

  update(_time: number, delta: number): void {
    const slotSize = 40;
    const gap = 4;
    const totalW = HOTBAR_SIZE * (slotSize + gap) - gap;
    const startX = -totalW / 2;
    const selected = Phaser.Math.Clamp(this.playScene.player.selectedSlot, 0, HOTBAR_SIZE - 1);

    this.selectorRect.setPosition(startX + selected * (slotSize + gap) + slotSize / 2, 0);

    const ratio = Phaser.Math.Clamp(this.playScene.player.stamina / this.playScene.player.maxStamina, 0, 1);
    this.staminaBar.width = 120 * ratio;
    if (ratio > 0.5) this.staminaBar.setFillStyle(0x44cc44);
    else if (ratio > 0.25) this.staminaBar.setFillStyle(0xcccc44);
    else this.staminaBar.setFillStyle(0xcc4444);

    if (this.toastText.visible) {
      this.toastTimer -= delta;
      if (this.toastTimer <= 0) {
        this.toastText.setVisible(false);
      } else if (this.toastTimer < 350) {
        this.toastText.setAlpha(this.toastTimer / 350);
      }
    }

    if (this.tutorialVisible && this.tutorialTargetTile) {
      const world = gridToWorld(this.tutorialTargetTile.x, this.tutorialTargetTile.y);
      const cam = this.playScene.cameras.main;
      const x = world.x - cam.worldView.x;
      const y = world.y - cam.worldView.y - 40;
      this.tutorialArrow.setPosition(x, y + Math.sin(this.time.now * 0.008) * 4);
      this.tutorialArrow.setVisible(x >= -30 && x <= this.cameras.main.width + 30 && y >= -50 && y <= this.cameras.main.height + 30);
    }
  }

  private createHotbar(): void {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    this.hotbarContainer = this.add.container(w / 2, h - 30).setDepth(120);

    const slotSize = 40;
    const gap = 4;
    const totalW = HOTBAR_SIZE * (slotSize + gap) - gap;
    const startX = -totalW / 2;

    for (let i = 0; i < HOTBAR_SIZE; i += 1) {
      const x = startX + i * (slotSize + gap) + slotSize / 2;
      const bg = this.add.rectangle(x, 0, slotSize, slotSize, 0x222222, 0.85);
      bg.setStrokeStyle(1, 0x666666, 1);
      this.hotbarSlots.push(bg);
      this.hotbarContainer.add(bg);

      const icon = this.add.sprite(x, 0, 'items', 0).setScale(2).setVisible(false);
      this.hotbarIcons.push(icon);
      this.hotbarContainer.add(icon);

      const qty = this.add
        .text(x + 12, 10, '', { fontSize: '10px', color: '#ffffff' })
        .setOrigin(1, 1);
      this.hotbarQtys.push(qty);
      this.hotbarContainer.add(qty);
    }

    this.selectorRect = this.add.rectangle(startX + slotSize / 2, 0, slotSize + 4, slotSize + 4);
    this.selectorRect.setStrokeStyle(2, 0xffdd44, 1);
    this.selectorRect.setFillStyle(0xffdd44, 0.08);
    this.hotbarContainer.add(this.selectorRect);
  }

  private createHud(): void {
    const w = this.cameras.main.width;

    this.add.rectangle(w / 2, 18, w, 36, 0x000000, 0.5).setDepth(110);

    this.goldText = this.add.text(10, 6, '500g', { fontSize: '16px', color: '#ffdd44' }).setDepth(111);
    this.dayText = this.add
      .text(w / 2, 6, 'Spring Day 1 Year 1', { fontSize: '16px', color: '#88cc44' })
      .setOrigin(0.5, 0)
      .setDepth(111);
    this.timeText = this.add
      .text(w - 10, 6, '6:00 AM', { fontSize: '16px', color: '#aaccff' })
      .setOrigin(1, 0)
      .setDepth(111);

    this.staminaBarBg = this.add.rectangle(10, 32, 120, 8, 0x333333).setOrigin(0, 0.5).setDepth(111);
    this.staminaBar = this.add.rectangle(10, 32, 120, 8, 0x44cc44).setOrigin(0, 0.5).setDepth(112);
  }

  private createToast(): void {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    this.toastText = this.add
      .text(w / 2, h / 2, '', {
        fontSize: '16px',
        color: '#ffffff',
        backgroundColor: '#000000aa',
        padding: { left: 10, right: 10, top: 6, bottom: 6 },
      })
      .setOrigin(0.5)
      .setVisible(false)
      .setDepth(1000);
  }

  private createTutorialOverlay(): void {
    const w = this.cameras.main.width;

    this.tutorialBox = this.add.rectangle(w / 2, 60, 760, 52, 0x000000, 0.7).setDepth(980).setVisible(false);
    this.tutorialBox.setStrokeStyle(2, 0xffffff, 0.18);

    this.tutorialText = this.add.text(w / 2, 60, '', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: 730 },
    }).setOrigin(0.5).setDepth(981).setVisible(false);

    this.tutorialArrow = this.add.text(0, 0, '▼', {
      fontSize: '22px',
      color: '#fff3a5',
      fontFamily: 'monospace',
    }).setOrigin(0.5).setDepth(981).setVisible(false);
  }

  private createCraftingPanel(): void {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    this.craftingPanel = this.add.container(w / 2, h / 2).setVisible(false).setDepth(910);

    const bg = this.add.rectangle(0, 0, 440, 320, 0x1a1a2e, 0.95);
    bg.setStrokeStyle(2, 0x88cc44, 1);

    this.craftingTitle = this.add
      .text(0, -138, 'Crafting', { fontSize: '20px', color: '#88cc44' })
      .setOrigin(0.5);

    const closeBtn = this.add
      .text(202, -138, 'X', { fontSize: '20px', color: '#ff6666' })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    closeBtn.on('pointerdown', () => this.closeCrafting());

    this.craftingPanel.add([bg, this.craftingTitle, closeBtn]);
  }

  private setupInput(): void {
    const keyboard = this.input.keyboard;
    if (keyboard) {
      const keyCodes = [
        Phaser.Input.Keyboard.KeyCodes.ONE,
        Phaser.Input.Keyboard.KeyCodes.TWO,
        Phaser.Input.Keyboard.KeyCodes.THREE,
        Phaser.Input.Keyboard.KeyCodes.FOUR,
        Phaser.Input.Keyboard.KeyCodes.FIVE,
        Phaser.Input.Keyboard.KeyCodes.SIX,
        Phaser.Input.Keyboard.KeyCodes.SEVEN,
        Phaser.Input.Keyboard.KeyCodes.EIGHT,
        Phaser.Input.Keyboard.KeyCodes.NINE,
        Phaser.Input.Keyboard.KeyCodes.ZERO,
      ];

      keyCodes.forEach((code, index) => {
        const key = keyboard.addKey(code);
        key.on('down', () => this.selectHotbarSlot(index));
      });
    }

    this.input.on('wheel', (_pointer: Phaser.Input.Pointer, _objects: unknown, _dx: number, dy: number) => {
      if (dy === 0) return;
      const delta = dy > 0 ? 1 : -1;
      const current = this.playScene.player.selectedSlot;
      const next = (current + delta + HOTBAR_SIZE) % HOTBAR_SIZE;
      this.selectHotbarSlot(next);
    });
  }

  private wirePlayEvents(): void {
    const ps = this.playScene;

    ps.events.on(Events.INVENTORY_CHANGE, () => {
      this.refreshHotbar();
      if (this.isCraftingOpen) this.populateCraftingRows();
    });
    ps.events.on(Events.GOLD_CHANGE, () => this.refreshGold());
    ps.events.on(Events.TIME_TICK, () => this.refreshTime());
    ps.events.on(Events.DAY_START, () => this.refreshDay());

    ps.events.on(Events.TOAST, (data: ToastData) => {
      this.showToast(data.message, data.duration ?? 2000, data.color ?? '#ffffff');
    });

    ps.events.on(Events.OPEN_CRAFTING, (data: CraftingOpenData) => this.openCrafting(data.cooking));
    ps.events.on(Events.CLOSE_CRAFTING, () => this.closeCrafting());
    ps.events.on(Events.OPEN_PAUSE, () => this.togglePause());
    ps.events.on(Events.OPEN_INVENTORY, () => this.openInventory());

    ps.events.on(Events.DIALOGUE_START, (data: DialogueStartData) => this.showDialogue(data));

    ps.events.on(Events.INTERACT, (data: InteractData) => {
      if (data.kind === InteractionKind.SHOP) {
        this.openShop();
      }
    });

    ps.events.on(Events.ACHIEVEMENT, (data: AchievementData) => {
      const label = data.name || data.achievementId;
      this.showToast(`Achievement Unlocked: ${label}`, 2200, '#ffdd55');
    });

    ps.events.on('TUTORIAL_ADVANCE', (data: TutorialAdvanceData) => {
      this.tutorialVisible = data.active;
      this.tutorialTargetTile = data.targetTile;
      this.tutorialBox.setVisible(data.active);
      this.tutorialText.setVisible(data.active);
      this.tutorialArrow.setVisible(data.active && Boolean(data.targetTile));
      this.tutorialText.setText(data.text ?? '');
    });
  }

  private selectHotbarSlot(slotIndex: number): void {
    this.playScene.player.selectedSlot = Phaser.Math.Clamp(slotIndex, 0, HOTBAR_SIZE - 1);
    this.playScene.events.emit(Events.INVENTORY_CHANGE, { inventory: this.playScene.player.inventory });
  }

  private refreshHotbar(): void {
    for (let i = 0; i < HOTBAR_SIZE; i += 1) {
      const slot = this.playScene.player.inventory[i];
      if (slot && slot.qty > 0) {
        const itemDef = ITEMS.find((item) => item.id === slot.itemId);
        if (!itemDef) {
          this.hotbarIcons[i].setVisible(false);
          this.hotbarQtys[i].setText('');
          this.hotbarSlots[i].setStrokeStyle(1, 0x666666, 1);
          continue;
        }

        this.hotbarIcons[i].setTexture('items', itemDef.spriteIndex).setVisible(true);
        this.hotbarQtys[i].setText(slot.qty > 1 ? `${slot.qty}` : '');

        if (slot.quality === Quality.GOLD) this.hotbarSlots[i].setStrokeStyle(1, 0xffd700, 1);
        else if (slot.quality === Quality.SILVER) this.hotbarSlots[i].setStrokeStyle(1, 0xc0c0c0, 1);
        else this.hotbarSlots[i].setStrokeStyle(1, 0x666666, 1);
      } else {
        this.hotbarIcons[i].setVisible(false);
        this.hotbarQtys[i].setText('');
        this.hotbarSlots[i].setStrokeStyle(1, 0x666666, 1);
      }
    }
  }

  private refreshGold(): void {
    this.goldText.setText(`${this.playScene.player.gold}g`);
  }

  private refreshDay(): void {
    const seasonNames: Record<Season, string> = {
      [Season.SPRING]: 'Spring',
      [Season.SUMMER]: 'Summer',
      [Season.FALL]: 'Fall',
      [Season.WINTER]: 'Winter',
    };

    const c = this.playScene.calendar;
    this.dayText.setText(`${seasonNames[c.season]} Day ${c.day} Year ${c.year}`);
  }

  private refreshTime(): void {
    const t = this.playScene.calendar.timeOfDay;
    const totalMinutes = Math.floor(t * 20 * 60);
    const absoluteHour = 6 + Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;

    const normalizedHour = absoluteHour % 24;
    const isPm = normalizedHour >= 12;
    const hour12 = normalizedHour === 0 ? 12 : normalizedHour > 12 ? normalizedHour - 12 : normalizedHour;
    const ampm = isPm ? 'PM' : 'AM';

    this.timeText.setText(`${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`);
  }

  private showToast(message: string, duration: number, color = '#ffffff'): void {
    this.toastText.setText(message);
    this.toastText.setColor(color);
    this.toastText.setVisible(true);
    this.toastText.setAlpha(1);
    this.toastTimer = duration;
  }

  private openInventory(): void {
    if (this.isInventoryOpen) {
      this.closeInventory();
      return;
    }

    this.isInventoryOpen = true;
    this.applyPauseState();

    this.inventoryPanel.open(
      this.playScene.player.inventory,
      () => this.closeInventory(),
      (fromIndex: number, toIndex: number) => {
        const inv = this.playScene.player.inventory;
        const temp = inv[fromIndex];
        inv[fromIndex] = inv[toIndex];
        inv[toIndex] = temp;
        this.playScene.events.emit(Events.INVENTORY_CHANGE, { inventory: inv });
      }
    );
  }

  private closeInventory(): void {
    if (!this.isInventoryOpen) return;
    this.isInventoryOpen = false;
    this.inventoryPanel.close();
    this.applyPauseState();
  }

  private openCrafting(cooking: boolean): void {
    this.isCraftingOpen = true;
    this.craftingCookingMode = cooking;
    this.craftingPanel.setVisible(true);
    this.applyPauseState();

    this.craftingTitle.setText(cooking ? 'Cooking' : 'Crafting');
    this.populateCraftingRows();
  }

  private populateCraftingRows(): void {
    this.craftingRows.forEach((obj) => obj.destroy());
    this.craftingRows = [];

    const recipes = RECIPES.filter((recipe) => {
      if (recipe.isCooking !== this.craftingCookingMode) return false;
      return this.playScene.unlockedRecipes.includes(recipe.id);
    });

    let y = -98;
    for (const recipe of recipes.slice(0, 7)) {
      const canCraft = recipe.ingredients.every((ing) => this.playScene.countItem(ing.itemId) >= ing.qty);
      const ingredientsLabel = recipe.ingredients
        .map((ing) => {
          const def = ITEMS.find((item) => item.id === ing.itemId);
          return `${def?.name ?? ing.itemId}x${ing.qty}`;
        })
        .join(', ');

      const color = canCraft ? '#ffffff' : '#666666';
      const btn = this.add
        .text(-200, y, `${recipe.name} (${ingredientsLabel})`, {
          fontSize: '13px',
          color,
          wordWrap: { width: 392 },
        })
        .setInteractive({ useHandCursor: canCraft });

      if (canCraft) {
        btn.on('pointerover', () => btn.setColor('#ffdd44'));
        btn.on('pointerout', () => btn.setColor('#ffffff'));
        btn.on('pointerdown', () => {
          this.playScene.events.emit(Events.CRAFT_ITEM, { recipeId: recipe.id });
        });
      }

      this.craftingPanel.add(btn);
      this.craftingRows.push(btn);
      y += 38;
    }
  }

  private closeCrafting(): void {
    if (!this.isCraftingOpen) return;
    this.isCraftingOpen = false;
    this.craftingPanel.setVisible(false);
    this.craftingRows.forEach((obj) => obj.destroy());
    this.craftingRows = [];
    this.applyPauseState();
  }

  private openShop(): void {
    if (this.isShopOpen) return;

    this.isShopOpen = true;
    this.applyPauseState();

    this.shopPanel.open(
      this.playScene.player.inventory,
      this.playScene.player.gold,
      (itemId: string, qty: number) => {
        const item = ITEMS.find((entry) => entry.id === itemId);
        if (!item) return;
        const cost = Math.max(25, item.sellPrice * 2) * qty;
        this.playScene.events.emit(Events.SHOP_BUY, { itemId, qty, cost });
      },
      (slotIndex: number, qty: number) => {
        const slot = this.playScene.player.inventory[slotIndex];
        if (!slot) return;
        const item = ITEMS.find((entry) => entry.id === slot.itemId);
        if (!item) return;
        const revenue = Math.floor(item.sellPrice * (Number(slot.quality) || 1)) * qty;
        this.playScene.events.emit(Events.SHOP_SELL, { itemId: slot.itemId, qty, revenue });
      },
      () => {
        this.isShopOpen = false;
        this.applyPauseState();
      }
    );
  }

  private showDialogue(data: DialogueStartData): void {
    const npc = NPCS.find((entry) => entry.id === data.npcId);
    const text =
      data.text ??
      npc?.dialoguePool['0']?.[0] ??
      '...';
    const portraitIndex = data.portraitIndex ?? npc?.portraitIndex ?? 0;

    this.isDialogueOpen = true;
    this.applyPauseState();

    this.dialogueBox.open({
      npcId: data.npcId,
      text,
      portraitIndex,
      onAdvance: () => {
        this.isDialogueOpen = false;
        this.dialogueBox.close(false);
        this.playScene.events.emit(Events.DIALOGUE_END, { npcId: data.npcId });
        this.applyPauseState();
      },
    });
  }

  private togglePause(): void {
    this.pauseToggled = !this.pauseToggled;
    this.applyPauseState();
    if (this.pauseToggled) {
      this.showToast('PAUSED', 1000, '#ffdd55');
    }
  }

  private applyPauseState(): void {
    const panelPaused = this.isInventoryOpen || this.isCraftingOpen || this.isShopOpen || this.isDialogueOpen;
    this.playScene.dayPaused = this.pauseToggled || panelPaused;
  }
}
