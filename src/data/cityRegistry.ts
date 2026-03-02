import { ItemDef, ItemCategory, BuffType } from '../types';

export const CITY_ITEMS: ItemDef[] = [
  // ── Foods & Drinks (20 items) ─────────────────────────────────────────────
  {
    id: 'coffee', name: 'Coffee', category: ItemCategory.FOOD,
    sellPrice: 25, description: 'A rich dark brew that sharpens your focus and quickens your step through the morning rush.',
    edible: true, staminaRestore: 20, buff: BuffType.SPEED, buffDuration: 90, spriteIndex: 200,
  },
  {
    id: 'espresso', name: 'Espresso', category: ItemCategory.FOOD,
    sellPrice: 40, description: 'A concentrated shot of bold Italian coffee culture, served in a tiny but mighty cup.',
    edible: true, staminaRestore: 18, buff: BuffType.SPEED, buffDuration: 60, spriteIndex: 201,
  },
  {
    id: 'latte', name: 'Latte', category: ItemCategory.FOOD,
    sellPrice: 35, description: 'Silky steamed milk and espresso swirled together into a comforting morning ritual.',
    edible: true, staminaRestore: 22, spriteIndex: 202,
  },
  {
    id: 'smoothie', name: 'Smoothie', category: ItemCategory.FOOD,
    sellPrice: 30, description: 'A blended wave of fresh fruit and vitamins that keeps your energy flowing all day long.',
    edible: true, staminaRestore: 25, buff: BuffType.LUCK, buffDuration: 120, spriteIndex: 203,
  },
  {
    id: 'energy_drink', name: 'Energy Drink', category: ItemCategory.FOOD,
    sellPrice: 45, description: 'Neon-colored and controversially effective, this carbonated can gets the job done fast.',
    edible: true, staminaRestore: 30, buff: BuffType.SPEED, buffDuration: 80, spriteIndex: 204,
  },
  {
    id: 'pasta', name: 'Pasta', category: ItemCategory.FOOD,
    sellPrice: 60, description: 'Al dente noodles tossed in a sauce that would make any Italian grandmother proud.',
    edible: true, staminaRestore: 35, spriteIndex: 205,
  },
  {
    id: 'stir_fry', name: 'Stir Fry', category: ItemCategory.FOOD,
    sellPrice: 55, description: 'A sizzling wok-tossed medley of vegetables and sauce, ready in minutes and full of flavor.',
    edible: true, staminaRestore: 32, spriteIndex: 206,
  },
  {
    id: 'sushi', name: 'Sushi', category: ItemCategory.FOOD,
    sellPrice: 80, description: 'Delicate slices of fresh fish draped over seasoned rice, a masterpiece in every bite.',
    edible: true, staminaRestore: 38, spriteIndex: 207,
  },
  {
    id: 'pizza', name: 'Pizza', category: ItemCategory.FOOD,
    sellPrice: 50, description: 'A golden-crusted circle of joy topped with sauce, cheese, and city-neighborhood pride.',
    edible: true, staminaRestore: 33, spriteIndex: 208,
  },
  {
    id: 'sandwich', name: 'Sandwich', category: ItemCategory.FOOD,
    sellPrice: 35, description: 'Stacked high with fresh ingredients between two sturdy slices of artisan bread.',
    edible: true, staminaRestore: 25, spriteIndex: 209,
  },
  {
    id: 'salad', name: 'Salad', category: ItemCategory.FOOD,
    sellPrice: 30, description: 'Crisp greens and colorful toppings tossed in a tangy house dressing you could drink.',
    edible: true, staminaRestore: 20, spriteIndex: 210,
  },
  {
    id: 'protein_bar', name: 'Protein Bar', category: ItemCategory.FOOD,
    sellPrice: 25, description: 'Dense with nutrients and surprisingly tasty, the go-to fuel for the fitness-minded city dweller.',
    edible: true, staminaRestore: 22, buff: BuffType.DEFENSE, buffDuration: 120, spriteIndex: 211,
  },
  {
    id: 'craft_beer', name: 'Craft Beer', category: ItemCategory.FOOD,
    sellPrice: 40, description: 'A small-batch brew from the neighborhood taproom, hopped to perfection and full of character.',
    edible: true, staminaRestore: 15, spriteIndex: 212,
  },
  {
    id: 'wine', name: 'Wine', category: ItemCategory.FOOD,
    sellPrice: 65, description: 'A sophisticated bottle from a boutique winery, best enjoyed with good company and conversation.',
    edible: true, staminaRestore: 18, spriteIndex: 213,
  },
  {
    id: 'bubble_tea', name: 'Bubble Tea', category: ItemCategory.FOOD,
    sellPrice: 30, description: 'Chewy tapioca pearls bobbing in sweet milk tea — the afternoon treat no one can resist.',
    edible: true, staminaRestore: 20, spriteIndex: 214,
  },
  {
    id: 'croissant', name: 'Croissant', category: ItemCategory.FOOD,
    sellPrice: 35, description: 'Flaky, buttery, and impossibly golden — the definitive morning pastry from the corner bakery.',
    edible: true, staminaRestore: 22, spriteIndex: 215,
  },
  {
    id: 'ramen', name: 'Ramen', category: ItemCategory.FOOD,
    sellPrice: 55, description: 'Rich broth, springy noodles, and a soft egg — the late-night bowl that fixes everything.',
    edible: true, staminaRestore: 36, spriteIndex: 216,
  },
  {
    id: 'burrito', name: 'Burrito', category: ItemCategory.FOOD,
    sellPrice: 45, description: 'A foil-wrapped treasure of rice, beans, grilled protein, and salsa verde generosity.',
    edible: true, staminaRestore: 34, spriteIndex: 217,
  },
  {
    id: 'acai_bowl', name: 'Acai Bowl', category: ItemCategory.FOOD,
    sellPrice: 50, description: 'A vibrant purple base crowned with granola, banana slices, and a drizzle of honey.',
    edible: true, staminaRestore: 28, spriteIndex: 218,
  },
  {
    id: 'matcha', name: 'Matcha', category: ItemCategory.FOOD,
    sellPrice: 40, description: 'Ceremonial grade green tea whisked to a smooth froth, earthy, calming, and alive with umami.',
    edible: true, staminaRestore: 24, buff: BuffType.LUCK, buffDuration: 100, spriteIndex: 219,
  },

  // ── Work Items (8 items) ──────────────────────────────────────────────────
  {
    id: 'laptop', name: 'Laptop', category: ItemCategory.RESOURCE,
    sellPrice: 500, description: 'A sleek portable computer for getting serious work done anywhere the city takes you.',
    spriteIndex: 220,
  },
  {
    id: 'briefcase', name: 'Briefcase', category: ItemCategory.RESOURCE,
    sellPrice: 200, description: 'A polished leather case for carrying documents with the confidence of a true professional.',
    spriteIndex: 221,
  },
  {
    id: 'notebook', name: 'Notebook', category: ItemCategory.RESOURCE,
    sellPrice: 30, description: 'Grid-ruled pages perfect for jotting down ideas, sketches, and ambitious to-do lists.',
    spriteIndex: 222,
  },
  {
    id: 'pen', name: 'Pen', category: ItemCategory.RESOURCE,
    sellPrice: 10, description: 'A reliable ballpoint that never skips and writes with smooth, satisfying precision.',
    spriteIndex: 223,
  },
  {
    id: 'employee_badge', name: 'Employee Badge', category: ItemCategory.SPECIAL,
    sellPrice: 0, description: 'Your official photo ID, granting access to the building and eternal identity as a worker.',
    spriteIndex: 224,
  },
  {
    id: 'report', name: 'Report', category: ItemCategory.RESOURCE,
    sellPrice: 25, description: 'Pages of carefully formatted data and conclusions that someone will definitely read someday.',
    spriteIndex: 225,
  },
  {
    id: 'usb_drive', name: 'USB Drive', category: ItemCategory.RESOURCE,
    sellPrice: 40, description: 'A tiny stick of storage filled with files, backups, and at least one mystery folder.',
    spriteIndex: 226,
  },
  {
    id: 'business_card', name: 'Business Card', category: ItemCategory.RESOURCE,
    sellPrice: 5, description: 'Crisp cardstock bearing your name and title — networking currency of the city professional.',
    spriteIndex: 227,
  },

  // ── Social / Gift Items (12 items) ────────────────────────────────────────
  {
    id: 'flowers', name: 'Flowers', category: ItemCategory.GIFT,
    sellPrice: 50, description: 'A hand-tied bouquet of seasonal blooms sure to brighten anyone\'s day and living space.',
    spriteIndex: 228,
  },
  {
    id: 'vinyl_record', name: 'Vinyl Record', category: ItemCategory.GIFT,
    sellPrice: 80, description: 'A classic album pressed in warm analog sound, a gift for the audiophile who has everything.',
    spriteIndex: 229,
  },
  {
    id: 'book', name: 'Book', category: ItemCategory.GIFT,
    sellPrice: 45, description: 'A thoughtfully chosen title that says you know someone well enough to guess what they\'ll love.',
    spriteIndex: 230,
  },
  {
    id: 'puzzle', name: 'Puzzle', category: ItemCategory.GIFT,
    sellPrice: 35, description: 'One thousand interlocking pieces promising hours of satisfying, meditative concentration.',
    spriteIndex: 231,
  },
  {
    id: 'art_print', name: 'Art Print', category: ItemCategory.GIFT,
    sellPrice: 120, description: 'A limited-edition print from a local gallery artist, signed with a pencil in the corner.',
    spriteIndex: 232,
  },
  {
    id: 'sneakers', name: 'Sneakers', category: ItemCategory.GIFT,
    sellPrice: 150, description: 'Fresh out of the box limited-edition kicks that command respect on any city sidewalk.',
    spriteIndex: 233,
  },
  {
    id: 'tea_set', name: 'Tea Set', category: ItemCategory.GIFT,
    sellPrice: 90, description: 'A delicate porcelain set for brewing and sharing the quietest, most civilized hour of the day.',
    spriteIndex: 234,
  },
  {
    id: 'cologne', name: 'Cologne', category: ItemCategory.GIFT,
    sellPrice: 70, description: 'A sophisticated fragrance bottled in heavy glass, the signature scent of someone unforgettable.',
    spriteIndex: 235,
  },
  {
    id: 'board_game', name: 'Board Game', category: ItemCategory.GIFT,
    sellPrice: 55, description: 'A strategy game that promises a fun evening and delivers two hours of loving table rivalry.',
    spriteIndex: 236,
  },
  {
    id: 'concert_ticket', name: 'Concert Ticket', category: ItemCategory.GIFT,
    sellPrice: 100, description: 'A pass to tonight\'s sold-out show — the best gift is always a shared memory in the making.',
    spriteIndex: 237,
  },
  {
    id: 'scented_candle', name: 'Scented Candle', category: ItemCategory.GIFT,
    sellPrice: 40, description: 'Hand-poured soy wax infused with cedar and vanilla, turning any apartment into a cozy retreat.',
    spriteIndex: 238,
  },
  {
    id: 'chocolate_box', name: 'Chocolate Box', category: ItemCategory.GIFT,
    sellPrice: 60, description: 'An assorted selection of artisan chocolates nestled in a ribbon-tied box of pure indulgence.',
    spriteIndex: 239,
  },

  // ── Apartment / Furniture (10 items) ─────────────────────────────────────
  {
    id: 'desk_lamp', name: 'Desk Lamp', category: ItemCategory.CRAFTABLE,
    sellPrice: 150, description: 'An adjustable arm lamp casting warm light on late-night reading and creative ambitions alike.',
    spriteIndex: 240,
  },
  {
    id: 'throw_pillow', name: 'Throw Pillow', category: ItemCategory.CRAFTABLE,
    sellPrice: 80, description: 'A plush decorative cushion that ties the whole room together with effortless cozy style.',
    spriteIndex: 241,
  },
  {
    id: 'plant_pot', name: 'Plant Pot', category: ItemCategory.CRAFTABLE,
    sellPrice: 60, description: 'A terracotta pot housing a cheerful little plant that proves you can keep something alive.',
    spriteIndex: 242,
  },
  {
    id: 'wall_art', name: 'Wall Art', category: ItemCategory.CRAFTABLE,
    sellPrice: 200, description: 'A statement piece for blank walls, transforming a bare apartment into a curated living space.',
    spriteIndex: 243,
  },
  {
    id: 'rug', name: 'Rug', category: ItemCategory.CRAFTABLE,
    sellPrice: 175, description: 'A soft woven rug that anchors the furniture and saves bare feet from cold morning floors.',
    spriteIndex: 244,
  },
  {
    id: 'coffee_table', name: 'Coffee Table', category: ItemCategory.CRAFTABLE,
    sellPrice: 300, description: 'A minimalist wooden table for books, remotes, and the morning cup you keep meaning to move.',
    spriteIndex: 245,
  },
  {
    id: 'bookshelf', name: 'Bookshelf', category: ItemCategory.CRAFTABLE,
    sellPrice: 250, description: 'A sturdy shelving unit for books, plants, and objects that tell visitors who you are.',
    spriteIndex: 246,
  },
  {
    id: 'tv_stand', name: 'TV Stand', category: ItemCategory.CRAFTABLE,
    sellPrice: 350, description: 'A sleek media console with cable management and just enough storage for gaming controllers.',
    spriteIndex: 247,
  },
  {
    id: 'kitchen_upgrade', name: 'Kitchen Upgrade', category: ItemCategory.CRAFTABLE,
    sellPrice: 500, description: 'A complete kitchen refresh with new fixtures and hardware turning cooking into a genuine pleasure.',
    spriteIndex: 248,
  },
  {
    id: 'bathroom_set', name: 'Bathroom Set', category: ItemCategory.CRAFTABLE,
    sellPrice: 400, description: 'Coordinated towels, accessories, and storage that make your bathroom feel like a boutique hotel.',
    spriteIndex: 249,
  },
];
