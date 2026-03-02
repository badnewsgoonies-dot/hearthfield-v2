# Worker: Office Minigame System

## Scope
Create ONLY: src/systems/officeMinigame.ts
Do NOT modify any existing files.

## Required reading
- src/types.ts (Events enum, Season)

## Task
Create an OfficeMinigame class that handles the work day loop — entering the office, doing tasks, earning performance, getting paid.

## Interface:
```typescript
import Phaser from 'phaser';

export interface WorkDay {
  tasksCompleted: number;
  totalTasks: number;
  performance: number;       // 0-100
  earnings: number;          // gold earned this shift
  overtimeMinutes: number;   // extra time worked past 5 PM
}

export interface JobLevel {
  title: string;
  baseSalary: number;         // weekly pay
  tasksPerDay: number;        // tasks to complete per shift
  requiredDaysWorked: number; // days needed for next promotion
  requiredPerformance: number; // avg performance needed for promotion
}

export const JOB_LEVELS: JobLevel[] = [
  { title: 'Intern',     baseSalary: 300,  tasksPerDay: 3, requiredDaysWorked: 5,  requiredPerformance: 50 },
  { title: 'Associate',  baseSalary: 500,  tasksPerDay: 4, requiredDaysWorked: 15, requiredPerformance: 60 },
  { title: 'Manager',    baseSalary: 800,  tasksPerDay: 5, requiredDaysWorked: 30, requiredPerformance: 70 },
  { title: 'Director',   baseSalary: 1200, tasksPerDay: 6, requiredDaysWorked: 50, requiredPerformance: 80 },
  { title: 'VP',         baseSalary: 2000, tasksPerDay: 7, requiredDaysWorked: 80, requiredPerformance: 90 },
];

export interface OfficeTask {
  type: 'email' | 'report' | 'meeting' | 'presentation' | 'code_review';
  description: string;
  difficulty: number;        // 1-5
  staminaCost: number;       // 5-15
  timeMinutes: number;       // in-game minutes to complete
  bonusGold: number;         // extra gold for completing
}

export class OfficeMinigame {
  constructor(scene: Phaser.Scene);

  /** Get current job level info */
  getJobLevel(level: number): JobLevel;

  /** Generate random tasks for a work day based on job level */
  generateTasks(jobLevel: number): OfficeTask[];

  /** Calculate performance score for a completed work day */
  calculatePerformance(tasksCompleted: number, totalTasks: number, overtimeMinutes: number): number;

  /** Check if eligible for promotion */
  checkPromotion(currentLevel: number, daysWorked: number, avgPerformance: number): boolean;

  /** Calculate weekly salary with bonuses */
  calculateWeeklyPay(jobLevel: number, avgPerformance: number): number;

  /** Get random task descriptions */
  getTaskDescriptions(type: OfficeTask['type']): string[];

  destroy(): void;
}
```

## Task descriptions (at least 3 per type):
- email: "Reply to client about Q3 projections", "Sort through 47 unread messages", "Draft team update newsletter"
- report: "Compile monthly sales figures", "Write project status summary", "Analyze competitor benchmarks"  
- meeting: "Weekly standup with the team", "Client presentation prep", "One-on-one with your manager"
- presentation: "Quarterly results deck", "New product pitch", "Team training session"
- code_review: "Review pull request #847", "Debug the API timeout issue", "Update documentation"

## Performance calculation:
- Base: (tasksCompleted / totalTasks) * 80
- Overtime bonus: +5 per 30 minutes overtime (max +15)
- Early finish bonus: +5 if all tasks done before 4 PM
- Random variance: ±5

## Validation
npx tsc --noEmit must pass.

## When done
Write completion report to status/workers/office-minigame.md
