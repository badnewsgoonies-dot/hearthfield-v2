import Phaser from 'phaser';

export interface Venue {
  id: string;
  name: string;
  type: 'cafe' | 'bar' | 'restaurant' | 'park' | 'gym' | 'bookstore' | 'gallery';
  openHour: number;
  closeHour: number;
  activities: VenueActivity[];
}

export interface VenueActivity {
  id: string;
  name: string;
  description: string;
  staminaCost: number;
  goldCost: number;
  friendshipBonus: number;
  duration: number;
  timeSlot: 'morning' | 'afternoon' | 'evening' | 'night';
}

export interface WeekendEvent {
  id: string;
  name: string;
  description: string;
  venue: string;
  day: 'saturday' | 'sunday';
  season: string;
  hour: number;
  friendshipBonusAll: number;
  rewards: { itemId: string; qty: number }[];
}

// ── NPC Venue Compatibility ──────────────────────────────────
const NPC_COMPATIBILITY: Record<string, string[]> = {
  alex:   ['cafe', 'bookstore', 'park'],
  jordan: ['gym', 'restaurant'],
  sam:    ['bar', 'bookstore', 'gallery'],
  maya:   ['restaurant', 'park', 'cafe'],
  riley:  ['gym', 'park'],
  casey:  ['bookstore', 'cafe', 'gallery'],
  morgan: ['gallery', 'bar', 'park'],
};

