/**
 * Hearthfield v2 — City NPC Gift & Dialogue Data
 * NEW FILE — does not modify any existing files.
 */

// ════════════════════════════════════════════════════════════
// INTERFACES
// ════════════════════════════════════════════════════════════

export interface CityGiftPreference {
  loved: string[];
  liked: string[];
  disliked: string[];
  hated: string[];
}

export interface CityGiftDialogue {
  loved: string[];     // 3 lines
  liked: string[];     // 3 lines
  disliked: string[];  // 3 lines
  hated: string[];     // 3 lines
}

export interface NPCScheduleBlock {
  hourStart: number;
  hourEnd: number;
  location: string;    // 'coffee_shop' | 'office' | 'bar' | 'park' | 'gym' | 'home' | 'gallery' | 'bookstore' | 'restaurant'
  activity: string;    // flavor text
}

export interface CityNPCProfile {
  id: string;
  greeting: string[];         // 5 random greetings
  chatLines: string[];        // 10 casual conversation lines
  dateDialogue: string[];     // 5 lines for dating scenes (dateable NPCs only)
  venuePreferences: string[]; // preferred hangout spots
  schedule: NPCScheduleBlock[];
  dateable: boolean;
}

// ════════════════════════════════════════════════════════════
// GIFT PREFERENCES
// ════════════════════════════════════════════════════════════

export const CITY_NPC_GIFTS: Record<string, CityGiftPreference> = {
  alex: {
    loved:    ['concert_tickets', 'book_gift', 'smoothie', 'flowers_bouquet'],
    liked:    ['coffee', 'croissant', 'plant_pot', 'chocolate_box'],
    disliked: ['energy_drink', 'briefcase'],
    hated:    ['basic_suit', 'designer_suit'],
  },
  jordan: {
    loved:    ['designer_suit', 'watch', 'briefcase', 'espresso'],
    liked:    ['energy_drink', 'steak', 'dress_shoes'],
    disliked: ['flowers_bouquet', 'chocolate_box'],
    hated:    ['casual_outfit', 'plant_pot'],
  },
  sam: {
    loved:    ['concert_tickets', 'wine_bottle', 'perfume', 'stereo'],
    liked:    ['cocktail', 'pizza_slice', 'sunglasses', 'wall_art'],
    disliked: ['espresso', 'briefcase', 'desk'],
    hated:    ['basic_suit', 'energy_drink'],
  },
  priya: {
    loved:    ['book_gift', 'tea', 'painting', 'perfume'],
    liked:    ['chocolate_box', 'lamp', 'flowers_bouquet', 'coffee'],
    disliked: ['energy_drink', 'tv', 'burger'],
    hated:    ['cocktail', 'sunglasses'],
  },
  derek: {
    loved:    ['smoothie', 'energy_drink', 'sneakers', 'salad'],
    liked:    ['tea', 'steak', 'watch'],
    disliked: ['cake_slice', 'cocktail', 'pizza_slice'],
    hated:    ['wine_bottle', 'chocolate_box'],
  },
  mika: {
    loved:    ['painting', 'wall_art', 'perfume', 'wine_bottle'],
    liked:    ['flowers_bouquet', 'book_gift', 'concert_tickets', 'curtains'],
    disliked: ['burger', 'energy_drink', 'briefcase'],
    hated:    ['basic_suit', 'tv'],
  },
  chen: {
    loved:    ['sushi_roll', 'steak', 'wine_bottle', 'ramen'],
    liked:    ['pasta', 'tea', 'cookbook_gift', 'salad'],
    disliked: ['energy_drink', 'burger', 'pizza_slice'],
    hated:    ['sandwich', 'croissant'],
  },
  val: {
    loved:    ['chocolate_box', 'flowers_bouquet', 'perfume', 'cake_slice'],
    liked:    ['coffee', 'magazine', 'plant_pot', 'rug'],
    disliked: ['steak', 'briefcase', 'energy_drink'],
    hated:    ['designer_suit', 'watch'],
  },
};

