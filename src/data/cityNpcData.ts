/**
 * Hearthfield v2 — City NPC Schedules & Gift Preferences
 * NEW FILE — does not modify any existing files.
 */
import { CityVenue, Season } from '../types';

// ════════════════════════════════════════════════════════════
// INTERFACES
// ════════════════════════════════════════════════════════════

export interface CityNPCSchedule {
  /** Returns the venue where the NPC is at a given hour (0-23) */
  getVenue(hour: number, season: Season, dayOfWeek: number): CityVenue;
}

export interface CityGiftPreference {
  loved: string[];
  liked: string[];
  neutral: string[];
  disliked: string[];
  hated: string[];
}

export interface CityGiftDialogue {
  loved: string[];   // 4 lines each
  liked: string[];
  disliked: string[];
  hated: string[];
}

// ════════════════════════════════════════════════════════════
// SCHEDULES
// ════════════════════════════════════════════════════════════

const alexSchedule: CityNPCSchedule = {
  getVenue(hour: number, _season: Season, dayOfWeek: number): CityVenue {
    const isWeekend = dayOfWeek % 7 === 0 || dayOfWeek % 7 === 6;
    if (isWeekend) {
      if (hour < 9)  return CityVenue.APARTMENT;
      if (hour < 12) return CityVenue.CAFE;
      if (hour < 18) return CityVenue.PARK;
      if (hour < 22) return CityVenue.BAR;
      return CityVenue.APARTMENT;
    }
    // Weekday
    if (hour < 8)  return CityVenue.APARTMENT;
    if (hour < 17) return CityVenue.OFFICE;
    if (hour < 19) return CityVenue.GYM;
    if (hour < 22) return CityVenue.BAR;
    return CityVenue.APARTMENT;
  },
};

const mayaSchedule: CityNPCSchedule = {
  getVenue(hour: number, season: Season, _dayOfWeek: number): CityVenue {
    // Rainy simulation: use winter as a proxy for rainy days
    const rainy = season === Season.WINTER;
    if (hour < 5)  return CityVenue.APARTMENT;
    if (hour < 14) return CityVenue.CAFE;
    if (hour < 16) return rainy ? CityVenue.BOOKSTORE : CityVenue.BOOKSTORE;
    if (hour < 19) return rainy ? CityVenue.BOOKSTORE : CityVenue.PARK;
    if (hour < 21) return CityVenue.APARTMENT;
    return CityVenue.APARTMENT;
  },
};

const jordanSchedule: CityNPCSchedule = {
  getVenue(hour: number, season: Season, _dayOfWeek: number): CityVenue {
    if (hour < 6)  return CityVenue.APARTMENT;
    if (hour < 12) return CityVenue.GYM;
    if (hour < 13) return CityVenue.CAFE;
    if (hour < 18) return CityVenue.GYM;
    if (hour < 20) return season === Season.WINTER ? CityVenue.GYM : CityVenue.PARK;
    return CityVenue.APARTMENT;
  },
};

const samSchedule: CityNPCSchedule = {
  getVenue(hour: number, season: Season, _dayOfWeek: number): CityVenue {
    // Mornings vary by season — spring/summer shop earlier
    const shopEnd = (season === Season.SPRING || season === Season.SUMMER) ? 9 : 10;
    if (hour < 7)        return CityVenue.APARTMENT;
    if (hour < shopEnd)  return CityVenue.GROCERY;
    if (hour < 14)       return CityVenue.RESTAURANT;
    if (hour < 15)       return CityVenue.CAFE;
    if (hour < 23)       return CityVenue.RESTAURANT;
    return CityVenue.APARTMENT;
  },
};

