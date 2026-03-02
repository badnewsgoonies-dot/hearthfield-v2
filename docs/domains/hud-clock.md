# Worker: HUD Clock & Weather Display

## Scope
Create ONLY: src/systems/hudClock.ts
Do NOT modify any existing files.

## Required reading
- src/types.ts (WeatherType — check src/systems/weather.ts for the enum)
- src/systems/weather.ts (WeatherType enum values: SUNNY, CLOUDY, RAIN, STORM, SNOW)

## Task
Create a HUDClock class that renders a visual analog clock face and weather icon on the game HUD.

## Interface:
```typescript
import Phaser from 'phaser';

export class HUDClock {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  
  constructor(scene: Phaser.Scene, x: number, y: number);
  
  /** Update clock with time progress (0-1 representing 6AM to 6AM) and weather */
  update(timeProgress: number, weather: string): void;
  
  /** Clean up */
  destroy(): void;
}
```

## Visual requirements — Clock:
- Circle face: 28px radius, fill 0x222244, stroke 0xaabbcc 2px
- Hour hand: 16px long, 3px wide, white
- Minute hand: 22px long, 2px wide, 0xaabbcc
- Center dot: 3px radius, white
- Time maps: progress 0 = 6:00 AM, 0.25 = 12:00 PM, 0.5 = 6:00 PM, 0.75 = 12:00 AM
- Hour hand rotates once per in-game day (360° over progress 0-1)
- Minute hand rotates 12 times per in-game day
- Small "AM"/"PM" text below clock (9px, white)

## Visual requirements — Weather icon (drawn with Graphics, below clock):
- SUNNY: yellow circle (0xffdd44) with 8 short ray lines
- CLOUDY: gray rounded rectangles (0x999999, 0xbbbbbb) overlapping
- RAIN: cloud shape + 3 blue diagonal lines (0x5588cc)
- STORM: cloud + yellow zigzag lightning bolt (0xffdd00) + rain lines
- SNOW: cloud shape + 3 white dots (0xffffff)
- Icon size: ~20x16px, centered below clock

## Validation
npx tsc --noEmit must pass.

## When done
Write completion report to status/workers/hud-clock.md
