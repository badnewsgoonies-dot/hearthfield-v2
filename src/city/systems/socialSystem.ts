/**
 * Social System — venue activities, NPC hangouts, weekend events, dating
 * NEW FILE — does not modify any existing files
 */
import Phaser from 'phaser';

export interface VenueDef {
  id: string;
  name: string;
  type: 'cafe' | 'bar' | 'restaurant' | 'bookstore' | 'gym' | 'park' | 'gallery' | 'club';
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
  friendshipReward: number;
  duration: number;
  requiredHearts: number;
}

export interface WeekendEvent {
  id: string;
  name: string;
  description: string;
  venue: string;
  dayOfWeek: number;
  season: string;
  activities: VenueActivity[];
  dialogue: string[];
}

export interface DateResult {
  npcId: string;
  success: boolean;
  friendshipGain: number;
  message: string;
}

const DATEABLE_NPCS = ['alex', 'sam', 'mika'];

const VENUES: VenueDef[] = [
  {
    id: 'sunrise_cafe',
    name: 'Sunrise Cafe',
    type: 'cafe',
    openHour: 8,
    closeHour: 21,
    activities: [
      {
        id: 'cafe_coffee',
        name: 'Have coffee',
        description: 'Enjoy a warm cup of coffee together.',
        staminaCost: 5,
        goldCost: 10,
        friendshipReward: 8,
        duration: 1,
        requiredHearts: 0,
      },
      {
        id: 'cafe_pastry',
        name: 'Share pastry',
        description: 'Split a fresh pastry from the display case.',
        staminaCost: 3,
        goldCost: 20,
        friendshipReward: 12,
        duration: 1,
        requiredHearts: 2,
      },
    ],
  },
  {
    id: 'neon_lounge',
    name: 'The Neon Lounge',
    type: 'bar',
    openHour: 18,
    closeHour: 26, // 2 AM represented as 26
    activities: [
      {
        id: 'bar_drinks',
        name: 'Grab drinks',
        description: 'Order a round at the bar.',
        staminaCost: 8,
        goldCost: 30,
        friendshipReward: 10,
        duration: 2,
        requiredHearts: 0,
      },
      {
        id: 'bar_dance',
        name: 'Dance',
        description: 'Hit the dance floor together.',
        staminaCost: 15,
        goldCost: 0,
        friendshipReward: 15,
        duration: 2,
        requiredHearts: 3,
      },
      {
        id: 'bar_karaoke',
        name: 'Karaoke',
        description: 'Take the mic for a duet.',
        staminaCost: 10,
        goldCost: 0,
        friendshipReward: 20,
        duration: 2,
        requiredHearts: 4,
      },
    ],
  },
  {
    id: 'sakura_kitchen',
    name: 'Sakura Kitchen',
    type: 'restaurant',
    openHour: 11,
    closeHour: 22,
    activities: [
      {
        id: 'rest_dinner',
        name: 'Dinner together',
        description: "Share a lovely dinner at Chen's restaurant.",
        staminaCost: 5,
        goldCost: 50,
        friendshipReward: 15,
        duration: 2,
        requiredHearts: 0,
      },
      {
        id: 'rest_tasting',
        name: "Chef's tasting",
        description: "Experience Chen's special tasting menu.",
        staminaCost: 5,
        goldCost: 100,
        friendshipReward: 25,
        duration: 3,
        requiredHearts: 4,
      },
    ],
  },
  {
    id: 'priyas_books',
    name: "Priya's Books",
    type: 'bookstore',
    openHour: 9,
    closeHour: 21,
    activities: [
      {
        id: 'book_browse',
        name: 'Browse together',
        description: 'Wander the shelves and share recommendations.',
        staminaCost: 3,
        goldCost: 0,
        friendshipReward: 8,
        duration: 1,
        requiredHearts: 0,
      },
      {
        id: 'book_club',
        name: 'Book club',
        description: 'Join the informal book discussion in the back room.',
        staminaCost: 5,
        goldCost: 0,
        friendshipReward: 12,
        duration: 2,
        requiredHearts: 2,
      },
    ],
  },
  {
    id: 'iron_forge_gym',
    name: 'Iron Forge Gym',
    type: 'gym',
    openHour: 6,
    closeHour: 22,
    activities: [
      {
        id: 'gym_workout',
        name: 'Workout',
        description: 'Break a sweat side by side.',
        staminaCost: 20,
        goldCost: 15,
        friendshipReward: 8,
        duration: 2,
        requiredHearts: 0,
      },
      {
        id: 'gym_sparring',
        name: 'Sparring',
        description: 'Friendly sparring session with Derek coaching.',
        staminaCost: 25,
        goldCost: 0,
        friendshipReward: 15,
        duration: 2,
        requiredHearts: 3,
      },
    ],
  },
  {
    id: 'central_park',
    name: 'Central Park',
    type: 'park',
    openHour: 0,
    closeHour: 24,
    activities: [
      {
        id: 'park_walk',
        name: 'Walk',
        description: 'Stroll through the park together.',
        staminaCost: 8,
        goldCost: 0,
        friendshipReward: 10,
        duration: 1,
        requiredHearts: 0,
      },
      {
        id: 'park_picnic',
        name: 'Picnic',
        description: 'Spread a blanket and enjoy the afternoon.',
        staminaCost: 5,
        goldCost: 20,
        friendshipReward: 18,
        duration: 2,
        requiredHearts: 3,
      },
    ],
  },
  {
    id: 'mikas_gallery',
    name: "Mika's Gallery",
    type: 'gallery',
    openHour: 10,
    closeHour: 20,
    activities: [
      {
        id: 'gallery_exhibit',
        name: 'View exhibit',
        description: 'Take in the current exhibition.',
        staminaCost: 3,
        goldCost: 10,
        friendshipReward: 8,
        duration: 1,
        requiredHearts: 0,
      },
      {
        id: 'gallery_tour',
        name: 'Private tour',
        description: 'Mika gives an exclusive behind-the-scenes tour.',
        staminaCost: 5,
        goldCost: 25,
        friendshipReward: 20,
        duration: 2,
        requiredHearts: 4,
      },
    ],
  },
  {
    id: 'club_pulse',
    name: 'Club Pulse',
    type: 'club',
    openHour: 20,
    closeHour: 26,
    activities: [
      {
        id: 'club_night_out',
        name: 'Night out',
        description: 'Dance the night away at the city hotspot.',
        staminaCost: 20,
        goldCost: 40,
        friendshipReward: 12,
        duration: 3,
        requiredHearts: 0,
      },
      {
        id: 'club_vip',
        name: 'VIP booth',
        description: 'Reserve the VIP booth for an upscale evening.',
        staminaCost: 15,
        goldCost: 100,
        friendshipReward: 25,
        duration: 3,
        requiredHearts: 5,
      },
    ],
  },
];

