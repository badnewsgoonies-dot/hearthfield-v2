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

const OFFICE_EVENTS: OfficeEvent[] = [
  {
    id: 'presentation_day',
    name: 'Presentation Day',
    description: 'Big presentation today — give it your all!',
    salaryMultiplier: 1.5,
    staminaMultiplier: 1.5,
    performanceBonus: 5,
  },
  {
    id: 'team_lunch',
    name: 'Team Lunch',
    description: 'Free lunch from the boss!',
    salaryMultiplier: 1.0,
    staminaMultiplier: 0.5,
    performanceBonus: 2,
  },
  {
    id: 'crunch_time',
    name: 'Crunch Time',
    description: 'Deadline rush — overtime pays double.',
    salaryMultiplier: 2.0,
    staminaMultiplier: 2.0,
    performanceBonus: 8,
  },
  {
    id: 'office_party',
    name: 'Office Party',
    description: "Someone's birthday! Not much work getting done.",
    salaryMultiplier: 0.5,
    staminaMultiplier: 0.3,
    performanceBonus: 3,
  },
  {
    id: 'client_visit',
    name: 'Client Visit',
    description: 'Important client meeting — impress them!',
    salaryMultiplier: 1.5,
    staminaMultiplier: 1.2,
    performanceBonus: 6,
  },
  {
    id: 'server_outage',
    name: 'Server Outage',
    description: "Systems are down — everyone's waiting around.",
    salaryMultiplier: 1.0,
    staminaMultiplier: 0.8,
    performanceBonus: 1,
  },
];

interface PromotionRequirement {
  daysNeeded: number;
  performanceNeeded: number;
  nextRank: JobRank | null;
}

const PROMOTION_REQUIREMENTS: Record<JobRank, PromotionRequirement> = {
  [JobRank.INTERN]:     { daysNeeded: 5,   performanceNeeded: 30, nextRank: JobRank.JUNIOR },
  [JobRank.JUNIOR]:     { daysNeeded: 15,  performanceNeeded: 50, nextRank: JobRank.ASSOCIATE },
  [JobRank.ASSOCIATE]:  { daysNeeded: 30,  performanceNeeded: 65, nextRank: JobRank.SENIOR },
  [JobRank.SENIOR]:     { daysNeeded: 50,  performanceNeeded: 75, nextRank: JobRank.MANAGER },
  [JobRank.MANAGER]:    { daysNeeded: 80,  performanceNeeded: 85, nextRank: JobRank.DIRECTOR },
  [JobRank.DIRECTOR]:   { daysNeeded: 120, performanceNeeded: 95, nextRank: JobRank.VP },
  [JobRank.VP]:         { daysNeeded: 0,   performanceNeeded: 0,  nextRank: null },
};

export class OfficeJobSystem {
  private state: JobState;

  constructor() {
    this.state = {
      rank: JobRank.INTERN,
      daysWorked: 0,
      streak: 0,
      performanceRating: 0,
      salary: JOB_SALARY[JobRank.INTERN],
      workedToday: false,
    };
  }

  getState(): JobState {
    return { ...this.state };
  }

  loadState(state: JobState): void {
    this.state = { ...state };
  }

  work(_currentStamina: number, _maxStamina: number, _season: Season, _day: number): WorkResult {
    const event = Math.random() < 0.2
      ? OFFICE_EVENTS[Math.floor(Math.random() * OFFICE_EVENTS.length)]
      : null;

    const salaryMultiplier = event ? event.salaryMultiplier : 1.0;
    const staminaMultiplier = event ? event.staminaMultiplier : 1.0;
    const performanceBonus = event ? event.performanceBonus : 0;

    const basePay = JOB_SALARY[this.state.rank];
    const streakBonus = Math.min(this.state.streak * 0.02, 0.20);
    const salary = Math.floor(basePay * (1 + streakBonus) * salaryMultiplier);
    const staminaCost = Math.floor(40 * staminaMultiplier);
    const performanceChange = Math.floor(3 + performanceBonus);

    this.state.daysWorked += 1;
    this.state.streak += 1;
    this.state.workedToday = true;
    this.state.performanceRating = Math.max(0, Math.min(100, this.state.performanceRating + performanceChange));
    this.state.salary = salary;

    const message = event ? event.description : 'Another day at the office.';

    return { salary, event, message, staminaCost, performanceChange };
  }

  checkPromotion(): JobRank | null {
    const req = PROMOTION_REQUIREMENTS[this.state.rank];
    if (
      req.nextRank !== null &&
      this.state.daysWorked >= req.daysNeeded &&
      this.state.performanceRating >= req.performanceNeeded
    ) {
      return req.nextRank;
    }
    return null;
  }

  promote(): void {
    const next = this.checkPromotion();
    if (next !== null) {
      this.state.rank = next;
      this.state.salary = JOB_SALARY[next];
    }
  }

  newDay(): void {
    this.state.workedToday = false;
  }

  skipWork(): void {
    this.state.streak = 0;
    this.state.performanceRating = Math.max(0, this.state.performanceRating - 5);
  }

  getPromotionRequirements(): { daysNeeded: number; performanceNeeded: number; nextRank: JobRank | null } {
    const req = PROMOTION_REQUIREMENTS[this.state.rank];
    return {
      daysNeeded: req.daysNeeded,
      performanceNeeded: req.performanceNeeded,
      nextRank: req.nextRank,
    };
  }

  static getRankTitle(rank: JobRank): string {
    switch (rank) {
      case JobRank.INTERN:    return 'Office Intern';
      case JobRank.JUNIOR:    return 'Junior Associate';
      case JobRank.ASSOCIATE: return 'Associate';
      case JobRank.SENIOR:    return 'Senior Associate';
      case JobRank.MANAGER:   return 'Department Manager';
      case JobRank.DIRECTOR:  return 'Division Director';
      case JobRank.VP:        return 'Vice President';
    }
  }
}