const lenaSchedule: CityNPCSchedule = {
  getVenue(hour: number, _season: Season, dayOfWeek: number): CityVenue {
    const isWeekend = dayOfWeek % 7 === 0 || dayOfWeek % 7 === 6;
    if (isWeekend) {
      if (hour < 10) return CityVenue.APARTMENT;
      if (hour < 14) return CityVenue.PARK;
      if (hour < 18) return CityVenue.BOOKSTORE;
      if (hour < 20) return CityVenue.CAFE;
      if (hour < 22) return CityVenue.APARTMENT;
      return CityVenue.APARTMENT;
    }
    if (hour < 9)  return CityVenue.APARTMENT;
    if (hour < 18) return CityVenue.BOOKSTORE;
    if (hour < 20) return CityVenue.CAFE;
    if (hour < 22) return CityVenue.APARTMENT;
    return CityVenue.APARTMENT;
  },
};

const devSchedule: CityNPCSchedule = {
  getVenue(hour: number, _season: Season, dayOfWeek: number): CityVenue {
    // Alternating evenings: odd days go to bar, even days go to restaurant
    const eveningVenue = dayOfWeek % 2 === 0 ? CityVenue.BAR : CityVenue.RESTAURANT;
    if (hour < 7)  return CityVenue.APARTMENT;
    if (hour < 9)  return CityVenue.CAFE;
    if (hour < 17) return CityVenue.ELECTRONICS;
    if (hour < 19) return CityVenue.GYM;
    if (hour < 22) return eveningVenue;
    return CityVenue.APARTMENT;
  },
};

const rosaSchedule: CityNPCSchedule = {
  getVenue(hour: number, season: Season, _dayOfWeek: number): CityVenue {
    const rainy = season === Season.WINTER;
    if (hour < 7)  return CityVenue.APARTMENT;
    if (hour < 9)  return rainy ? CityVenue.APARTMENT : CityVenue.APARTMENT;
    if (hour < 12) return rainy ? CityVenue.BOOKSTORE : CityVenue.COMMUNITY_GARDEN;
    if (hour < 13) return rainy ? CityVenue.APARTMENT : CityVenue.CAFE;
    if (hour < 16) return rainy ? CityVenue.BOOKSTORE : CityVenue.PARK;
    if (hour < 18) return rainy ? CityVenue.APARTMENT : CityVenue.GROCERY;
    return CityVenue.APARTMENT;
  },
};

export const CITY_NPC_SCHEDULES: Record<string, CityNPCSchedule> = {
  alex:   alexSchedule,
  maya:   mayaSchedule,
  jordan: jordanSchedule,
  sam:    samSchedule,
  lena:   lenaSchedule,
  dev:    devSchedule,
  rosa:   rosaSchedule,
};

// ════════════════════════════════════════════════════════════
// GIFT PREFERENCES
// ════════════════════════════════════════════════════════════

