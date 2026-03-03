import { ItemDef, ItemCategory, NPCDef, Season, MapId, BuffType } from '../types';

// ════════════════════════════════════════════════════════════
// CITY SHOP INTERFACE
// ════════════════════════════════════════════════════════════

export interface CityShop {
  id: string;
  name: string;
  inventory: string[];  // item IDs sold
  openHour: number;     // 0-23
  closeHour: number;
}

// ════════════════════════════════════════════════════════════
// CITY ITEMS  (46 items, spriteIndex 0–45)
// ════════════════════════════════════════════════════════════

export const CITY_ITEMS: ItemDef[] = [
  // ── Food & Drinks ─────────────────────────────────────────
  {
    id: 'coffee', name: 'Coffee', category: ItemCategory.FOOD, sellPrice: 15,
    description: 'A bold dark brew to start the morning right.',
    edible: true, staminaRestore: 15, spriteIndex: 0,
  },
  {
    id: 'latte', name: 'Latte', category: ItemCategory.FOOD, sellPrice: 25,
    description: 'Silky steamed milk swirled with a shot of espresso.',
    edible: true, staminaRestore: 20, spriteIndex: 1,
  },
  {
    id: 'espresso', name: 'Espresso', category: ItemCategory.FOOD, sellPrice: 30,
    description: 'A concentrated shot of pure focus. Gives you a quick burst of speed.',
    edible: true, staminaRestore: 25, buff: BuffType.SPEED, buffDuration: 30, spriteIndex: 2,
  },
  {
    id: 'croissant', name: 'Croissant', category: ItemCategory.FOOD, sellPrice: 20,
    description: 'Flaky, buttery, impossibly golden — the essential morning pastry.',
    edible: true, staminaRestore: 12, spriteIndex: 3,
  },
  {
    id: 'sandwich', name: 'Sandwich', category: ItemCategory.FOOD, sellPrice: 35,
    description: 'Stacked high on artisan bread. A dependable midday meal.',
    edible: true, staminaRestore: 25, spriteIndex: 4,
  },
  {
    id: 'sushi_roll', name: 'Sushi Roll', category: ItemCategory.FOOD, sellPrice: 50,
    description: 'Delicate rice rolls with fresh fish. A downtown lunchtime indulgence.',
    edible: true, staminaRestore: 35, spriteIndex: 5,
  },
  {
    id: 'pasta', name: 'Pasta', category: ItemCategory.FOOD, sellPrice: 40,
    description: 'Al dente noodles in a rich sauce. Simple and deeply satisfying.',
    edible: true, staminaRestore: 30, spriteIndex: 6,
  },
  {
    id: 'steak', name: 'Steak', category: ItemCategory.FOOD, sellPrice: 80,
    description: 'A perfectly seared cut served with sides. The gold standard dinner.',
    edible: true, staminaRestore: 50, spriteIndex: 7,
  },
  {
    id: 'cocktail', name: 'Cocktail', category: ItemCategory.FOOD, sellPrice: 45,
    description: 'A handcrafted drink that loosens the mood and sparks great conversation.',
    edible: true, staminaRestore: 10, buff: BuffType.LUCK, buffDuration: 60, spriteIndex: 8,
  },
  {
    id: 'smoothie', name: 'Smoothie', category: ItemCategory.FOOD, sellPrice: 30,
    description: 'A blended wave of fresh fruit that keeps your energy steady all day.',
    edible: true, staminaRestore: 20, spriteIndex: 9,
  },
  {
    id: 'cake_slice', name: 'Cake Slice', category: ItemCategory.FOOD, sellPrice: 25,
    description: 'A generous wedge of moist layered cake from the corner bakery.',
    edible: true, staminaRestore: 15, spriteIndex: 10,
  },
  {
    id: 'ramen', name: 'Ramen', category: ItemCategory.FOOD, sellPrice: 35,
    description: 'Rich broth, springy noodles, and a soft egg. The late-night fix.',
    edible: true, staminaRestore: 28, spriteIndex: 11,
  },
  {
    id: 'salad', name: 'Salad', category: ItemCategory.FOOD, sellPrice: 25,
    description: 'Crisp greens tossed in a tangy dressing. Light and refreshing.',
    edible: true, staminaRestore: 18, spriteIndex: 12,
  },
  {
    id: 'burger', name: 'Burger', category: ItemCategory.FOOD, sellPrice: 30,
    description: 'A juicy patty on a toasted bun. Classic city-diner comfort food.',
    edible: true, staminaRestore: 22, spriteIndex: 13,
  },
  {
    id: 'pizza_slice', name: 'Pizza Slice', category: ItemCategory.FOOD, sellPrice: 20,
    description: 'A late-night slice of gooey cheese and crisp crust. Essential.',
    edible: true, staminaRestore: 16, spriteIndex: 14,
  },
  {
    id: 'tea', name: 'Tea', category: ItemCategory.FOOD, sellPrice: 10,
    description: 'A calming cup of brewed leaves. Perfect for a quiet afternoon.',
    edible: true, staminaRestore: 10, spriteIndex: 15,
  },
  {
    id: 'energy_drink', name: 'Energy Drink', category: ItemCategory.FOOD, sellPrice: 40,
    description: 'Neon-colored and controversially effective. Gets the job done fast.',
    edible: true, staminaRestore: 40, spriteIndex: 16,
  },
  {
    id: 'nachos', name: 'Nachos', category: ItemCategory.FOOD, sellPrice: 25,
    description: 'Loaded chips with melted cheese and jalapeños. Bar food perfection.',
    edible: true, staminaRestore: 18, spriteIndex: 17,
  },

  // ── Clothing (category: RESOURCE) ────────────────────────
  {
    id: 'basic_suit', name: 'Basic Suit', category: ItemCategory.RESOURCE, sellPrice: 200,
    description: 'A clean, professional two-piece. Makes a solid first impression.',
    spriteIndex: 18,
  },
  {
    id: 'designer_suit', name: 'Designer Suit', category: ItemCategory.RESOURCE, sellPrice: 800,
    description: 'Tailored by a master. The power suit that commands every boardroom.',
    spriteIndex: 19,
  },
  {
    id: 'casual_outfit', name: 'Casual Outfit', category: ItemCategory.RESOURCE, sellPrice: 100,
    description: 'Relaxed and stylish. Perfect for weekends and coffee runs.',
    spriteIndex: 20,
  },
  {
    id: 'watch', name: 'Watch', category: ItemCategory.RESOURCE, sellPrice: 500,
    description: 'An elegant timepiece that says you arrived early on purpose.',
    spriteIndex: 21,
  },
  {
    id: 'sunglasses', name: 'Sunglasses', category: ItemCategory.RESOURCE, sellPrice: 150,
    description: 'Sleek frames that make every sidewalk feel like a runway.',
    spriteIndex: 22,
  },
  {
    id: 'briefcase', name: 'Briefcase', category: ItemCategory.RESOURCE, sellPrice: 300,
    description: 'Polished leather for carrying documents with quiet confidence.',
    spriteIndex: 23,
  },
  {
    id: 'sneakers', name: 'Sneakers', category: ItemCategory.RESOURCE, sellPrice: 120,
    description: 'Fresh out of the box. Comfortable enough for the commute.',
    spriteIndex: 24,
  },
  {
    id: 'dress_shoes', name: 'Dress Shoes', category: ItemCategory.RESOURCE, sellPrice: 250,
    description: 'Polished leather oxfords. The finishing touch on a sharp outfit.',
    spriteIndex: 25,
  },
  {
    id: 'winter_coat', name: 'Winter Coat', category: ItemCategory.RESOURCE, sellPrice: 350,
    description: 'A wool-blend coat that keeps you warm and stylish through the cold months.',
    spriteIndex: 26,
  },

  // ── Furniture (category: CRAFTABLE) ──────────────────────
  {
    id: 'desk', name: 'Desk', category: ItemCategory.CRAFTABLE, sellPrice: 400,
    description: 'A solid workspace for getting things done from the comfort of home.',
    spriteIndex: 27,
  },
  {
    id: 'bookshelf', name: 'Bookshelf', category: ItemCategory.CRAFTABLE, sellPrice: 250,
    description: 'A sturdy shelving unit that tells visitors who you are.',
    spriteIndex: 28,
  },
  {
    id: 'couch', name: 'Couch', category: ItemCategory.CRAFTABLE, sellPrice: 600,
    description: 'A plush sectional sofa. The heart of any living room.',
    spriteIndex: 29,
  },
  {
    id: 'tv', name: 'TV', category: ItemCategory.CRAFTABLE, sellPrice: 800,
    description: 'A large flat-screen that transforms any wall into an entertainment center.',
    spriteIndex: 30,
  },
  {
    id: 'plant_pot', name: 'Plant Pot', category: ItemCategory.CRAFTABLE, sellPrice: 50,
    description: 'A cheerful terracotta pot proving you can keep something alive.',
    spriteIndex: 31,
  },
  {
    id: 'rug', name: 'Rug', category: ItemCategory.CRAFTABLE, sellPrice: 200,
    description: 'A woven rug that anchors the furniture and warms the floor.',
    spriteIndex: 32,
  },
  {
    id: 'lamp', name: 'Lamp', category: ItemCategory.CRAFTABLE, sellPrice: 100,
    description: 'A warm ambient light that makes any corner feel intentional.',
    spriteIndex: 33,
  },
  {
    id: 'painting', name: 'Painting', category: ItemCategory.CRAFTABLE, sellPrice: 350,
    description: 'An original canvas from a local artist. Conversation starter included.',
    spriteIndex: 34,
  },
  {
    id: 'coffee_table', name: 'Coffee Table', category: ItemCategory.CRAFTABLE, sellPrice: 150,
    description: 'A minimalist table for books, remotes, and morning cups.',
    spriteIndex: 35,
  },
  {
    id: 'bed_upgrade', name: 'Bed Upgrade', category: ItemCategory.CRAFTABLE, sellPrice: 500,
    description: 'A premium mattress and frame set. Sleep better, feel better.',
    spriteIndex: 36,
  },
  {
    id: 'mini_fridge', name: 'Mini Fridge', category: ItemCategory.CRAFTABLE, sellPrice: 300,
    description: 'A compact refrigerator for late-night snacks and drinks.',
    spriteIndex: 37,
  },
  {
    id: 'stereo', name: 'Stereo', category: ItemCategory.CRAFTABLE, sellPrice: 450,
    description: 'A high-fidelity speaker system that fills the apartment with music.',
    spriteIndex: 38,
  },
  {
    id: 'wall_art', name: 'Wall Art', category: ItemCategory.CRAFTABLE, sellPrice: 200,
    description: 'A statement print that transforms a bare wall into a curated space.',
    spriteIndex: 39,
  },
  {
    id: 'curtains', name: 'Curtains', category: ItemCategory.CRAFTABLE, sellPrice: 80,
    description: 'Linen panels that soften the light and add polish to any window.',
    spriteIndex: 40,
  },

  // ── Gifts ────────────────────────────────────────────────
  {
    id: 'flowers_bouquet', name: 'Flowers Bouquet', category: ItemCategory.GIFT, sellPrice: 75,
    description: 'A hand-tied bunch of seasonal blooms. Brightens any room instantly.',
    spriteIndex: 41,
  },
  {
    id: 'wine_bottle', name: 'Wine Bottle', category: ItemCategory.GIFT, sellPrice: 120,
    description: 'A boutique vintage best shared with good company.',
    spriteIndex: 42,
  },
  {
    id: 'book_gift', name: 'Book', category: ItemCategory.GIFT, sellPrice: 60,
    description: 'A thoughtfully chosen title that says you know them well.',
    spriteIndex: 43,
  },
  {
    id: 'concert_tickets', name: 'Concert Tickets', category: ItemCategory.GIFT, sellPrice: 200,
    description: 'Two passes to tonight\'s sold-out show. The best gifts are shared memories.',
    spriteIndex: 44,
  },
  {
    id: 'perfume', name: 'Perfume', category: ItemCategory.GIFT, sellPrice: 150,
    description: 'A sophisticated fragrance in heavy glass. Unforgettable.',
    spriteIndex: 45,
  },
  {
    id: 'chocolate_box', name: 'Chocolate Box', category: ItemCategory.GIFT, sellPrice: 45,
    description: 'Artisan chocolates in a ribbon-tied box. Pure indulgence.',
    spriteIndex: 46,
  },
];

