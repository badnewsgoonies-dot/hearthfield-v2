import Phaser from 'phaser';

export enum JobRank {
  INTERN = 'intern',
  ASSOCIATE = 'associate',
  SENIOR = 'senior',
  MANAGER = 'manager',
  DIRECTOR = 'director',
  VP = 'vp',
}

export interface OfficeState {
  rank: JobRank;
  performance: number;      // 0-100
  daysWorked: number;
  totalEarnings: number;
  currentStreak: number;    // consecutive days worked
  promotionProgress: number; // 0-100, promotes at 100
}

export interface WorkTask {
  id: string;
  name: string;
  description: string;
  staminaCost: number;
  performanceReward: number;
  completionTime: number;   // ms
}

const SALARY_TABLE: Record<JobRank, number> = {
  [JobRank.INTERN]:    50,
  [JobRank.ASSOCIATE]: 100,
  [JobRank.SENIOR]:    175,
  [JobRank.MANAGER]:   300,
  [JobRank.DIRECTOR]:  500,
  [JobRank.VP]:        800,
};

const RANK_ORDER: JobRank[] = [
  JobRank.INTERN,
  JobRank.ASSOCIATE,
  JobRank.SENIOR,
  JobRank.MANAGER,
  JobRank.DIRECTOR,
  JobRank.VP,
];

const RANK_TITLES: Record<JobRank, string> = {
  [JobRank.INTERN]:    'Intern',
  [JobRank.ASSOCIATE]: 'Associate',
  [JobRank.SENIOR]:    'Senior',
  [JobRank.MANAGER]:   'Manager',
  [JobRank.DIRECTOR]:  'Director',
  [JobRank.VP]:        'Vice President',
};

// Required performance threshold to avoid demotion
const DEMOTION_THRESHOLD = 30;

