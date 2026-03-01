/**
 * Achievement Panel — toggleable overlay showing all achievements
 * NEW FILE — does not modify any existing files
 */
import Phaser from 'phaser';

export interface AchievementPanelConfig {
  scene: Phaser.Scene;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface AchievementInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export class AchievementPanel {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private px: number;
  private py: number;
  private pw: number;
  private ph: number;
  private visible = false;
  private scrollY = 0;
  private contentContainer!: Phaser.GameObjects.Container;
  private maskGraphics!: Phaser.GameObjects.Graphics;

  constructor(config: AchievementPanelConfig) {
    this.scene = config.scene;
    this.px = config.x;
    this.py = config.y;
    this.pw = config.width;
    this.ph = config.height;
    this.container = this.scene.add.container(0, 0);
    this.container.setDepth(100);
    this.container.setVisible(false);
  }

  show(unlockedIds: string[], allAchievements: AchievementInfo[]): void {
    this.container.removeAll(true);
    this.scrollY = 0;

    // Background
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x1a1a2e, 0.92);
    bg.fillRoundedRect(this.px, this.py, this.pw, this.ph, 8);
    bg.lineStyle(2, 0xffdd88, 0.6);
    bg.strokeRoundedRect(this.px, this.py, this.pw, this.ph, 8);
    this.container.add(bg);

    // Title
    const title = this.scene.add.text(this.px + this.pw / 2, this.py + 18, 'Achievements', {
      fontSize: '18px', color: '#ffdd88', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.container.add(title);

    // Close button
    const closeBtn = this.scene.add.text(this.px + this.pw - 24, this.py + 8, 'X', {
      fontSize: '16px', color: '#ff6666', fontStyle: 'bold',
    }).setOrigin(0.5, 0).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.hide());
    this.container.add(closeBtn);

    // Counter
    const unlocked = allAchievements.filter(a => unlockedIds.includes(a.id)).length;
    const counter = this.scene.add.text(this.px + this.pw / 2, this.py + this.ph - 18, `${unlocked}/${allAchievements.length} Unlocked`, {
      fontSize: '12px', color: '#aaaacc',
    }).setOrigin(0.5);
    this.container.add(counter);

    // Content area with mask
    const contentY = this.py + 40;
    const contentH = this.ph - 70;
    this.maskGraphics = this.scene.add.graphics();
    this.maskGraphics.fillStyle(0xffffff);
    this.maskGraphics.fillRect(this.px + 8, contentY, this.pw - 16, contentH);
    const mask = this.maskGraphics.createGeometryMask();

    this.contentContainer = this.scene.add.container(0, 0);
    this.contentContainer.setMask(mask);
    this.container.add(this.contentContainer);

    // Achievement cards (2 columns)
    const colW = (this.pw - 32) / 2;
    const cardH = 56;
    const gap = 6;
    const startX = this.px + 12;

    for (let i = 0; i < allAchievements.length; i++) {
      const ach = allAchievements[i];
      const isUnlocked = unlockedIds.includes(ach.id);
      const col = i % 2;
      const row = Math.floor(i / 2);
      const cx = startX + col * (colW + 8);
      const cy = contentY + 4 + row * (cardH + gap);

      const card = this.scene.add.graphics();
      if (isUnlocked) {
        card.lineStyle(1, 0xffdd88, 0.5);
        card.fillStyle(0x2a3a4e, 1);
      } else {
        card.fillStyle(0x2a2a3e, 1);
      }
      card.fillRoundedRect(cx, cy, colW, cardH, 4);
      if (isUnlocked) card.strokeRoundedRect(cx, cy, colW, cardH, 4);
      this.contentContainer.add(card);

      // Icon
      const iconText = this.scene.add.text(cx + 8, cy + cardH / 2, isUnlocked ? ach.icon : '🔒', {
        fontSize: '20px',
      }).setOrigin(0, 0.5).setAlpha(isUnlocked ? 1 : 0.4);
      this.contentContainer.add(iconText);

      // Name
      const nameText = this.scene.add.text(cx + 36, cy + 10, ach.name, {
        fontSize: '11px', color: isUnlocked ? '#ffffff' : '#666688', fontStyle: 'bold',
      }).setAlpha(isUnlocked ? 1 : 0.5);
      this.contentContainer.add(nameText);

      // Description
      const descText = this.scene.add.text(cx + 36, cy + 28, isUnlocked ? ach.description : '???', {
        fontSize: '9px', color: isUnlocked ? '#aaaacc' : '#444466',
        wordWrap: { width: colW - 44 },
      }).setAlpha(isUnlocked ? 1 : 0.4);
      this.contentContainer.add(descText);
    }

    // Scroll handling
    this.scene.input.on('wheel', (_p: Phaser.Input.Pointer, _gos: Phaser.GameObjects.GameObject[], _dx: number, dy: number) => {
      if (!this.visible) return;
      const totalRows = Math.ceil(allAchievements.length / 2);
      const totalH = totalRows * (cardH + gap);
      const maxScroll = Math.max(0, totalH - contentH);
      this.scrollY = Phaser.Math.Clamp(this.scrollY + dy * 0.5, 0, maxScroll);
      this.contentContainer.setY(-this.scrollY);
    });

    this.container.setVisible(true);
    this.visible = true;
  }

  hide(): void {
    this.container.setVisible(false);
    this.visible = false;
  }

  toggle(unlockedIds: string[], allAchievements: AchievementInfo[]): void {
    if (this.visible) this.hide();
    else this.show(unlockedIds, allAchievements);
  }

  isVisible(): boolean {
    return this.visible;
  }

  destroy(): void {
    this.container.destroy();
    if (this.maskGraphics) this.maskGraphics.destroy();
  }
}