// ════════════════════════════════════════════════════════════
// CITY NPCS  (8 NPCs)
// ════════════════════════════════════════════════════════════

export const CITY_NPCS: NPCDef[] = [
  {
    id: 'alex',
    name: 'Alex',
    marriageable: true,
    birthday: { season: Season.SPRING, day: 14 },
    lovedItems: ['latte', 'croissant', 'flowers_bouquet', 'cake_slice'],
    likedItems: ['coffee', 'tea', 'smoothie', 'book_gift'],
    hatedItems: ['energy_drink', 'nachos'],
    defaultMap: MapId.TOWN,
    portraitIndex: 0,
    spriteIndex: 0,
    dialoguePool: {
      '0': [
        'Welcome! What can I get you today?',
        'We just got a new seasonal blend in. You should try it.',
        'Busy morning — hope you\'re having a good one.',
        'The espresso is especially good today.',
        'Let me know if you need anything.',
      ],
      '1-3': [
        'Oh, you\'re back! The usual?',
        'I saved the last croissant for you. Don\'t tell anyone.',
        'You look like you could use a latte. I\'m on it.',
        'How\'s your day going so far?',
        'I\'ve been experimenting with a new foam technique. Want to try it?',
      ],
      '4-6': [
        'Honestly, this job\'s better when familiar faces come in.',
        'I\'ve been thinking about roasting my own beans someday.',
        'You always seem to show up right when I need a break.',
        'I made this one with extra care — just for you.',
        'Don\'t laugh, but I actually read the whole book you mentioned.',
        'Some days the coffee practically makes itself.',
      ],
      '7-10': [
        'I don\'t know what I\'d do without our morning chats.',
        'I told my roommate about you. They want to meet you.',
        'You\'ve honestly made this job a hundred times better.',
        'I was thinking — maybe we could explore the city together sometime?',
        'Every time the door opens I kind of hope it\'s you.',
        'I made your order before you even sat down. Is that weird?',
      ],
    },
  },
  {
    id: 'jordan',
    name: 'Jordan',
    marriageable: false,
    birthday: { season: Season.SUMMER, day: 7 },
    lovedItems: ['espresso', 'steak', 'designer_suit', 'watch'],
    likedItems: ['coffee', 'briefcase', 'sandwich', 'energy_drink'],
    hatedItems: ['cake_slice', 'tea'],
    defaultMap: MapId.TOWN,
    portraitIndex: 1,
    spriteIndex: 1,
    dialoguePool: {
      '0': [
        'New hire, huh? Keep your head down and you\'ll be fine.',
        'The quarterly review is coming up. Just saying.',
        'I got here at 7 AM. Did you?',
        'Performance metrics don\'t lie.',
        'Welcome to Meridian Corp. It\'s competitive here.',
      ],
      '1-3': [
        'Not bad on that last report. Keep it up.',
        'I hear you\'re making a good impression on management.',
        'Competition between colleagues is healthy. Remember that.',
        'I noticed your project. Solid execution.',
        'We should get coffee and talk strategy sometime.',
      ],
      '4-6': [
        'Okay, I\'ll admit it — you\'re pretty good at this.',
        'I pushed you early on because I saw potential.',
        'Want to collaborate on the Henderson account?',
        'Between us — management has their eye on you.',
        'You remind me of myself when I started. Don\'t waste it.',
        'I respect the hustle. Genuinely.',
      ],
      '7-10': [
        'You\'ve become the one person here I actually trust.',
        'I heard you\'re up for the same promotion as me. May the best one win.',
        'I told my mentor about your work. Impressed is an understatement.',
        'Don\'t tell anyone, but I\'m rooting for you.',
        'I don\'t say this often, but — I\'m glad you work here.',
        'If you ever leave Meridian, take me with you.',
      ],
    },
  },
  {
    id: 'sam',
    name: 'Sam',
    marriageable: true,
    birthday: { season: Season.FALL, day: 21 },
    lovedItems: ['cocktail', 'vinyl_record', 'concert_tickets', 'wine_bottle'],
    likedItems: ['pizza_slice', 'nachos', 'burger', 'chocolate_box'],
    hatedItems: ['tea', 'salad'],
    defaultMap: MapId.TOWN,
    portraitIndex: 2,
    spriteIndex: 2,
    dialoguePool: {
      '0': [
        'What\'ll it be tonight?',
        'The house special is good if you want something different.',
        'Live band starts at nine. Stick around.',
        'First time here? You picked a good night.',
        'I make a mean old-fashioned. Trust me on that.',
      ],
      '1-3': [
        'You\'ve got good taste in music. I noticed you listening.',
        'I set aside some of the good stuff for regulars.',
        'Heard you come in most weekends now. I like that.',
        'What kind of music are you into?',
        'You always look like you\'re thinking something interesting.',
      ],
      '4-6': [
        'This place is way better when you\'re here.',
        'I played that track you mentioned last week. Crowd loved it.',
        'Want to hear my side project? I\'ve been recording.',
        'Some nights this bar feels like the whole world.',
        'I\'ve been working on a new cocktail. You\'re my test subject.',
        'I don\'t talk to most customers the way I talk to you.',
      ],
      '7-10': [
        'I\'ve been writing a song. It\'s kind of about you, don\'t make it weird.',
        'The city\'s loud but somehow quieter when you\'re around.',
        'Want to catch that show on Saturday? Together, I mean.',
        'I saved you a seat at the bar. Every night.',
        'You make the last call feel like the first one.',
        'I think about our conversations more than I should.',
      ],
    },
  },
  {
    id: 'priya',
    name: 'Priya',
    marriageable: false,
    birthday: { season: Season.WINTER, day: 3 },
    lovedItems: ['book_gift', 'tea', 'flowers_bouquet', 'perfume'],
    likedItems: ['cake_slice', 'smoothie', 'painting', 'wine_bottle'],
    hatedItems: ['energy_drink', 'nachos'],
    defaultMap: MapId.TOWN,
    portraitIndex: 3,
    spriteIndex: 3,
    dialoguePool: {
      '0': [
        'Let me know if you\'re looking for anything in particular.',
        'We just got a new shipment in. Beautiful covers this time.',
        'Reading anything good lately?',
        'Take your time — no rush in a bookstore.',
        'The poetry section is in the back if you\'re curious.',
      ],
      '1-3': [
        'You have genuinely good taste in books.',
        'I held this one for you — thought you\'d appreciate it.',
        'Have you tried the author I recommended? What did you think?',
        'I love when people take their time here.',
        'You always leave with something unexpected. I respect that.',
      ],
      '4-6': [
        'I\'ve started recommending your favorites to other customers.',
        'There\'s a reading circle Thursday evenings. You should come.',
        'I feel like I know you through the books you choose.',
        'I put an essay aside for you — it reminded me of our conversations.',
        'You make this shop feel like what I hoped it would be.',
        'Not everyone gets why I do this. You do.',
      ],
      '7-10': [
        'You\'re the reason I look forward to opening the shop.',
        'I wrote a poem once. You\'re the only person I\'d trust with it.',
        'Do you want to come to the author reading with me this weekend?',
        'Every book I read, I think of what you\'d say about it.',
        'I\'ve never met someone who sees the world the way you do.',
        'You\'ve become my favorite part of this little corner of the city.',
      ],
    },
  },
  {
    id: 'derek',
    name: 'Derek',
    marriageable: false,
    birthday: { season: Season.SUMMER, day: 15 },
    lovedItems: ['smoothie', 'energy_drink', 'sneakers', 'steak'],
    likedItems: ['sandwich', 'salad', 'burger', 'casual_outfit'],
    hatedItems: ['cocktail', 'cake_slice'],
    defaultMap: MapId.TOWN,
    portraitIndex: 4,
    spriteIndex: 4,
    dialoguePool: {
      '0': [
        'Welcome! First time at the gym?',
        'Form is everything. I can help with that.',
        'Consistency beats intensity every time.',
        'You\'ve got good energy. Let\'s channel it.',
        'Warm up first. Always warm up first.',
      ],
      '1-3': [
        'I\'ve been watching your progress. You\'re improving.',
        'Try adding ten more pounds this week. You\'re ready.',
        'The mental part is half the battle. You\'ve got it.',
        'I love working with people who actually show up.',
        'You\'ve got good form. Takes most people months to get there.',
      ],
      '4-6': [
        'I\'m putting together a weekend group run. You in?',
        'Honestly, you\'re one of my favorite clients.',
        'I\'ve been thinking about your goals. I have some ideas.',
        'You\'ve pushed me to get better at coaching too.',
        'The discipline you show here? It shows everywhere.',
        'You\'re not just getting stronger. You\'re getting confident.',
      ],
      '7-10': [
        'You\'ve come a long way. I hope you see that.',
        'I train a lot of people but not everyone has what you have.',
        'Want to do a fitness challenge together? Just for fun.',
        'You motivate me as much as I motivate you. That\'s rare.',
        'I\'m proud of what you\'ve built here.',
        'The city looks different when you\'re strong enough to really take it on.',
      ],
    },
  },
  {
    id: 'mika',
    name: 'Mika',
    marriageable: true,
    birthday: { season: Season.FALL, day: 10 },
    lovedItems: ['painting', 'wine_bottle', 'flowers_bouquet', 'perfume'],
    likedItems: ['book_gift', 'concert_tickets', 'wall_art', 'tea'],
    hatedItems: ['energy_drink', 'burger'],
    defaultMap: MapId.TOWN,
    portraitIndex: 5,
    spriteIndex: 5,
    dialoguePool: {
      '0': [
        'The exhibit opens Friday. I\'d recommend it.',
        'Art speaks differently to everyone. What do you see?',
        'This piece arrived last week. I\'m still thinking about it.',
        'We have a new local artist featured this month.',
        'Feel free to wander. That\'s how you find the real things.',
      ],
      '1-3': [
        'You have an interesting eye. I\'ve noticed.',
        'Most people walk past that one. You stopped.',
        'I\'d like to know what you thought of the last show.',
        'You ask the right questions about art.',
        'There\'s a private opening Thursday. Very few invitations.',
      ],
      '4-6': [
        'I think about the things you said about that installation.',
        'You see things in the work that even I hadn\'t articulated.',
        'I\'ve been working on something. I want your perspective.',
        'Most people consume art. You experience it. That\'s rare.',
        'I keep finding pieces I think you\'d love.',
        'Being around you makes the gallery feel more alive.',
      ],
      '7-10': [
        'I\'ve never shown anyone my personal work. Would you want to see it?',
        'You\'ve changed how I think about what I curate.',
        'There\'s a city I want to see through your eyes someday.',
        'Every time I hang a new piece I wonder what you\'ll say.',
        'I made something with you in mind. Don\'t read too much into it.',
        'The mystery I liked at first — it\'s gone. What replaced it is better.',
      ],
    },
  },
  {
    id: 'chen',
    name: 'Chen',
    marriageable: false,
    birthday: { season: Season.WINTER, day: 19 },
    lovedItems: ['steak', 'sushi_roll', 'wine_bottle', 'ramen'],
    likedItems: ['pasta', 'salad', 'flowers_bouquet', 'chocolate_box'],
    hatedItems: ['energy_drink', 'pizza_slice'],
    defaultMap: MapId.TOWN,
    portraitIndex: 6,
    spriteIndex: 6,
    dialoguePool: {
      '0': [
        'Welcome. Tonight\'s tasting menu is ready.',
        'I insist you try the special. I made it twice to get it right.',
        'Food is care made visible. I hope you feel that tonight.',
        'Everything here is made from scratch. No shortcuts.',
        'Tell me what you liked. And what you didn\'t.',
      ],
      '1-3': [
        'You came back. That tells me the food spoke to you.',
        'I made the sauce differently this week. Let me know.',
        'Your feedback last time made me rethink the whole dish.',
        'I can make something off-menu if you\'re feeling adventurous.',
        'Real pleasure to cook for someone who actually pays attention.',
      ],
      '4-6': [
        'I don\'t let many people into the kitchen. You\'re an exception.',
        'Your palate is honest. I appreciate that more than compliments.',
        'I\'ve been testing a new recipe. You\'re my first call.',
        'You\'ve made me a better chef. Seriously.',
        'Cooking for someone who understands — that\'s everything.',
        'I cooked my grandmother\'s recipe tonight. For you.',
      ],
      '7-10': [
        'I\'ve never had a dining guest become someone I trust like this.',
        'I want to cook you a full tasting menu. Just for you.',
        'You\'re the reason I still believe in what I do.',
        'I think about your reaction when I create something new.',
        'Nobody has ever made me feel like my work matters the way you do.',
        'If I ever open my own place — I want you at the first table.',
      ],
    },
  },
  {
    id: 'val',
    name: 'Val',
    marriageable: false,
    birthday: { season: Season.SPRING, day: 28 },
    lovedItems: ['chocolate_box', 'flowers_bouquet', 'cake_slice', 'cocktail'],
    likedItems: ['wine_bottle', 'smoothie', 'book_gift', 'perfume'],
    hatedItems: ['briefcase', 'dress_shoes'],
    defaultMap: MapId.TOWN,
    portraitIndex: 7,
    spriteIndex: 7,
    dialoguePool: {
      '0': [
        'Oh! You must be the new neighbor. I\'m Val, 4B.',
        'Fair warning — the elevator is slow on Mondays.',
        'The building has a rooftop garden. Not many people know.',
        'I hope the walls aren\'t too thin. They are though.',
        'Welcome to the building. Watch out for Mr. Whiskers on the stairs.',
      ],
      '1-3': [
        'Have you heard about the couple in 3A? Drama.',
        'I made extra soup and have no idea what to do with it.',
        'The landlord is raising rent again. Can you believe it?',
        'I saw someone from that TV show on our street yesterday.',
        'Your lights were on really late. Working hard or can\'t sleep?',
      ],
      '4-6': [
        'I can\'t believe we lived next door for so long before really talking.',
        'I told literally everyone about you. You\'re their favorite story.',
        'Okay, I have some tea about the building. Ready?',
        'You\'re my favorite neighbor. Don\'t tell the others.',
        'I think I\'ve been a bit much. But also — have you heard about 2C?',
        'This city is more manageable with a friend close by.',
      ],
      '7-10': [
        'You\'re honestly the reason I feel okay about living here.',
        'I saved you the good spot in the laundry room. You\'re welcome.',
        'I don\'t know what I\'d do without someone to debrief with.',
        'You\'ve become my person in this city. That\'s huge.',
        'I may overshare. But I only do it with people I actually care about.',
        'Neighbors come and go. I hope you stay a long, long time.',
      ],
    },
  },
];

