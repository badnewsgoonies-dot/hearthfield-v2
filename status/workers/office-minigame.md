# Worker: Office Minigame System — COMPLETE

## Status: ✅ Done

## File Created
- `src/systems/officeMinigame.ts`

## What Was Implemented
- `WorkDay` interface
- `JobLevel` interface
- `JOB_LEVELS` constant array (5 levels: Intern → VP)
- `OfficeTask` interface
- `OfficeMinigame` class with all required methods:
  - `getJobLevel(level)` — returns clamped job level info
  - `generateTasks(jobLevel)` — generates random tasks per shift based on job level's `tasksPerDay`
  - `calculatePerformance(tasksCompleted, totalTasks, overtimeMinutes)` — base 80% + overtime bonus (max +15) + early finish (+5 for negative overtimeMinutes) + ±5 variance, clamped 0–100
  - `checkPromotion(currentLevel, daysWorked, avgPerformance)` — compares against level thresholds
  - `calculateWeeklyPay(jobLevel, avgPerformance)` — base salary ±25% by performance
  - `getTaskDescriptions(type)` — returns copy of description array for task type
  - `destroy()` — no-op cleanup

## Task Descriptions Included
All 3+ descriptions per type as specified (email, report, meeting, presentation, code_review).

## Validation
`npx tsc --noEmit` — **exit code 0** ✅
