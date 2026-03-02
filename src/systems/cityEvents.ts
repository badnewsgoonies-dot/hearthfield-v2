export interface CityEvent {
  id: string;
  name: string;
  season: string;
  day: number;
  description: string;
  location: string;
}

export interface CityEventResult {
  eventId: string;
  participated: boolean;
  score: number;
  rank: 'gold' | 'silver' | 'bronze' | 'participant';
  rewards: Array<{ itemId: string; quantity: number }>;
  message: string;
}

type CityRank = 'gold' | 'silver' | 'bronze' | 'participant';

const CITY_EVENT_DIALOGUE: Record<string, Record<string, string[]>> = {
  food_festival: {
    alex: [
      'The ramen stall near the corner is already sold out. I got there early.',
      'I judge a food festival by how many dishes I cannot stop thinking about after.',
      'Bring your absolute best dish and let the crowd decide the rest.',
    ],
    morgan: [
      'A real food festival is about stories behind the plates, not just flavors.',
      'I have been reviewing restaurants for years, but street stalls still surprise me.',
      'The sushi vendor at the end of the row uses fish from the harbor this morning.',
    ],
    sam: [
      'I practiced this recipe six times before today. No regrets.',
      'Scoring top marks here means your cooking actually connects with people.',
      'Try the fusion stand near the fountain. Unexpected, but it works.',
    ],
    jordan: [
      'Food is medicine when it is made with care. This festival proves it.',
      'I always look for the dish that took the most patience to prepare.',
      'The herb vendor has supplies I cannot find anywhere else in the city.',
    ],
    casey: [
      'Every booth here has a different philosophy about flavor. I love it.',
      'I tried to enter but my specialty is desserts and they judge main courses.',
      'Golden rank means your food left an impression nobody expected.',
    ],
    riley: [
      'I covered three food festivals this year. This one has the best layout.',
      'The crowd response tells you everything about a dish before you taste it.',
      'Whoever wins gold today earned it with every prep hour behind the scenes.',
    ],
    taylor: [
      'I designed the stage banners. The organizers let me pick the color palette.',
      'Flavor and presentation together are what separate good cooks from great ones.',
      'I always eat something unexpected at these events. Today it was the miso crêpe.',
    ],
  },
  art_walk: {
    alex: [
      'Gallery spaces feel different when the artists are standing right beside their work.',
      'I picked up two pieces already. My walls are running out of room.',
      'If you find something that stops you mid-step, that is the one to buy.',
    ],
    morgan: [
      'The printmaker on the second block studied under someone I interviewed once.',
      'Art walks are about the conversation, not just the canvas.',
      'I always buy something I do not fully understand yet.',
    ],
    sam: [
      'I gifted a watercolor to a friend last year and they still talk about it.',
      'The meaning of a piece changes completely when you give it to someone.',
      'Scoring well here means your generosity matched the art\'s worth.',
    ],
    casey: [
      'I sketched half these buildings in my own notebook before they became gallery walls.',
      'Street art and gallery art are siblings. Today they share the same block.',
      'The photographer near the alley does work that stops conversations cold.',
    ],
    riley: [
      'I wrote a piece on this walk last spring. The scene has changed completely.',
      'Artists deserve more than one day a year to show what they have been making.',
      'The ceramic sculptor has a new series that took me a while to understand.',
    ],
    taylor: [
      'I have work in the third venue. I am terrified and excited in equal measure.',
      'Every brushstroke today represents hours that nobody gets to see.',
      'Gold rank today means your gifting matched the vision behind the work.',
    ],
  },
  block_party: {
    alex: [
      'I have lived on this block for years and still learn something new at every party.',
      'Bring a good attitude and let the music handle the rest.',
      'The more friendships you carry in, the better this day feels on the way out.',
    ],
    morgan: [
      'Block parties remind me why I chose city living over anything quieter.',
      'I have been talking to people today I walk past every single morning.',
      'Score here reflects how rooted you really are in this neighborhood.',
    ],
    sam: [
      'I cooked three dishes and still had time to catch up with everyone on my floor.',
      'This is the kind of afternoon that recharges you for months.',
      'Your friendship total shows up right here, when the whole block comes together.',
    ],
    jordan: [
      'Community is health in its most direct form. Today is proof of that.',
      'I organized the first aid station but I have barely needed to use it.',
      'Strong friendships produce the kind of joy you feel in your whole body.',
    ],
    casey: [
      'I decorated the whole corner stretch this morning with stuff I had at home.',
      'Spontaneous block parties have energy. Organized ones have heart. This is both.',
      'Gold rank means your social network actually carries this neighborhood.',
    ],
    riley: [
      'I should be filing a story right now but I cannot stop talking to people.',
      'The best parties are the ones where nobody checks the time.',
      'Whoever organized this food situation deserves serious credit.',
    ],
    taylor: [
      'I helped string the lights last night. Took two hours and it was completely worth it.',
      'Color and light transform a sidewalk into a whole different place.',
      'Your friends showed up for you today. That matters more than any score.',
    ],
  },
  rooftop_concert: {
    alex: [
      'Getting a rooftop ticket is harder than it looks. I am still not sure how I managed it.',
      'One strong connection up here is worth more than a packed contact list.',
      'The skyline at this hour looks completely different from street level.',
    ],
    morgan: [
      'I interviewed the headliner last month. Tonight feels personal in a new way.',
      'A concert is better when you share it with someone who really listens.',
      'Your strongest friendship defines tonight more than anything else here.',
    ],
    sam: [
      'I brought the person I feel closest to. They did not expect the view.',
      'Music lands differently when you are standing next to someone who matters.',
      'High marks here come from depth, not from knowing everyone.',
    ],
    jordan: [
      'The acoustics up here are genuinely excellent. I did not expect that.',
      'Shared experience at the right moment creates bonds that last.',
      'Whoever you brought tonight, they will remember this with you.',
    ],
    casey: [
      'I sketched the crowd during the opener. Forty people, forty different ways to listen.',
      'A rooftop show has an intimacy that stadium concerts cannot replicate.',
      'Gold tonight means one friendship runs so deep it carries its own score.',
    ],
    riley: [
      'I am supposed to cover this objectively but I am clearly just having a good time.',
      'The best concerts make you forget you are in a city for a few minutes.',
      'Bring someone close and let the music do the rest of the talking.',
    ],
    taylor: [
      'I helped design the stage backdrop. Every light placement was intentional.',
      'Art, music, and a person you trust. That is a near-perfect evening.',
      'The vinyl record they are selling is limited. Grab one if you can.',
    ],
  },
  harvest_market: {
    alex: [
      'I come every year just for the smoked pepper oil. I buy six jars.',
      'Seasonal markets remind you that city food has roots somewhere real.',
      'No competition today. Just good produce and better conversations.',
    ],
    morgan: [
      'The farmer from the valley always has the best late squash of the season.',
      'Markets like this connect the city to where its food actually comes from.',
      'I picked up dried herbs that will last through the whole winter.',
    ],
    sam: [
      'I have been planning my larder restock around this market for weeks.',
      'Every booth here is someone\'s full year of work on display.',
      'No prizes today, just community. That is honestly enough.',
    ],
    jordan: [
      'I come for medicinal herbs and leave with three bags of things I did not plan to buy.',
      'Whole food markets are one of the best things this neighborhood has going for it.',
      'The coffee roaster at the east end has a blend you will not find anywhere else.',
    ],
    casey: [
      'I sketched the market layout in the morning before the crowds arrived.',
      'Color changes completely in fall. Even vegetables feel more saturated.',
      'Everybody wins at the harvest market. That is exactly how it should be.',
    ],
    riley: [
      'I do a market feature every fall and this one consistently has the most character.',
      'The heirloom tomato variety that vendor grows is not available commercially.',
      'A community that supports its farmers has something worth protecting.',
    ],
    taylor: [
      'I made the signage for four of these booths. It is a nice feeling to see them up.',
      'The market palette is all amber, rust, and deep green today.',
      'Everyone gets a fair share here. Participation is its own kind of gold.',
    ],
  },
  pub_crawl: {
    alex: [
      'I mapped the route last night. Four venues, one evening, no backtracking.',
      'The bookstore bar is new this year and already the best stop on the circuit.',
      'Covering all four marks the real run. Two out of four is a walk.',
    ],
    morgan: [
      'Every venue on this crawl has a different crowd and a completely different vibe.',
      'I came for the cocktails and stayed for the conversation at every single stop.',
      'Gold rank means you saw everything this neighborhood has to offer tonight.',
    ],
    sam: [
      'The rooftop bar has a cocktail named after the building it sits on. Worth it.',
      'I treat the crawl as a tour of the city\'s personality, one venue at a time.',
      'Your venue count tonight is a score all on its own.',
    ],
    jordan: [
      'Pacing matters on a crawl. Stay hydrated between stops. I am a professional.',
      'The café does a late espresso that pairs perfectly with the next stop.',
      'The city has layers. A good crawl shows you three or four of them.',
    ],
    casey: [
      'Every venue I visit tonight goes straight into a sketchbook entry.',
      'Bar design tells you everything about who the owners want to attract.',
      'Four venues is full marks. Two is a solid start. Zero is just a Tuesday.',
    ],
    riley: [
      'I have covered every pub crawl in this district for four years running.',
      'The energy shifts venue to venue in ways that are genuinely hard to describe.',
      'Gold rank crawlers are the ones who actually stay curious at every stop.',
    ],
    taylor: [
      'I illustrated the crawl poster this year. Eight colors, two late nights.',
      'The bar I enjoy most changes every year depending on who is staffing it.',
      'A city shows you who it is after dark. Tonight is a good introduction.',
    ],
  },
  holiday_lights: {
    alex: [
      'I started decorating in October this year. The neighbors had opinions.',
      'A well-lit apartment on a winter night does something good for the whole street.',
      'Your item count shows how much of yourself you put into making home feel like home.',
    ],
    morgan: [
      'I write about design, and I think the best apartment setups tell a story.',
      'Eight items or more means the space has real warmth behind the choices.',
      'This is the one season where maximalism is not just acceptable, it is correct.',
    ],
    sam: [
      'I spent two weekends arranging and rearranging before I felt settled.',
      'A decorated apartment is an invitation to feel something specific when you walk in.',
      'Gold rank here means your home has become something worth visiting.',
    ],
    jordan: [
      'The light levels matter. Warm light in winter has measurable mood effects.',
      'I added plants to my holiday display this year and the effect was completely different.',
      'Your home reflects your intentions. This event surfaces exactly that.',
    ],
    casey: [
      'I consider apartment decorating a legitimate art form and I will not apologize for it.',
      'The difference between eight items and five items is the difference between a mood and a statement.',
      'I helped three neighbors with their layouts. All of them thanked me.',
    ],
    riley: [
      'I did a holiday lights feature once. The apartments I still remember were the ones with thought behind them.',
      'Candles, color, texture. The simplest tools create the most lasting impressions.',
      'Gold rank apartments have a quality that photographs but also a quality that does not.',
    ],
    taylor: [
      'I curated every piece in my apartment by asking if it adds to the story of the room.',
      'Scented candles are an underrated element. Scent memory is powerful.',
      'Your item count is a rough proxy for how much you care about the space you live in.',
    ],
  },
  new_years_gala: {
    alex: [
      'I go big on the gala every year. It sets the tone for everything after.',
      'You cannot hold back on the last night. Spend well and let the year close correctly.',
      'Gold rank tonight means you committed to the send-off this city deserves.',
    ],
    morgan: [
      'I cover the gala every year. The most interesting guests always arrive last.',
      'New Year\'s galas are about possibility, not just celebration.',
      'What you spend tonight says something about what you expect from tomorrow.',
    ],
    sam: [
      'I saved specifically for this. Some evenings are worth planning backward from.',
      'The catering here comes from three different restaurants. I have tried everything.',
      'High gold spend translates directly to a rank that feels earned when midnight comes.',
    ],
    jordan: [
      'I approach the gala as a reset ritual. Deliberate, specific, meaningful.',
      'The best thing you can do on the last night is give the evening its full due.',
      'Spending generously tonight is not excess. It is intention.',
    ],
    casey: [
      'I designed the decorations for the main hall. Every element has a reason.',
      'New Year\'s events have a visual language. I tried to honor and update it.',
      'Gold rank tonight means you showed up fully for the close of the year.',
    ],
    riley: [
      'Filing my year-end piece while wearing formal wear is one of my traditions now.',
      'The gala separates the people who celebrate from the people who truly mark the moment.',
      'This city earns a good send-off every year. Tonight is how you give it one.',
    ],
    taylor: [
      'I art-directed the program layout and the table settings. It took most of November.',
      'A beautiful ending creates space for a better beginning. That is the whole point.',
      'Gold rank tonight means the year ended with full presence and real investment.',
    ],
  },
};

