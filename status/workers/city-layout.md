# Worker Completion: City Map Layout Data

## Status: DONE

## File Created
- `src/city/data/cityLayout.ts`

## Exports Delivered
- `CityMapTile` interface
- `CityDecoration` interface
- `CityBuildingPlacement` interface
- `CITY_MAP_WIDTH = 40`, `CITY_MAP_HEIGHT = 25`
- `CITY_TILES` — 25×40 grid generated via `buildCityTiles()` with correct tile types
- `CITY_BUILDINGS` — 10 buildings across downtown and residential zones
- `CITY_DECORATIONS` — 68 placements (well over the 30 minimum)
- `ROAD_ROWS` — `[10]`
- `SIDEWALK_AREAS` — 7 sidewalk regions

## Map Coverage
- **Downtown (rows 3–8):** Meridian Corp, Sakura Kitchen, Urban Style, Mika's Gallery, Club Pulse
- **Main Street (row 10):** Road with crosswalks at x:8, x:20, x:32; bus stop at (35,11)
- **Residential (rows 12–17):** Player Apartment, Sunrise Cafe, Priya's Books, Iron Forge Gym, The Neon Lounge; tree-lined sidewalks rows 16–17
- **Park (rows 18–23):** Fountain at (20,20), pond water tiles at x:28–32 y:20–22, benches, trees, flower boxes
- **South Edge (row 24):** Sidewalk

## Validation
`npx tsc --noEmit` — **exit code 0, no errors**

## No Existing Files Modified
