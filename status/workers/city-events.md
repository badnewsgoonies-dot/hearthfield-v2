# Worker Report: City Events System

**Status:** ✅ Complete  
**File Created:** `src/systems/cityEvents.ts`  
**TypeScript Validation:** `npx tsc --noEmit` — passed, exit code 0

## Summary

Created `CityEventHandler` class following the `FestivalEventHandler` pattern from `src/systems/festivalEvents.ts`.

## Interfaces Implemented

- `CityEvent` — id, name, season, day, description, location
- `CityEventResult` — eventId, participated, score, rank (`gold|silver|bronze|participant`), rewards, message

## 8 City Events

| ID | Season | Day | Scoring | Gold Reward |
|----|--------|-----|---------|-------------|
| `food_festival` | Spring | 15 | bestItemValue | sushi x3 |
| `art_walk` | Spring | 25 | bestItemValue (gifted) | art_print x2 |
| `block_party` | Summer | 12 | sum(friendships)/100 | concert_ticket x2 |
| `rooftop_concert` | Summer | 26 | max(friendship)/50 | vinyl_record x1 |
| `harvest_market` | Fall | 14 | flat 50, no competition | coffee x5 (all) |
| `pub_crawl` | Fall | 27 | venuesVisited (0–4) | cocktail x3 |
| `holiday_lights` | Winter | 10 | apartmentItems count | scented_candle x3 |
| `new_years_gala` | Winter | 28 | gold spent (up to 2000) | chocolate_box x5 |

## NPC Dialogue Coverage

All 7 NPCs (alex, morgan, sam, jordan, casey, riley, taylor) have 3 dialogue lines each for events where they logically appear. Each NPC covers at least 4 events:

| NPC | Events covered |
|-----|---------------|
| alex | food_festival, art_walk, block_party, rooftop_concert, harvest_market, pub_crawl, holiday_lights, new_years_gala (8) |
| morgan | food_festival, art_walk, block_party, rooftop_concert, harvest_market, pub_crawl, holiday_lights, new_years_gala (8) |
| sam | food_festival, art_walk, block_party, rooftop_concert, harvest_market, pub_crawl, holiday_lights, new_years_gala (8) |
| jordan | food_festival, art_walk, block_party, rooftop_concert, harvest_market, pub_crawl, holiday_lights, new_years_gala (8) |
| casey | food_festival, art_walk, block_party, rooftop_concert, harvest_market, pub_crawl, holiday_lights, new_years_gala (8) |
| riley | food_festival, art_walk, block_party, rooftop_concert, harvest_market, pub_crawl, holiday_lights, new_years_gala (8) |
| taylor | food_festival, art_walk, block_party, rooftop_concert, harvest_market, pub_crawl, holiday_lights, new_years_gala (8) |

## Methods

- `CityEventHandler.CITY_EVENTS` — static readonly array of 8 `CityEvent` objects
- `getTodaysEvent(season, day)` — returns matching event or `null`
- `calculateScore(eventId, playerData)` — returns full `CityEventResult` with rank/rewards
- `getEventDialogue(eventId, npcId)` — returns 3 dialogue strings or default fallback

## No Existing Files Modified