// All tasks organized by rank
const TASKS_BY_RANK: Record<JobRank, WorkTask[]> = {
  [JobRank.INTERN]: [
    { id: 'intern_file_reports', name: 'File Reports', description: 'Organize and file the quarterly reports.', staminaCost: 5, performanceReward: 3, completionTime: 3000 },
    { id: 'intern_fetch_coffee', name: 'Fetch Coffee', description: 'Get coffee orders for the team.', staminaCost: 3, performanceReward: 2, completionTime: 2000 },
    { id: 'intern_data_entry', name: 'Data Entry', description: 'Enter data into the company spreadsheets.', staminaCost: 8, performanceReward: 4, completionTime: 4000 },
    { id: 'intern_sort_mail', name: 'Sort Mail', description: 'Sort and distribute the office mail.', staminaCost: 4, performanceReward: 3, completionTime: 2500 },
  ],
  [JobRank.ASSOCIATE]: [
    { id: 'assoc_draft_memo', name: 'Draft Memo', description: 'Write an internal memo for the department.', staminaCost: 8, performanceReward: 4, completionTime: 4000 },
    { id: 'assoc_client_call', name: 'Client Call', description: 'Handle a client inquiry call.', staminaCost: 6, performanceReward: 3, completionTime: 3000 },
    { id: 'assoc_budget_review', name: 'Budget Review', description: 'Review the monthly budget reports.', staminaCost: 10, performanceReward: 5, completionTime: 5000 },
    { id: 'assoc_meeting_notes', name: 'Meeting Notes', description: 'Take notes during the team meeting.', staminaCost: 5, performanceReward: 3, completionTime: 2500 },
  ],
  [JobRank.SENIOR]: [
    { id: 'senior_lead_meeting', name: 'Lead Meeting', description: 'Facilitate the weekly team meeting.', staminaCost: 10, performanceReward: 5, completionTime: 5000 },
    { id: 'senior_code_review', name: 'Code Review', description: 'Review code submissions from junior staff.', staminaCost: 12, performanceReward: 6, completionTime: 6000 },
    { id: 'senior_mentor_intern', name: 'Mentor Intern', description: 'Provide guidance and training to interns.', staminaCost: 8, performanceReward: 4, completionTime: 4000 },
    { id: 'senior_strategy_brief', name: 'Strategy Brief', description: 'Prepare a strategic overview document.', staminaCost: 15, performanceReward: 7, completionTime: 7000 },
  ],
  [JobRank.MANAGER]: [
    { id: 'mgr_quarterly_report', name: 'Quarterly Report', description: 'Compile the department quarterly report.', staminaCost: 15, performanceReward: 6, completionTime: 7000 },
    { id: 'mgr_hire_candidate', name: 'Hire Candidate', description: 'Interview and evaluate a job candidate.', staminaCost: 10, performanceReward: 5, completionTime: 5000 },
    { id: 'mgr_resolve_conflict', name: 'Resolve Conflict', description: 'Mediate a dispute between team members.', staminaCost: 12, performanceReward: 5, completionTime: 5500 },
    { id: 'mgr_set_okrs', name: 'Set OKRs', description: 'Define objectives and key results for the quarter.', staminaCost: 10, performanceReward: 6, completionTime: 5000 },
  ],
  [JobRank.DIRECTOR]: [
    { id: 'dir_board_presentation', name: 'Board Presentation', description: 'Present quarterly results to the board.', staminaCost: 20, performanceReward: 7, completionTime: 9000 },
    { id: 'dir_budget_approval', name: 'Budget Approval', description: 'Review and approve department budgets.', staminaCost: 15, performanceReward: 6, completionTime: 7000 },
    { id: 'dir_partner_meeting', name: 'Partner Meeting', description: 'Meet with external business partners.', staminaCost: 18, performanceReward: 7, completionTime: 8000 },
    { id: 'dir_dept_restructure', name: 'Department Restructure', description: 'Plan and execute a department reorganization.', staminaCost: 20, performanceReward: 8, completionTime: 10000 },
  ],
  [JobRank.VP]: [
    { id: 'vp_company_strategy', name: 'Company Strategy', description: 'Define the long-term company strategy.', staminaCost: 25, performanceReward: 8, completionTime: 11000 },
    { id: 'vp_investor_call', name: 'Investor Call', description: 'Present company performance to investors.', staminaCost: 20, performanceReward: 7, completionTime: 9000 },
    { id: 'vp_ma_review', name: 'M&A Review', description: 'Evaluate a potential merger or acquisition.', staminaCost: 22, performanceReward: 8, completionTime: 10000 },
    { id: 'vp_ceo_briefing', name: 'CEO Briefing', description: 'Prepare and deliver a briefing for the CEO.', staminaCost: 18, performanceReward: 7, completionTime: 8500 },
  ],
};

// Required performance to earn promotion (promotionProgress threshold)
const REQUIRED_PROMOTION_PERFORMANCE = 50;