const WEEKEND_EVENTS: WeekendEvent[] = [
  {
    id: 'gallery_opening',
    name: 'Gallery Opening',
    description: "A glamorous opening night at Mika's Gallery featuring new local artists.",
    venue: 'mikas_gallery',
    dayOfWeek: 5,
    season: 'spring',
    activities: [
      {
        id: 'go_opening_mingle',
        name: 'Mingle with guests',
        description: 'Work the room and meet the artists.',
        staminaCost: 5,
        goldCost: 0,
        friendshipReward: 15,
        duration: 2,
        requiredHearts: 0,
      },
      {
        id: 'go_opening_champagne',
        name: 'Champagne toast',
        description: 'Raise a glass to the new exhibit.',
        staminaCost: 3,
        goldCost: 30,
        friendshipReward: 20,
        duration: 1,
        requiredHearts: 0,
      },
    ],
    dialogue: [
      'The gallery glows with warm light and excited chatter.',
      'Mika beams with pride as guests admire the new pieces.',
      'Fresh flowers and canvases fill every corner of the room.',
      "You can't help but feel inspired by all the creativity around you.",
      'Even the city outside seems quieter tonight — like it knows something special is happening.',
    ],
  },
  {
    id: 'park_yoga',
    name: 'Park Yoga',
    description: 'A community yoga session on the great lawn of Central Park.',
    venue: 'central_park',
    dayOfWeek: 6,
    season: 'spring',
    activities: [
      {
        id: 'yoga_join',
        name: 'Join the class',
        description: 'Follow along with the outdoor yoga instructor.',
        staminaCost: 10,
        goldCost: 0,
        friendshipReward: 12,
        duration: 1,
        requiredHearts: 0,
      },
      {
        id: 'yoga_meditate',
        name: 'Meditate together',
        description: 'Find a quiet corner of the lawn to breathe.',
        staminaCost: 5,
        goldCost: 0,
        friendshipReward: 18,
        duration: 1,
        requiredHearts: 0,
      },
    ],
    dialogue: [
      'The spring air is crisp and fragrant with blooming flowers.',
      'Mats are spread across the lawn in a colorful patchwork.',
      'Birds sing overhead as the instructor guides the group.',
      'Val waves at you from across the lawn with a big grin.',
      "Afterward, the park feels more alive — like the whole city exhaled at once.",
    ],
  },
  {
    id: 'rooftop_party',
    name: 'Rooftop Party',
    description: 'A summer rooftop bash hosted at Club Pulse with skyline views.',
    venue: 'club_pulse',
    dayOfWeek: 5,
    season: 'summer',
    activities: [
      {
        id: 'rp_dance_roof',
        name: 'Dance on the rooftop',
        description: 'Dance under the open sky with the city below.',
        staminaCost: 18,
        goldCost: 20,
        friendshipReward: 20,
        duration: 2,
        requiredHearts: 0,
      },
      {
        id: 'rp_skyline',
        name: 'Watch the skyline',
        description: 'Find a quiet rail and take in the summer city lights.',
        staminaCost: 5,
        goldCost: 0,
        friendshipReward: 15,
        duration: 1,
        requiredHearts: 0,
      },
    ],
    dialogue: [
      'The summer heat is finally broken by a rooftop breeze.',
      'City lights stretch to the horizon in every direction.',
      'Music pulses up from below, mingling with laughter all around.',
      "Sam raises a glass from across the crowd and winks.",
      'For a moment you think: this is exactly where you want to be.',
    ],
  },
  {
    id: 'food_festival',
    name: 'Food Festival',
    description: "A sprawling outdoor food festival in Central Park with the city's best chefs.",
    venue: 'central_park',
    dayOfWeek: 6,
    season: 'summer',
    activities: [
      {
        id: 'ff_taste',
        name: 'Sample dishes',
        description: 'Try bites from a dozen different stalls.',
        staminaCost: 5,
        goldCost: 25,
        friendshipReward: 15,
        duration: 2,
        requiredHearts: 0,
      },
      {
        id: 'ff_chen_stall',
        name: "Visit Chen's stall",
        description: "Stop by Chen's special festival booth for a preview dish.",
        staminaCost: 5,
        goldCost: 40,
        friendshipReward: 22,
        duration: 1,
        requiredHearts: 0,
      },
    ],
    dialogue: [
      'The park smells incredible — smoky, sweet, and spicy all at once.',
      'Colorful banners and tents line every path through the park.',
      'Chen waves you over with a proud smile and a loaded fork.',
      "You lose track of how many samples you've tried. You regret nothing.",
      'The evening sun turns golden and everything feels easy and full.',
    ],
  },
  {
    id: 'jazz_night',
    name: 'Jazz Night',
    description: 'Live jazz at The Neon Lounge for one special fall evening.',
    venue: 'neon_lounge',
    dayOfWeek: 5,
    season: 'fall',
    activities: [
      {
        id: 'jn_listen',
        name: 'Listen to the band',
        description: 'Find a good seat and lose yourself in the music.',
        staminaCost: 5,
        goldCost: 15,
        friendshipReward: 15,
        duration: 2,
        requiredHearts: 0,
      },
      {
        id: 'jn_slow_dance',
        name: 'Slow dance',
        description: 'Pull your companion onto the small dance floor.',
        staminaCost: 8,
        goldCost: 0,
        friendshipReward: 25,
        duration: 1,
        requiredHearts: 0,
      },
    ],
    dialogue: [
      'Amber light fills the lounge as a trumpet wails softly.',
      'The crowd sways together, strangers and friends alike.',
      "Sam's behind the bar, but even they stop to listen for a moment.",
      'Rain taps the windows outside, adding to the atmosphere.',
      'Some nights the city feels like a song playing just for you.',
    ],
  },
  {
    id: 'book_fair',
    name: 'Book Fair',
    description: "A charming book fair spilling out of Priya's Books into the street.",
    venue: 'priyas_books',
    dayOfWeek: 6,
    season: 'fall',
    activities: [
      {
        id: 'bf_hunt',
        name: 'Hunt for treasures',
        description: 'Dig through tables of used books for hidden gems.',
        staminaCost: 5,
        goldCost: 10,
        friendshipReward: 14,
        duration: 2,
        requiredHearts: 0,
      },
      {
        id: 'bf_reading',
        name: 'Author reading',
        description: 'Attend the short author reading in the doorway.',
        staminaCost: 3,
        goldCost: 0,
        friendshipReward: 18,
        duration: 1,
        requiredHearts: 0,
      },
    ],
    dialogue: [
      'Folding tables overflow with paperbacks in every direction.',
      'Priya greets everyone by name with a warm smile and a recommendation.',
      'The smell of old paper mingles with autumn leaves in the air.',
      "You find a book you've been looking for for months — marked down to two gold.",
      'Even people who never read stop to browse. Books have a way of doing that.',
    ],
  },
  {
    id: 'holiday_market',
    name: 'Holiday Market',
    description: 'A festive winter market in Central Park with lights, crafts, and hot drinks.',
    venue: 'central_park',
    dayOfWeek: 5,
    season: 'winter',
    activities: [
      {
        id: 'hm_browse_stalls',
        name: 'Browse stalls',
        description: 'Wander through the decorated market stalls.',
        staminaCost: 5,
        goldCost: 0,
        friendshipReward: 12,
        duration: 2,
        requiredHearts: 0,
      },
      {
        id: 'hm_hot_cocoa',
        name: 'Share hot cocoa',
        description: 'Warm up with a mug of cocoa by the fire pit.',
        staminaCost: 3,
        goldCost: 15,
        friendshipReward: 20,
        duration: 1,
        requiredHearts: 0,
      },
    ],
    dialogue: [
      'Fairy lights twinkle across every stall and tree branch.',
      'Your breath mists in the cold air but no one seems to mind.',
      'The smell of cinnamon and pine is almost overwhelming — in the best way.',
      'Val drags you to a stall selling handmade scarves. They buy three.',
      'For a moment, the whole park feels like a snow globe.',
    ],
  },
  {
    id: 'nye_party',
    name: 'NYE Party',
    description: "Ring in the New Year at Club Pulse's legendary New Year's Eve bash.",
    venue: 'club_pulse',
    dayOfWeek: 6,
    season: 'winter',
    activities: [
      {
        id: 'nye_countdown',
        name: 'Join the countdown',
        description: 'Count down to midnight with the whole crowd.',
        staminaCost: 10,
        goldCost: 50,
        friendshipReward: 25,
        duration: 2,
        requiredHearts: 0,
      },
      {
        id: 'nye_toast',
        name: 'Champagne toast',
        description: 'Clink glasses at midnight for good luck.',
        staminaCost: 5,
        goldCost: 40,
        friendshipReward: 20,
        duration: 1,
        requiredHearts: 0,
      },
    ],
    dialogue: [
      'Club Pulse is packed wall to wall — everyone in the city showed up.',
      'Confetti rains down from the ceiling as the clock ticks closer.',
      'Sam slides a glass of champagne across the bar: "On the house."',
      "The countdown begins — ten, nine, eight — and your heart pounds.",
      'Midnight hits. The city erupts. A new year begins.',
    ],
  },
];

