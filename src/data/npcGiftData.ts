export interface GiftPreference {
  loved: string[];    // +5 friendship points, special dialogue
  liked: string[];    // +3 friendship points
  neutral: string[];  // +1 friendship point
  disliked: string[]; // -2 friendship points
  hated: string[];    // -5 friendship points, negative dialogue
}

export interface GiftDialogue {
  loved: string[];    // 3 random responses for loved gifts
  liked: string[];    // 3 random responses
  disliked: string[]; // 3 random responses
  hated: string[];    // 3 random responses
}

export const NPC_GIFT_PREFERENCES: Record<string, GiftPreference> = {
  elena: {
    loved: ['parsnip', 'cauliflower', 'egg', 'milk', 'honey_cake', 'farmers_lunch'],
    liked: ['potato', 'tomato', 'blueberry', 'pumpkin', 'baked_potato', 'tomato_soup', 'omelet', 'large_egg'],
    neutral: [],
    disliked: ['copper_ore', 'iron_ore', 'gold_ore'],
    hated: ['copper_bar', 'iron_bar', 'coal'],
  },
  owen: {
    loved: ['copper_ore', 'iron_ore', 'gold_ore', 'copper_bar', 'iron_bar', 'gold_bar', 'diamond', 'ruby'],
    liked: ['amethyst', 'aquamarine', 'emerald', 'furnace'],
    neutral: [],
    disliked: ['daffodil', 'dandelion', 'sweet_pea', 'bouquet'],
    hated: ['honey_cake', 'pumpkin_soup', 'blueberry_tart'],
  },
  lily: {
    loved: ['daffodil', 'dandelion', 'sweet_pea', 'crocus', 'amethyst', 'ruby', 'honey', 'bouquet'],
    liked: ['aquamarine', 'emerald', 'diamond', 'blueberry', 'cranberry', 'crystal_fruit'],
    neutral: [],
    disliked: ['sardine', 'trout', 'salmon', 'catfish', 'stone'],
    hated: ['coal', 'tuna'],
  },
  marcus: {
    loved: ['copper_ore', 'iron_ore', 'gold_ore', 'salmon', 'catfish', 'fish_stew', 'miners_treat'],
    liked: ['trout', 'bass', 'tuna', 'baked_potato', 'corn_chowder', 'stone'],
    neutral: [],
    disliked: ['daffodil', 'sweet_pea', 'dandelion', 'bouquet'],
    hated: ['crocus', 'blueberry_tart'],
  },
  rose: {
    loved: ['starfruit', 'legendary_fish', 'gold_bar', 'diamond', 'pendant', 'crystal_fruit'],
    liked: ['ruby', 'emerald', 'cauliflower', 'pumpkin', 'honey_cake', 'lucky_charm'],
    neutral: [],
    disliked: ['stone', 'fiber', 'sap', 'coal'],
    hated: ['wood', 'bait'],
  },
  sage: {
    loved: ['mushroom', 'wild_berries', 'honey', 'common_mushroom', 'wild_horseradish', 'hazelnut', 'blackberry', 'leek'],
    liked: ['dandelion', 'daffodil', 'sweet_pea', 'grape', 'wild_plum', 'spice_berry', 'winter_root', 'snow_yam'],
    neutral: [],
    disliked: ['copper_bar', 'iron_bar', 'coal', 'furnace'],
    hated: ['gold_bar', 'quality_sprinkler'],
  },
  finn: {
    loved: ['wood', 'stone', 'chest', 'sprinkler', 'scarecrow', 'furnace', 'quality_sprinkler'],
    liked: ['clay', 'coal', 'copper_bar', 'iron_bar', 'gold_bar', 'bee_house'],
    neutral: [],
    disliked: ['sardine', 'trout', 'salmon', 'catfish'],
    hated: ['wild_berries', 'bass'],
  },
};

