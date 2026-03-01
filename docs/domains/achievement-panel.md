# Worker: Achievement Panel

## Scope
Create ONLY: `src/systems/achievementPanel.ts`
Do NOT modify any existing files.

## Required reading
- src/types.ts (especially the Achievement interface if it exists)
- src/data/achievementData.ts (ACHIEVEMENTS array, achievement definitions)
- src/systems/achievements.ts (AchievementSystem, getState())

## Task
Create an AchievementPanel class — a toggleable overlay UI that shows all achievements with unlock status.

## Interface (export exactly this):
```typescript
import Phaser from 'phaser';

export interface AchievementPanelConfig {
  scene: Phaser.Scene;
  x: number;
  y: number;
  width: number;
  height: number;
}

export class AchievementPanel {
  constructor(config: AchievementPanelConfig);
  
  /** Show the panel with current achievement data */
  show(unlockedIds: string[], allAchievements: Array<{ id: string; name: string; description: string; icon: string }>): void;
  
  /** Hide the panel */
  hide(): void;
  
  /** Toggle visibility */
  toggle(unlockedIds: string[], allAchievements: Array<{ id: string; name: string; description: string; icon: string }>): void;
  
  /** Is currently visible */
  isVisible(): boolean;
  
  /** Destroy all game objects */
  destroy(): void;
}
```

## Visual design
- Dark semi-transparent background (0x1a1a2e, alpha 0.92)
- Title: "Achievements" in gold (#ffdd88), centered at top
- Close button (X) in top-right corner, clickable
- Scrollable grid of achievement cards (2 columns)
- Each card:
  - 120x60px dark card (0x2a2a3e)
  - Icon on left (text emoji from achievement data)
  - Name in white, description in gray below
  - Unlocked: full color, gold border glow
  - Locked: dimmed (alpha 0.4), "???" instead of description
- Counter at bottom: "12/28 Unlocked"
- Scroll with mousewheel or drag (use a Phaser mask + container offset)

## Rendering
- All drawn with Phaser Graphics + Text objects
- Contained in a Phaser.GameObjects.Container for easy show/hide
- Use setDepth(100) to render above everything
- Panel should be 600x400, centered on 800x600 canvas (so x=100, y=100)

## Validation
File must compile with: `npx tsc --noEmit`
Must export AchievementPanel class.

## When done
Write completion report to status/workers/achievement-panel.md