export class SocialSystem {
  private scene: Phaser.Scene;
  private lastDateDay: number = -1;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  getVenues(): VenueDef[] {
    return VENUES;
  }

  getAvailableActivities(venueId: string, currentHour: number, companionId?: string): VenueActivity[] {
    const venue = VENUES.find(v => v.id === venueId);
    if (!venue) return [];

    const closeHour = venue.closeHour > 24 ? venue.closeHour - 24 : venue.closeHour;
    const isOpen =
      venue.openHour === 0 && venue.closeHour === 24
        ? true
        : venue.closeHour > 24
        ? currentHour >= venue.openHour || currentHour < closeHour
        : currentHour >= venue.openHour && currentHour < venue.closeHour;

    if (!isOpen) return [];

    if (!companionId) {
      return venue.activities.filter(a => a.requiredHearts === 0);
    }

    return venue.activities;
  }

  doActivity(
    activityId: string,
    venueId: string,
    npcId: string
  ): { friendshipGain: number; staminaCost: number; goldCost: number; message: string } {
    const venue = VENUES.find(v => v.id === venueId);
    if (!venue) {
      return { friendshipGain: 0, staminaCost: 0, goldCost: 0, message: 'Venue not found.' };
    }

    // Also search weekend event activities
    const activity =
      venue.activities.find(a => a.id === activityId) ??
      WEEKEND_EVENTS.flatMap(e => e.activities).find(a => a.id === activityId);

    if (!activity) {
      return { friendshipGain: 0, staminaCost: 0, goldCost: 0, message: 'Activity not found.' };
    }

    const message = `You and ${npcId} enjoyed "${activity.name}" at ${venue.name}. +${activity.friendshipReward} friendship!`;

    return {
      friendshipGain: activity.friendshipReward,
      staminaCost: activity.staminaCost,
      goldCost: activity.goldCost,
      message,
    };
  }