export const NPC_GIFT_DIALOGUE: Record<string, GiftDialogue> = {
  elena: {
    loved: [
      "Oh my goodness, this is exactly what I needed for my recipe! You know me so well.",
      "Fresh from the farm? You're too kind! I'll bake something special tonight.",
      "This is wonderful! I've been working on a new dish — you just made my day.",
    ],
    liked: [
      "How thoughtful! I can definitely put this to good use in the kitchen.",
      "Oh, lovely! Thank you so much — this will be perfect.",
      "A gift for me? You're so sweet. I'll make good use of this.",
    ],
    disliked: [
      "Hmm... ore? I appreciate the thought, but I'm not sure what I'd do with this.",
      "This is, um... interesting. I suppose I could find a use for it somewhere.",
      "Oh. Well, thank you anyway. I'll figure something out.",
    ],
    hated: [
      "I'm sorry, but I really can't use this in my kitchen. Please don't bring me coal.",
      "This is not something I enjoy. I don't mean to be rude, but... yikes.",
      "Oh dear. I know you mean well, but this is quite unpleasant for me.",
    ],
  },
  owen: {
    loved: [
      "Now THIS is a gift! Quality ore — you clearly know what matters.",
      "Excellent! I can work with this. You've got a good eye for material.",
      "A fine gem — I could craft something magnificent with this. Thank you!",
    ],
    liked: [
      "Not bad at all. I can put this to use at the forge.",
      "Good choice. You understand what a blacksmith needs.",
      "Useful stuff. Thanks for thinking of me.",
    ],
    disliked: [
      "Flowers? I... what would I even do with flowers?",
      "That's very pretty, I suppose, but I have no use for it whatsoever.",
      "Thanks, I guess. Not exactly my style, but I'll... set it somewhere.",
    ],
    hated: [
      "Cooked food? I'd rather eat charcoal. No offense.",
      "I can't stand sweet pastries. Ruins my appetite for good hard work.",
      "Please, don't bring me food. Just ore. Or gems. Never food.",
    ],
  },
  lily: {
    loved: [
      "It's beautiful! The colors are just perfect — you have such wonderful taste.",
      "Oh, this brings me so much inspiration! I feel like painting right now.",
      "A flower for me? You understand my soul. This is going in my studio.",
    ],
    liked: [
      "How lovely! This would make a wonderful subject for a painting.",
      "Oh, it shimmers so beautifully. Thank you, truly!",
      "You always bring the prettiest things. I adore it.",
    ],
    disliked: [
      "Fish? I... appreciate the gesture, but fish aren't really my thing.",
      "A rock. That's... okay. I suppose everything has its own beauty.",
      "That's very rugged of you. Not quite my aesthetic, but thank you.",
    ],
    hated: [
      "Coal?! My hands are already stained with paint — I don't need coal dust too!",
      "I'm sorry, but this is genuinely unpleasant. Please don't.",
      "The smell alone... no. Please. I beg you.",
    ],
  },
  marcus: {
    loved: [
      "Now that's what I call a haul! Great ore — I knew you had a good eye for the mines.",
      "Fresh fish? You've been to the river. That's the best gift there is.",
      "Hearty food AND good ore? You know exactly how to keep a miner going.",
    ],
    liked: [
      "Nice catch! Can't go wrong with good fish after a long day.",
      "Solid material. A miner can always use more of this.",
      "This'll keep me going. Appreciate it.",
    ],
    disliked: [
      "Flowers? Heh. I'd rather you give me a pickaxe, but... thanks.",
      "Pretty little thing. Guess I'll stick it somewhere.",
      "Not quite my style, but I won't say no to a gift.",
    ],
    hated: [
      "A tart? I'm a miner, not a patisserie customer.",
      "That's... delicate. Too delicate. This kind of thing makes me nervous.",
      "I wouldn't know what to do with that. Give me rocks any day.",
    ],
  },
  rose: {
    loved: [
      "Extraordinary! I haven't seen one of these in many years. You have my deepest gratitude.",
      "The stars themselves seem to have guided you to bring me this. Remarkable.",
      "Yes... this is precisely what the omens promised. How did you know?",
    ],
    liked: [
      "A fine gift. Quality over quantity — you understand that, don't you?",
      "Lovely. The energy around this is quite strong. Thank you, dear.",
      "How thoughtful. I sense great potential in you.",
    ],
    disliked: [
      "Stone and fiber... these are common things. Still, you gave from the heart.",
      "Hmm. I've seen brighter days, but a gift is a gift.",
      "I appreciate your effort, even if this isn't quite to my taste.",
    ],
    hated: [
      "Wood scraps? I am not a lumberyard, child.",
      "Bait? I think you may have confused me with someone who fishes.",
      "How very... rustic. I'll pretend you brought me something meaningful.",
    ],
  },
  sage: {
    loved: [
      "From the forest! You went out to find this for me — the earth thanks you.",
      "Wild-gathered, pure, and unspoiled. This is the greatest of gifts.",
      "I can smell the woods on it still. Perfect. Absolutely perfect.",
    ],
    liked: [
      "Foraged with care — I can tell. Nature always provides.",
      "This came from good soil. I'm grateful you thought of me.",
      "A humble gift from the land. This means more than you know.",
    ],
    disliked: [
      "Metal bars... the forest weeps when these are made. But I accept your good intentions.",
      "Industrial things make me uneasy. Still, you meant well.",
      "I'll find a way to return this energy to nature somehow.",
    ],
    hated: [
      "A machine?! This represents everything I stand against. No. Absolutely not.",
      "I cannot accept this. Gold bars are the opposite of what I value.",
      "This carries the energy of destruction. Please take it back.",
    ],
  },
  finn: {
    loved: [
      "Excellent timber! This is exactly what I needed for the project. You're a lifesaver.",
      "Good stone — solid, dependable, just like you. I'll put this to great use.",
      "A crafted item! You've got skill. I respect that. Thanks, friend.",
    ],
    liked: [
      "Clay and coal — the essentials. You really get what a builder needs.",
      "Good materials. Never wasted in the hands of a carpenter.",
      "Solid choice. I'll work this into something useful soon.",
    ],
    disliked: [
      "Raw fish? Not really workshop supplies, but I appreciate the thought.",
      "I'm no chef. Though I suppose I could brine it or something?",
      "Hmm. Fish. Not my first choice of gift, but, uh... thanks.",
    ],
    hated: [
      "Wild berries? I'm trying to build a barn, not make jam.",
      "Bass? What am I supposed to do with a bass?! I have lumber to cut!",
      "No, no, no. I need materials, not food. Please. I'm begging you.",
    ],
  },
};

/** Returns the preference tier for a given NPC and item */
export function getGiftReaction(npcId: string, itemId: string): 'loved' | 'liked' | 'neutral' | 'disliked' | 'hated' {
  const prefs = NPC_GIFT_PREFERENCES[npcId];
  if (!prefs) return 'neutral';

  if (prefs.loved.includes(itemId)) return 'loved';
  if (prefs.liked.includes(itemId)) return 'liked';
  if (prefs.disliked.includes(itemId)) return 'disliked';
  if (prefs.hated.includes(itemId)) return 'hated';

  return 'neutral';
}