export const CITY_GIFT_PREFERENCES: Record<string, CityGiftPreference> = {
  alex: {
    loved:    ['laptop', 'briefcase', 'business_suit', 'coffee', 'fancy_pen'],
    liked:    ['notebook', 'planner', 'energy_drink', 'tie', 'desk_lamp'],
    neutral:  ['chocolate_box', 'bouquet', 'artisan_tea'],
    disliked: ['vinyl_record', 'novel', 'scented_candle', 'potted_plant'],
    hated:    ['magazine', 'beer'],
  },
  maya: {
    loved:    ['vinyl_record', 'novel', 'artisan_tea', 'scented_candle', 'wall_art'],
    liked:    ['bouquet', 'potted_plant', 'notebook', 'chocolate_box', 'fancy_pen'],
    neutral:  ['coffee', 'pastry', 'magazine'],
    disliked: ['energy_drink', 'beer', 'gaming_setup'],
    hated:    ['laptop', 'briefcase', 'gadget'],
  },
  jordan: {
    loved:    ['smoothie', 'sporty_gear', 'energy_drink', 'gym_pass', 'multivitamin'],
    liked:    ['water_bottle', 'running_shoes', 'protein_bar', 'athletic_wear', 'yoga_mat'],
    neutral:  ['coffee', 'novel', 'magazine'],
    disliked: ['beer', 'wine', 'chocolate_box'],
    hated:    ['pastry', 'wine', 'chocolate_box'],
  },
  sam: {
    loved:    ['salmon_fillet', 'olive_oil', 'cheese', 'steak', 'wine'],
    liked:    ['fresh_herbs', 'truffle', 'artisan_bread', 'spice_set', 'cookbook'],
    neutral:  ['coffee', 'chocolate_box', 'bouquet'],
    disliked: ['magazine', 'gadget', 'gaming_setup'],
    hated:    ['energy_drink', 'magazine', 'bus_ticket'],
  },
  lena: {
    loved:    ['novel', 'fancy_pen', 'notebook', 'artisan_tea', 'scented_candle'],
    liked:    ['wall_art', 'vinyl_record', 'bookmark', 'reading_glasses', 'potted_plant'],
    neutral:  ['chocolate_box', 'coffee', 'bouquet'],
    disliked: ['beer', 'energy_drink', 'briefcase'],
    hated:    ['gadget', 'gaming_setup', 'energy_drink'],
  },
  dev: {
    loved:    ['laptop', 'gadget', 'gaming_setup', 'coffee', 'energy_drink'],
    liked:    ['usb_drive', 'mechanical_keyboard', 'monitor', 'smart_watch', 'desk_lamp'],
    neutral:  ['novel', 'magazine', 'chocolate_box'],
    disliked: ['bouquet', 'artisan_tea', 'potted_plant'],
    hated:    ['vinyl_record', 'scented_candle', 'novel'],
  },
  rosa: {
    loved:    ['bouquet', 'artisan_tea', 'chocolate_box', 'scented_candle', 'potted_plant'],
    liked:    ['novel', 'knitting_yarn', 'birdhouse', 'seed_packet', 'honey'],
    neutral:  ['coffee', 'magazine', 'fancy_pen'],
    disliked: ['energy_drink', 'beer', 'gaming_setup'],
    hated:    ['laptop', 'gadget', 'gaming_setup'],
  },
};

// ════════════════════════════════════════════════════════════
// GIFT DIALOGUE
// ════════════════════════════════════════════════════════════

