/**
 * Thoughtful's curated gift catalog.
 *
 * This is the single source of truth the recommendation layer works from.
 * It is deliberately self-contained and typed so it can later be swapped
 * for a real product/affiliate API without touching the questionnaire,
 * the matching layer, or the results UI.
 *
 * The AI never invents products — it ranks and reasons over these entries.
 */

/* ------------------------------------------------------------------ */
/*  Vocabulary — aligned with the questionnaire options                */
/* ------------------------------------------------------------------ */

export type GiftCategory =
  | "personalized"
  | "practical"
  | "creative"
  | "experiences"
  | "luxury"
  | "fun";

export const GIFT_CATEGORY_LABELS: Record<GiftCategory, string> = {
  personalized: "Personalized",
  practical: "Practical",
  creative: "Creative",
  experiences: "Experience",
  luxury: "Luxury",
  fun: "Fun & unexpected",
};

export type GiftInterest =
  | "Photography"
  | "Travel"
  | "Coffee"
  | "Books"
  | "Fitness"
  | "Gaming"
  | "Fashion"
  | "Cooking"
  | "Music"
  | "Art"
  | "Technology"
  | "Beauty"
  | "Sports"
  | "Food"
  | "Home & Decor";

export type GiftOccasionId =
  | "birthday"
  | "anniversary"
  | "graduation"
  | "wedding"
  | "valentines"
  | "eid"
  | "christmas"
  | "just-because"
  | "other";

export type GiftRelationshipId =
  | "partner"
  | "friend"
  | "parent"
  | "sibling"
  | "colleague"
  | "other";

export type GiftStyle =
  | "practical"
  | "creative"
  | "personalized"
  | "luxury"
  | "funny"
  | "experience"
  | "surprise";

export type PriceBand = "under-25" | "25-50" | "50-100" | "100-250" | "250-plus";

/* ------------------------------------------------------------------ */
/*  The gift shape                                                     */
/* ------------------------------------------------------------------ */

export interface Gift {
  id: string;
  name: string;
  /** one sentence of product truth */
  description: string;
  category: GiftCategory;
  /** realistic estimated price, USD — whole, believable numbers */
  price: number;
  /** the budget band the price falls into, e.g. "$25–50" */
  priceLabel: string;
  /** questionnaire interest labels this gift genuinely serves */
  interests: GiftInterest[];
  occasions: GiftOccasionId[];
  relationships: GiftRelationshipId[];
  styles: GiftStyle[];
  /** product photography — replaceable with local paths later */
  image: string;
  /** the one-line reason it lands — grounds later AI reasoning */
  whyItsGood: string;
}

/* ------------------------------------------------------------------ */
/*  Price helpers                                                      */
/* ------------------------------------------------------------------ */

export function priceBandFor(price: number): PriceBand {
  if (price < 25) return "under-25";
  if (price <= 50) return "25-50";
  if (price <= 100) return "50-100";
  if (price <= 250) return "100-250";
  return "250-plus";
}

const PRICE_BAND_LABELS: Record<PriceBand, string> = {
  "under-25": "Under $25",
  "25-50": "$25\u201350",
  "50-100": "$50\u2013100",
  "100-250": "$100\u2013250",
  "250-plus": "$250+",
};

export function priceLabelFor(price: number): string {
  return PRICE_BAND_LABELS[priceBandFor(price)];
}

/* ------------------------------------------------------------------ */
/*  Image shorthand (Pexels CDN, warm product/editorial photography)   */
/* ------------------------------------------------------------------ */

