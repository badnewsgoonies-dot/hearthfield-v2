import Phaser from 'phaser';
import { SAVE_KEY, Scenes } from '../types';

interface StarParticle {
  x: number;
  y: number;
  size: number;
  speed: number;
  twinkle: number;
}

export class MenuScene extends Phaser.Scene {
  private stars: StarParticle[] = [];
  private starGraphics!: Phaser.GameObjects.Graphics;
  private titleText!: Phaser.GameObjects.Text;
  private controlsOverlay?: Phaser.GameObjects.Container;
  private titleHue = 0.22;

  private namePrompt?: HTMLDivElement;
  private promptReposition?: () => void;

  constructor() {
    super(Scenes.MENU);
  }

  create(): void {
    const { width, height, centerX } = this.cameras.main;

    this.drawBackdrop(width, height);
    this.createStarfield(width, height);

    this.titleText = this.add
      .text(centerX, 110, 'HEARTHFIELD', {
        fontFamily: 'monospace',
        fontSize: '76px',
        fontStyle: 'bold',
        color: '#9de06f',
        stroke: '#1a2d0f',
        strokeThickness: 8,
      })
      .setOrigin(0.5)
      .setShadow(0, 5, '#0a1408', 0, false, true);

    this.add
      .text(centerX, 168, 'A farming adventure', {
        fontFamily: 'monospace',
        fontSize: '22px',
        color: '#d8efb8',
      })
      .setOrigin(0.5);

    const menuStartY = 260;
    const rowGap = 52;

    this.createMenuButton('New Game', menuStartY, () => {
      this.openNamePrompt();
    });

    if (this.hasSaveData()) {
      this.createMenuButton('Continue', menuStartY + rowGap, () => {
        this.scene.start(Scenes.PLAY, { loadSave: true });
      });
    }

    const controlsY = this.hasSaveData() ? menuStartY + rowGap * 2 : menuStartY + rowGap;
    this.createMenuButton('Controls', controlsY, () => {
      this.toggleControlsOverlay(true);
    });

    this.createControlsOverlay(width, height);

    this.input.keyboard?.on('keydown-ESC', () => {
      if (this.controlsOverlay?.visible) {
        this.toggleControlsOverlay(false);
      }
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanupDom, this);
    this.events.once(Phaser.Scenes.Events.DESTROY, this.cleanupDom, this);
  }

  update(_time: number, delta: number): void {
    this.updateStarfield(delta);
    this.cycleTitleColor(delta);
  }

  private drawBackdrop(width: number, height: number): void {
    const bg = this.add.graphics();

    bg.fillStyle(0x0f1f2d, 1);
    bg.fillRect(0, 0, width, height);

    bg.fillStyle(0x1a3042, 1);
    bg.fillRect(0, height - 160, width, 160);

    bg.fillStyle(0x253f52, 1);
    for (let i = 0; i < width; i += 18) {
      const h = 30 + ((i / 18) % 3) * 12;
      bg.fillRect(i, height - h, 16, h);
    }
  }

  private createStarfield(width: number, height: number): void {
    this.starGraphics = this.add.graphics();

    const starCount = 100;
    this.stars = [];

    for (let i = 0; i < starCount; i += 1) {
      this.stars.push({
        x: Phaser.Math.Between(0, width),
        y: Phaser.Math.Between(0, height),
        size: Phaser.Math.Between(1, 3),
        speed: Phaser.Math.FloatBetween(5, 22),
        twinkle: Phaser.Math.FloatBetween(0, Math.PI * 2),
      });
    }

    this.updateStarfield(0);
  }

  private updateStarfield(delta: number): void {
    const { width, height } = this.cameras.main;
    this.starGraphics.clear();

    for (const star of this.stars) {
      star.y += star.speed * (delta / 1000);
      star.twinkle += delta * 0.004;

      if (star.y > height + 4) {
        star.y = -4;
        star.x = Phaser.Math.Between(0, width);
      }

      const alpha = 0.35 + Math.sin(star.twinkle) * 0.25;
      this.starGraphics.fillStyle(0xffffff, Phaser.Math.Clamp(alpha, 0.1, 0.9));
      this.starGraphics.fillRect(Math.round(star.x), Math.round(star.y), star.size, star.size);
    }
  }

  private cycleTitleColor(delta: number): void {
    this.titleHue = (this.titleHue + delta * 0.00003) % 1;
    const color = Phaser.Display.Color.HSLToColor(this.titleHue, 0.65, 0.62).color
      .toString(16)
      .padStart(6, '0');

    this.titleText.setColor(`#${color}`);
  }

  private createMenuButton(
    label: string,
    y: number,
    onClick: () => void,
  ): Phaser.GameObjects.Text {
    const cx = this.cameras.main.centerX;

    const btn = this.add
      .text(cx, y, label, {
        fontFamily: 'monospace',
        fontSize: '36px',
        color: '#f2f7db',
        stroke: '#12240e',
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => {
      btn.setColor('#fff9b0');
      btn.setScale(1.05);
    });

    btn.on('pointerout', () => {
      btn.setColor('#f2f7db');
      btn.setScale(1);
    });

    btn.on('pointerdown', onClick);

    return btn;
  }

  private hasSaveData(): boolean {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      return Boolean(raw && raw.trim().length > 0);
    } catch {
      return false;
    }
  }

  private createControlsOverlay(width: number, height: number): void {
    const panel = this.add.container(width / 2, height / 2);

    const bg = this.add.rectangle(0, 0, 700, 420, 0x0d1a24, 0.95);
    const border = this.add.rectangle(0, 0, 704, 424, 0xb8dfa0, 0).setStrokeStyle(4, 0xb8dfa0, 1);

    const title = this.add
      .text(0, -170, 'CONTROLS', {
        fontFamily: 'monospace',
        fontSize: '40px',
        fontStyle: 'bold',
        color: '#f2f7db',
      })
      .setOrigin(0.5);

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
        color: '#d9f0c8',
        lineSpacing: 14,
      })
      .setOrigin(0, 0);

    const close = this.add
      .text(0, 160, 'Close', {
        fontFamily: 'monospace',
        fontSize: '30px',
        color: '#f2f7db',
        stroke: '#12240e',
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    close.on('pointerover', () => close.setColor('#fff9b0'));
    close.on('pointerout', () => close.setColor('#f2f7db'));
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
      this.scene.start(Scenes.INTRO, { playerName });
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
