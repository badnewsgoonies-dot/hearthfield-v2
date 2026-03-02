import Phaser from 'phaser';
import { clamp } from '../types';

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

const TASK_DESCRIPTIONS: Record<OfficeTask['type'], string[]> = {
  email: [
    'Reply to client about Q3 projections',
    'Sort through 47 unread messages',
    'Draft team update newsletter',
  ],
  report: [
    'Compile monthly sales figures',
    'Write project status summary',
    'Analyze competitor benchmarks',
  ],
  meeting: [
    'Weekly standup with the team',
    'Client presentation prep',
    'One-on-one with your manager',
  ],
  presentation: [
    'Quarterly results deck',
    'New product pitch',
    'Team training session',
  ],
  code_review: [
    'Review pull request #847',
    'Debug the API timeout issue',
    'Update documentation',
  ],
};

const TASK_TYPES: OfficeTask['type'][] = ['email', 'report', 'meeting', 'presentation', 'code_review'];

export class OfficeMinigame {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /** Get current job level info */
  getJobLevel(level: number): JobLevel {
    const idx = clamp(level, 0, JOB_LEVELS.length - 1);
    return JOB_LEVELS[idx];
  }

  /** Generate random tasks for a work day based on job level */
  generateTasks(jobLevel: number): OfficeTask[] {
    const level = this.getJobLevel(jobLevel);
    const tasks: OfficeTask[] = [];

    for (let i = 0; i < level.tasksPerDay; i++) {
      const type = TASK_TYPES[Math.floor(Math.random() * TASK_TYPES.length)];
      const descriptions = TASK_DESCRIPTIONS[type];
      const description = descriptions[Math.floor(Math.random() * descriptions.length)];
      const difficulty = Math.floor(Math.random() * 5) + 1; // 1-5
      const staminaCost = 5 + Math.floor(Math.random() * 11); // 5-15
      const timeMinutes = difficulty * 10 + Math.floor(Math.random() * 20); // scaled by difficulty
      const bonusGold = difficulty * 10;

      tasks.push({ type, description, difficulty, staminaCost, timeMinutes, bonusGold });
    }

    return tasks;
  }

  /** Calculate performance score for a completed work day */
  calculatePerformance(tasksCompleted: number, totalTasks: number, overtimeMinutes: number): number {
    if (totalTasks === 0) return 0;

    // Base: (tasksCompleted / totalTasks) * 80
    let performance = (tasksCompleted / totalTasks) * 80;

    // Overtime bonus: +5 per 30 minutes overtime (max +15)
    const overtimeBonus = Math.min(Math.floor(overtimeMinutes / 30) * 5, 15);
    performance += overtimeBonus;

    // Early finish bonus: +5 if all tasks done before 4 PM
    // overtimeMinutes < 0 means finished before 5 PM; we treat overtimeMinutes === 0 and
    // all tasks complete as having finished on time; caller can pass negative value for early finish.
    if (tasksCompleted >= totalTasks && overtimeMinutes < 0) {
      performance += 5;
    }

    // Random variance: ±5
    performance += (Math.random() * 10) - 5;

    return clamp(Math.round(performance), 0, 100);
  }

  /** Check if eligible for promotion */
  checkPromotion(currentLevel: number, daysWorked: number, avgPerformance: number): boolean {
    if (currentLevel >= JOB_LEVELS.length - 1) return false;
    const level = this.getJobLevel(currentLevel);
    return daysWorked >= level.requiredDaysWorked && avgPerformance >= level.requiredPerformance;
  }

  /** Calculate weekly salary with bonuses */
  calculateWeeklyPay(jobLevel: number, avgPerformance: number): number {
    const level = this.getJobLevel(jobLevel);
    const performanceMultiplier = 1 + (avgPerformance - 50) / 200; // ±25% based on performance around 50
    return Math.round(level.baseSalary * clamp(performanceMultiplier, 0.5, 1.5));
  }

  /** Get random task descriptions */
  getTaskDescriptions(type: OfficeTask['type']): string[] {
    return [...TASK_DESCRIPTIONS[type]];
  }

  destroy(): void {
    // Nothing to clean up
  }
}
