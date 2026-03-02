# Office System — Completion Report

## Status: ✅ Complete

## File Created
- `src/city/systems/officeSystem.ts`

## What Was Implemented

### Enums & Interfaces
- `JobRank` enum: INTERN, ASSOCIATE, SENIOR, MANAGER, DIRECTOR, VP
- `OfficeState` interface: rank, performance (0-100), daysWorked, totalEarnings, currentStreak, promotionProgress (0-100)
- `WorkTask` interface: id, name, description, staminaCost, performanceReward, completionTime

### OfficeSystem Class
- `getState()` / `setState()` for save/load integration
- `clockIn(currentHour)` — applies on-time (+5) or late (+2) performance bonus, returns salary + assigned task
- `completeTask(taskId)` — awards performanceReward, calculates bonus gold (10% salary × reward)
- `endOfDay(workedToday)` — handles streaks, streak bonuses, promotion progress, promotion/demotion checks
- `getAvailableTasks()` — returns 4 tasks for current rank
- `getSalary(rank)` — returns salary from table
- `getRankInfo(rank)` — returns title, salary, nextRank, requiredPerformance

### Salary Table
INTERN=50, ASSOCIATE=100, SENIOR=175, MANAGER=300, DIRECTOR=500, VP=800

### Performance Rules
- On time (before 9:15 AM): +5
- Late (9:15–10:00 AM): +2
- Missed work: -15, streak reset
- Task completion: +task.performanceReward
- Streak bonus: +1 per 5 consecutive days (max +5)
- Below 30 performance → demotion

### Promotion
- `promotionProgress` increases by `performance / 10` each day worked
- At 100 → promoted, progress resets to 0

### Tasks (24 total, 4 per rank)
All tasks implemented as specified in the spec.

## Validation
`npx tsc --noEmit` — ✅ exits with code 0, no errors