const DEFAULT_DIALOGUE = [
  'City events bring out the best side of this neighborhood.',
  'There is always something worth showing up for around here.',
  'See you at the next one.',
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function getCityRank(
  score: number,
  thresholds: { gold?: number; silver?: number; bronze?: number }
): CityRank {
  if (thresholds.gold !== undefined && score >= thresholds.gold) return 'gold';
  if (thresholds.silver !== undefined && score >= thresholds.silver) return 'silver';
  if (thresholds.bronze !== undefined && score >= thresholds.bronze) return 'bronze';
  return 'participant';
}

export class CityEventHandler {
  static readonly CITY_EVENTS: CityEvent[] = [
    {
      id: 'food_festival',
      name: 'Food Festival',
      season: 'spring',
      day: 15,
      description: 'Showcase the finest city cuisine in a competitive tasting event.',
      location: 'City Square',
    },
    {
      id: 'art_walk',
      name: 'Art Walk',
      season: 'spring',
      day: 25,
      description: 'Explore galleries and gift art pieces to friends along the city streets.',
      location: 'Arts District',
    },
    {
      id: 'block_party',
      name: 'Block Party',
      season: 'summer',
      day: 12,
      description: 'Celebrate your neighborhood with everyone you know.',
      location: 'Residential Block',
    },
    {
      id: 'rooftop_concert',
      name: 'Rooftop Concert',
      season: 'summer',
      day: 26,
      description: 'Enjoy live music on the rooftop with your closest friend.',
      location: 'Rooftop Venue',
    },
    {
      id: 'harvest_market',
      name: 'Harvest Market',
      season: 'fall',
      day: 14,
      description: 'A community market celebrating the season\'s best produce.',
      location: 'Farmers Market',
    },
    {
      id: 'pub_crawl',
      name: 'Pub Crawl',
      season: 'fall',
      day: 27,
      description: 'Tour the city\'s best venues in one legendary evening.',
      location: 'City District',
    },
    {
      id: 'holiday_lights',
      name: 'Holiday Lights',
      season: 'winter',
      day: 10,
      description: 'Deck your apartment with decorations and show off your festive spirit.',
      location: 'Your Apartment',
    },
    {
      id: 'new_years_gala',
      name: 'New Year\'s Gala',
      season: 'winter',
      day: 28,
      description: 'Ring in the new year at the city\'s most prestigious event.',
      location: 'Grand Ballroom',
    },
  ];

  static getTodaysEvent(season: string, day: number): CityEvent | null {
    return (
      CityEventHandler.CITY_EVENTS.find(
        (e) => e.season === season.toLowerCase() && e.day === day
      ) ?? null
    );
  }

  static calculateScore(
    eventId: string,
    playerData: {
      gold: number;
      friendships: Record<string, number>;
      bestItemValue: number;
      venuesVisited: number;
      apartmentItems: number;
      mealsCooked: number;
      daysWorked: number;
    }
  ): CityEventResult {
    const { gold, friendships, bestItemValue, venuesVisited, apartmentItems } = playerData;

    switch (eventId) {
      case 'food_festival': {
        const score = clamp(bestItemValue, 0, 5000);
        const rank = getCityRank(score, { gold: 100, silver: 60, bronze: 30 });
        return {
          eventId,
          participated: true,
          score,
          rank,
          rewards: rank !== 'participant' ? [{ itemId: 'sushi', quantity: 3 }] : [],
          message: `Your dish scored ${score} at the food festival, earning ${rank} rank.`,
        };
      }

      case 'art_walk': {
        const score = clamp(bestItemValue, 0, 10000);
        const rank = getCityRank(score, { gold: 200, silver: 100, bronze: 50 });
        return {
          eventId,
          participated: true,
          score,
          rank,
          rewards: rank !== 'participant' ? [{ itemId: 'art_print', quantity: 2 }] : [],
          message: `Your gifted art totalled ${score} in value, placing you at ${rank} rank.`,
        };
      }

      case 'block_party': {
        const friendshipTotal = Object.values(friendships).reduce((sum, v) => sum + v, 0);
        const score = Math.floor(friendshipTotal / 100);
        const rank = getCityRank(score, { gold: 15, silver: 10, bronze: 5 });
        return {
          eventId,
          participated: true,
          score,
          rank,
          rewards: rank !== 'participant' ? [{ itemId: 'concert_ticket', quantity: 2 }] : [],
          message: `Your friendship network scored ${score} at the block party, earning ${rank}.`,
        };
      }

      case 'rooftop_concert': {
        const highest = Object.values(friendships).reduce((max, v) => Math.max(max, v), 0);
        const score = Math.floor(highest / 50);
        const rank = getCityRank(score, { gold: 16, silver: 10, bronze: 5 });
        return {
          eventId,
          participated: true,
          score,
          rank,
          rewards: rank !== 'participant' ? [{ itemId: 'vinyl_record', quantity: 1 }] : [],
          message: `Your strongest friendship scored ${score} at the rooftop concert, earning ${rank}.`,
        };
      }

      case 'harvest_market': {
        const score = 50;
        return {
          eventId,
          participated: true,
          score,
          rank: 'participant',
          rewards: [{ itemId: 'coffee', quantity: 5 }],
          message: 'You enjoyed the harvest market and came home with a bag full of seasonal goods.',
        };
      }

      case 'pub_crawl': {
        const score = clamp(venuesVisited, 0, 4);
        const rank = getCityRank(score, { gold: 4, silver: 3, bronze: 2 });
        return {
          eventId,
          participated: true,
          score,
          rank,
          rewards: rank !== 'participant' ? [{ itemId: 'cocktail', quantity: 3 }] : [],
          message: `You visited ${score} venues on the pub crawl, earning ${rank} rank.`,
        };
      }

      case 'holiday_lights': {
        const score = clamp(apartmentItems, 0, 999);
        const rank = getCityRank(score, { gold: 8, silver: 5, bronze: 3 });
        return {
          eventId,
          participated: true,
          score,
          rank,
          rewards: rank !== 'participant' ? [{ itemId: 'scented_candle', quantity: 3 }] : [],
          message: `Your apartment had ${score} decorative items, earning ${rank} rank for holiday lights.`,
        };
      }

      case 'new_years_gala': {
        const spent = clamp(gold, 0, 2000);
        const score = spent;
        const rank = getCityRank(score, { gold: 1500, silver: 800, bronze: 300 });
        return {
          eventId,
          participated: true,
          score,
          rank,
          rewards: rank !== 'participant' ? [{ itemId: 'chocolate_box', quantity: 5 }] : [],
          message: `You spent ${score}g at the New Year's Gala, securing ${rank} rank.`,
        };
      }

      default:
        return {
          eventId,
          participated: true,
          score: 0,
          rank: 'participant',
          rewards: [],
          message: `You attended the city event and enjoyed the atmosphere.`,
        };
    }
  }

  static getEventDialogue(eventId: string, npcId: string): string[] {
    const normalizedNpcId = npcId.toLowerCase().trim();
    return CITY_EVENT_DIALOGUE[eventId]?.[normalizedNpcId] ?? DEFAULT_DIALOGUE;
  }
}