export class OfficeSystem {
  private scene: Phaser.Scene;
  private state: OfficeState;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.state = {
      rank: JobRank.INTERN,
      performance: 50,
      daysWorked: 0,
      totalEarnings: 0,
      currentStreak: 0,
      promotionProgress: 0,
    };
  }

  getState(): OfficeState {
    return { ...this.state };
  }

  setState(state: OfficeState): void {
    this.state = { ...state };
  }

  /** Call when player enters office during work hours. Returns salary earned. */
  clockIn(currentHour: number): { salary: number; onTime: boolean; task: WorkTask } {
    const onTime = currentHour < 9.25; // before 9:15 AM
    const late = currentHour >= 9.25 && currentHour < 10;

    if (onTime) {
      this.state.performance = Math.min(100, this.state.performance + 5);
    } else if (late) {
      this.state.performance = Math.min(100, this.state.performance + 2);
    }

    const salary = this.getSalary(this.state.rank);
    this.state.totalEarnings += salary;

    const tasks = this.getAvailableTasks();
    const task = tasks[Math.floor(Math.random() * tasks.length)];

    return { salary, onTime, task };
  }

  /** Call when player completes a work task */
  completeTask(taskId: string): { performanceGain: number; bonusGold: number } {
    const allTasks = Object.values(TASKS_BY_RANK).flat();
    const task = allTasks.find(t => t.id === taskId);

    if (!task) {
      return { performanceGain: 0, bonusGold: 0 };
    }

    const performanceGain = task.performanceReward;
    this.state.performance = Math.min(100, this.state.performance + performanceGain);

    // Bonus gold: 10% of salary per performance point rewarded
    const bonusGold = Math.floor(this.getSalary(this.state.rank) * 0.1 * performanceGain);

    return { performanceGain, bonusGold };
  }

  /** Call at end of day. Handles attendance, streaks, promotion checks. */
  endOfDay(workedToday: boolean): {
    performanceChange: number;
    promoted: boolean;
    demoted: boolean;
    newRank?: JobRank;
    message: string;
  } {
    let performanceChange = 0;
    let promoted = false;
    let demoted = false;
    let newRank: JobRank | undefined;
    let message = '';

    if (workedToday) {
      this.state.daysWorked++;
      this.state.currentStreak++;

      // Streak bonus: +1 per 5 days, max +5
      const streakBonus = Math.min(5, Math.floor(this.state.currentStreak / 5));
      if (streakBonus > 0) {
        this.state.performance = Math.min(100, this.state.performance + streakBonus);
        performanceChange += streakBonus;
      }

      // Advance promotion progress
      const progressGain = this.state.performance / 10;
      this.state.promotionProgress = Math.min(100, this.state.promotionProgress + progressGain);

      // Check for promotion
      if (this.state.promotionProgress >= 100) {
        const currentIndex = RANK_ORDER.indexOf(this.state.rank);
        if (currentIndex < RANK_ORDER.length - 1) {
          this.state.rank = RANK_ORDER[currentIndex + 1];
          this.state.promotionProgress = 0;
          promoted = true;
          newRank = this.state.rank;
          message = `Congratulations! You've been promoted to ${RANK_TITLES[this.state.rank]}!`;
        } else {
          this.state.promotionProgress = 100;
          message = 'Outstanding performance! You are at the top of your career.';
        }
      } else {
        message = `Good work today! Promotion progress: ${Math.floor(this.state.promotionProgress)}%`;
      }
    } else {
      // Missed work
      this.state.currentStreak = 0;
      const missedPenalty = -15;
      this.state.performance = Math.max(0, this.state.performance + missedPenalty);
      performanceChange = missedPenalty;

      // Check for demotion
      if (this.state.performance < DEMOTION_THRESHOLD) {
        const currentIndex = RANK_ORDER.indexOf(this.state.rank);
        if (currentIndex > 0) {
          this.state.rank = RANK_ORDER[currentIndex - 1];
          this.state.promotionProgress = 0;
          demoted = true;
          newRank = this.state.rank;
          message = `You missed work and your performance dropped. Demoted to ${RANK_TITLES[this.state.rank]}.`;
        } else {
          message = 'You missed work. Your performance is critically low!';
        }
      } else {
        message = 'You missed work today. Try to keep a consistent schedule.';
      }
    }

    return { performanceChange, promoted, demoted, newRank, message };
  }

  /** Get available tasks for current rank */
  getAvailableTasks(): WorkTask[] {
    return TASKS_BY_RANK[this.state.rank];
  }

  /** Get salary for a rank */
  getSalary(rank: JobRank): number {
    return SALARY_TABLE[rank];
  }

  /** Get rank display info */
  getRankInfo(rank: JobRank): { title: string; salary: number; nextRank: JobRank | null; requiredPerformance: number } {
    const currentIndex = RANK_ORDER.indexOf(rank);
    const nextRank = currentIndex < RANK_ORDER.length - 1 ? RANK_ORDER[currentIndex + 1] : null;
    // Required performance to maintain rank (avoid demotion) and progress toward promotion
    const requiredPerformance = DEMOTION_THRESHOLD;

    return {
      title: RANK_TITLES[rank],
      salary: SALARY_TABLE[rank],
      nextRank,
      requiredPerformance,
    };
  }
}