const px = (id: number): string =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200`;

/* ------------------------------------------------------------------ */
/*  The catalog                                                        */
/* ------------------------------------------------------------------ */

type GiftDraft = Omit<Gift, "priceLabel">;

const DRAFTS: GiftDraft[] = [
  /* ------------------------------ Personalized ------------------------------ */
  {
    id: "story-so-far-photo-book",
    name: "\u201cThe Story So Far\u201d photo book",
    description:
      "A linen-bound photo book laid out from your favourite photos together, with room for quiet captions.",
    category: "personalized",
    price: 34,
    interests: ["Photography"],
    occasions: ["anniversary", "birthday", "valentines", "christmas"],
    relationships: ["partner", "friend", "parent", "sibling"],
    styles: ["personalized"],
    image: px(16374374),
    whyItsGood:
      "It turns shared memories into something they can hold — hard to beat on an anniversary.",
  },
  {
    id: "beneath-this-sky-star-map",
    name: "Custom star map print",
    description:
      "A museum-grade print of the exact night sky above a date and place that matters to you both.",
    category: "personalized",
    price: 29,
    interests: ["Art", "Home & Decor"],
    occasions: ["anniversary", "wedding", "valentines"],
    relationships: ["partner"],
    styles: ["personalized", "creative"],
    image: px(34787343),
    whyItsGood:
      "One date, one place, one sky — quietly romantic without saying a word.",
  },
  {
    id: "engraved-coordinates-bracelet",
    name: "Engraved coordinates bracelet",
    description:
      "A slim bracelet hand-engraved with initials, a date, or the coordinates of somewhere you both love.",
    category: "personalized",
    price: 58,
    interests: ["Fashion", "Beauty"],
    occasions: ["anniversary", "valentines", "birthday", "graduation"],
    relationships: ["partner", "friend", "sibling", "parent"],
    styles: ["personalized", "luxury"],
    image: px(39358064),
    whyItsGood:
      "Small enough for every day, personal enough that they'll never take it off.",
  },
  {
    id: "embossed-travel-journal",
    name: "Personalized travel journal",
    description:
      "A lay-flat linen journal with their name embossed on the cover, made for tickets, sketches and tiny maps.",
    category: "personalized",
    price: 32,
    interests: ["Travel", "Books"],
    occasions: ["graduation", "birthday", "just-because", "christmas"],
    relationships: ["friend", "sibling", "partner", "colleague"],
    styles: ["personalized"],
    image: px(7235894),
    whyItsGood:
      "For the traveller who keeps everything — now it all has a beautiful home.",
  },
  {
    id: "custom-illustrated-portrait",
    name: "Custom illustrated portrait",
    description:
      "A hand-drawn portrait from your photo, created by an independent illustrator and delivered as a fine-art print.",
    category: "personalized",
    price: 65,
    interests: ["Art", "Home & Decor"],
    occasions: ["wedding", "anniversary", "birthday", "christmas"],
    relationships: ["partner", "parent", "friend"],
    styles: ["personalized", "creative"],
    image: px(4348205),
    whyItsGood:
      "It looks like art, but it's actually the two of you — that's the trick.",
  },
  {
    id: "family-recipe-book",
    name: "Personalized family recipe book",
    description:
      "A clothbound recipe journal printed with the family name, ready to fill with the dishes that raised you.",
    category: "personalized",
    price: 38,
    interests: ["Cooking", "Food"],
    occasions: ["christmas", "wedding", "birthday", "just-because"],
    relationships: ["parent", "sibling", "partner"],
    styles: ["personalized"],
    image: px(12673819),
    whyItsGood:
      "Asking for her recipes gives two gifts at once — the book, and being asked.",
  },

  /* ------------------------------ Practical -------------------------------- */
  {
    id: "insulated-steel-bottle",
    name: "Insulated steel bottle",
    description:
      "A double-walled steel bottle that keeps drinks cold for 24 hours, in soft matte colours.",
    category: "practical",
    price: 32,
    interests: ["Fitness", "Sports", "Travel"],
    occasions: ["birthday", "graduation", "just-because"],
    relationships: ["friend", "sibling", "colleague", "partner", "other"],
    styles: ["practical"],
    image: px(4793328),
    whyItsGood:
      "They'll carry it daily — and think of you at the gym, on trails, at their desk.",
  },
  {
    id: "full-grain-leather-wallet",
    name: "Full-grain leather wallet",
    description:
      "A slim bifold in full-grain leather that ages beautifully, with room for exactly what they need.",
    category: "practical",
    price: 85,
    interests: ["Fashion"],
    occasions: ["birthday", "graduation", "christmas", "anniversary"],
    relationships: ["partner", "parent", "sibling", "colleague"],
    styles: ["practical", "luxury"],
    image: px(32954513),
    whyItsGood:
      "Replaces the thing they use most with one they'll keep for a decade.",
  },
  {
    id: "hand-stitched-card-holder",
    name: "Hand-stitched leather card holder",
    description:
      "A two-pocket card holder in vegetable-tanned leather, made to slim the everyday carry.",
    category: "practical",
    price: 45,
    interests: ["Fashion"],
    occasions: ["birthday", "graduation", "christmas", "just-because"],
    relationships: ["colleague", "friend", "sibling"],
    styles: ["practical"],
    image: px(37326711),
    whyItsGood:
      "Polished enough for a colleague, useful enough to never leave their pocket.",
  },
  {
    id: "travel-tech-organizer",
    name: "Travel tech organizer",
    description:
      "A weatherproof roll-up case for cables, chargers and earbuds, so nothing tangles in their bag again.",
    category: "practical",
    price: 28,
    interests: ["Technology", "Travel"],
    occasions: ["graduation", "birthday", "just-because"],
    relationships: ["colleague", "friend", "sibling", "other"],
    styles: ["practical"],
    image: px(4386357),
    whyItsGood:
      "The person who travels with a knot of cables will thank you every single trip.",
  },
  {
    id: "walnut-desk-organizer",
    name: "Walnut & brass desk organizer",
    description:
      "A solid walnut catch-all with brass details for keys, pens and the phone they're always losing.",
    category: "practical",
    price: 45,
    interests: ["Home & Decor", "Technology"],
    occasions: ["graduation", "christmas", "just-because"],
    relationships: ["colleague", "friend", "parent"],
    styles: ["practical"],
    image: px(28228020),
    whyItsGood: "Quietly upgrades the desk they sit at all day.",
  },
  {
    id: "pour-over-coffee-set",
    name: "Pour-over coffee set",
    description:
      "A ceramic dripper and kettle with a starter bag of beans, for slow weekend coffee at home.",
    category: "practical",
    price: 42,
    interests: ["Coffee"],
    occasions: ["birthday", "christmas", "just-because"],
    relationships: ["friend", "colleague", "partner", "parent", "sibling"],
    styles: ["practical"],
    image: px(33138912),
    whyItsGood: "Turns their kitchen into the café they'd cross town for.",
  },
  {
    id: "portable-speaker",
    name: "Portable bluetooth speaker",
    description:
      "A palm-sized speaker with warm, room-filling sound and a 20-hour battery.",
    category: "practical",
    price: 89,
    interests: ["Music", "Technology"],
    occasions: ["birthday", "graduation", "christmas"],
    relationships: ["friend", "sibling", "partner", "other"],
    styles: ["practical"],
    image: px(6892708),
    whyItsGood:
      "Picnics, kitchens, hotel rooms — suddenly everywhere has a soundtrack.",
  },
  {
    id: "weekly-planner-brass-pen",
    name: "Weekly planner & brass pen",
    description:
      "A lay-flat weekly planner with thick paper, paired with a brass pen that develops a patina.",
    category: "practical",
    price: 24,
    interests: ["Books"],
    occasions: ["graduation", "just-because", "birthday"],
    relationships: ["colleague", "friend", "sibling"],
    styles: ["practical"],
    image: px(15951969),
    whyItsGood: "For the one with big plans this year — literally.",
  },
  {
    id: "readers-evening-set",
    name: "Reader's evening set",
    description:
      "A warm reading light and an embossed leather bookmark, boxed for slow evenings.",
    category: "practical",
    price: 28,
    interests: ["Books"],
    occasions: ["birthday", "christmas", "just-because"],
    relationships: ["friend", "parent", "sibling", "colleague"],
    styles: ["practical"],
    image: px(18431777),
    whyItsGood:
      "Says 'I know what your perfect night looks like' for under thirty.",
  },
  {
    id: "yoga-starter-set",
    name: "Yoga starter set",
    description:
      "A cushioned non-slip mat with two cork blocks and a carry strap, in calm mineral tones.",
    category: "practical",
    price: 55,
    interests: ["Fitness", "Sports"],
    occasions: ["birthday", "just-because", "christmas"],
    relationships: ["friend", "sibling", "partner"],
    styles: ["practical"],
    image: px(8899549),
    whyItsGood: "The gentle nudge toward the habit they keep talking about.",
  },
  {
    id: "three-month-coffee-subscription",
    name: "Three-month coffee subscription",
    description:
      "Single-origin coffee roasted to order and posted on their schedule, for three months.",
    category: "practical",
    price: 48,
    interests: ["Coffee", "Food"],
    occasions: ["birthday", "christmas", "just-because"],
    relationships: ["friend", "colleague", "partner", "parent", "sibling"],
    styles: ["practical"],
    image: px(8937485),
    whyItsGood: "It's the gift that arrives again in March — and again in April.",
  },
  {
    id: "smart-fitness-band",
    name: "Smart fitness band",
    description:
      "A slim fitness band tracking sleep, heart rate and recovery, with a two-week battery.",
    category: "practical",
    price: 110,
    interests: ["Fitness", "Technology", "Sports"],
    occasions: ["birthday", "graduation", "christmas"],
    relationships: ["partner", "sibling", "friend"],
    styles: ["practical", "luxury"],
    image: px(8534782),
    whyItsGood: "For the friend training for something — it quietly cheers them on.",
  },
  {
    id: "wireless-gaming-headset",
    name: "Wireless gaming headset",
    description:
      "A wireless over-ear headset with a broadcast-grade mic and memory-foam earcups.",
    category: "practical",
    price: 95,
    interests: ["Gaming", "Music", "Technology"],
    occasions: ["birthday", "christmas", "graduation"],
    relationships: ["sibling", "friend", "partner"],
    styles: ["practical"],
    image: px(8414344),
    whyItsGood:
      "Better game audio for them — and finally some silence for the rest of the house.",
  },

  /* ------------------------------ Creative --------------------------------- */
  {
    id: "watercolor-starter-kit",
    name: "Watercolour starter kit",
    description:
      "A travel tin of 24 artist-grade watercolours with brushes and cold-press paper.",
    category: "creative",
    price: 30,
    interests: ["Art"],
    occasions: ["birthday", "christmas", "just-because"],
    relationships: ["friend", "sibling", "parent", "partner"],
    styles: ["creative"],
    image: px(19196316),
    whyItsGood: "Small enough for a kitchen table — or the top of a mountain.",
  },
  {
    id: "candle-making-kit",
    name: "DIY candle-making kit",
    description:
      "Soy wax, crackling wooden wicks and two amber jars, with scents they blend themselves.",
    category: "creative",
    price: 36,
    interests: ["Home & Decor", "Art"],
    occasions: ["birthday", "christmas", "just-because"],
    relationships: ["friend", "sibling", "partner"],
    styles: ["creative"],
    image: px(4790467),
    whyItsGood: "An evening of making, then months of burning their own creation.",
  },
  {
    id: "instant-camera-bundle",
    name: "Instant camera film bundle",
    description:
      "Two packs of instant film, a linen album and washi corners for their instant camera.",
    category: "creative",
    price: 40,
    interests: ["Photography"],
    occasions: ["birthday", "christmas", "valentines"],
    relationships: ["partner", "friend", "sibling"],
    styles: ["creative"],
    image: px(9799073),
    whyItsGood: "It refills the fun — and makes sure the prints actually get kept.",
  },
  {
    id: "creative-writing-journal",
    name: "Creative writing journal",
    description:
      "A guided journal with 300 prompts for stories, lists and gloriously bad first drafts.",
    category: "creative",
    price: 22,
    interests: ["Books"],
    occasions: ["birthday", "just-because", "christmas"],
    relationships: ["friend", "sibling", "colleague", "other"],
    styles: ["creative"],
    image: px(9553514),
    whyItsGood: "For the one who says they'd write if they knew where to start.",
  },
  {
    id: "pottery-at-home-kit",
    name: "Pottery at-home kit",
    description:
      "Air-dry clay, sculpting tools and glazes for two slow afternoons at the kitchen table.",
    category: "creative",
    price: 48,
    interests: ["Art", "Home & Decor"],
    occasions: ["birthday", "christmas", "just-because"],
    relationships: ["friend", "partner", "sibling"],
    styles: ["creative"],
    image: px(9736289),
    whyItsGood: "Make a wonky bowl together — then keep it forever.",
  },
  {
    id: "card-making-lettering-kit",
    name: "Card-making & lettering kit",
    description:
      "Brush pens, gouache and blank cards for hand-lettered greetings people actually keep.",
    category: "creative",
    price: 27,
    interests: ["Art"],
    occasions: ["just-because", "christmas", "birthday"],
    relationships: ["friend", "sibling", "parent"],
    styles: ["creative"],
    image: px(5412106),
    whyItsGood: "Their thank-you notes are about to get unfairly beautiful.",
  },

  /* ------------------------------ Experiences ------------------------------ */
  {
    id: "dinner-for-two",
    name: "Candlelit dinner for two",
    description:
      "A three-course dinner at a much-loved local restaurant, booked and paid for in advance.",
    category: "experiences",
    price: 120,
    interests: ["Food"],
    occasions: ["anniversary", "valentines", "wedding", "birthday"],
    relationships: ["partner", "parent"],
    styles: ["experience", "luxury"],
    image: px(37307283),
    whyItsGood: "No wrapping needed — just an evening they'll talk about for weeks.",
  },
  {
    id: "coffee-tasting-flight",
    name: "Coffee tasting experience",
    description:
      "A guided tasting of four single-origin coffees with a roaster, plus beans to take home.",
    category: "experiences",
    price: 45,
    interests: ["Coffee", "Food"],
    occasions: ["birthday", "just-because", "valentines"],
    relationships: ["friend", "partner", "colleague"],
    styles: ["experience"],
    image: px(22678714),
    whyItsGood: "They'll leave caffeinated and wonderfully opinionated about beans.",
  },
  {
    id: "spa-day-for-one",
    name: "Spa day experience",
    description:
      "A full afternoon of treatments and thermal rooms — with absolutely no phone.",
    category: "experiences",
    price: 150,
    interests: ["Beauty"],
    occasions: ["birthday", "valentines", "christmas", "just-because"],
    relationships: ["partner", "parent", "friend", "sibling"],
    styles: ["experience", "luxury"],
    image: px(7691167),
    whyItsGood:
      "The person who never sits still gets a whole day where stillness is the point.",
  },
  {
    id: "cooking-class-for-two",
    name: "Cooking class for two",
    description:
      "An evening class for two — pasta, bread or dumplings — ending with the dinner you made.",
    category: "experiences",
    price: 95,
    interests: ["Cooking", "Food"],
    occasions: ["anniversary", "birthday", "valentines", "just-because"],
    relationships: ["partner", "friend", "sibling", "parent"],
    styles: ["experience"],
    image: px(8176598),
    whyItsGood: "A skill, a meal and a shared memory in one booking.",
  },
  {
    id: "sunrise-hike-adventure",
    name: "Guided sunrise hike",
    description:
      "A guided sunrise hike with thermos coffee waiting at the summit — for them and a plus-one.",
    category: "experiences",
    price: 68,
    interests: ["Travel", "Fitness"],
    occasions: ["birthday", "graduation", "just-because"],
    relationships: ["friend", "sibling", "partner"],
    styles: ["experience"],
    image: px(1143518),
    whyItsGood: "Some people collect things; others collect mornings like this one.",
  },
  {
    id: "live-music-gift-card",
    name: "Live music gift card",
    description: "A gift card toward two tickets for a show they get to choose themselves.",
    category: "experiences",
    price: 110,
    interests: ["Music"],
    occasions: ["birthday", "valentines", "just-because", "christmas"],
    relationships: ["partner", "friend", "sibling"],
    styles: ["experience"],
    image: px(35836062),
    whyItsGood: "You're not just giving a night out — you're giving the countdown to it.",
  },
  {
    id: "wine-and-cheese-evening",
    name: "Wine & cheese tasting evening",
    description: "A sommelier-led tasting of five wines with paired cheeses, for two.",
    category: "experiences",
    price: 85,
    interests: ["Food"],
    occasions: ["anniversary", "valentines", "birthday", "christmas"],
    relationships: ["partner", "friend", "parent", "colleague"],
    styles: ["experience", "luxury"],
    image: px(3938727),
    whyItsGood: "Reliably the evening where everyone says 'we should do this more often'.",
  },
  {
    id: "pilates-class-pack",
    name: "Five-class pilates pack",
    description: "Five classes at a boutique studio near them, with mat hire included.",
    category: "experiences",
    price: 90,
    interests: ["Fitness"],
    occasions: ["birthday", "just-because"],
    relationships: ["friend", "sibling", "partner"],
    styles: ["experience"],
    image: px(8151752),
    whyItsGood: "A nudge without pressure — and the first class is already paid for.",
  },
  {
    id: "museum-membership",
    name: "Year of museum entry",
    description: "A year of unlimited entry to their city's art museum, plus guest passes.",
    category: "experiences",
    price: 60,
    interests: ["Art", "Books"],
    occasions: ["birthday", "just-because", "christmas"],
    relationships: ["friend", "parent", "partner"],
    styles: ["experience"],
    image: px(34201404),
    whyItsGood: "Twelve months of quiet Sundays, on you.",
  },

  /* ------------------------------ Luxury ----------------------------------- */
  {
    id: "signature-eau-de-parfum",
    name: "Signature eau de parfum",
    description: "A warm, amber-led eau de parfum from a small perfumery, beautifully boxed.",
    category: "luxury",
    price: 130,
    interests: ["Beauty", "Fashion"],
    occasions: ["anniversary", "valentines", "birthday", "christmas", "eid"],
    relationships: ["partner", "parent", "sibling"],
    styles: ["luxury"],
    image: px(11159174),
    whyItsGood: "A scent can say what a card can't.",
  },
  {
    id: "leather-weekender",
    name: "Full-grain leather weekender",
    description:
      "A full-grain leather weekender with brass hardware, sized precisely for the overhead bin.",
    category: "luxury",
    price: 190,
    interests: ["Travel", "Fashion"],
    occasions: ["graduation", "anniversary", "birthday", "christmas"],
    relationships: ["partner", "sibling", "parent"],
    styles: ["luxury", "practical"],
    image: px(4452637),
    whyItsGood: "Every trip for the next twenty years starts by picking this up.",
  },
  {
    id: "noise-cancelling-headphones",
    name: "Premium noise-cancelling headphones",
    description:
      "Flagship noise-cancelling headphones with studio-tuned sound and a 30-hour battery.",
    category: "luxury",
    price: 220,
    interests: ["Music", "Technology", "Travel"],
    occasions: ["birthday", "graduation", "christmas"],
    relationships: ["partner", "sibling", "friend"],
    styles: ["luxury", "practical"],
    image: px(815494),
    whyItsGood: "Planes, open offices, loud neighbours — gone.",
  },
  {
    id: "luxury-coffee-gift-set",
    name: "Rare micro-lot coffee set",
    description:
      "Three rare micro-lot coffees, a hand-thrown ceramic cup and tasting notes, gift-boxed.",
    category: "luxury",
    price: 75,
    interests: ["Coffee", "Food"],
    occasions: ["christmas", "birthday", "just-because", "eid"],
    relationships: ["colleague", "friend", "parent", "partner"],
    styles: ["luxury"],
    image: px(35025304),
    whyItsGood: "The coffee person has everything — except coffees like these.",
  },
  {
    id: "silk-skincare-set",
    name: "Silk-lined skincare set",
    description:
      "A silk-lined box of small-batch cleanser, serum and night cream that turns routine into ritual.",
    category: "luxury",
    price: 95,
    interests: ["Beauty"],
    occasions: ["birthday", "christmas", "valentines", "eid"],
    relationships: ["partner", "parent", "sibling", "friend"],
    styles: ["luxury"],
    image: px(4202321),
    whyItsGood: "Five quiet minutes, morning and night, that feel like a gift every day.",
  },
  {
    id: "merino-cashmere-scarf",
    name: "Merino-cashmere scarf",
    description:
      "A woven scarf in a merino-cashmere blend, in a colour that quietly goes with everything.",
    category: "luxury",
    price: 110,
    interests: ["Fashion"],
    occasions: ["christmas", "birthday", "anniversary", "eid"],
    relationships: ["parent", "partner", "sibling"],
    styles: ["luxury"],
    image: px(2986445),
    whyItsGood: "The rare luxury they'll actually reach for every cold day.",
  },
  {
    id: "restored-film-camera",
    name: "Restored 35mm film camera",
    description:
      "A fully serviced vintage 35mm camera with a fresh strap and its first roll of film included.",
    category: "luxury",
    price: 180,
    interests: ["Photography"],
    occasions: ["birthday", "graduation", "christmas", "anniversary"],
    relationships: ["partner", "sibling", "friend"],
    styles: ["luxury"],
    image: px(3733981),
    whyItsGood: "For the photographer, this isn't equipment — it's a love letter.",
  },
  {
    id: "ceramic-espresso-cup-set",
    name: "Hand-thrown espresso cup set",
    description: "Four hand-thrown espresso cups with saucers, glazed in warm ivory.",
    category: "luxury",
    price: 85,
    interests: ["Coffee", "Home & Decor"],
    occasions: ["christmas", "birthday", "wedding", "just-because"],
    relationships: ["parent", "friend", "partner", "colleague"],
    styles: ["luxury"],
    image: px(13429429),
    whyItsGood: "Morning coffee, permanently upgraded to an occasion.",
  },

  /* ------------------------------ Fun & unexpected ------------------------- */
  {
    id: "scratch-off-world-map",
    name: "Scratch-off world map",
    description:
      "A gold-foil world map where every visited country scratches away to reveal colour beneath.",
    category: "fun",
    price: 25,
    interests: ["Travel"],
    occasions: ["birthday", "graduation", "christmas", "just-because"],
    relationships: ["friend", "sibling", "partner", "colleague", "other"],
    styles: ["funny", "creative"],
    image: px(7235814),
    whyItsGood: "Part trophy wall, part to-do list — dormant wanderlust, awakened.",
  },
  {
    id: "mystery-snack-box",
    name: "Mystery international snack box",
    description: "Twelve snacks from twelve countries in one box — and no menu attached.",
    category: "fun",
    price: 30,
    interests: ["Food"],
    occasions: ["just-because", "birthday", "christmas"],
    relationships: ["sibling", "friend", "colleague", "other"],
    styles: ["funny", "surprise"],
    image: px(33774018),
    whyItsGood: "Half the fun is guessing; the other half is a new obsession.",
  },
  {
    id: "strategy-board-game",
    name: "Modern strategy board game",
    description: "A beautifully designed strategy game for two to five players and long evenings.",
    category: "fun",
    price: 45,
    interests: ["Gaming"],
    occasions: ["christmas", "birthday", "just-because"],
    relationships: ["friend", "sibling", "partner", "other"],
    styles: ["funny"],
    image: px(6218131),
    whyItsGood: "It's not a gift — it's the next five years of game nights.",
  },
  {
    id: "hot-chocolate-bomb-kit",
    name: "Hot chocolate bomb kit",
    description:
      "Moulds, couverture chocolate and marshmallows for eight gloriously theatrical hot chocolates.",
    category: "fun",
    price: 22,
    interests: ["Food", "Cooking"],
    occasions: ["christmas", "just-because", "birthday"],
    relationships: ["sibling", "friend", "colleague", "other"],
    styles: ["funny", "creative"],
    image: px(10105463),
    whyItsGood: "Silly to buy, pure magic to watch melt.",
  },
  {
    id: "dice-and-cards-travel-set",
    name: "Dice & cards travel set",
    description: "A leather roll of five dice and linen-finish cards for games absolutely anywhere.",
    category: "fun",
    price: 19,
    interests: ["Gaming", "Travel"],
    occasions: ["just-because", "birthday", "christmas"],
    relationships: ["sibling", "friend", "colleague", "other"],
    styles: ["funny"],
    image: px(7047507),
    whyItsGood: "Airport delays just got significantly more fun.",
  },
];

/** The finished catalog: every gift with its derived price band label. */
export const GIFTS: Gift[] = DRAFTS.map((gift) => ({
  ...gift,
  priceLabel: priceLabelFor(gift.price),
}));
