import Phaser from 'phaser';
import { Season } from '../types';
import { FestivalDef } from '../data/festivalData';

export interface FestivalResult {
  festivalId: string;
  participated: boolean;
  score: number;
  rank: string;
  rewards: Array<{ itemId: string; qty: number }>;
  message: string;
}

export interface FestivalActivity {
  name: string;
  description: string;
  scoreFormula: string;
}

type Rank = 'Gold' | 'Silver' | 'Bronze' | 'Participant';

const FESTIVAL_ACTIVITIES: Record<string, FestivalActivity[]> = {
  egg_festival: [
    {
      name: 'Egg Hunt',
      description: 'Search town for hidden eggs before time runs out.',
      scoreFormula: 'Eggs found (3-8) based on luck derived from gold % 100.',
    },
  ],
  flower_dance: [
    {
      name: 'Dance Pairing',
      description: 'Invite villagers to dance and build social momentum.',
      scoreFormula: 'Total friendship hearts across all seven NPCs (0-28).',
    },
  ],
  luau: [
    {
      name: 'Soup Contribution',
      description: 'Contribute your best ingredient to the communal pot.',
      scoreFormula: 'Best item sell price (0-5000).',
    },
  ],
  moonlight_jellies: [
    {
      name: 'Jelly Watching',
      description: 'Gather at the shoreline and watch the migration.',
      scoreFormula: 'Flat 50 score; no competitive ranking.',
    },
  ],
  harvest_fair: [
    {
      name: 'Grange Showcase',
      description: 'Display a premium item judged for value and quality.',
      scoreFormula: 'Best item sell price x quality multiplier (1/1.25/1.5/2).',
    },
  ],
  spirit_eve: [
    {
      name: 'Haunted Maze',
      description: 'Push through spooky paths and prove your grit.',
      scoreFormula: 'Mine progress from monstersKilled / 5, capped at 100.',
    },
  ],
  ice_festival: [
    {
      name: 'Ice Fishing Derby',
      description: 'Catch as many fish as possible through frozen holes.',
      scoreFormula: 'Total fish caught.',
    },
  ],
  feast_winter: [
    {
      name: 'Night Market Stalls',
      description: 'Browse rotating vendors and spend for rare finds.',
      scoreFormula: '10% of current gold spent value, capped at 5000.',
    },
  ],
  night_market: [
    {
      name: 'Night Market Stalls',
      description: 'Browse rotating vendors and spend for rare finds.',
      scoreFormula: '10% of current gold spent value, capped at 5000.',
    },
  ],
};

