import Phaser from 'phaser';
import { SAVE_KEY, CITY_SAVE_KEY, Scenes } from '../types';

interface Cloud {
  x: number;
  y: number;
  width: number;
  speed: number;
}

interface SeasonParticle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  drift: number;
  phase: number;
  kind: 'leaf' | 'petal' | 'snow';
}

interface MenuButton {
  container: Phaser.GameObjects.Container;
  bg: Phaser.GameObjects.Rectangle;
  text: Phaser.GameObjects.Text;
  enabled: boolean;
  onClick?: () => void;
}

export class MenuScene extends Phaser.Scene {
  private bgGraphics!: Phaser.GameObjects.Graphics;
  private cloudGraphics!: Phaser.GameObjects.Graphics;
  private farmGraphics!: Phaser.GameObjects.Graphics;
  private particleGraphics!: Phaser.GameObjects.Graphics;

  private clouds: Cloud[] = [];
  private particles: SeasonParticle[] = [];

  private titleText!: Phaser.GameObjects.Text;
  private subtitleText!: Phaser.GameObjects.Text;
  private versionText!: Phaser.GameObjects.Text;

  private menuButtons: MenuButton[] = [];
  private controlsOverlay?: Phaser.GameObjects.Container;
  private animTime = 0;
  private pendingMode: 'farm' | 'city' = 'farm';

  private namePrompt?: HTMLDivElement;
  private promptReposition?: () => void;

  constructor() {
    super(Scenes.MENU);
  }