export const CITY_GIFT_DIALOGUE: Record<string, CityGiftDialogue> = {
  alex: {
    loved: [
      "This is exactly what I needed to get ahead. You really get me.",
      "A laptop? You just upgraded my entire workflow. I owe you one.",
      "This is the kind of gift that shows you understand ambition.",
      "You know what separates the good from the great? Attention to detail — like this gift.",
    ],
    liked: [
      "This is practical. I like practical. Good call.",
      "Useful and thoughtful. That's a winning combination.",
      "You've got a sharp eye for what works. Thanks.",
      "I'll put this to good use. Already thinking about how.",
    ],
    disliked: [
      "Oh... thanks. I'm not really a vinyl person, but I appreciate it.",
      "That's very... relaxing of you. I'll find somewhere to put it.",
      "I usually like things that get things done, but it's the thought that counts.",
      "Different strokes, I guess. Thank you.",
    ],
    hated: [
      "A magazine? I barely have time to read reports, let alone this.",
      "I'm trying to cut back on things that don't move the needle. This doesn't.",
      "I don't mean to be harsh, but this really isn't my scene.",
      "Next time, maybe something that'll help me close a deal?",
    ],
  },
  maya: {
    loved: [
      "Oh! This is perfect — I've been saving a spot for this on my shelf.",
      "You found this? I've been looking for this record for months!",
      "A candle and a novel — you just described my ideal evening. Thank you.",
      "You get me in a way most people don't bother to try.",
    ],
    liked: [
      "Flowers? That's really sweet. I'll put them by the register.",
      "You're so thoughtful. This is going to brighten up my whole week.",
      "I love little things like this. Makes the day more beautiful.",
      "This is lovely. Simple and lovely.",
    ],
    disliked: [
      "Uh... an energy drink? I'm more of a slow-brewed-tea person, honestly.",
      "This is a bit... corporate for me, but thank you for thinking of me.",
      "I appreciate the gesture, though this wouldn't be my choice.",
      "It's okay! We don't always have the same taste, and that's fine.",
    ],
    hated: [
      "A laptop? I specifically left that world behind. Hard pass.",
      "This is the exact kind of thing I'm trying to get away from.",
      "I don't want to be rude, but please — not this.",
      "I work in a cozy cafe for a reason. This doesn't fit.",
    ],
  },
  jordan: {
    loved: [
      "Yes! This is exactly what I needed for tomorrow's session. You're the best.",
      "A gym pass?! You just made my whole week. Seriously.",
      "You understand what drives me. That means a lot.",
      "This is peak practical gift-giving. Well done.",
    ],
    liked: [
      "Oh nice! I can always use another one of these for training.",
      "Smart choice. This'll come in useful on heavy leg days for sure.",
      "You're paying attention. I like that.",
      "Good stuff. Quality gear makes all the difference.",
    ],
    disliked: [
      "I appreciate it, but chocolate isn't really part of my meal plan.",
      "Wine? I'm in season. Maybe after competition, though.",
      "That's sweet of you — literally — but I try to keep it clean.",
      "I'll pass this along to someone who can enjoy it more.",
    ],
    hated: [
      "A pastry? Do you know how long it takes to burn that off?",
      "I'm going to pretend I didn't see this and we'll move on.",
      "This would undo an entire training week. No thank you.",
      "I'd rather sprint hills barefoot than eat this.",
    ],
  },
  sam: {
    loved: [
      "This salmon is fresh — beautiful marbling. You clearly know your fish.",
      "Truffles?! Where did you find these? These are going straight into tonight's special.",
      "A chef knows quality, and this is quality. You have excellent taste.",
      "This is the kind of ingredient that separates a good dish from a great one. Thank you.",
    ],
    liked: [
      "Lovely. I can already think of three dishes I'd use this in.",
      "Good find. A chef is only as good as their ingredients.",
      "You're speaking my language. I'll put this to good use tonight.",
      "This will be perfect for the menu I'm working on. Great timing.",
    ],
    disliked: [
      "I appreciate it, but this isn't exactly... culinary.",
      "That's very kind, but I can't really use this in the kitchen.",
      "I'll take it, but between us, it's not the most useful thing for a chef.",
      "Thank you, truly. It's the thought, right?",
    ],
    hated: [
      "An energy drink? I make food from scratch. This is the opposite of that.",
      "Please. I spent years learning real craft. This is an insult to ingredients.",
      "A bus ticket? I... wasn't expecting that.",
      "This doesn't belong anywhere near my kitchen. Or my life.",
    ],
  },
  lena: {
    loved: [
      "Oh, you found this novel! I've been searching everywhere for it. Thank you!",
      "A fine pen — the right instrument makes the words come easier. I love it.",
      "Tea and candlelight and a good book. You understand the perfect evening.",
      "This is exactly what my reading nook was missing. You have wonderful taste.",
    ],
    liked: [
      "How thoughtful! This will fit beautifully on the shelf.",
      "You chose this for me? I'm touched. Really.",
      "A small beautiful thing — which is more than most people manage.",
      "This will be put to good and loving use. Thank you.",
    ],
    disliked: [
      "Oh. This is very... energetic. Not quite my pace, but kind of you.",
      "I appreciate the thought, though this is a bit outside my taste.",
      "Books are more my speed, but I do appreciate the sentiment.",
      "Thank you — I'll find somewhere for this.",
    ],
    hated: [
      "A gaming setup? I'm running a bookstore, not an arcade.",
      "Noise and screens — the two greatest enemies of reading. But thank you.",
      "This is the kind of thing I specifically avoid. Please don't.",
      "I'll return it quietly and pretend this never happened.",
    ],
  },
  dev: {
    loved: [
      "Oh this is sweet — a new gadget! I'm already thinking about how to mod it.",
      "A laptop upgrade! You just saved me three hours of compile time. Amazing.",
      "You understand the value of good hardware. This is a seriously good gift.",
      "Coffee AND tech? You've cracked my gift algorithm. Well done.",
    ],
    liked: [
      "Nice — I've been thinking about getting one of these.",
      "Solid pick. This'll plug right into my current setup.",
      "You're operating at a high signal-to-noise ratio with this one.",
      "I'll have this integrated into my workflow by tonight. Thanks.",
    ],
    disliked: [
      "Flowers are... an interesting input. I'm not sure how to process this.",
      "Tea? I drink coffee. Just coffee. But it's a thoughtful gesture.",
      "Not really optimized for my use case, but I appreciate the effort.",
      "I'd trade this for a USB hub, but sure. Thank you.",
    ],
    hated: [
      "A vinyl record? I went fully digital in 2009. This is regression.",
      "A scented candle. This is the opposite of what I need to ship product.",
      "A novel? I have twelve unread dev docs. I don't have time for fiction.",
      "This is very analog of you. I'm not sure we have compatible stacks.",
    ],
  },
  rosa: {
    loved: [
      "Oh, flowers! You know, I've been growing these myself, but homegrown never smells quite like a fresh bouquet.",
      "Chocolate and tea — you know exactly how to make an old neighbor feel special.",
      "A potted plant! I have just the spot for it by the window. Thank you, dear.",
      "This candle is lovely. I'll light it while I read tonight. How did you know?",
    ],
    liked: [
      "How kind! I do love a good book, especially these days.",
      "You brought me honey? From where? I want to know everything.",
      "What a sweet thing to do. You remind me of my late husband — always thinking of others.",
      "Oh, this is lovely. I'll treasure it.",
    ],
    disliked: [
      "Oh my. An energy drink. I haven't had one of these since... actually, never.",
      "That's very modern of you. I'll find someone younger to pass it to.",
      "I appreciate the thought, even if it's not quite my style.",
      "Very thoughtful, dear. Just... not for me.",
    ],
    hated: [
      "A laptop? I have a perfectly good typewriter, thank you very much.",
      "Gadgets like this just give me headaches. Please, keep it.",
      "A gaming setup! My grandchildren would love this. It's wasted on me, I'm afraid.",
      "Technology is all very well, but I prefer the garden.",
    ],
  },
};

