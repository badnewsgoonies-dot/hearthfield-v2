# Worker: Office Job System

## Scope
Create ONLY: src/systems/officeJob.ts
Do NOT modify any existing files.

## Required reading
- src/types.ts (all interfaces)

## Task
Create an OfficeJob class managing the player's career progression.

## Interface:
```typescript
export enum OfficeRank {
  INTERN = 'intern',
  JUNIOR = 'junior', 
  SENIOR = 'senior',
  MANAGER = 'manager',
  VP = 'vp',
  CEO = 'ceo'
}

export interface OfficeState {
  rank: OfficeRank;
  daysWorked: number;
  workedToday: boolean;
  salary: number;
  reputation: number; // 0-100, affects promotion speed
  taskStreak: number; // consecutive days worked
}

export interface DailyWorkResult {
  earned: number;
  bonusEarned: number;
  reputationGained: number;
  promotionReady: boolean;
  message: string;
}

export class OfficeJob {
  private state: OfficeState;
  
  constructor();
  
  getState(): OfficeState;
  setState(state: OfficeState): void;
  
  /** Call when player enters office and presses E to work. Returns earnings + status */
  doWork(): DailyWorkResult;
  
  /** Call at start of each new day */
  newDay(): void;
  
  /** Check if promotion is available */
  canPromote(): boolean;
  
  /** Execute promotion */
  promote(): { newRank: OfficeRank; newSalary: number; message: string };
  
  /** Get save data */
  toJSON(): OfficeState;
}
```

## Business Rules:
- Salary by rank: intern=100, junior=200, senior=350, manager=500, vp=750, ceo=1000
- Promotion requirements (cumulative days worked): junior=5, senior=15, manager=30, vp=60, ceo=100
- Work streak bonus: +10% per consecutive day, max +50% at 5 days
- If player skips a day, streak resets to 0
- Reputation: +5 per work day, +2 bonus per streak day, -10 if skip day. Capped 0-100.
- Reputation >= 80 required for VP and CEO promotions (in addition to days)
- Promotion message should be celebratory and mention the new rank and salary
- doWork() should return workedToday=true and refuse if already worked today (message: "Already clocked in today!")

## Validation
npx tsc --noEmit must pass.

## When done
Write completion report to status/workers/office-system.md
