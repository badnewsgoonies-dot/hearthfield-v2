import { Season } from '../types';

export interface ForageSpawnRule {
  itemId: string;
  seasons: Season[];
  weight: number;
  zones: ('farm' | 'town' | 'pond' | 'mine_entrance' | 'forest_edge')[];
  maxPerDay: number;
  minDay: number;
  description: string;
}

export const FORAGE_SPAWN_RULES: ForageSpawnRule[] = [
  // ── Spring ──────────────────────────────────────────────────
  {
    itemId: 'wild_berries',
    seasons: [Season.SPRING],
    weight: 8,
    zones: ['farm', 'forest_edge', 'town'],
    maxPerDay: 6,
    minDay: 1,
    description: 'Clusters of sweet berries ripen along fence lines and forest edges.',
  },
  {
    itemId: 'daffodil',
    seasons: [Season.SPRING],
    weight: 7,
    zones: ['farm', 'town', 'forest_edge'],
    maxPerDay: 5,
    minDay: 1,
    description: 'Bright yellow blooms dot meadows and garden borders.',
  },
  {
    itemId: 'leek',
    seasons: [Season.SPRING],
    weight: 5,
    zones: ['farm', 'forest_edge'],
    maxPerDay: 4,
    minDay: 3,
    description: 'Wild leeks push up through moist soil near tree roots.',
  },
  {
    itemId: 'wild_horseradish',
    seasons: [Season.SPRING],
    weight: 4,
    zones: ['farm', 'forest_edge'],
    maxPerDay: 3,
    minDay: 5,
    description: 'Pungent roots hide beneath broad leaves on the farm\'s edge.',
  },
  {
    itemId: 'dandelion',
    seasons: [Season.SPRING],
    weight: 9,
    zones: ['farm', 'town', 'forest_edge'],
    maxPerDay: 8,
    minDay: 1,
    description: 'These cheerful weeds spring up everywhere after the first warm rain.',
  },
  {
    itemId: 'fiber',
    seasons: [Season.SPRING],
    weight: 6,
    zones: ['farm', 'forest_edge', 'town'],
    maxPerDay: 7,
    minDay: 1,
    description: 'Tall grass and weeds yield useful fiber when cut.',
  },
  {
    itemId: 'sap',
    seasons: [Season.SPRING],
    weight: 4,
    zones: ['forest_edge'],
    maxPerDay: 3,
    minDay: 2,
    description: 'Trees weep sticky sap as they wake from winter dormancy.',
  },

  // ── Summer ──────────────────────────────────────────────────
  {
    itemId: 'wild_berries',
    seasons: [Season.SUMMER],
    weight: 7,
    zones: ['farm', 'forest_edge', 'pond'],
    maxPerDay: 6,
    minDay: 1,
    description: 'Ripe berries hang heavy on thorny canes near the water.',
  },
  {
    itemId: 'grape',
    seasons: [Season.SUMMER],
    weight: 5,
    zones: ['forest_edge', 'farm'],
    maxPerDay: 4,
    minDay: 5,
    description: 'Wild grape vines climb old fences and tree trunks.',
  },
  {
    itemId: 'spice_berry',
    seasons: [Season.SUMMER],
    weight: 4,
    zones: ['forest_edge', 'farm'],
    maxPerDay: 3,
    minDay: 7,
    description: 'Hot-flavored berries grow in sunlit clearings.',
  },
  {
    itemId: 'sweet_pea',
    seasons: [Season.SUMMER],
    weight: 6,
    zones: ['farm', 'town', 'forest_edge'],
    maxPerDay: 5,
    minDay: 1,
    description: 'Fragrant vines wind along walls and hedges throughout the season.',
  },
  {
    itemId: 'fiber',
    seasons: [Season.SUMMER],
    weight: 8,
    zones: ['farm', 'forest_edge', 'pond'],
    maxPerDay: 9,
    minDay: 1,
    description: 'Lush summer growth means fiber is abundant everywhere.',
  },
  {
    itemId: 'honey',
    seasons: [Season.SUMMER],
    weight: 3,
    zones: ['farm', 'forest_edge'],
    maxPerDay: 2,
    minDay: 10,
    description: 'Wild hives occasionally drip honey from hollow tree trunks.',
  },
  {
    itemId: 'sap',
    seasons: [Season.SUMMER],
    weight: 3,
    zones: ['forest_edge'],
    maxPerDay: 3,
    minDay: 1,
    description: 'Resinous sap beads on sun-warmed bark.',
  },

  // ── Fall ────────────────────────────────────────────────────
  {
    itemId: 'mushroom',
    seasons: [Season.FALL],
    weight: 7,
    zones: ['forest_edge', 'mine_entrance'],
    maxPerDay: 5,
    minDay: 1,
    description: 'Earthy fungi flourish in the cool, damp shade of the forest floor.',
  },
  {
    itemId: 'common_mushroom',
    seasons: [Season.FALL],
    weight: 8,
    zones: ['forest_edge', 'mine_entrance', 'farm'],
    maxPerDay: 6,
    minDay: 1,
    description: 'These familiar caps push up through leaf litter after autumn rains.',
  },
  {
    itemId: 'wild_berries',
    seasons: [Season.FALL],
    weight: 5,
    zones: ['farm', 'forest_edge'],
    maxPerDay: 4,
    minDay: 1,
    description: 'Late-season berries cling to bare branches — sweet and tart.',
  },
  {
    itemId: 'blackberry',
    seasons: [Season.FALL],
    weight: 9,
    zones: ['forest_edge', 'farm', 'town'],
    maxPerDay: 8,
    minDay: 1,
    description: 'Blackberries droop from thorny canes all along the forest edge.',
  },
  {
    itemId: 'hazelnut',
    seasons: [Season.FALL],
    weight: 5,
    zones: ['forest_edge', 'farm'],
    maxPerDay: 4,
    minDay: 8,
    description: 'Clusters of nuts drop from hazel shrubs in mid-fall.',
  },
  {
    itemId: 'wild_plum',
    seasons: [Season.FALL],
    weight: 4,
    zones: ['forest_edge', 'farm'],
    maxPerDay: 3,
    minDay: 5,
    description: 'Small, tart plums ripen on low-growing wild trees.',
  },
  {
    itemId: 'fiber',
    seasons: [Season.FALL],
    weight: 5,
    zones: ['farm', 'forest_edge'],
    maxPerDay: 6,
    minDay: 1,
    description: 'Dried stalks and reeds offer plenty of fibrous material.',
  },

  // ── Winter ──────────────────────────────────────────────────
  {
    itemId: 'fiber',
    seasons: [Season.WINTER],
    weight: 6,
    zones: ['farm', 'forest_edge'],
    maxPerDay: 5,
    minDay: 1,
    description: 'Dead grasses and dried stems still yield usable fiber under the snow.',
  },
  {
    itemId: 'winter_root',
    seasons: [Season.WINTER],
    weight: 5,
    zones: ['farm', 'forest_edge', 'mine_entrance'],
    maxPerDay: 4,
    minDay: 1,
    description: 'Hardy tubers wait just below the frost line, ready to be dug up.',
  },
  {
    itemId: 'snow_yam',
    seasons: [Season.WINTER],
    weight: 4,
    zones: ['farm', 'forest_edge'],
    maxPerDay: 3,
    minDay: 3,
    description: 'Pale yams lie buried beneath fresh snowfall on open ground.',
  },
  {
    itemId: 'crocus',
    seasons: [Season.WINTER],
    weight: 3,
    zones: ['farm', 'town'],
    maxPerDay: 2,
    minDay: 10,
    description: 'Brave little blooms push through ice cracks near sheltered walls.',
  },
  {
    itemId: 'crystal_fruit',
    seasons: [Season.WINTER],
    weight: 1,
    zones: ['forest_edge', 'mine_entrance'],
    maxPerDay: 1,
    minDay: 15,
    description: 'A rare, glittering fruit found only in the deepest winter cold.',
  },
  {
    itemId: 'stone',
    seasons: [Season.WINTER],
    weight: 7,
    zones: ['mine_entrance', 'farm'],
    maxPerDay: 8,
    minDay: 1,
    description: 'Frost-heaved stones surface across the farm and near the mine.',
  },
];

/** Get forageable items for a given season and zone */
export function getSeasonalForageables(season: Season, zone: string): ForageSpawnRule[] {
  return FORAGE_SPAWN_RULES.filter(
    (rule) => rule.seasons.includes(season) && rule.zones.includes(zone as ForageSpawnRule['zones'][number]),
  );
}

/** Get a weighted random forageable for spawning */
export function rollForageable(season: Season, zone: string): string | null {
  const candidates = getSeasonalForageables(season, zone);
  if (candidates.length === 0) return null;

  const totalWeight = candidates.reduce((sum, rule) => sum + rule.weight, 0);
  let roll = Math.random() * totalWeight;

  for (const rule of candidates) {
    roll -= rule.weight;
    if (roll <= 0) return rule.itemId;
  }

  return candidates[candidates.length - 1].itemId;
}