  create(): void {
    const { width, height, centerX } = this.cameras.main;

    this.cameras.main.fadeIn(500, 0, 0, 0);

    this.bgGraphics = this.add.graphics();
    this.cloudGraphics = this.add.graphics();
    this.farmGraphics = this.add.graphics();
    this.particleGraphics = this.add.graphics();

    this.createClouds(width);
    this.createSeasonParticles(width, height);
    this.drawBackground(width, height);

    this.titleText = this.add
      .text(centerX, 92, 'Hearthfield', {
        fontFamily: 'monospace',
        fontSize: '88px',
        fontStyle: 'bold',
        color: '#ffe27a',
        stroke: '#5c3b14',
        strokeThickness: 10,
      })
      .setOrigin(0.5)
      .setShadow(0, 6, '#2a1a0a', 0.65, false, true)
      .setAlpha(0)
      .setY(74);

    this.subtitleText = this.add
      .text(centerX, 152, 'Farm life or city life — you choose', {
        fontFamily: 'monospace',
        fontSize: '24px',
        color: '#fff3bd',
        stroke: '#5c3b14',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setShadow(0, 3, '#2a1a0a', 0.5, false, true)
      .setAlpha(0)
      .setY(138);

    const hasSave = this.hasSaveData();
    const hasCitySave = this.hasCitySaveData();
    const baseY = 380;

    const newFarmBtn = this.createMenuButton('🌾  New Farm', baseY, true, () => {
      this.pendingMode = 'farm';
      this.openNamePrompt();
    });

    const continueFarmBtn = this.createMenuButton('🌾  Continue Farm', baseY + 52, hasSave, () => {
      this.beginSceneTransition(() => this.scene.start(Scenes.PLAY, { loadSave: true }));
    });

    const newCityBtn = this.createMenuButton('🏙️  New City', baseY + 114, true, () => {
      this.pendingMode = 'city';
      this.openNamePrompt();
    });

    const continueCityBtn = this.createMenuButton('🏙️  Continue City', baseY + 166, hasCitySave, () => {
      this.beginSceneTransition(() => this.scene.start(Scenes.CITY_PLAY, { loadSave: true }));
    });

    this.menuButtons = [newFarmBtn, continueFarmBtn, newCityBtn, continueCityBtn];

    this.versionText = this.add
      .text(width - 14, height - 12, 'v0.1.0', {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#ffe8a3',
      })
      .setOrigin(1, 1)
      .setShadow(0, 2, '#2a1a0a', 0.5, false, true)
      .setAlpha(0);

    this.createControlsOverlay(width, height);

    this.input.keyboard?.on('keydown-ESC', () => {
      if (this.controlsOverlay?.visible) {
        this.toggleControlsOverlay(false);
      }
    });

    this.tweens.add({
      targets: this.titleText,
      alpha: 1,
      y: 92,
      duration: 700,
      ease: 'Cubic.easeOut',
    });

    this.tweens.add({
      targets: this.subtitleText,
      alpha: 1,
      y: 152,
      duration: 700,
      delay: 120,
      ease: 'Cubic.easeOut',
    });

    this.tweens.add({
      targets: [newFarmBtn.container, continueFarmBtn.container, newCityBtn.container, continueCityBtn.container, this.versionText],
      alpha: 1,
      y: '+=0',
      duration: 700,
      delay: 240,
      ease: 'Quad.easeOut',
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanupDom, this);
    this.events.once(Phaser.Scenes.Events.DESTROY, this.cleanupDom, this);
  }

  update(_time: number, delta: number): void {
    this.animTime += delta;

    const { width, height } = this.cameras.main;
    this.updateClouds(delta, width);
    this.updateParticles(delta, width, height);
    this.drawClouds();
    this.drawFarm(width, height);
    this.drawParticles();
  }

  private beginSceneTransition(onComplete: () => void): void {
    this.cameras.main.fadeOut(550, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, onComplete);
  }

  private drawBackground(width: number, height: number): void {
    this.bgGraphics.clear();

    this.bgGraphics.fillGradientStyle(0x8cd2ff, 0x8cd2ff, 0xe3f5ff, 0xe3f5ff, 1);
    this.bgGraphics.fillRect(0, 0, width, height);

    this.bgGraphics.fillStyle(0xf7d86f, 1);
    this.bgGraphics.fillCircle(width - 86, 86, 44);

    this.bgGraphics.fillStyle(0x7ebf61, 1);
    this.bgGraphics.fillEllipse(width * 0.3, height * 0.82, width * 0.95, 260);

    this.bgGraphics.fillStyle(0x5e9c4a, 1);
    this.bgGraphics.fillEllipse(width * 0.72, height * 0.86, width, 220);

    this.bgGraphics.fillStyle(0x4c8a3f, 1);
    this.bgGraphics.fillRect(0, height - 90, width, 90);
  }

  private createClouds(width: number): void {
    this.clouds = [];

    for (let i = 0; i < 7; i += 1) {
      this.clouds.push({
        x: Phaser.Math.Between(0, width),
        y: Phaser.Math.Between(42, 220),
        width: Phaser.Math.Between(72, 138),
        speed: Phaser.Math.FloatBetween(8, 20),
      });
    }
  }

  private updateClouds(delta: number, width: number): void {
    for (const cloud of this.clouds) {
      cloud.x += cloud.speed * (delta / 1000);
      if (cloud.x > width + cloud.width) {
        cloud.x = -cloud.width;
        cloud.y = Phaser.Math.Between(42, 220);
      }
    }
  }

  private drawClouds(): void {
    this.cloudGraphics.clear();

    for (const cloud of this.clouds) {
      this.cloudGraphics.fillStyle(0xffffff, 0.78);
      this.cloudGraphics.fillEllipse(cloud.x - cloud.width * 0.2, cloud.y + 4, cloud.width * 0.52, 32);
      this.cloudGraphics.fillEllipse(cloud.x + cloud.width * 0.04, cloud.y - 10, cloud.width * 0.56, 40);
      this.cloudGraphics.fillEllipse(cloud.x + cloud.width * 0.32, cloud.y + 5, cloud.width * 0.5, 30);
    }
  }

  private drawFarm(width: number, height: number): void {
    const centerX = width * 0.5;
    const baseY = height * 0.7;
    const sway = Math.sin(this.animTime * 0.0025) * 2;

    this.farmGraphics.clear();

    this.farmGraphics.fillStyle(0x6e4b2e, 1);
    this.farmGraphics.fillRect(centerX - 78, baseY - 48, 156, 96);

    this.farmGraphics.fillStyle(0xa26132, 1);
    this.farmGraphics.fillTriangle(
      centerX - 94,
      baseY - 44,
      centerX + 94,
      baseY - 44,
      centerX,
      baseY - 118,
    );

    this.farmGraphics.fillStyle(0xe8d8b2, 1);
    this.farmGraphics.fillRect(centerX - 16, baseY + 2, 32, 46);

    this.farmGraphics.fillStyle(0x9fd4ff, 1);
    this.farmGraphics.fillRect(centerX - 58, baseY - 20, 26, 20);
    this.farmGraphics.fillRect(centerX + 32, baseY - 20, 26, 20);

    for (let i = 0; i < 6; i += 1) {
      const rowX = centerX - 175 + i * 58;
      this.farmGraphics.fillStyle(0x7f4e2c, 1);
      this.farmGraphics.fillRect(rowX, baseY + 48, 36, 18);

      this.farmGraphics.fillStyle(0x6cb34f, 1);
      this.farmGraphics.fillRect(rowX + 6 + sway, baseY + 40, 4, 8);
      this.farmGraphics.fillRect(rowX + 14 - sway, baseY + 37, 4, 11);
      this.farmGraphics.fillRect(rowX + 22 + sway * 0.8, baseY + 39, 4, 9);
    }

    this.farmGraphics.fillStyle(0x5d3c21, 1);
    for (let i = 0; i < 11; i += 1) {
      const postX = centerX - 220 + i * 42;
      this.farmGraphics.fillRect(postX, baseY + 24, 7, 20);
    }

    this.farmGraphics.fillStyle(0x8b6039, 1);
    this.farmGraphics.fillRect(centerX - 220, baseY + 30, 430, 5);
    this.farmGraphics.fillRect(centerX - 220, baseY + 39, 430, 4);

    this.drawTree(centerX - 250, baseY + 20, sway);
    this.drawTree(centerX + 250, baseY + 14, -sway);
  }

  private drawTree(x: number, y: number, sway: number): void {
    this.farmGraphics.fillStyle(0x6b4427, 1);
    this.farmGraphics.fillRect(x - 10, y - 70, 20, 74);

    this.farmGraphics.fillStyle(0x4b8f3f, 1);
    this.farmGraphics.fillCircle(x + sway, y - 94, 32);
    this.farmGraphics.fillCircle(x - 26 + sway * 0.4, y - 72, 26);
    this.farmGraphics.fillCircle(x + 24 + sway * 0.4, y - 72, 24);
  }

  private createSeasonParticles(width: number, height: number): void {
    this.particles = [];
    const kinds: Array<SeasonParticle['kind']> = ['leaf', 'petal', 'snow'];

    for (let i = 0; i < 36; i += 1) {
      this.particles.push({
        x: Phaser.Math.Between(0, width),
        y: Phaser.Math.Between(0, height),
        size: Phaser.Math.Between(2, 5),
        speedY: Phaser.Math.FloatBetween(14, 34),
        drift: Phaser.Math.FloatBetween(8, 30),
        phase: Phaser.Math.FloatBetween(0, Math.PI * 2),
        kind: kinds[i % kinds.length],
      });
    }
  }

  private updateParticles(delta: number, width: number, height: number): void {
    for (const p of this.particles) {
      p.y += p.speedY * (delta / 1000);
      p.phase += delta * 0.0018;
      p.x += Math.sin(p.phase) * p.drift * (delta / 1000);

      if (p.y > height + 10) {
        p.y = -10;
        p.x = Phaser.Math.Between(0, width);
      }

      if (p.x < -16) {
        p.x = width + 16;
      }
      if (p.x > width + 16) {
        p.x = -16;
      }
    }
  }

  private drawParticles(): void {
    this.particleGraphics.clear();

    for (const p of this.particles) {
      if (p.kind === 'leaf') {
        this.particleGraphics.fillStyle(0xd1a34a, 0.8);
        this.particleGraphics.fillEllipse(p.x, p.y, p.size + 3, p.size);
      } else if (p.kind === 'petal') {
        this.particleGraphics.fillStyle(0xf4b4c2, 0.8);
        this.particleGraphics.fillEllipse(p.x, p.y, p.size + 2, p.size + 1);
      } else {
        this.particleGraphics.fillStyle(0xffffff, 0.8);
        this.particleGraphics.fillCircle(p.x, p.y, p.size * 0.45);
      }
    }
  }

  private createMenuButton(
    label: string,
    y: number,
    enabled: boolean,
    onClick?: () => void,
  ): MenuButton {
    const cx = this.cameras.main.centerX;

    const bg = this.add.rectangle(cx, y, 254, 50, enabled ? 0x5f8f41 : 0x676767, enabled ? 0.92 : 0.58);
    bg.setStrokeStyle(3, enabled ? 0xe2d082 : 0x969696, 0.95);

    const text = this.add
      .text(cx, y, label, {
        fontFamily: 'monospace',
        fontSize: '32px',
        color: enabled ? '#fff8d4' : '#d0d0d0',
        stroke: enabled ? '#28411e' : '#555555',
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setShadow(0, 3, '#1f1308', 0.5, false, true);

    const container = this.add.container(0, 0, [bg, text]).setAlpha(0);

    const button: MenuButton = {
      container,
      bg,
      text,
      enabled,
      onClick,
    };

    if (!enabled) {
      return button;
    }

    bg.setInteractive({ useHandCursor: true });

    bg.on('pointerover', () => {
      bg.setFillStyle(0x74a84f, 1);
      text.setScale(1.04);
    });

    bg.on('pointerout', () => {
      bg.setFillStyle(0x5f8f41, 0.92);
      text.setScale(1);
    });

    bg.on('pointerdown', () => {
      text.setScale(0.98);
    });

    bg.on('pointerup', () => {
      text.setScale(1.04);
      button.onClick?.();
    });

    return button;
  }

  private hasSaveData(): boolean {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      return Boolean(raw && raw.trim().length > 0);
    } catch {
      return false;
    }
  }

  private hasCitySaveData(): boolean {
    try {
      const raw = localStorage.getItem(CITY_SAVE_KEY);
      return Boolean(raw && raw.trim().length > 0);
    } catch {
      return false;
    }
  }

  private createControlsOverlay(width: number, height: number): void {
    const panel = this.add.container(width / 2, height / 2);

    const bg = this.add.rectangle(0, 0, 700, 420, 0x2a1e14, 0.94);
    const border = this.add.rectangle(0, 0, 704, 424, 0xe6c67a, 0).setStrokeStyle(4, 0xe6c67a, 1);

    const title = this.add
      .text(0, -170, 'CONTROLS', {
        fontFamily: 'monospace',
        fontSize: '40px',
        fontStyle: 'bold',
        color: '#fff3cc',
      })
      .setOrigin(0.5)
      .setShadow(0, 4, '#140d06', 0.6, false, true);

    const lines = [
      'WASD / Arrow Keys  - Move',
      'E                  - Interact',
      '1-9                - Hotbar Select',
      'Space              - Use Tool',
      'Tab                - Inventory',
      'Esc                - Pause / Close',
      'F                  - Fish',
    ];

    const body = this.add
      .text(-290, -110, lines.join('\n'), {
        fontFamily: 'monospace',
        fontSize: '24px',
        color: '#fbeec8',
        lineSpacing: 14,
      })
      .setOrigin(0, 0)
      .setShadow(0, 2, '#140d06', 0.45, false, true);

    const close = this.add
      .text(0, 160, 'Close', {
        fontFamily: 'monospace',
        fontSize: '30px',
        color: '#fff5d4',
        stroke: '#3b2818',
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setShadow(0, 3, '#140d06', 0.5, false, true)
      .setInteractive({ useHandCursor: true });

    close.on('pointerover', () => close.setColor('#ffec99'));
    close.on('pointerout', () => close.setColor('#fff5d4'));
    close.on('pointerdown', () => this.toggleControlsOverlay(false));

    panel.add([bg, border, title, body, close]);
    panel.setDepth(20);
    panel.setVisible(false);

    this.controlsOverlay = panel;
  }

  private toggleControlsOverlay(show: boolean): void {
    if (!this.controlsOverlay) {
      return;
    }

    this.controlsOverlay.setVisible(show);
  }

  private openNamePrompt(): void {
    if (this.namePrompt) {
      return;
    }

    const prompt = document.createElement('div');
    prompt.style.position = 'fixed';
    prompt.style.padding = '14px';
    prompt.style.background = '#101b25';
    prompt.style.border = '3px solid #b8dfa0';
    prompt.style.boxShadow = '0 0 0 3px #263e31';
    prompt.style.fontFamily = 'monospace';
    prompt.style.zIndex = '1000';
    prompt.style.display = 'flex';
    prompt.style.flexDirection = 'column';
    prompt.style.gap = '10px';
    prompt.style.minWidth = '280px';

    const label = document.createElement('label');
    label.textContent = 'Enter your farmer name:';
    label.style.color = '#eef9d7';
    label.style.fontSize = '14px';

    const input = document.createElement('input');
    input.type = 'text';
    input.maxLength = 20;
    input.placeholder = 'Farmer';
    input.style.padding = '8px';
    input.style.fontFamily = 'monospace';
    input.style.fontSize = '16px';
    input.style.border = '2px solid #7eaf69';
    input.style.background = '#1f2f22';
    input.style.color = '#f5ffe4';

    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.gap = '8px';
    row.style.justifyContent = 'flex-end';

    const startBtn = document.createElement('button');
    startBtn.type = 'button';
    startBtn.textContent = 'Start';
    startBtn.style.fontFamily = 'monospace';
    startBtn.style.padding = '8px 14px';
    startBtn.style.cursor = 'pointer';

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.style.fontFamily = 'monospace';
    cancelBtn.style.padding = '8px 14px';
    cancelBtn.style.cursor = 'pointer';

    row.appendChild(cancelBtn);
    row.appendChild(startBtn);
    prompt.appendChild(label);
    prompt.appendChild(input);
    prompt.appendChild(row);

    const startGame = () => {
      const playerName = input.value.trim() || 'Farmer';
      this.cleanupDom();
      this.beginSceneTransition(() => this.scene.start(Scenes.INTRO, { playerName }));
    };

    startBtn.addEventListener('click', startGame);
    cancelBtn.addEventListener('click', () => this.cleanupDom());
    input.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') {
        startGame();
      } else if (ev.key === 'Escape') {
        this.cleanupDom();
      }
    });

    document.body.appendChild(prompt);

    const positionPrompt = () => {
      const rect = this.game.canvas.getBoundingClientRect();
      prompt.style.left = `${rect.left + rect.width / 2}px`;
      prompt.style.top = `${rect.top + rect.height / 2}px`;
      prompt.style.transform = 'translate(-50%, -50%)';
    };

    this.promptReposition = positionPrompt;
    window.addEventListener('resize', this.promptReposition);
    this.scale.on('resize', positionPrompt);

    positionPrompt();
    input.focus();

    this.namePrompt = prompt;
  }

  private cleanupDom(): void {
    if (this.promptReposition) {
      window.removeEventListener('resize', this.promptReposition);
      this.scale.off('resize', this.promptReposition);
      this.promptReposition = undefined;
    }

    if (this.namePrompt) {
      this.namePrompt.remove();
      this.namePrompt = undefined;
    }
  }
}