const FESTIVAL_DIALOGUE: Record<string, Record<string, string[]>> = {
  egg_festival: {
    elena: [
      'I tucked candy eggs near the bakery stand. Follow the sweet smell.',
      'If you find one painted with flowers, bring it to me for judging.',
      'I packed snacks, so no one has to hunt on an empty stomach.',
    ],
    owen: [
      'Speed wins this hunt. Eyes up, feet moving, no hesitation.',
      'I mapped the fastest route before sunrise. Training matters.',
      'Beat my count and I will call it a real upset.',
    ],
    lily: [
      'The pastel ribbons make town look like a watercolor today.',
      'I hide eggs where colors contrast so they pop in the grass.',
      'This festival is half scavenger hunt, half art installation.',
    ],
    marcus: [
      'Watch the hedges; birds always reveal where people walked last.',
      'Nature leaves clues if you slow down enough to notice patterns.',
      'I trade tips for any egg with a mineral-speckled shell.',
    ],
    rose: [
      'Every egg has a story, even the cracked ones.',
      'Kids laugh louder at this festival than any other day.',
      'Collect a few and share one. Traditions hold better that way.',
    ],
    sage: [
      'Spring games remind us that renewal begins with curiosity.',
      'The hunt is playful, but gratitude is the real prize.',
      'Count your finds, then count your blessings.',
    ],
    finn: [
      'I built a tiny egg chute near the fountain for fun.',
      'If a clue seems weird, it was probably my idea.',
      'Race you to the square and back after the horn.',
    ],
  },
  flower_dance: {
    elena: [
      'I baked rose-shortbread for everyone waiting their turn to dance.',
      'A good partner notices rhythm and comfort, not just steps.',
      'Tell me who danced with confidence and I will guess their favorite tea.',
    ],
    owen: [
      'Posture, balance, timing. Dancing is discipline in disguise.',
      'Do not stomp the beat; own it.',
      'I respect anyone brave enough to ask for a dance.',
    ],
    lily: [
      'This is my favorite palette: petals, silk, and sunlight.',
      'I sketched every outfit this morning before the music started.',
      'When everyone spins together, it feels like living brushstrokes.',
    ],
    marcus: [
      'Wildflowers at the edge of town are peaking right on schedule.',
      'The dance floor sits where pollinators cross each spring.',
      'Even festivals follow ecological timing if you look closely.',
    ],
    rose: [
      'Dances reveal who trusts each other before words do.',
      'I love seeing neighbors cheer for awkward first steps.',
      'Community grows one invitation at a time.',
    ],
    sage: [
      'Circles and partners mirror the seasons: meeting, parting, returning.',
      'Shared movement can calm a restless mind.',
      'If you listen deeply, the flute sounds like wind through young leaves.',
    ],
    finn: [
      'I reinforced the stage so Owen cannot stomp it loose again.',
      'Spinning too fast is risky, but very worth it.',
      'After the dance, help me hang lanterns for the evening crowd.',
    ],
  },
  luau: {
    elena: [
      'The soup only shines when everyone contributes something thoughtful.',
      'Bring flavor, not just price. Balance matters.',
      'I can taste the valley in one spoonful when we get it right.',
    ],
    owen: [
      'A strong ingredient carries the whole pot.',
      'I judge by impact. One bite should wake you up.',
      'Do not hold back your best produce today.',
    ],
    lily: [
      'Even the garnish tells a story at the luau.',
      'Color in the bowl matters almost as much as aroma.',
      'I adore how the ocean light makes every dish glow.',
    ],
    marcus: [
      'Coastal herbs are sharp this season; they cut through rich broth.',
      'Sustainable harvests make better festivals year after year.',
      'Use ingredients that respect where they came from.',
    ],
    rose: [
      'The communal pot is trust made visible.',
      'I always watch faces when the first taste goes around.',
      'A good luau feels like everyone cooking for one table.',
    ],
    sage: [
      'Sharing food is one of the oldest rituals we keep.',
      'Intent enters the soup before the spoon does.',
      'Offer what you can with sincerity and it will be enough.',
    ],
    finn: [
      'I built a longer ladle so no one burns their sleeves.',
      'If the Governor asks, yes, I tested the soup temperature scientifically.',
      'Big pot, big party, no leaks this time.',
    ],
  },
  moonlight_jellies: {
    elena: [
      'I packed warm tea because sea breezes get sharp at night.',
      'Watching the jellies drift makes every kitchen worry feel small.',
      'Stay a while. Quiet moments can feed you too.',
    ],
    owen: [
      'No contest tonight, just steady breathing and the tide.',
      'Even I slow down when the water starts to glow.',
      'Strength is also knowing when to be still.',
    ],
    lily: [
      'The shoreline turns into living lanterns after dusk.',
      'I cannot paint this glow exactly, but I keep trying.',
      'Do you hear how the waves keep perfect tempo with the lights?',
    ],
    marcus: [
      'This migration is one of the healthiest signs in our waters.',
      'When the jellies arrive in good numbers, the whole coast benefits.',
      'Tonight is science and wonder sharing the same sky.',
    ],
    rose: [
      'Everyone goes quiet at once when the first jelly appears.',
      'It feels like the town is holding one shared breath.',
      'Some memories do not need prizes to last forever.',
    ],
    sage: [
      'Light in dark water reminds us hope travels in groups.',
      'I come here each year to release what I cannot carry forward.',
      'Let the tide take your worries and return calm instead.',
    ],
    finn: [
      'I set up extra railings so kids can see safely.',
      'No fireworks needed when nature does this on its own.',
      'After the viewing, help me collect lanterns before the wind grabs them.',
    ],
  },
  harvest_fair: {
    elena: [
      'Judges want quality, but they remember flavor too.',
      'A flawless crop still needs care from field to table.',
      'Show them something that proves your farm has heart.',
    ],
    owen: [
      'This fair is a test. Bring your best and stand by it.',
      'Value and quality together, that is real performance.',
      'Pressure makes champions if you use it right.',
    ],
    lily: [
      'Your display should look as good as it scores.',
      'I love booths that arrange colors by season and texture.',
      'Presentation is not vanity; it is respect for your work.',
    ],
    marcus: [
      'A great entry shows healthy soil, not just a lucky harvest.',
      'Mineral-rich produce usually reveals itself at first bite.',
      'I can tell who rotates crops just by their display quality.',
    ],
    rose: [
      'The fair reminds us how much effort hides behind daily meals.',
      'I cheer for every farmer who enters, win or lose.',
      'Your booth tells the story of your entire season.',
    ],
    sage: [
      'Harvest festivals honor labor, weather, and patience together.',
      'Offer your best item with gratitude, not attachment.',
      'Recognition is nice, but stewardship is the deeper reward.',
    ],
    finn: [
      'I reinforced the judging tables for oversized pumpkins.',
      'Need display stands? I built a few spare sets this morning.',
      'If your produce sparkles, the crowd notices immediately.',
    ],
  },
  spirit_eve: {
    elena: [
      'I made spiced pumpkin stew for brave maze runners.',
      'Eat first. Courage burns calories faster than fear admits.',
      'If you find the hidden chest, celebrate with something warm.',
    ],
    owen: [
      'Haunted or not, a maze is just obstacles and nerves.',
      'Keep moving when sounds try to make you freeze.',
      'Anyone who clears the route earns my respect.',
    ],
    lily: [
      'The lantern shadows are gorgeous and slightly terrifying.',
      'I painted the mask booth with mineral pigments for extra glow.',
      'Fear and beauty mix perfectly tonight.',
    ],
    marcus: [
      'Cave instincts help here: read terrain, trust your footing.',
      'Most scares are smoke and mirrors, but stay alert anyway.',
      'I hid ore chips along the path for observant explorers.',
    ],
    rose: [
      'Stories feel closer on nights like this.',
      'The maze is scary, but laughter keeps it friendly.',
      'Take a charm if you want luck on the darker turns.',
    ],
    sage: [
      'Spirit festivals help us practice courage with community nearby.',
      'Meeting fear directly can turn it into wisdom.',
      'Carry a lantern, and remember you are never truly alone here.',
    ],
    finn: [
      'I built half the maze walls and still get lost in there.',
      'Watch for false dead ends; I may have made them too convincing.',
      'If a skeleton rattles, that is definitely not my wiring. Probably.',
    ],
  },
  ice_festival: {
    elena: [
      'Hot broth after ice fishing tastes like victory itself.',
      'Keep your hands warm or you will miss the subtle bites.',
      'Bring your catch by later and I will share a recipe idea.',
    ],
    owen: [
      'Cold weather separates prepared fishers from complainers.',
      'Set the line, stay focused, strike cleanly.',
      'Big totals come from discipline, not luck alone.',
    ],
    lily: [
      'The frozen lake reflects light like polished glass.',
      'I stitched silver thread into my scarf to match the ice.',
      'Even fishing holes look elegant when framed with snow lanterns.',
    ],
    marcus: [
      'Ice thickness is safe today, but stay near marked zones.',
      'Winter fish run deeper; patience beats frantic reeling.',
      'I charted the best spots near the reed line.',
    ],
    rose: [
      'Nothing brings people together like shared cold and hot drinks.',
      'I love hearing cheers carry across the frozen water.',
      'Win or lose, everyone leaves with a story.',
    ],
    sage: [
      'Winter asks for stillness, and fishing rewards it.',
      'Breathe with the wind and let the line teach patience.',
      'This quiet is a gift if you make room for it.',
    ],
    finn: [
      'I drilled extra holes and labeled depths for fair play.',
      'If your stool wobbles, come by my toolkit.',
      'Fastest way to warm up is hauling in another fish.',
    ],
  },
  feast_winter: {
    elena: [
      'Night stalls smell like roasted chestnuts and caramel spice.',
      'I always sample one new treat from every vendor row.',
      'Save some gold for dessert; trust me on this.',
    ],
    owen: [
      'I treat the market like a supply run: compare, commit, move.',
      'Rare stock appears fast and disappears faster.',
      'Spend with purpose and you leave stronger.',
    ],
    lily: [
      'Lantern reflections on snow make the whole market shimmer.',
      'Every booth feels like a tiny stage set.',
      'I could wander these aisles all night sketching signs.',
    ],
    marcus: [
      'I come for winter forage bundles and polished stone tools.',
      'Traveling merchants bring materials we cannot source locally.',
      'The market is noisy, but the finds are worth it.',
    ],
    rose: [
      'Gift season always makes people kinder in small ways.',
      'I keep spare coin for anyone short on a present.',
      'A busy market can still feel deeply personal.',
    ],
    sage: [
      'Exchanging gifts is a ritual of attention.',
      'What we choose to give says what we notice in others.',
      'Walk slowly tonight; gratitude hides in ordinary stalls.',
    ],
    finn: [
      'I helped assemble half these booths before sunset.',
      'Check the back lane vendor with mechanical trinkets.',
      'If you hear a bell chain rattling, my wind rig survived the cold.',
    ],
  },
};

