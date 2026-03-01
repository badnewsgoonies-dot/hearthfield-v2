import { Season } from '../types';

export interface FestivalDef {
  id: string;
  name: string;
  season: Season;
  day: number;
  description: string;
  type: 'competition' | 'social' | 'seasonal';
  rewards: { itemId: string; qty: number }[];
}

export const FESTIVALS: FestivalDef[] = [
  { id: 'egg_festival', name: 'Egg Festival', season: Season.SPRING, day: 13,
    description: 'A spring celebration! Find hidden eggs around town.',
    type: 'competition', rewards: [{ itemId: 'gold_ore', qty: 5 }] },
  { id: 'flower_dance', name: 'Flower Dance', season: Season.SPRING, day: 24,
    description: 'A romantic spring dance. Ask someone to dance!',
    type: 'social', rewards: [] },
  { id: 'luau', name: 'Luau', season: Season.SUMMER, day: 11,
    description: 'The Governor visits! Add your best item to the communal soup.',
    type: 'social', rewards: [] },
  { id: 'moonlight_jellies', name: 'Moonlight Jellies', season: Season.SUMMER, day: 28,
    description: 'Watch the moonlight jellies at the beach.',
    type: 'seasonal', rewards: [] },
  { id: 'harvest_fair', name: 'Harvest Fair', season: Season.FALL, day: 16,
    description: 'Show off your best produce! Win prizes at the fair.',
    type: 'competition', rewards: [{ itemId: 'gold_bar', qty: 3 }] },
  { id: 'spirit_eve', name: 'Spirit\'s Eve', season: Season.FALL, day: 27,
    description: 'A spooky festival! Navigate the haunted maze.',
    type: 'seasonal', rewards: [{ itemId: 'pumpkin', qty: 5 }] },
  { id: 'ice_festival', name: 'Ice Festival', season: Season.WINTER, day: 8,
    description: 'Ice fishing competition at the frozen lake!',
    type: 'competition', rewards: [{ itemId: 'iron_bar', qty: 5 }] },
  { id: 'feast_winter', name: 'Feast of the Winter Star', season: Season.WINTER, day: 25,
    description: 'Secret gift exchange! Everyone draws a name.',
    type: 'social', rewards: [] },
];
