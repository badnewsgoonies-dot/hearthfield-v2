# Hearthfield: City Life DLC

Separate save mode — player picks "Farm Life" or "City Life" at game start.
Same engine (TypeScript + Phaser), reuses shared systems (inventory, clock, tooltips, particles, achievements, stamina, save/load).

## Core Systems
1. **Office Job** — Go to work at office building, complete tasks, earn salary, get promoted (Intern → Junior → Senior → Manager → VP → CEO). Each rank unlocks salary bump + new interactions.
2. **Apartment** — Player's home. Decorate, cook meals, sleep. Upgradeable (studio → 1BR → penthouse). Similar to farm house interiors.
3. **Social Scene** — Bars, restaurants, coffee shops, park. Meet NPCs, build friendships/romance, attend city events.

## Map Layout (40x25 grid, same as farm)
- Rows 0-3: Skyline backdrop, tall buildings (decorative)
- Rows 4-8: DOWNTOWN — Office tower (work), Bank, Department Store, Electronics shop
- Rows 9-12: MAIN STREET — Coffee shop, Restaurant, Bar, Bookstore, with sidewalk paths
- Rows 13-16: PARK — Green space, benches, fountain, food cart, busker NPC
- Rows 17-20: RESIDENTIAL — Player apartment building, neighbor buildings, mailbox
- Rows 21-24: TRANSIT — Bus stop (future: travel to farm), parking lot, street lamps

## City NPCs (7, matching farm count)
- **Alex** — Barista at coffee shop, laid-back artist type. Loves: coffee, art supplies, vinyl records
- **Morgan** — Your office rival/friend, ambitious. Loves: briefcases, ties, business books
- **Sam** — Bartender at the bar, witty storyteller. Loves: cocktail ingredients, music, jokes
- **Jordan** — Park ranger/gardener, nature lover in the city. Loves: plants, seeds, nature books
- **Casey** — Chef at the restaurant, passionate foodie. Loves: rare ingredients, spices, recipes
- **Riley** — Bookstore owner, quiet intellectual. Loves: books, tea, antiques
- **Taylor** — Neighbor in your apartment building, friendly. Loves: home decor, baked goods, pets

## City Items (new registry entries)
### Food & Drink
coffee (sell 15), espresso (sell 30), croissant (sell 25), sandwich (sell 40), pasta (sell 55), steak_dinner (sell 120), cocktail (sell 45), smoothie (sell 35), sushi (sell 80), cake (sell 65)

### Work & Office
briefcase (sell 200), laptop (sell 500), business_card (sell 5), pen_set (sell 30), desk_lamp (sell 75), filing_cabinet (sell 100), promotion_certificate (sell 0, quest item)

### Social & Gifts  
vinyl_record (sell 45), art_print (sell 60), book (sell 25), flowers_bouquet (sell 40), chocolate_box (sell 50), concert_ticket (sell 80), board_game (sell 35), scented_candle (sell 30)

### Apartment
throw_pillow (sell 20), wall_art (sell 55), rug (sell 90), plant_pot (sell 35), kitchen_set (sell 150), curtains (sell 45), bookshelf (sell 120), coffee_table (sell 80)

## Day Structure
- Morning (6AM-9AM): Get ready, eat breakfast, commute
- Work hours (9AM-5PM): At office (auto or mini-tasks)
- Evening (5PM-10PM): Free time — socialize, shop, eat out, apartment
- Night (10PM-6AM): Sleep (must be home)

## Office Job System
- Player goes to office building, presses E to "work"
- Work generates salary based on rank: Intern 100g/day, Junior 200, Senior 350, Manager 500, VP 750, CEO 1000
- Promotion requires: days worked + friendship with Morgan + specific items delivered to boss
- Promotion milestones: Intern(0 days), Junior(5), Senior(15), Manager(30), VP(60), CEO(100)

## City Events (like farm festivals)
- Food Festival (Spring 15): cooking competition, score based on best meal item
- Art Walk (Spring 25): gift art items, scored by value
- Summer Block Party (Summer 12): social event, score = total NPC friendships  
- Rooftop Concert (Summer 26): attend with friend, score = highest friendship
- Harvest Market (Fall 14): farmers market, buy rare items
- Halloween Pub Crawl (Fall 27): visit all social venues, score = venues visited
- Holiday Lights (Winter 10): decorating competition, score = apartment items
- New Year's Gala (Winter 28): formal event, score = gold spent on outfit