// ════════════════════════════════════════════════════════════
// CITY SHOPS  (6 shops)
// ════════════════════════════════════════════════════════════

export const CITY_SHOPS: CityShop[] = [
  {
    id: 'sunrise_cafe',
    name: 'Sunrise Cafe',
    inventory: ['coffee', 'latte', 'espresso', 'croissant', 'tea', 'smoothie'],
    openHour: 7,
    closeHour: 20,
  },
  {
    id: 'metro_mart',
    name: 'Metro Mart',
    inventory: ['sandwich', 'salad', 'burger', 'energy_drink', 'cake_slice', 'chocolate_box'],
    openHour: 8,
    closeHour: 22,
  },
  {
    id: 'sakura_kitchen',
    name: 'Sakura Kitchen',
    inventory: ['sushi_roll', 'ramen', 'pasta', 'steak'],
    openHour: 11,
    closeHour: 22,
  },
  {
    id: 'the_neon_lounge',
    name: 'The Neon Lounge',
    inventory: ['cocktail', 'pizza_slice', 'nachos'],
    openHour: 18,
    closeHour: 2,
  },
  {
    id: 'urban_style',
    name: 'Urban Style',
    inventory: [
      'basic_suit', 'designer_suit', 'casual_outfit',
      'watch', 'sunglasses', 'briefcase',
      'sneakers', 'dress_shoes', 'winter_coat',
    ],
    openHour: 9,
    closeHour: 19,
  },
  {
    id: 'home_and_living',
    name: 'Home & Living',
    inventory: [
      'desk', 'bookshelf', 'couch', 'tv', 'plant_pot',
      'rug', 'lamp', 'painting', 'coffee_table', 'bed_upgrade',
      'mini_fridge', 'stereo', 'wall_art', 'curtains',
    ],
    openHour: 9,
    closeHour: 18,
  },
];