// ════════════════════════════════════════════════════════════
// VENUE GREETINGS
// ════════════════════════════════════════════════════════════

export const CITY_NPC_GREETINGS: Record<string, Record<string, string[]>> = {
  alex: {
    [CityVenue.OFFICE]: [
      "Hey — don't tell me you work here too? Small city.",
      "Head down, deadlines don't care about your feelings. What's up?",
      "If you're looking for the conference room, it's always booked. Try the stairwell.",
    ],
    [CityVenue.GYM]: [
      "You lift? I didn't picture you as a gym person. Good.",
      "Post-work is the only time I can actually think clearly.",
      "Stress management, career strategy — same thing, different equipment.",
    ],
    [CityVenue.BAR]: [
      "Finally, a place where no one talks about KPIs. Mostly.",
      "I always say: you learn more about someone over a drink than a performance review.",
      "First round's on me if you survived the same kind of day I had.",
    ],
  },
  maya: {
    [CityVenue.CAFE]: [
      "Welcome in — the lavender latte is fresh, if you're feeling something different.",
      "Take your time. Good coffee should never be rushed.",
      "You look like you could use a quiet corner and a warm cup. I've got both.",
    ],
    [CityVenue.BOOKSTORE]: [
      "Lena carries the best selection — I always find something I wasn't looking for.",
      "I come here on my afternoons off. It's the calmest place in the city.",
      "Have you read anything from the staff picks shelf? Never disappoints.",
    ],
    [CityVenue.PARK]: [
      "I like to just sit here and watch the light change. You should try it.",
      "Sometimes the best thing you can do after a long shift is be outside.",
      "The birds here don't care about anything. I respect that.",
    ],
  },
  jordan: {
    [CityVenue.GYM]: [
      "You here for cardio or weights? I can write you a program if you want.",
      "Consistency beats intensity every single time. Remember that.",
      "Don't skip the warmup. I see everyone skip the warmup.",
    ],
    [CityVenue.CAFE]: [
      "Post-training fuel. The protein content here is actually decent.",
      "I always get the same thing. No point in overthinking nutrition.",
      "Twelve hours of training and this is my reward. It's earned.",
    ],
    [CityVenue.PARK]: [
      "Six miles today. You should join me sometime.",
      "Running outside is different from a treadmill. The road pushes back.",
      "I do my best thinking at mile four. What brings you out here?",
    ],
  },
  sam: {
    [CityVenue.GROCERY]: [
      "This produce section is hit or miss — you have to come early.",
      "I can tell the difference between a Tuesday delivery and a Thursday delivery. This is Thursday.",
      "Shopping for service tonight. Big reservation, can't afford to cut corners.",
    ],
    [CityVenue.RESTAURANT]: [
      "We're between services — perfect time to chat, but make it quick.",
      "The kitchen is everything. Every detail has to be right.",
      "Tonight's special took me three days to develop. Hope you'll try it.",
    ],
    [CityVenue.CAFE]: [
      "This is my one quiet hour. I guard it fiercely.",
      "Professional respect for anyone who makes coffee well. Maya knows what she's doing.",
      "Two shots, no sugar. My one daily indulgence that isn't salt-based.",
    ],
  },
  lena: {
    [CityVenue.BOOKSTORE]: [
      "Come in, come in — take your time. The best books demand it.",
      "If you're looking for a recommendation, I have opinions. Strong ones.",
      "Every shelf has a story. Not just the ones inside the covers.",
    ],
    [CityVenue.CAFE]: [
      "I decompress here after closing. Books and people take a lot out of you.",
      "Maya makes the only tea in this city that doesn't taste like hot sadness.",
      "I've been coming here for years. It's a ritual now.",
    ],
    [CityVenue.PARK]: [
      "I bring a book, obviously. The light here in the afternoon is perfect for reading.",
      "Away from the shelves, I remember I'm a person and not just a curator.",
      "The trees here are older than most of the books I sell. That's something.",
    ],
  },
  dev: {
    [CityVenue.CAFE]: [
      "Best WiFi in the city. I've tested all of them. This one wins.",
      "I think better with caffeine. Technically, everyone does — I've read the papers.",
      "Working remotely from here. The background noise helps me focus. Weird but true.",
    ],
    [CityVenue.ELECTRONICS]: [
      "This is essentially my office. Quieter than a real one.",
      "I'm evaluating three different models right now. It's a process.",
      "The staff here just let me think. That's more valuable than any product.",
    ],
    [CityVenue.GYM]: [
      "Counterintuitive, but physical output improves code quality. It's science.",
      "An hour here, then back to the build pipeline. That's the routine.",
      "I track my reps in a spreadsheet. Don't judge me.",
    ],
  },
  rosa: {
    [CityVenue.COMMUNITY_GARDEN]: [
      "The tomatoes are coming in beautifully this year. Want to take some?",
      "I've been tending this plot for eleven years. The soil knows me by now.",
      "Gardening is the only hobby that gives back more than you put in.",
    ],
    [CityVenue.PARK]: [
      "I sit on that bench there every afternoon. The pigeons expect me now.",
      "A walk in the park does more for the mind than any pill. That's my medical opinion.",
      "The city changes, but the park stays the same. That's why I keep coming back.",
    ],
    [CityVenue.APARTMENT]: [
      "Come in, dear — I just put the kettle on.",
      "I was just looking through old photographs. You have good timing.",
      "Quieter days suit me. Plenty of time to think.",
    ],
  },
};

// ════════════════════════════════════════════════════════════
// UTILITY FUNCTION
// ════════════════════════════════════════════════════════════

export function getCityGiftReaction(npcId: string, itemId: string): 'loved' | 'liked' | 'neutral' | 'disliked' | 'hated' {
  const prefs = CITY_GIFT_PREFERENCES[npcId];
  if (!prefs) return 'neutral';

  if (prefs.loved.includes(itemId))    return 'loved';
  if (prefs.liked.includes(itemId))    return 'liked';
  if (prefs.disliked.includes(itemId)) return 'disliked';
  if (prefs.hated.includes(itemId))    return 'hated';

  return 'neutral';
}