// ── Venue Definitions ────────────────────────────────────────
export const CITY_VENUES: Venue[] = [
  {
    id: 'daily_grind',
    name: 'Daily Grind',
    type: 'cafe',
    openHour: 6,
    closeHour: 18,
    activities: [
      {
        id: 'grab_coffee',
        name: 'Grab Coffee',
        description: 'Enjoy a cup of coffee together.',
        staminaCost: 5,
        goldCost: 15,
        friendshipBonus: 8,
        duration: 1,
        timeSlot: 'morning',
      },
      {
        id: 'study_together',
        name: 'Study Together',
        description: 'Hit the books side by side.',
        staminaCost: 10,
        goldCost: 0,
        friendshipBonus: 12,
        duration: 2,
        timeSlot: 'afternoon',
      },
    ],
  },
  {
    id: 'neon_tap',
    name: 'The Neon Tap',
    type: 'bar',
    openHour: 17,
    closeHour: 2,
    activities: [
      {
        id: 'drinks',
        name: 'Drinks',
        description: 'Share a round of drinks.',
        staminaCost: 15,
        goldCost: 30,
        friendshipBonus: 15,
        duration: 2,
        timeSlot: 'evening',
      },
      {
        id: 'karaoke',
        name: 'Karaoke',
        description: 'Belt out your favourite songs.',
        staminaCost: 20,
        goldCost: 10,
        friendshipBonus: 20,
        duration: 2,
        timeSlot: 'night',
      },
      {
        id: 'pool',
        name: 'Pool',
        description: 'A friendly game of billiards.',
        staminaCost: 10,
        goldCost: 5,
        friendshipBonus: 10,
        duration: 1,
        timeSlot: 'evening',
      },
    ],
  },
  {
    id: 'rosemarys',
    name: "Rosemary's",
    type: 'restaurant',
    openHour: 11,
    closeHour: 22,
    activities: [
      {
        id: 'lunch_date',
        name: 'Lunch Date',
        description: 'A relaxed lunch together.',
        staminaCost: 10,
        goldCost: 40,
        friendshipBonus: 18,
        duration: 1,
        timeSlot: 'afternoon',
      },
      {
        id: 'dinner_date',
        name: 'Dinner Date',
        description: 'An intimate dinner for two.',
        staminaCost: 15,
        goldCost: 60,
        friendshipBonus: 25,
        duration: 2,
        timeSlot: 'evening',
      },
    ],
  },
  {
    id: 'central_park',
    name: 'Central Park',
    type: 'park',
    openHour: 6,
    closeHour: 22,
    activities: [
      {
        id: 'morning_walk',
        name: 'Morning Walk',
        description: 'A brisk walk in the fresh air.',
        staminaCost: 5,
        goldCost: 0,
        friendshipBonus: 10,
        duration: 1,
        timeSlot: 'morning',
      },
      {
        id: 'picnic',
        name: 'Picnic',
        description: 'Spread a blanket and enjoy the outdoors.',
        staminaCost: 10,
        goldCost: 15,
        friendshipBonus: 15,
        duration: 2,
        timeSlot: 'afternoon',
      },
      {
        id: 'sunset_watch',
        name: 'Sunset Watch',
        description: 'Watch the sun dip below the horizon.',
        staminaCost: 5,
        goldCost: 0,
        friendshipBonus: 12,
        duration: 1,
        timeSlot: 'evening',
      },
    ],
  },
  {
    id: 'fitzone',
    name: 'FitZone',
    type: 'gym',
    openHour: 6,
    closeHour: 21,
    activities: [
      {
        id: 'workout',
        name: 'Workout',
        description: 'Push your limits together.',
        staminaCost: 20,
        goldCost: 10,
        friendshipBonus: 10,
        duration: 2,
        timeSlot: 'morning',
      },
      {
        id: 'yoga_class',
        name: 'Yoga Class',
        description: 'Find your balance and flow.',
        staminaCost: 15,
        goldCost: 15,
        friendshipBonus: 12,
        duration: 1,
        timeSlot: 'afternoon',
      },
    ],
  },
  {
    id: 'pages_and_co',
    name: 'Pages & Co',
    type: 'bookstore',
    openHour: 9,
    closeHour: 20,
    activities: [
      {
        id: 'browse_books',
        name: 'Browse Books',
        description: 'Wander the shelves looking for hidden gems.',
        staminaCost: 5,
        goldCost: 0,
        friendshipBonus: 8,
        duration: 1,
        timeSlot: 'morning',
      },
      {
        id: 'book_club',
        name: 'Book Club',
        description: 'Discuss the latest read over tea.',
        staminaCost: 10,
        goldCost: 0,
        friendshipBonus: 15,
        duration: 2,
        timeSlot: 'afternoon',
      },
    ],
  },
  {
    id: 'frost_gallery',
    name: 'Frost Gallery',
    type: 'gallery',
    openHour: 10,
    closeHour: 18,
    activities: [
      {
        id: 'gallery_tour',
        name: 'Gallery Tour',
        description: 'Stroll through the latest exhibition.',
        staminaCost: 8,
        goldCost: 20,
        friendshipBonus: 12,
        duration: 1,
        timeSlot: 'afternoon',
      },
      {
        id: 'art_class',
        name: 'Art Class',
        description: 'Create something beautiful together.',
        staminaCost: 15,
        goldCost: 25,
        friendshipBonus: 18,
        duration: 2,
        timeSlot: 'afternoon',
      },
    ],
  },
];

