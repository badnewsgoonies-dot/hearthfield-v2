import Phaser from 'phaser';

/**
 * Shared touch input state — written by UIScene, read by PlayScene.
 */
export interface TouchInputState {
  dx: number;       // -1..1 horizontal
  dy: number;       // -1..1 vertical
  toolJust: boolean; // space equivalent (single-fire)
  interactJust: boolean; // E equivalent (single-fire)
  inventoryJust: boolean; // I equivalent (single-fire)
  pauseJust: boolean; // ESC equivalent (single-fire)
}

const DPAD_RADIUS = 52;
const DPAD_CENTER_DEAD = 14;
const BTN_RADIUS = 28;
const ALPHA_REST = 0.35;
const ALPHA_ACTIVE = 0.65;

export class TouchControls {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private joystickBase: Phaser.GameObjects.Arc;
  private joystickThumb: Phaser.GameObjects.Arc;
  private btnTool: Phaser.GameObjects.Container;
  private btnInteract: Phaser.GameObjects.Container;
  private btnInventory: Phaser.GameObjects.Container;
  private btnPause: Phaser.GameObjects.Container;
  private allButtons: { container: Phaser.GameObjects.Container; key: keyof TouchInputState }[] = [];

  private joystickPointerId: number | null = null;
  private joystickOriginX = 0;
  private joystickOriginY = 0;

  public state: TouchInputState = {
    dx: 0, dy: 0,
    toolJust: false,
    interactJust: false,
    inventoryJust: false,
    pauseJust: false,
  };

  private isTouchDevice: boolean;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.isTouchDevice = !!(
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0
    );

    this.container = scene.add.container(0, 0).setDepth(950).setScrollFactor(0);

    // --- Virtual joystick (bottom-left) ---
    const w = scene.scale.width;
    const h = scene.scale.height;
    const padX = 80;
    const padY = h - 100;

    this.joystickBase = scene.add.circle(padX, padY, DPAD_RADIUS, 0xffffff, ALPHA_REST);
    this.joystickBase.setStrokeStyle(2, 0xffffff, ALPHA_REST + 0.1);
    this.joystickThumb = scene.add.circle(padX, padY, 20, 0xffffff, ALPHA_ACTIVE);
    this.container.add([this.joystickBase, this.joystickThumb]);

    // --- Action buttons (bottom-right) ---
    this.btnTool = this.makeButton(w - 70, h - 130, '⚔', 0x88cc44);
    this.btnInteract = this.makeButton(w - 70, h - 68, 'E', 0x44aaff);
    this.btnInventory = this.makeButton(w - 44, 50, '▤', 0xcc8844);
    this.btnPause = this.makeButton(44, 50, '⏸', 0x888888);
    this.container.add([this.btnTool, this.btnInteract, this.btnInventory, this.btnPause]);

    this.allButtons = [
      { container: this.btnTool, key: 'toolJust' },
      { container: this.btnInteract, key: 'interactJust' },
      { container: this.btnInventory, key: 'inventoryJust' },
      { container: this.btnPause, key: 'pauseJust' },
    ];

    // Only show on touch devices
    this.container.setVisible(this.isTouchDevice);