// ════════════════════════════════════════════════════════════
// GIFT DIALOGUE
// ════════════════════════════════════════════════════════════

export const CITY_NPC_DIALOGUE: Record<string, CityGiftDialogue> = {
  alex: {
    loved: [
      "Oh wow, concert tickets! I've been wanting to see them forever — this is incredible!",
      "You brought me a book? You clearly get me. This is going straight to the top of my pile.",
      "Flowers! They're beautiful. I'll put them on the counter where everyone can see.",
    ],
    liked: [
      "Ooh, coffee! You know the way to my heart.",
      "That's really thoughtful. I'll enjoy this.",
      "A plant pot? I love it — I'm always trying to make this place feel more alive.",
    ],
    disliked: [
      "Oh... an energy drink. I'm more of a slow-start-with-an-oat-latte kind of person, but thanks.",
      "A briefcase? I live in an apron, but it's a kind thought.",
      "That's not really my thing, but I appreciate you thinking of me.",
    ],
    hated: [
      "I mean... I guess suits exist for a reason, but definitely not for me.",
      "That's very corporate. Very not-me. But you tried, and that counts?",
      "I'll quietly pass this along to someone who lives in an office.",
    ],
  },
  jordan: {
    loved: [
      "A designer suit — now we're talking. This is exactly the image I need to project.",
      "This watch is flawless. Do you know how much this costs? Don't answer that.",
      "Espresso. The only gift that actually improves my productivity. Perfect.",
    ],
    liked: [
      "Energy drink — smart move. I've got three back-to-backs this afternoon.",
      "Steak. Protein. Exactly what the macro plan called for.",
      "Good pick. That's useful.",
    ],
    disliked: [
      "Flowers? A little impractical for my desk, but it's the thought.",
      "Chocolate. I'll... find someone to give this to. Thanks though.",
      "I'm not really a sweets person, but I appreciate the gesture.",
    ],
    hated: [
      "Casual outfit? I don't do casual. I don't even own casual.",
      "A plant pot. I'm not sure what my desk has done to deserve this.",
      "That's very relaxed of you. I operate at a different frequency.",
    ],
  },
  sam: {
    loved: [
      "Concert tickets?! You absolute legend. We're going together, right?",
      "Wine — the good kind. You're not messing around. I respect that.",
      "Perfume... this actually smells like something from a dream I had once. Thank you.",
    ],
    liked: [
      "A cocktail for the bartender — I like the irony. This is great.",
      "Wall art! I've been staring at the same blank corner for months.",
      "Sunglasses, nice. These definitely survive closing time energy.",
    ],
    disliked: [
      "Espresso makes me anxious. Like, my-own-heartbeat anxious. But it's a kind thought.",
      "A briefcase isn't really part of my vibe, but I see what you were going for.",
      "Hmm. I wouldn't have picked that, but hey — you tried.",
    ],
    hated: [
      "A basic suit. I wore one once. I don't talk about that time.",
      "Energy drink? I run on late nights and bass frequencies, not this.",
      "I'd rather go home early than associate with this stuff. Just saying.",
    ],
  },
  priya: {
    loved: [
      "A book! Oh, which one — oh, I've been meaning to read this for ages. Thank you!",
      "Tea! I have a whole shelf of blends, but there's always room for more.",
      "A painting... this is exquisite. I know exactly where to hang it.",
    ],
    liked: [
      "Chocolate! A quiet afternoon just got a little better.",
      "A lamp — practical and beautiful. My kind of gift.",
      "Coffee, lovely. I'll brew it fresh before the next customer comes in.",
    ],
    disliked: [
      "An energy drink. I don't think I've ever had one of these, but... thank you.",
      "A TV would overwhelm my reading space, but I know you meant well.",
      "Burgers and bookshops don't quite mix, but the thought is sweet.",
    ],
    hated: [
      "A cocktail in a bookstore is... a mood I have not cultivated.",
      "Sunglasses are a bit loud for my vibe. But it's genuinely kind of you.",
      "That's not quite me, but I can see you were thinking of me.",
    ],
  },
  derek: {
    loved: [
      "A smoothie — yes! You know exactly what to bring to a training session.",
      "Energy drink! Okay, you understand me. This is going straight down.",
      "These sneakers — are these the new release? You didn't. YOU DID. Let's go!",
    ],
    liked: [
      "Tea — good for recovery, actually. Smart choice.",
      "A quality steak. Protein. Respect.",
      "A watch with good tracking — I can use this on the track. Nice.",
    ],
    disliked: [
      "Cake slice... I'm not going to pretend that fits my nutrition plan.",
      "A cocktail is a nice social gesture, but I'm in-season. Rain check?",
      "Pizza's delicious but it's not exactly performance fuel. You know?",
    ],
    hated: [
      "Wine? I haven't had wine since my cheat day two years ago.",
      "Chocolate box. That's... a lot of sugar. I'll donate it to the front desk.",
      "I'm not mad, I'm just going to have to do an extra set tonight.",
    ],
  },
  mika: {
    loved: [
      "A painting... where did you find this? The composition is stunning.",
      "Wall art! The gallery needs new voices. This could be the one.",
      "Perfume. It smells like something that doesn't have a name yet. I love it.",
    ],
    liked: [
      "Flowers bring life to a space that sometimes forgets to breathe.",
      "A book — the right kind of escape. Thank you for this.",
      "Concert tickets. Art for the ears. I'll go with an open mind.",
    ],
    disliked: [
      "A burger is... honest. Raw in its way. But not quite my aesthetic.",
      "Energy drinks have a certain brutal energy I don't think I can channel here.",
      "That's not something I'd reach for, but I appreciate the effort.",
    ],
    hated: [
      "A basic suit makes the invisible visible — invisible taste, that is. But thank you.",
      "A TV? Art is made to be in front of you, not to make you passive.",
      "This feels like a statement. I'm not sure it's the one you intended.",
    ],
  },
  chen: {
    loved: [
      "This sushi — fresh, beautiful. You have a good eye for quality.",
      "You brought me steak? The marbling on this is remarkable. Thank you.",
      "Ramen. Real ramen. Where did you get this? I need to know.",
    ],
    liked: [
      "Pasta — I'll critique it, but I'll also eat it. That's high praise.",
      "A cookbook. I'll disagree with half the techniques, but I respect the effort.",
      "Tea between services. Simple. Perfect.",
    ],
    disliked: [
      "Energy drink in my kitchen would be a health code violation of the soul.",
      "A burger is food, yes, technically. I'll pass.",
      "Pizza... we serve real food here. But it's the thought.",
    ],
    hated: [
      "A sandwich. You brought me a sandwich. I spent fifteen years in culinary school.",
      "A croissant. Store-bought, I can tell. Please never bring this near my kitchen.",
      "I'm going to be honest with you because I respect you.",
    ],
  },
  val: {
    loved: [
      "Chocolates! Oh, you're an angel. Come in, come in!",
      "Flowers! They'll look perfect on the windowsill. Everyone will see them from the street.",
      "Perfume! This is the good stuff. How did you know? Oh, I told you, didn't I.",
    ],
    liked: [
      "Coffee! Let's sit and you can tell me everything about your week.",
      "A magazine — I haven't seen this issue yet. Do you know who's on the back page?",
      "A plant pot! I have just the spot. Third shelf, left side.",
    ],
    disliked: [
      "Steak is a bit... hearty for me. I'm more of a light-lunch person.",
      "A briefcase makes me think of tax season, but it's a thoughtful gift.",
      "Energy drinks give me the jitters something fierce. You're sweet though.",
    ],
    hated: [
      "A designer suit! Very glamorous. But between us, I prefer comfort these days.",
      "A watch is a lovely idea but mine has been broken for two years and I like it.",
      "That's very... formal of you. I live in slippers.",
    ],
  },
};