// ── Weekend Events ───────────────────────────────────────────
export const WEEKEND_EVENTS: WeekendEvent[] = [
  {
    id: 'block_party',
    name: 'Block Party',
    description: 'A lively neighbourhood street party in the park.',
    venue: 'central_park',
    day: 'saturday',
    season: 'spring',
    hour: 12,
    friendshipBonusAll: 5,
    rewards: [{ itemId: 'flowers', qty: 3 }],
  },
  {
    id: 'open_mic',
    name: 'Open Mic Night',
    description: 'Local talents take the stage at the bar.',
    venue: 'neon_tap',
    day: 'sunday',
    season: 'spring',
    hour: 19,
    friendshipBonusAll: 8,
    rewards: [{ itemId: 'coffee', qty: 2 }],
  },
  {
    id: 'rooftop_concert',
    name: 'Rooftop Concert',
    description: 'Music under the summer stars.',
    venue: 'neon_tap',
    day: 'saturday',
    season: 'summer',
    hour: 20,
    friendshipBonusAll: 10,
    rewards: [{ itemId: 'vinyl_record', qty: 1 }],
  },
  {
    id: 'food_festival',
    name: 'Food Festival',
    description: "Sample the town's best dishes.",
    venue: 'rosemarys',
    day: 'sunday',
    season: 'summer',
    hour: 11,
    friendshipBonusAll: 8,
    rewards: [{ itemId: 'pasta', qty: 2 }],
  },
  {
    id: 'art_show',
    name: 'Art Show',
    description: 'An autumn showcase of local artists.',
    venue: 'frost_gallery',
    day: 'saturday',
    season: 'fall',
    hour: 14,
    friendshipBonusAll: 8,
    rewards: [{ itemId: 'art_print', qty: 1 }],
  },
  {
    id: 'trivia_night',
    name: 'Trivia Night',
    description: 'Test your knowledge at the bar.',
    venue: 'neon_tap',
    day: 'sunday',
    season: 'fall',
    hour: 19,
    friendshipBonusAll: 10,
    rewards: [{ itemId: 'book', qty: 1 }],
  },
  {
    id: 'holiday_market',
    name: 'Holiday Market',
    description: 'A cosy winter market in the park.',
    venue: 'central_park',
    day: 'saturday',
    season: 'winter',
    hour: 10,
    friendshipBonusAll: 8,
    rewards: [{ itemId: 'scented_candle', qty: 2 }],
  },
  {
    id: 'new_years_party',
    name: "New Year's Party",
    description: 'Ring in the new year at the bar.',
    venue: 'neon_tap',
    day: 'sunday',
    season: 'winter',
    hour: 21,
    friendshipBonusAll: 15,
    rewards: [{ itemId: 'craft_beer', qty: 3 }],
  },
];

// ── SocialSystem ─────────────────────────────────────────────
export class SocialSystem {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /** Get venues open at a given hour */
  getOpenVenues(hour: number): Venue[] {
    return CITY_VENUES.filter((venue) => {
      if (venue.openHour < venue.closeHour) {
        return hour >= venue.openHour && hour < venue.closeHour;
      }
      // Crosses midnight (e.g. 17–2)
      return hour >= venue.openHour || hour < venue.closeHour;
    });
  }

  /** Get activities available at a venue during a time slot */
  getActivities(
    venueId: string,
    timeSlot: 'morning' | 'afternoon' | 'evening' | 'night',
  ): VenueActivity[] {
    const venue = CITY_VENUES.find((v) => v.id === venueId);
    if (!venue) return [];
    return venue.activities.filter((a) => a.timeSlot === timeSlot);
  }

  /** Calculate friendship gain for activity with NPC (base + compatibility bonus) */
  calculateFriendshipGain(activity: VenueActivity, npcId: string): number {
    let gain = activity.friendshipBonus;
    // Find which venue owns this activity
    const venue = CITY_VENUES.find((v) =>
      v.activities.some((a) => a.id === activity.id),
    );
    if (venue) {
      const compatible = NPC_COMPATIBILITY[npcId] ?? [];
      if (compatible.includes(venue.type)) {
        gain += 5;
      }
    }
    return gain;
  }

  /** Get this week's weekend event (rotates by weekNumber within the season) */
  getWeekendEvent(season: string, weekNumber: number): WeekendEvent | null {
    const seasonEvents = WEEKEND_EVENTS.filter((e) => e.season === season);
    if (seasonEvents.length === 0) return null;
    return seasonEvents[weekNumber % seasonEvents.length] ?? null;
  }

  /** Get all NPCs who would attend a weekend event */
  getEventAttendees(eventId: string): string[] {
    const event = WEEKEND_EVENTS.find((e) => e.id === eventId);
    if (!event) return [];
    const venue = CITY_VENUES.find((v) => v.id === event.venue);
    if (!venue) return [];
    return Object.entries(NPC_COMPATIBILITY)
      .filter(([, types]) => types.includes(venue.type))
      .map(([npcId]) => npcId);
  }

  destroy(): void {
    // No listeners or timers to clean up
  }
}