    if (this.isTouchDevice) {
      this.wireTouch();
    }
  }

  private makeButton(x: number, y: number, label: string, color: number): Phaser.GameObjects.Container {
    const bg = this.scene.add.circle(0, 0, BTN_RADIUS, color, ALPHA_REST);
    bg.setStrokeStyle(2, 0xffffff, 0.3);
    const txt = this.scene.add.text(0, 0, label, {
      fontSize: '20px', color: '#ffffff', fontFamily: 'monospace',
    }).setOrigin(0.5);
    const c = this.scene.add.container(x, y, [bg, txt]);
    return c;
  }

  private wireTouch() {
    const scene = this.scene;

    // Joystick — use full-screen zone on left half
    scene.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      // Check if hitting a button first — skip joystick if so
      for (const btn of this.allButtons) {
        const dist = Phaser.Math.Distance.Between(p.x, p.y, btn.container.x, btn.container.y);
        if (dist < BTN_RADIUS + 14) return;
      }
      // Left half = joystick, but not too close to bottom (hotbar area)
      if (p.x < scene.scale.width * 0.4 && p.y < scene.scale.height - 55 && this.joystickPointerId === null) {
        this.joystickPointerId = p.id;
        this.joystickOriginX = p.x;
        this.joystickOriginY = p.y;
        // Move base to touch point
        this.joystickBase.setPosition(p.x, p.y);
        this.joystickThumb.setPosition(p.x, p.y);
        this.joystickBase.setAlpha(ALPHA_ACTIVE);
      }
    });

    scene.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (p.id === this.joystickPointerId) {
        const dx = p.x - this.joystickOriginX;
        const dy = p.y - this.joystickOriginY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < DPAD_CENTER_DEAD) {
          this.state.dx = 0;
          this.state.dy = 0;
          this.joystickThumb.setPosition(this.joystickOriginX, this.joystickOriginY);
        } else {
          const clamped = Math.min(dist, DPAD_RADIUS);
          const nx = dx / dist;
          const ny = dy / dist;
          this.state.dx = nx * (clamped / DPAD_RADIUS);
          this.state.dy = ny * (clamped / DPAD_RADIUS);
          this.joystickThumb.setPosition(
            this.joystickOriginX + nx * clamped,
            this.joystickOriginY + ny * clamped,
          );
        }
      }
    });

    const releaseJoystick = (p: Phaser.Input.Pointer) => {
      if (p.id === this.joystickPointerId) {
        this.joystickPointerId = null;
        this.state.dx = 0;
        this.state.dy = 0;
        // Reset to default position
        const padX = 80;
        const padY = scene.scale.height - 100;
        this.joystickBase.setPosition(padX, padY);
        this.joystickThumb.setPosition(padX, padY);
        this.joystickBase.setAlpha(ALPHA_REST);
      }
    };
    scene.input.on('pointerup', releaseJoystick);
    scene.input.on('pointerupoutside', releaseJoystick);

    // Action buttons — hit test all buttons
    scene.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      // Skip if this is the joystick pointer
      if (p.id === this.joystickPointerId) return;

      for (const btn of this.allButtons) {
        const dist = Phaser.Math.Distance.Between(
          p.x, p.y,
          btn.container.x, btn.container.y,
        );
        if (dist < BTN_RADIUS + 14) {
          (this.state as any)[btn.key] = true;
          const bg = btn.container.first as Phaser.GameObjects.Arc;
          bg.setAlpha(ALPHA_ACTIVE);
          scene.time.delayedCall(120, () => {
            bg.setAlpha(ALPHA_REST);
          });
          break; // only one button per tap
        }
      }
    });
  }

  /** Call at end of update() to reset single-fire flags */
  consumeJustPressed(): void {
    this.state.toolJust = false;
    this.state.interactJust = false;
    this.state.inventoryJust = false;
    this.state.pauseJust = false;
  }

  /** Gamepad polling — call every frame */
  pollGamepad(): void {
    const gp = this.scene.input.gamepad;
    if (!gp || !gp.pad1) return;
    const pad = gp.pad1;

    // Show controls if gamepad connected
    this.container.setVisible(true);

    // Left stick
    const lx = pad.axes.length > 0 ? pad.axes[0].getValue() : 0;
    const ly = pad.axes.length > 1 ? pad.axes[1].getValue() : 0;
    const dead = 0.15;
    this.state.dx = Math.abs(lx) > dead ? lx : 0;
    this.state.dy = Math.abs(ly) > dead ? ly : 0;

    // D-pad fallback
    if (this.state.dx === 0 && this.state.dy === 0) {
      if (pad.left) this.state.dx = -1;
      if (pad.right) this.state.dx = 1;
      if (pad.up) this.state.dy = -1;
      if (pad.down) this.state.dy = 1;
    }

    // A = tool, B = interact (Xbox layout)
    if (pad.A && !(pad as any)._prevA) this.state.toolJust = true;
    if (pad.B && !(pad as any)._prevB) this.state.interactJust = true;
    (pad as any)._prevA = pad.A;
    (pad as any)._prevB = pad.B;
  }

  reposition(): void {
    const w = this.scene.scale.width;
    const h = this.scene.scale.height;
    // Reset joystick default
    this.joystickBase.setPosition(80, h - 100);
    this.joystickThumb.setPosition(80, h - 100);
    // Buttons
    this.btnTool.setPosition(w - 70, h - 130);
    this.btnInteract.setPosition(w - 70, h - 68);
    this.btnInventory.setPosition(w - 44, 50);
    this.btnPause.setPosition(44, 50);
  }
}