  getWeekendEvent(dayOfWeek: number, season: string): WeekendEvent | null {
    return WEEKEND_EVENTS.find(e => e.dayOfWeek === dayOfWeek && e.season === season) ?? null;
  }

  askOnDate(npcId: string, venueId: string, hearts: number): DateResult {
    if (!DATEABLE_NPCS.includes(npcId)) {
      return {
        npcId,
        success: false,
        friendshipGain: 0,
        message: `${npcId} isn't looking for a date right now.`,
      };
    }

    if (hearts < 5) {
      return {
        npcId,
        success: false,
        friendshipGain: 0,
        message: `You need at least 5 hearts with ${npcId} to ask them on a date.`,
      };
    }

    const today = this.scene.game.getTime();
    if (today === this.lastDateDay) {
      return {
        npcId,
        success: false,
        friendshipGain: 0,
        message: "You've already been on a date today.",
      };
    }

    const successChance = 0.6 + (hearts - 5) * 0.05;
    const roll = Math.random();

    this.lastDateDay = today;

    if (roll <= successChance) {
      return {
        npcId,
        success: true,
        friendshipGain: 30,
        message: `${npcId} smiled warmly and said yes! You had a wonderful time together. +30 friendship!`,
      };
    } else {
      return {
        npcId,
        success: false,
        friendshipGain: 5,
        message: `${npcId} appreciated the gesture but wasn't quite ready. Maybe next time! +5 friendship.`,
      };
    }
  }

  getNPCsAtVenue(venueId: string, currentHour: number, npcSchedules: Record<string, any>): string[] {
    const present: string[] = [];
    for (const [npcId, schedule] of Object.entries(npcSchedules)) {
      if (schedule && schedule.location === venueId) {
        const start: number = schedule.startHour ?? 0;
        const end: number = schedule.endHour ?? 24;
        if (currentHour >= start && currentHour < end) {
          present.push(npcId);
        }
      }
    }
    return present;
  }
}
