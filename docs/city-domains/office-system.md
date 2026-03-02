# Worker: Office Job System

## Scope
Create ONLY: src/systems/officeJob.ts
Do NOT modify any existing files.

## Required reading
- src/types.ts (JobRank, JobState, JOB_SALARY, Events, Season)

## Task
Create the office job system that manages the player's career progression.

## Exports:
```typescript
import { JobRank, JobState, JOB_SALARY, Season } from '../types';

export interface WorkResult {
  salary: number;
  event: OfficeEvent | null;
  message: string;
  staminaCost: number;     // percentage of max stamina (0-100)
  performanceChange: number; // +/- to performance rating
}

export interface OfficeEvent {
  id: string;
  name: string;
  description: string;
  salaryMultiplier: number;  // 1.0 = normal, 2.0 = double
  staminaMultiplier: number; // 1.0 = normal
  performanceBonus: number;  // extra perf points
}

export class OfficeJobSystem {
  private state: JobState;
  
  constructor();
  
  /** Get current job state */
  getState(): JobState;
  
  /** Load state from save data */
  loadState(state: JobState): void;
  
  /** Perform a day of work. Returns salary earned + any events */
  work(currentStamina: number, maxStamina: number, season: Season, day: number): WorkResult;
  
  /** Check if player qualifies for promotion. Returns new rank or null */
  checkPromotion(): JobRank | null;
  
  /** Apply promotion */
  promote(): void;
  
  /** Call at start of new day */
  newDay(): void;
  
  /** Skip work (break streak) */
  skipWork(): void;
  
  /** Get promotion requirements for next rank */
  getPromotionRequirements(): { daysNeeded: number; performanceNeeded: number; nextRank: JobRank | null };
  
  /** Get rank title for display */
  static getRankTitle(rank: JobRank): string;
}
```

## Promotion requirements:
- Intern → Junior: 5 days worked, 30 performance
- Junior → Associate: 15 days, 50 performance
- Associate → Senior: 30 days, 65 performance
- Senior → Manager: 50 days, 75 performance
- Manager → Director: 80 days, 85 performance
- Director → VP: 120 days, 95 performance

## Office events (random, 20% chance per work day):
1. "Presentation Day" — salaryMult 1.5, staminaMult 1.5, perfBonus +5. "Big presentation today — give it your all!"
2. "Team Lunch" — salaryMult 1.0, staminaMult 0.5, perfBonus +2. "Free lunch from the boss!"
3. "Crunch Time" — salaryMult 2.0, staminaMult 2.0, perfBonus +8. "Deadline rush — overtime pays double."
4. "Office Party" — salaryMult 0.5, staminaMult 0.3, perfBonus +3. "Someone's birthday! Not much work getting done."
5. "Client Visit" — salaryMult 1.5, staminaMult 1.2, perfBonus +6. "Important client meeting — impress them!"
6. "Server Outage" — salaryMult 1.0, staminaMult 0.8, perfBonus +1. "Systems are down — everyone's waiting around."

## Work calculation:
- basePay = JOB_SALARY[rank]
- streakBonus = min(streak * 0.02, 0.20) (max 20% bonus for 10-day streak)
- salary = floor(basePay * (1 + streakBonus) * event.salaryMultiplier)
- staminaCost = floor(40 * event.staminaMultiplier)
- performanceChange = floor(3 + event.performanceBonus) if worked, -5 if skipped
- Performance clamps 0-100

## Rank titles:
Intern → "Office Intern", Junior → "Junior Associate", Associate → "Associate", Senior → "Senior Associate", Manager → "Department Manager", Director → "Division Director", VP → "Vice President"

## Validation
npx tsc --noEmit must pass.

## When done
Write completion report to status/city-workers/office-system.md
