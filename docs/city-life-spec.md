# Hearthfield: City Life — DLC Spec

## Concept
Separate game mode selectable from the title screen alongside "Farm Life." Same engine, same calendar/day-night/stamina systems, entirely different map, NPCs, jobs, and gameplay loop.

## Core Loops

### 1. Office Job
- Player works at "Nexus Corp" office building downtown
- Enter office → work minigame (click tasks, answer emails, meet deadlines)
- Shifts: 9 AM - 5 PM (can leave early with stamina penalty)
- Salary: paid every 7 days. Base 500g, increases with promotions
- Promotion ladder: Intern → Associate → Manager → Director → VP (5 levels)
- Promotion requires: days worked + performance score + social connections
- Can call in sick (1 per season, no penalty)

### 2. Apartment Life  
- Player lives in an apartment (interior scene, like house)
- Cook meals (reuse crafting system with city recipes: coffee, pasta, stir-fry, smoothie)
- Furniture upgrades: bed (stamina recovery), desk (work bonus), kitchen (recipe unlock), TV (mood), bookshelf (skill XP)
- Apartment upgrade tiers: Studio → 1BR → Loft (costs escalate: 5000g, 15000g, 40000g)
- Morning routine: wake up → eat breakfast → go to work (or day off activities)

### 3. Social Scene
- 7 city NPCs with friendship/romance arcs
- Venues: Coffee shop, bar, restaurant, park, gym, bookstore, art gallery
- Activities: grab coffee (morning), lunch date (noon), drinks (evening), movie night (night)
- Each NPC has preferred venues and time preferences
- Weekend events: block party, art show, trivia night, concert (rotating)

## Map Layout (40x25 grid, same as farm)
```
Rows 0-1:   Sky/roof line (decorative)
Rows 2-6:   DOWNTOWN — office tower, coffee shop, restaurant, bar
             Sidewalks (PATH tiles), street (STONE), crosswalks
Rows 7-9:   MAIN STREET — shops, art gallery, bookstore, gym
             Street lamps, benches, bus stop, newspaper stand
Rows 10-12: PARK — trees, pond, benches, fountain, dog walkers
             Grass area with paths through it
Rows 13-15: TRANSITION — smaller buildings, laundromat, corner store
Rows 16-19: RESIDENTIAL — apartment buildings, player's apartment entrance
             Quieter streets, potted plants, mailboxes
Rows 20-24: NEIGHBORHOOD — houses, small yards, community garden
             Cat on fence, kids playing (decorative NPCs)
```

## City NPCs (7)
1. **Alex** — barista at coffee shop. Creative, artsy. Loves: coffee, books, art supplies
2. **Jordan** — coworker at Nexus Corp. Competitive but fair. Loves: tech gadgets, energy drinks
3. **Sam** — bartender at The Neon Tap. Night owl, philosophical. Loves: rare drinks, vinyl records
4. **Maya** — chef at Rosemary's restaurant. Passionate, warm. Loves: ingredients, recipes, flowers
5. **Riley** — gym trainer. Energetic, motivational. Loves: protein bars, sneakers, smoothies
6. **Casey** — bookstore owner. Quiet, intellectual. Loves: books, tea, puzzles
7. **Morgan** — artist at the gallery. Eccentric, expressive. Loves: art supplies, unusual items, gems

## City Items (new registry entries)
- Foods: coffee, espresso, latte, pasta, stir_fry, smoothie, protein_bar, sushi, pizza, sandwich, salad, energy_drink, craft_beer, wine
- Work items: laptop, briefcase, notebook, pen, badge, report
- Social: flowers, vinyl_record, book, puzzle, art_print, sneakers, tea_set
- Apartment: desk_lamp, throw_pillow, plant_pot, wall_art, rug, coffee_table
- Currency same as farm (gold)

## Day Structure
- 6 AM: Wake up (or alarm setting)
- 7-8 AM: Morning routine (eat, coffee shop)
- 9 AM-5 PM: Work (Mon-Fri) / Free day (Sat-Sun)
- 5-7 PM: After work (gym, errands, park)
- 7-10 PM: Evening social (dinner, bar, events)
- 10 PM+: Late night (stamina drains fast)
- Weekends: full free days for social/exploration/side activities

## Reused Systems (import from existing)
- Calendar, day/night cycle, weather
- Stamina/energy system
- Inventory + item management
- Save/load
- Toast notifications
- Achievement framework
- NPC schedule system
- Dialogue system
- Interior scene (parameterized for apartment)
- Particle effects, HUD clock

## New Systems Needed
- CityScene.ts — main city map (equivalent to PlayScene)
- CityRenderer.ts — procedural city buildings
- OfficeMinigame.ts — work tasks
- SocialSystem.ts — venue activities, dating
- ApartmentData.ts — furniture, upgrades, recipes
- CityNPCData.ts — 7 NPCs with full dialogue
- CityRegistry.ts — city-specific items
- GameModeSelect — title screen choice (Farm Life / City Life)