const QUALITY_MULTIPLIERS: Record<number, number> = {
  1: 1,
  2: 1.25,
  3: 1.5,
  4: 2,
};

const DEFAULT_DIALOGUE = [
  'Festivals always bring the town together.',
  'There is something to enjoy for everyone here.',
  'Come back next year and see how it changes.',
];

function normalizeFestivalId(festivalId: string): string {
  if (festivalId === 'night_market') return 'feast_winter';
  return festivalId;
}

function normalizeNpcId(npcId: string): string {
  return npcId.toLowerCase().trim();
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function getRankAndRewards(
  score: number,
  thresholds: { gold?: number; silver?: number; bronze?: number },
  rewardsByRank: Record<Rank, Array<{ itemId: string; qty: number }>>
): { rank: Rank; rewards: Array<{ itemId: string; qty: number }> } {
  if (thresholds.gold !== undefined && score >= thresholds.gold) {
    return { rank: 'Gold', rewards: rewardsByRank.Gold };
  }
  if (thresholds.silver !== undefined && score >= thresholds.silver) {
    return { rank: 'Silver', rewards: rewardsByRank.Silver };
  }
  if (thresholds.bronze !== undefined && score >= thresholds.bronze) {
    return { rank: 'Bronze', rewards: rewardsByRank.Bronze };
  }
  return { rank: 'Participant', rewards: rewardsByRank.Participant };
}

function getBestItemSellPrice(playerData: Record<string, any>): number {
  const sellPrice = Number(playerData.bestItem?.sellPrice ?? 0);
  return Number.isFinite(sellPrice) ? clamp(sellPrice, 0, 5000) : 0;
}

function getQualityMultiplier(quality: number): number {
  if (quality >= 4) return QUALITY_MULTIPLIERS[4];
  if (quality <= 1) return QUALITY_MULTIPLIERS[1];
  return QUALITY_MULTIPLIERS[quality] ?? 1;
}

export class FestivalEventHandler {
  static getActivities(festival: FestivalDef): FestivalActivity[] {
    void Phaser;
    void Season;

    const festivalId = normalizeFestivalId(festival.id);
    return FESTIVAL_ACTIVITIES[festivalId] ?? [
      {
        name: 'Festival Participation',
        description: `Join the activities at ${festival.name}.`,
        scoreFormula: 'Participation-based event scoring.',
      },
    ];
  }

  static calculateScore(festival: FestivalDef, playerData: Record<string, any>): FestivalResult {
    const festivalId = normalizeFestivalId(festival.id);
    const gold = Number(playerData.gold ?? 0);
    const friendships = Number(playerData.friendships ?? 0);
    const fishCaught = Number(playerData.fishCaught ?? 0);
    const monstersKilled = Number(playerData.monstersKilled ?? 0);

    switch (festivalId) {
      case 'egg_festival': {
        const luck = ((gold % 100) + 100) % 100;
        const eggsFound = 3 + Math.floor(luck / 17);
        const { rank, rewards } = getRankAndRewards(
          eggsFound,
          { gold: 6, silver: 4, bronze: 2 },
          {
            Gold: [{ itemId: 'gold_ore', qty: 5 }],
            Silver: [{ itemId: 'iron_ore', qty: 5 }],
            Bronze: [{ itemId: 'copper_ore', qty: 5 }],
            Participant: [],
          }
        );

        return {
          festivalId,
          participated: true,
          score: eggsFound,
          rank,
          rewards,
          message: `You found ${eggsFound} eggs in the hunt and finished with ${rank} rank.`,
        };
      }

      case 'flower_dance': {
        const score = clamp(friendships, 0, 28);
        const { rank, rewards } = getRankAndRewards(
          score,
          { gold: 20, silver: 12, bronze: 5 },
          {
            Gold: [{ itemId: 'melon_seeds', qty: 5 }],
            Silver: [{ itemId: 'blueberry_seeds', qty: 3 }],
            Bronze: [],
            Participant: [],
          }
        );

        return {
          festivalId,
          participated: true,
          score,
          rank,
          rewards,
          message: `Your social standing reached ${score} hearts, earning a ${rank} result at the dance.`,
        };
      }

      case 'luau': {
        const score = getBestItemSellPrice(playerData);
        const { rank, rewards } = getRankAndRewards(
          score,
          { gold: 1000, silver: 200, bronze: 50 },
          {
            Gold: [{ itemId: 'gold_bar', qty: 1 }],
            Silver: [{ itemId: 'starfruit_seeds', qty: 1 }],
            Bronze: [],
            Participant: [],
          }
        );

        return {
          festivalId,
          participated: true,
          score,
          rank,
          rewards,
          message: `Your soup ingredient value was ${score}, and the crowd rated it ${rank}.`,
        };
      }

      case 'moonlight_jellies': {
        const score = 50;
        const friendshipTier = clamp(friendships, 0, 28);
        let message = 'You watched the moonlight jellies in peaceful silence.';
        if (friendshipTier >= 18) {
          message = 'You shared a magical moonlight jellies night with close friends by the sea.';
        } else if (friendshipTier >= 8) {
          message = 'You enjoyed the moonlight jellies with familiar faces from around town.';
        }

        return {
          festivalId,
          participated: true,
          score,
          rank: 'Participant',
          rewards: [],
          message,
        };
      }

      case 'harvest_fair': {
        const basePrice = getBestItemSellPrice(playerData);
        const quality = Number(playerData.bestItem?.quality ?? 1);
        const multiplier = getQualityMultiplier(quality);
        const score = Math.round(basePrice * multiplier);
        const { rank, rewards } = getRankAndRewards(
          score,
          { gold: 2000, silver: 500, bronze: 100 },
          {
            Gold: [{ itemId: 'gold_bar', qty: 3 }],
            Silver: [{ itemId: 'iron_bar', qty: 5 }],
            Bronze: [],
            Participant: [],
          }
        );

        return {
          festivalId,
          participated: true,
          score,
          rank,
          rewards,
          message: `Your display scored ${score} (${basePrice} x ${multiplier.toFixed(2)}), awarding ${rank}.`,
        };
      }

      case 'spirit_eve': {
        const score = clamp(Math.floor(monstersKilled / 5), 0, 100);
        const { rank, rewards } = getRankAndRewards(
          score,
          { gold: 80, silver: 40, bronze: 10 },
          {
            Gold: [{ itemId: 'gold_ore', qty: 10 }],
            Silver: [],
            Bronze: [],
            Participant: [],
          }
        );

        return {
          festivalId,
          participated: true,
          score,
          rank,
          rewards,
          message: `Your haunted maze prowess reached ${score}, securing ${rank} standing.`,
        };
      }

      case 'ice_festival': {
        const score = Math.max(0, Math.floor(fishCaught));
        const { rank, rewards } = getRankAndRewards(
          score,
          { gold: 30, silver: 15, bronze: 5 },
          {
            Gold: [{ itemId: 'fiber', qty: 20 }],
            Silver: [{ itemId: 'trout', qty: 5 }],
            Bronze: [],
            Participant: [],
          }
        );

        return {
          festivalId,
          participated: true,
          score,
          rank,
          rewards,
          message: `You landed ${score} fish on the ice and finished at ${rank} tier.`,
        };
      }

      case 'feast_winter': {
        const score = clamp(Math.floor(Math.max(0, gold) * 0.1), 0, 5000);
        const { rank, rewards } = getRankAndRewards(
          score,
          { gold: 2000, silver: 500 },
          {
            Gold: [],
            Silver: [],
            Bronze: [],
            Participant: [],
          }
        );

        return {
          festivalId,
          participated: true,
          score,
          rank,
          rewards,
          message: `Your market spending index was ${score}, ending with ${rank} recognition.`,
        };
      }

      default:
        return {
          festivalId,
          participated: true,
          score: 0,
          rank: 'Participant',
          rewards: [],
          message: `You attended ${festival.name} and enjoyed the celebration.`,
        };
    }
  }

  static getFestivalDialogue(festivalId: string, npcId: string): string[] {
    const normalizedFestivalId = normalizeFestivalId(festivalId);
    const normalizedNpcId = normalizeNpcId(npcId);

    return FESTIVAL_DIALOGUE[normalizedFestivalId]?.[normalizedNpcId] ?? DEFAULT_DIALOGUE;
  }
}