// ════════════════════════════════════════════════════════════
// NPC PROFILES
// ════════════════════════════════════════════════════════════

export const CITY_NPC_PROFILES: Record<string, CityNPCProfile> = {
  alex: {
    id: 'alex',
    dateable: true,
    venuePreferences: ['coffee_shop', 'park', 'bookstore'],
    greeting: [
      "Hey! Good morning — the oat milk just came in, if that's your thing.",
      "Oh hey, I was just thinking about you! Come in, come in.",
      "Welcome back. The usual, or are we trying something new today?",
      "Perfect timing — I just put on a fresh batch.",
      "There you are! I saved the last croissant. Don't tell anyone.",
    ],
    chatLines: [
      "I've been reading this poet — Mary Oliver? Every line feels like standing outside on a cool morning.",
      "Someone left a whole stack of records here yesterday. I've been playing them all afternoon.",
      "The park was incredible at sunrise. I went before my shift. You should try it sometime.",
      "I'm thinking about taking a pottery class. There's something meditative about working with your hands.",
      "A kid came in today and ordered with so much confidence. It made my whole week.",
      "Do you ever just sit somewhere and sketch what you see? I do that when it's slow.",
      "I swear the ferns in here grow a little every day. I talk to them, which might help.",
      "I heard there's a gallery opening this weekend. The kind with good wine and strange art.",
      "Sometimes I think the best conversations happen over coffee. Not always, but often.",
      "I stayed up too late reading again. I have no regrets. None.",
    ],
    dateDialogue: [
      "I can't stop thinking about that walk we took last time. The light was perfect.",
      "You make even a Tuesday feel worth showing up for.",
      "I wrote something last night and thought of you when I read it back.",
      "This is nice, isn't it? Just being here, no rush, no agenda.",
      "I think I've been happy lately. Like, actually happy. I wanted you to know.",
    ],
    schedule: [
      { hourStart: 6,  hourEnd: 14, location: 'coffee_shop', activity: 'Working the morning shift, steaming milk and chatting with regulars' },
      { hourStart: 15, hourEnd: 17, location: 'park',         activity: 'Sitting on the bench by the fountain with a book' },
      { hourStart: 17, hourEnd: 19, location: 'bookstore',    activity: 'Browsing new arrivals and recommending things to Priya' },
      { hourStart: 20, hourEnd: 24, location: 'home',         activity: 'Winding down with tea and music' },
    ],
  },

  jordan: {
    id: 'jordan',
    dateable: false,
    venuePreferences: ['office', 'restaurant', 'gym'],
    greeting: [
      "You're early. I respect that. Don't be late next time.",
      "Networking starts before the meeting. Just so you know.",
      "Good. You're here. I hate waiting on people.",
      "You look like you slept. That's good — rest is part of performance.",
      "Keep moving. Standing still is falling behind.",
    ],
    chatLines: [
      "I applied for the senior track. The interview is next Thursday. I'm ready.",
      "Did you see the quarterly numbers? I contributed to three of those KPIs.",
      "Sleep is non-negotiable. Eight hours minimum. That's in my productivity protocol.",
      "I have a five-year plan and a ten-year plan. The five-year plan is slightly ahead of schedule.",
      "Personal brand is everything. What does your LinkedIn say about you?",
      "I don't do lunch. I do working lunches. There's a difference.",
      "I mentor two junior associates. Not because HR asked, but because it looks good and also I believe in it.",
      "Competition is healthy. It keeps you honest.",
      "My biggest weakness is that I care too much about results. That's what I say in interviews.",
      "I took a salary negotiation course. Used it twice. Worth every penny.",
    ],
    dateDialogue: [],
    schedule: [
      { hourStart: 6,  hourEnd: 8,  location: 'gym',        activity: 'Pre-dawn lifting session, always the same routine' },
      { hourStart: 9,  hourEnd: 18, location: 'office',     activity: 'Back-to-back meetings, spreadsheets, climbing the ladder' },
      { hourStart: 19, hourEnd: 21, location: 'restaurant', activity: 'Business dinner or networking event' },
      { hourStart: 22, hourEnd: 24, location: 'home',       activity: 'Reviewing tomorrow\'s agenda before bed' },
    ],
  },

  sam: {
    id: 'sam',
    dateable: true,
    venuePreferences: ['bar', 'park'],
    greeting: [
      "Hey. You made it. Good.",
      "Didn't expect to see you tonight. That's usually a good sign.",
      "I just put on a new record — you should hear the bass line on side B.",
      "Sit down. I'll make you something. You look like you need something.",
      "The night's just getting started. You've got good timing.",
    ],
    chatLines: [
      "I've been thinking about what music sounds like before anyone names it. Like, the moment before genre.",
      "I had this dream where the bar was underwater. Everyone still ordered drinks though.",
      "Someone left a vinyl here last week. No name, no note. It's incredible.",
      "I work nights because days always feel like they're waiting for something to happen.",
      "I've been sober-curious lately. Which is weird for a bartender. I'm exploring it.",
      "The regulars here have more philosophy in them than most books I've read.",
      "I went to the park at 5am once and I've never fully recovered. It's different then.",
      "I think I understand people better after midnight. There's less performance.",
      "Do you ever feel like the right song at the right moment can change something permanent in you?",
      "I've been writing something. Not music. Just... thoughts. It might be nothing.",
    ],
    dateDialogue: [
      "I don't usually let people in this far. Just so you know that means something.",
      "The city looks different when you're next to someone who notices it.",
      "I wrote a song about this exact kind of night once. Now I'm living it. Weird.",
      "I think I like you more every time I see you. That scares me a little.",
      "Stay a little longer. The night deserves it.",
    ],
    schedule: [
      { hourStart: 8,  hourEnd: 14, location: 'home', activity: 'Sleeping in, making breakfast slowly, listening to records' },
      { hourStart: 14, hourEnd: 16, location: 'park', activity: 'Wandering the paths, headphones on, thinking' },
      { hourStart: 17, hourEnd: 26, location: 'bar',  activity: 'Working the bar at The Neon Lounge, mixing cocktails till close' },
    ],
  },

  priya: {
    id: 'priya',
    dateable: false,
    venuePreferences: ['bookstore', 'coffee_shop'],
    greeting: [
      "Oh, welcome in! Mind the stack by the door — I'm reorganising the fiction section.",
      "Hello! I just got a new shipment in. Come see if anything calls to you.",
      "Oh good, a visitor. It's been quiet today. Too quiet.",
      "Perfect timing — I was just about to put the kettle on.",
      "Welcome. Take your time. Good books don't rush anyone.",
    ],
    chatLines: [
      "I've been rereading a novel I first read at eighteen. It means something completely different now.",
      "A customer today asked for 'something life-changing but not too long.' I found them something perfect.",
      "I think the best bookstores feel like someone's living room. That's what I'm going for.",
      "I've been learning about the history of typography. It's consumed my entire week.",
      "There's a reading group that meets here on Thursdays. You should come. Low pressure, good conversation.",
      "Someone donated an entire box of poetry collections. I've been reading one a night.",
      "I had tea this morning that tasted like a quiet afternoon in autumn. I'm still thinking about it.",
      "A good book is the only thing I know that slows down time.",
      "I've been writing a little — just observations. Nothing for publication, just for the practice.",
      "My cat knocked over an entire shelf this morning. He looked deeply unbothered.",
    ],
    dateDialogue: [],
    schedule: [
      { hourStart: 9,  hourEnd: 19, location: 'bookstore',   activity: 'Running the shop, recommending books, restocking shelves' },
      { hourStart: 19, hourEnd: 20, location: 'coffee_shop', activity: 'Unwinding with a cup of tea and a chapter' },
      { hourStart: 21, hourEnd: 24, location: 'home',        activity: 'Evening reading and quiet reflection' },
    ],
  },

  derek: {
    id: 'derek',
    dateable: false,
    venuePreferences: ['gym', 'park'],
    greeting: [
      "Hey! Let's go — energy's high today, can you feel it?",
      "You showed up! That's already 90% of it.",
      "Good to see you. We've got work to do.",
      "The body remembers consistency. You're building something real here.",
      "Let's get after it. No time like right now.",
    ],
    chatLines: [
      "I had a client PR their deadlift this morning. I literally teared up. That's progress.",
      "Rest days are part of training. People always forget the rest days.",
      "I've been studying biomechanics in my spare time. The hip hinge is philosophically underrated.",
      "You know what's better than motivation? Discipline. Motivation leaves. Discipline stays.",
      "I run the park loop at 6am every day. Join me sometime. You won't regret it.",
      "I'm developing a twelve-week program. It's the most thought I've put into anything.",
      "A good warmup changes everything. I cannot stress this enough.",
      "People come in thinking fitness is about looks. It's about what you're capable of.",
      "I used to be really hard on myself. I'm working on the self-compassion thing. It's a process.",
      "Salad doesn't have to be sad. I can show you. Seriously.",
    ],
    dateDialogue: [],
    schedule: [
      { hourStart: 6,  hourEnd: 12, location: 'gym',  activity: 'Morning training sessions with clients' },
      { hourStart: 13, hourEnd: 16, location: 'park', activity: 'Outdoor runs and cooldown stretches' },
      { hourStart: 16, hourEnd: 20, location: 'gym',  activity: 'Afternoon personal training sessions' },
      { hourStart: 21, hourEnd: 24, location: 'home', activity: 'Meal prep and recovery routine' },
    ],
  },

  mika: {
    id: 'mika',
    dateable: true,
    venuePreferences: ['gallery', 'restaurant', 'bar'],
    greeting: [
      "Oh. You came. I wondered if you would.",
      "Every person who walks through that door sees something different. What do you see?",
      "I've been waiting for someone worth talking to. You'll do.",
      "The gallery is quiet today. That's when it speaks loudest.",
      "I was just thinking about something. You may have interrupted a breakthrough.",
    ],
    chatLines: [
      "There's a piece in the back room I've been staring at for three days. I'm not sure I understand it yet.",
      "A critic came in and told me this show was 'challenging.' I said yes. That's the point.",
      "I think mystery is a form of respect — you let people arrive at meaning themselves.",
      "Wine and art are similar. The best ones make you feel something you can't name.",
      "I used to paint. I stopped when it started feeling like performance. Maybe I'll start again.",
      "The city inspires me when I'm not paying attention. The second I try to capture it, it's gone.",
      "I had a dream the gallery was full of people who couldn't leave. It was beautiful.",
      "Do you think anything you've made will outlast you? I think about that.",
      "I dressed in all black for three years. Now I wear color sometimes. It's complicated.",
      "Silence is its own kind of curation. The spaces between things matter.",
    ],
    dateDialogue: [
      "I've started to see things differently since I started spending time with you.",
      "I don't let most people get this close. You should know that's not an accident.",
      "I found a piece today that made me think of you. I didn't buy it. But I wanted to.",
      "The way you look at things — really look — I find it extraordinary.",
      "If I painted you, I wouldn't paint your face. I'd paint the way you make the room feel.",
    ],
    schedule: [
      { hourStart: 10, hourEnd: 18, location: 'gallery',    activity: 'Curating exhibits, speaking with artists, guiding visitors' },
      { hourStart: 19, hourEnd: 21, location: 'restaurant', activity: 'Dinner, usually somewhere with good light' },
      { hourStart: 21, hourEnd: 23, location: 'bar',        activity: 'Late drinks, observing people, thinking' },
      { hourStart: 24, hourEnd: 28, location: 'home',       activity: 'Reading, sketching, listening to ambient music' },
    ],
  },

  chen: {
    id: 'chen',
    dateable: false,
    venuePreferences: ['restaurant', 'bar'],
    greeting: [
      "We're not open yet. Ah — it's you. Come in.",
      "Perfect timing. The broth is just finishing. You can have the first taste.",
      "I'm busy, but not too busy for someone who appreciates food.",
      "You're early. The kitchen is a mess and the menu isn't finalised. Also, welcome.",
      "Sit. I'll feed you. It's what I do.",
    ],
    chatLines: [
      "I spent four hours on a sauce today that no one will ever see. That's craftsmanship.",
      "I had a food critic in last week. They gave us four stars. I was insulted.",
      "The secret to ramen is patience. You can't rush a broth. You just can't.",
      "My grandmother taught me to cook by letting me watch. She never explained anything. Best method.",
      "I think the best meals feel like someone thought about you specifically while making them.",
      "I fired a dishwasher once for not caring. You can tell who cares.",
      "Wine pairing is an art form that most people treat like a guessing game.",
      "I tried a dish at another restaurant last week. I've been trying to forget it.",
      "My kitchen is loud and hot and I love it more than anywhere else in the world.",
      "I'll share any recipe I know. The technique is the secret. The recipe is just a map.",
    ],
    dateDialogue: [],
    schedule: [
      { hourStart: 7,  hourEnd: 9,  location: 'home',       activity: 'Morning coffee and menu planning' },
      { hourStart: 10, hourEnd: 22, location: 'restaurant', activity: 'Running the kitchen, prepping, cooking service' },
      { hourStart: 22, hourEnd: 23, location: 'bar',        activity: 'One drink to decompress after a long service' },
      { hourStart: 24, hourEnd: 28, location: 'home',       activity: 'Eating something simple, finally' },
    ],
  },

  val: {
    id: 'val',
    dateable: false,
    venuePreferences: ['coffee_shop', 'park', 'home'],
    greeting: [
      "Oh! There you are! I was just thinking about you.",
      "Come in, come in — I have news. Sit down.",
      "You look well! Did you do something different? It's something.",
      "I was just about to put the kettle on. You have the most perfect timing.",
      "Hello, hello! I'm so glad it's you.",
    ],
    chatLines: [
      "Did you hear about the couple on the third floor? I can't say too much, but it's a lot.",
      "I've been here seven years and I still know every face in this building. That's community.",
      "The coffee shop just got a new pastry chef. I've been three times this week. Research.",
      "There's a weekend event at the park I've been hearing about. I'll find out the details.",
      "I always bring baked goods to new neighbours. It's old-fashioned but it works.",
      "I keep a little notebook of useful information. You never know when something becomes relevant.",
      "The city changes all the time, but some things stay the same. The park, for instance.",
      "I know the property manager personally. Very good to know, just in case.",
      "There's something going on with the building's wifi. I've made three calls. No progress.",
      "I heard they're doing construction on the block over. I have opinions.",
    ],
    dateDialogue: [],
    schedule: [
      { hourStart: 7,  hourEnd: 9,  location: 'home',        activity: 'Morning routine, watering plants, reading the news' },
      { hourStart: 9,  hourEnd: 11, location: 'coffee_shop', activity: 'Daily coffee and catching up on neighbourhood gossip' },
      { hourStart: 11, hourEnd: 14, location: 'park',        activity: 'Walking laps, greeting regulars, feeding birds' },
      { hourStart: 15, hourEnd: 24, location: 'home',        activity: 'Home projects, baking, watching the street from the window' },
    ],
  },
};
