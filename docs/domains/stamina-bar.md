# Worker: Stamina Bar Renderer  

## Scope
Create ONLY: src/systems/staminaBar.ts
Do NOT modify any existing files.

## Required reading
- src/types.ts (check for stamina-related types)

## Task
Create a StaminaBar class that renders a visual stamina/energy bar on the HUD.

## Interface:
```typescript
import Phaser from 'phaser';

export class StaminaBar {
  constructor(scene: Phaser.Scene, x: number, y: number);
  
  /** Update the bar with current/max stamina values */
  update(current: number, max: number): void;
  
  /** Show low stamina warning pulse */
  showWarning(): void;
  
  destroy(): void;
}
```

## Visual requirements:
- Vertical bar (12px wide, 80px tall)
- Background: dark (0x1a1a2e) with 1px border (0x4a4a6a)
- Fill: gradient from green (0x44cc44) at top to yellow (0xddcc00) at 50% to red (0xff4444) at bottom
- Fill height = (current/max) * barHeight
- When current < 25% max: bar pulses alpha between 0.6 and 1.0 (sine wave, 500ms cycle)
- Small "E" label above bar (10px, white, for "Energy")
- Number display below: "X/Y" in small text (9px)
- Depth: 9995

## Validation
npx tsc --noEmit must pass.

## When done
Write completion report to status/workers/stamina-bar.md
