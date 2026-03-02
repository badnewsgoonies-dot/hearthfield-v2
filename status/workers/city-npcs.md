# City NPC Data — Completion Report

**Status:** ✅ Complete  
**File created:** `src/data/cityNPCData.ts`  
**TypeScript validation:** `npx tsc --noEmit` — PASSED (exit 0, no errors)

## Exports

- `CITY_NPCS: NPCDef[]` — 7 NPCs matching `NPCDef` interface from `types.ts`
- `CITY_NPC_SCHEDULES: CityNPCSchedule[]` — weekday + weekend schedules per NPC
- `CITY_NPC_DIALOGUE: CityNPCDialogue[]` — full structured dialogue per NPC
- Interfaces `CityNPCSchedule` and `CityNPCDialogue` exported per spec

## NPC Roster

| ID | Name | Role | portraitIndex | spriteIndex |
|----|------|------|--------------|-------------|
| alex | Alex Chen | Barista, Daily Grind | 10 | 10 |
| jordan | Jordan Park | Coworker, Nexus Corp | 11 | 11 |
| sam | Sam Rivera | Bartender, The Neon Tap | 12 | 12 |
| maya | Maya Okafor | Chef, Rosemary's | 13 | 13 |
| riley | Riley Torres | Gym Trainer | 14 | 14 |
| casey | Casey Webb | Bookstore Owner | 15 | 15 |
| morgan | Morgan Frost | Gallery Artist | 16 | 16 |

## Dialogue Line Counts per NPC

| NPC | Greeting | Workplace | Casual | Heart Milestones (2/4/6/8/10) | Date | Total |
|-----|----------|-----------|--------|-------------------------------|------|-------|
| alex | 5 | 3 | 5 | 2+2+2+2+2 = 10 | 3 | **26** |
| jordan | 5 | 3 | 5 | 10 | 3 | **26** |
| sam | 5 | 3 | 5 | 10 | 3 | **26** |
| maya | 5 | 3 | 5 | 10 | 3 | **26** |
| riley | 5 | 3 | 5 | 10 | 3 | **26** |
| casey | 5 | 3 | 5 | 10 | 3 | **26** |
| morgan | 5 | 3 | 5 | 10 | 3 | **26** |

**Total dialogue lines: 182** (26 per NPC × 7 NPCs)  
Each NPC also has a `dialoguePool` in the `NPCDef` with 5 lines at each of 5 heart brackets = **25 additional lines per NPC**, giving a combined total of **357 dialogue strings** across both structures.

## Spec Compliance

- ✅ All 7 NPCs defined per spec personality/role descriptions
- ✅ `NPCDef` interface matched exactly (id, name, marriageable, birthday, lovedItems, likedItems, hatedItems, defaultMap, portraitIndex, spriteIndex, dialoguePool)
- ✅ `lovedItems`/`hatedItems` use city item IDs from spec (coffee, espresso, book, art_print, energy_drink, laptop, vinyl_record, craft_beer, protein_bar, smoothie, sneakers, etc.)
- ✅ `likedItems`: 4 items per NPC
- ✅ Schedules: grid positions within city map bounds (x: 0–39, y: 0–24)
- ✅ Heart milestone dialogue at levels 2, 4, 6, 8, 10 (2 lines each)
- ✅ Dialogue reflects distinct personalities (Casey is dry/witty, Riley is loud/energetic, Sam is philosophical, etc.)
- ✅ No existing files modified
