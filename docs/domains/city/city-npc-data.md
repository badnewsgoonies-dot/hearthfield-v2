# Worker: City NPC Gift & Dialogue Data

## Scope
Create ONLY: src/city/data/cityNPCData.ts
Do NOT modify any existing files.

## Required reading
- docs/city-spec.md (NPC section)

## Task
Create comprehensive NPC personality data: gift preferences, dialogue lines, and social venue preferences.

## Exports:
```typescript
export interface CityGiftPreference {
  loved: string[];
  liked: string[];
  disliked: string[];
  hated: string[];
}

export interface CityGiftDialogue {
  loved: string[];     // 3 lines
  liked: string[];     // 3 lines
  disliked: string[];  // 3 lines
  hated: string[];     // 3 lines
}

export interface NPCScheduleBlock {
  hourStart: number;
  hourEnd: number;
  location: string;    // 'coffee_shop' | 'office' | 'bar' | 'park' | 'gym' | 'home' | 'gallery' | 'bookstore' | 'restaurant'
  activity: string;    // flavor text
}

export interface CityNPCProfile {
  id: string;
  greeting: string[];         // 5 random greetings
  chatLines: string[];        // 10 casual conversation lines
  dateDialogue: string[];     // 5 lines for dating scenes (dateable NPCs only)
  venuePreferences: string[]; // preferred hangout spots
  schedule: NPCScheduleBlock[];
  dateable: boolean;
}

export const CITY_NPC_GIFTS: Record<string, CityGiftPreference>;
export const CITY_NPC_DIALOGUE: Record<string, CityGiftDialogue>;
export const CITY_NPC_PROFILES: Record<string, CityNPCProfile>;
```

## NPC Details:

### alex (Barista, dateable)
- Loves: concert_tickets, book_gift, smoothie, flowers_bouquet
- Likes: coffee, croissant, plant_pot, chocolate_box
- Dislikes: energy_drink, briefcase
- Hates: basic_suit, designer_suit
- Schedule: coffee_shop 6AM-2PM, park 3-5PM, bookstore 5-7PM, home 8PM+
- Personality: warm, creative, loves art and nature, quotes poetry

### jordan (Coworker)
- Loves: designer_suit, watch, briefcase, espresso
- Likes: energy_drink, steak, dress_shoes
- Dislikes: flowers_bouquet, chocolate_box
- Hates: casual_outfit, plant_pot
- Schedule: gym 6-8AM, office 9AM-6PM, restaurant 7-9PM, home 10PM+
- Personality: ambitious, competitive, talks about promotions and networking

### sam (Bartender, dateable)
- Loves: concert_tickets, wine_bottle, perfume, stereo
- Likes: cocktail, pizza_slice, sunglasses, wall_art
- Dislikes: espresso, briefcase, desk
- Hates: basic_suit, energy_drink
- Schedule: home 8AM-2PM, park 2-4PM, bar 5PM-2AM
- Personality: chill, music obsessed, philosophical, night owl

### priya (Bookstore owner)
- Loves: book_gift, tea, painting, perfume
- Likes: chocolate_box, lamp, flowers_bouquet, coffee
- Dislikes: energy_drink, tv, burger
- Hates: cocktail, sunglasses
- Schedule: bookstore 9AM-7PM, coffee_shop 7-8PM, home 9PM+
- Personality: intellectual, warm, recommends books, loves quiet

### derek (Gym trainer)
- Loves: smoothie, energy_drink, sneakers, salad
- Likes: tea, steak, watch
- Dislikes: cake_slice, cocktail, pizza_slice
- Hates: wine_bottle, chocolate_box
- Schedule: gym 6AM-12PM, park 1-4PM, gym 4-8PM, home 9PM+
- Personality: high energy, motivational quotes, talks gains

### mika (Gallery curator, dateable)
- Loves: painting, wall_art, perfume, wine_bottle
- Likes: flowers_bouquet, book_gift, concert_tickets, curtains
- Dislikes: burger, energy_drink, briefcase
- Hates: basic_suit, tv
- Schedule: gallery 10AM-6PM, restaurant 7-9PM, bar 9-11PM, home 12AM+
- Personality: artistic, mysterious, speaks in metaphors, cultured

### chen (Restaurant chef)
- Loves: sushi_roll, steak, wine_bottle, ramen
- Likes: pasta, tea, cookbook_gift, salad
- Dislikes: energy_drink, burger, pizza_slice
- Hates: sandwich, croissant
- Schedule: home 7-9AM, restaurant 10AM-10PM, bar 10-11PM, home 12AM+
- Personality: perfectionist, generous with food, critiques everything

### val (Neighbor)
- Loves: chocolate_box, flowers_bouquet, perfume, cake_slice
- Likes: coffee, magazine, plant_pot, rug
- Dislikes: steak, briefcase, energy_drink
- Hates: designer_suit, watch
- Schedule: home 7-9AM, coffee_shop 9-11AM, park 11AM-2PM, home 3PM+
- Personality: friendly gossip, knows everyone, gives social tips

Each NPC needs minimum: 5 greetings, 10 chat lines, 3 lines per gift tier (12 dialogue lines), full daily schedule.
Dateable NPCs (alex, sam, mika): 5 date dialogue lines each.

## Validation
npx tsc --noEmit must pass.

## When done
Write completion report to status/workers/city-npc-data.md
