import type { ContentEntry } from "../types";

type WordSeed = Pick<
  ContentEntry,
  | "slug"
  | "slovak"
  | "english"
  | "category"
  | "examples"
  | "related"
  | "topics"
  | "register"
>;

/** Learner essentials not covered by SNK frequency POS lists. */
export const curatedEssentialsSeed: WordSeed[] = [
  // Wave A — Questions
  {
    slug: "preco",
    slovak: "prečo",
    english: "why",
    category: "Phrases",
    topics: ["Questions"],
    examples: [
      { slovak: "Prečo sa učíš slovenčinu?", english: "Why are you learning Slovak?" },
      { slovak: "Prečo nie?", english: "Why not?" },
    ],
    related: ["ako", "co", "kedy"],
  },
  {
    slug: "kedy",
    slovak: "kedy",
    english: "when",
    category: "Phrases",
    topics: ["Questions"],
    examples: [
      { slovak: "Kedy prídeš?", english: "When will you come?" },
      { slovak: "Kedy to bolo?", english: "When was that?" },
    ],
    related: ["preco", "kde", "ako"],
  },
  {
    slug: "aky",
    slovak: "aký",
    english: "what kind; which (m.)",
    category: "Phrases",
    topics: ["Questions"],
    examples: [
      { slovak: "Aký je to deň?", english: "What kind of day is it?" },
      { slovak: "Akú farbu máš rád?", english: "Which color do you like?" },
    ],
    related: ["ktory", "co", "kolko"],
  },
  {
    slug: "ktory",
    slovak: "ktorý",
    english: "which; who; that (relative)",
    category: "Phrases",
    topics: ["Questions"],
    examples: [
      {
        slovak: "Muž, ktorý tam stojí, je môj brat.",
        english: "The man who is standing there is my brother.",
        note: "Curated",
      },
      {
        slovak: "Ktorá kniha sa ti páči?",
        english: "Which book do you like?",
        note: "Curated",
      },
    ],
    related: ["aky", "kto", "co"],
  },
  {
    slug: "ci",
    slovak: "či",
    english: "whether; if (yes/no question)",
    category: "Phrases",
    topics: ["Questions"],
    examples: [
      { slovak: "Neviem, či príde.", english: "I don't know whether he will come." },
      { slovak: "Či už si doma?", english: "Are you home yet?" },
    ],
    related: ["ano", "nie", "co"],
  },
  {
    slug: "odkial",
    slovak: "odkiaľ",
    english: "from where",
    category: "Phrases",
    topics: ["Questions"],
    examples: [
      { slovak: "Odkiaľ si?", english: "Where are you from?" },
      { slovak: "Odkiaľ ide tento vlak?", english: "Where does this train come from?" },
    ],
    related: ["kde", "kam", "kto"],
  },
  {
    slug: "kam",
    slovak: "kam",
    english: "where to",
    category: "Phrases",
    topics: ["Questions"],
    examples: [
      { slovak: "Kam ideš?", english: "Where are you going?" },
      { slovak: "Kam to patrí?", english: "Where does this belong?" },
    ],
    related: ["kde", "odkial", "ako"],
  },

  // Wave B — Deixis / indefinites
  {
    slug: "tento",
    slovak: "tento",
    english: "this (m.)",
    category: "Phrases",
    topics: ["Essentials"],
    examples: [
      { slovak: "Tento dom je starý.", english: "This house is old." },
      { slovak: "Tento človek je môj priateľ.", english: "This person is my friend." },
    ],
    related: ["ten", "to", "tu"],
  },
  {
    slug: "ten",
    slovak: "ten",
    english: "that (m.)",
    category: "Phrases",
    topics: ["Essentials"],
    examples: [
      { slovak: "Ten muž je učiteľ.", english: "That man is a teacher." },
      { slovak: "Ten deň bol krásny.", english: "That day was beautiful." },
    ],
    related: ["tento", "to", "tam"],
  },
  {
    slug: "to",
    slovak: "to",
    english: "that; it (neuter)",
    category: "Phrases",
    topics: ["Essentials"],
    examples: [
      { slovak: "To je pravda.", english: "That is true." },
      { slovak: "Čo je to?", english: "What is that?" },
    ],
    related: ["co", "tento", "ten"],
  },
  {
    slug: "tu",
    slovak: "tu",
    english: "here",
    category: "Phrases",
    topics: ["Essentials"],
    examples: [
      { slovak: "Som tu.", english: "I am here." },
      { slovak: "Tu je toaleta.", english: "The toilet is here." },
    ],
    related: ["tam", "kde", "to"],
  },
  {
    slug: "tam",
    slovak: "tam",
    english: "there",
    category: "Phrases",
    topics: ["Essentials"],
    examples: [
      { slovak: "Je to tam.", english: "It is there." },
      { slovak: "Tam bývam.", english: "I live there." },
    ],
    related: ["tu", "kde", "kam"],
  },
  {
    slug: "niekto",
    slovak: "niekto",
    english: "someone",
    category: "Phrases",
    topics: ["Essentials"],
    examples: [
      { slovak: "Niekto volá.", english: "Someone is calling." },
      { slovak: "Je tu niekto?", english: "Is someone here?" },
    ],
    related: ["nikto", "nieco", "kto"],
  },
  {
    slug: "nieco",
    slovak: "niečo",
    english: "something",
    category: "Phrases",
    topics: ["Essentials"],
    examples: [
      { slovak: "Chcem niečo jesť.", english: "I want something to eat." },
      { slovak: "Niečo sa stalo.", english: "Something happened." },
    ],
    related: ["nic", "co", "niekto"],
  },
  {
    slug: "nikto",
    slovak: "nikto",
    english: "no one; nobody",
    category: "Phrases",
    topics: ["Essentials"],
    examples: [
      { slovak: "Nikto neprišiel.", english: "No one came." },
      { slovak: "Nikto to nevie.", english: "Nobody knows that." },
    ],
    related: ["niekto", "nic", "nie"],
  },
  {
    slug: "nic",
    slovak: "nič",
    english: "nothing",
    category: "Phrases",
    topics: ["Essentials"],
    examples: [
      { slovak: "Nič sa nestalo.", english: "Nothing happened." },
      { slovak: "Nemám nič.", english: "I have nothing." },
    ],
    related: ["nieco", "nikto", "nie"],
  },
  {
    slug: "kazdy",
    slovak: "každý",
    english: "every; each",
    category: "Phrases",
    topics: ["Essentials"],
    examples: [
      { slovak: "Každý deň cvičím.", english: "I practice every day." },
      { slovak: "Každý to vie.", english: "Everyone knows that." },
    ],
    related: ["niekto", "kolko", "den"],
  },

  // Wave C — Personal + possessive pronouns
  {
    slug: "ja",
    slovak: "ja",
    english: "I",
    category: "Phrases",
    topics: ["Conversation"],
    examples: [
      { slovak: "Ja som študent.", english: "I am a student." },
      { slovak: "Ja rozumiem.", english: "I understand." },
    ],
    related: ["ty", "on", "my"],
  },
  {
    slug: "ty",
    slovak: "ty",
    english: "you (singular informal)",
    category: "Phrases",
    topics: ["Conversation"],
    examples: [
      { slovak: "Ty si môj priateľ.", english: "You are my friend." },
      { slovak: "Ako sa máš ty?", english: "How are you?" },
    ],
    related: ["ja", "vy", "on"],
  },
  {
    slug: "on",
    slovak: "on",
    english: "he",
    category: "Phrases",
    topics: ["Conversation"],
    examples: [
      { slovak: "On je učiteľ.", english: "He is a teacher." },
      { slovak: "On hovorí po anglicky.", english: "He speaks English." },
    ],
    related: ["ona", "oni", "ja"],
  },
  {
    slug: "ona",
    slovak: "ona",
    english: "she",
    category: "Phrases",
    topics: ["Conversation"],
    examples: [
      { slovak: "Ona je lekárka.", english: "She is a doctor." },
      { slovak: "Ona býva v Bratislave.", english: "She lives in Bratislava." },
    ],
    related: ["on", "oni", "zena"],
  },
  {
    slug: "my",
    slovak: "my",
    english: "we",
    category: "Phrases",
    topics: ["Conversation"],
    examples: [
      { slovak: "My sme priatelia.", english: "We are friends." },
      { slovak: "My ideme domov.", english: "We are going home." },
    ],
    related: ["vy", "oni", "ja"],
  },
  {
    slug: "vy",
    slovak: "vy",
    english: "you (plural / formal)",
    category: "Phrases",
    topics: ["Conversation"],
    examples: [
      { slovak: "Vy ste z Kanady?", english: "Are you from Canada?" },
      { slovak: "Čo chcete vy?", english: "What would you like?" },
    ],
    related: ["ty", "my", "dobry-den"],
  },
  {
    slug: "oni",
    slovak: "oni",
    english: "they",
    category: "Phrases",
    topics: ["Conversation"],
    examples: [
      { slovak: "Oni sú študenti.", english: "They are students." },
      { slovak: "Oni prídu zajtra.", english: "They will come tomorrow." },
    ],
    related: ["on", "ona", "my"],
  },
  {
    slug: "moj",
    slovak: "môj",
    english: "my (m.)",
    category: "Phrases",
    topics: ["Conversation"],
    examples: [
      { slovak: "Toto je môj dom.", english: "This is my house." },
      { slovak: "Moja mama je tu.", english: "My mom is here." },
    ],
    related: ["tvoj", "svoj", "ja"],
  },
  {
    slug: "tvoj",
    slovak: "tvoj",
    english: "your (m., singular)",
    category: "Phrases",
    topics: ["Conversation"],
    examples: [
      { slovak: "Kde je tvoj telefón?", english: "Where is your phone?" },
      { slovak: "Tvoja sestra je milá.", english: "Your sister is nice." },
    ],
    related: ["moj", "vas", "ty"],
  },
  {
    slug: "svoj",
    slovak: "svoj",
    english: "one's own",
    category: "Phrases",
    topics: ["Conversation"],
    examples: [
      { slovak: "Mám svoju knihu.", english: "I have my own book." },
      { slovak: "Rob si svoju prácu.", english: "Do your own work." },
    ],
    related: ["moj", "tvoj", "nas"],
  },
  {
    slug: "nas",
    slovak: "náš",
    english: "our",
    category: "Phrases",
    topics: ["Conversation"],
    examples: [
      { slovak: "Náš dom je malý.", english: "Our house is small." },
      { slovak: "Naša rodina je veľká.", english: "Our family is big." },
    ],
    related: ["vas", "moj", "my"],
  },
  {
    slug: "vas",
    slovak: "váš",
    english: "your (plural / formal)",
    category: "Phrases",
    topics: ["Conversation"],
    examples: [
      { slovak: "Vaša kancelária je tu.", english: "Your office is here." },
      { slovak: "Váš návrh je dobrý.", english: "Your proposal is good." },
    ],
    related: ["nas", "tvoj", "vy"],
  },

  // Wave D — Glue words + greetings
  {
    slug: "a",
    slovak: "a",
    english: "and",
    category: "Phrases",
    topics: ["Essentials"],
    examples: [
      { slovak: "Chlieb a maslo.", english: "Bread and butter." },
      { slovak: "Ja a ty.", english: "You and I." },
    ],
    related: ["ale", "alebo", "ze"],
  },
  {
    slug: "ale",
    slovak: "ale",
    english: "but",
    category: "Phrases",
    topics: ["Essentials"],
    examples: [
      { slovak: "Chcem ísť, ale prší.", english: "I want to go, but it is raining." },
      { slovak: "Je to malé, ale pekné.", english: "It is small, but nice." },
    ],
    related: ["a", "alebo", "lebo"],
  },
  {
    slug: "alebo",
    slovak: "alebo",
    english: "or",
    category: "Phrases",
    topics: ["Essentials"],
    examples: [
      { slovak: "Čaj alebo káva?", english: "Tea or coffee?" },
      { slovak: "Dnes alebo zajtra.", english: "Today or tomorrow." },
    ],
    related: ["a", "ale", "ci"],
  },
  {
    slug: "ze",
    slovak: "že",
    english: "that (conjunction)",
    category: "Phrases",
    topics: ["Essentials"],
    examples: [
      { slovak: "Hovorí, že príde.", english: "He says that he will come." },
      { slovak: "Myslím, že áno.", english: "I think that yes." },
    ],
    related: ["ci", "lebo", "a"],
  },
  {
    slug: "ked",
    slovak: "keď",
    english: "when",
    category: "Phrases",
    topics: ["Essentials"],
    examples: [
      { slovak: "Keď prídeš, zavolaj.", english: "When you arrive, call." },
      {
        slovak: "Keď bolo pekne, išli sme von.",
        english: "When it was nice, we went out.",
      },
    ],
    related: ["kedy", "ci", "lebo"],
  },
  {
    slug: "pretoze",
    slovak: "pretože",
    english: "because",
    category: "Phrases",
    topics: ["Essentials"],
    examples: [
      {
        slovak: "Nešiel som, pretože som bol chorý.",
        english: "I didn't go because I was sick.",
      },
      {
        slovak: "Pretože prší, zostávam doma.",
        english: "Because it is raining, I am staying home.",
      },
    ],
    related: ["lebo", "ze", "preco"],
  },
  {
    slug: "lebo",
    slovak: "lebo",
    english: "because (informal)",
    category: "Phrases",
    topics: ["Essentials"],
    examples: [
      {
        slovak: "Nemôžem, lebo nemám čas.",
        english: "I can't, because I don't have time.",
      },
      { slovak: "Lebo som unavený.", english: "Because I am tired." },
    ],
    related: ["pretoze", "preco", "ze"],
  },
  {
    slug: "v",
    slovak: "v",
    english: "in; at",
    category: "Phrases",
    topics: ["Essentials"],
    examples: [
      { slovak: "Som v meste.", english: "I am in the city." },
      { slovak: "Je to v taške.", english: "It is in the bag." },
    ],
    related: ["na", "do", "o"],
  },
  {
    slug: "na",
    slovak: "na",
    english: "on; at; to",
    category: "Phrases",
    topics: ["Essentials"],
    examples: [
      { slovak: "Kniha je na stole.", english: "The book is on the table." },
      { slovak: "Idem na stanicu.", english: "I am going to the station." },
    ],
    related: ["v", "do", "po"],
  },
  {
    slug: "do",
    slovak: "do",
    english: "into; to (direction)",
    category: "Phrases",
    topics: ["Essentials"],
    examples: [
      { slovak: "Idem do školy.", english: "I am going to school." },
      { slovak: "Vlož to do tašky.", english: "Put it in the bag." },
    ],
    related: ["z", "od", "na"],
  },
  {
    slug: "z",
    slovak: "z",
    english: "from; out of",
    category: "Phrases",
    topics: ["Essentials"],
    examples: [
      { slovak: "Som z Bratislavy.", english: "I am from Bratislava." },
      { slovak: "Vyjdi z domu.", english: "Come out of the house." },
    ],
    related: ["zo", "od", "do"],
  },
  {
    slug: "zo",
    slovak: "zo",
    english: "from (before certain consonants)",
    category: "Phrases",
    topics: ["Essentials"],
    examples: [
      { slovak: "Som zo Slovenska.", english: "I am from Slovakia." },
      { slovak: "Je zo školy.", english: "He is from school." },
    ],
    related: ["z", "od", "odkial"],
  },
  {
    slug: "s",
    slovak: "s",
    english: "with",
    category: "Phrases",
    topics: ["Essentials"],
    examples: [
      { slovak: "Idem s priateľom.", english: "I am going with a friend." },
      { slovak: "Káva s mliekom.", english: "Coffee with milk." },
    ],
    related: ["so", "a", "pre"],
  },
  {
    slug: "so",
    slovak: "so",
    english: "with (before certain consonants)",
    category: "Phrases",
    topics: ["Essentials"],
    examples: [
      { slovak: "Som so sestrou.", english: "I am with my sister." },
      { slovak: "Chlieb so syrom.", english: "Bread with cheese." },
    ],
    related: ["s", "a", "v"],
  },
  {
    slug: "o",
    slovak: "o",
    english: "about; at (time)",
    category: "Phrases",
    topics: ["Essentials"],
    examples: [
      { slovak: "Hovoríme o práci.", english: "We are talking about work." },
      { slovak: "O siedmej.", english: "At seven o'clock." },
    ],
    related: ["na", "v", "pre"],
  },
  {
    slug: "pre",
    slovak: "pre",
    english: "for",
    category: "Phrases",
    topics: ["Essentials"],
    examples: [
      { slovak: "Toto je pre teba.", english: "This is for you." },
      { slovak: "Prečo to robíš?", english: "Why are you doing that?" },
    ],
    related: ["o", "s", "na"],
  },
  {
    slug: "od",
    slovak: "od",
    english: "from; since",
    category: "Phrases",
    topics: ["Essentials"],
    examples: [
      { slovak: "Od rána pracujem.", english: "I have been working since morning." },
      { slovak: "Dostal som list od mamy.", english: "I got a letter from mom." },
    ],
    related: ["z", "do", "odkial"],
  },
  {
    slug: "po",
    slovak: "po",
    english: "after; along; for (duration)",
    category: "Phrases",
    topics: ["Essentials"],
    examples: [
      { slovak: "Po obede idem spať.", english: "After lunch I go to sleep." },
      { slovak: "Po slovensky.", english: "In Slovak." },
    ],
    related: ["na", "do", "za"],
  },
  {
    slug: "za",
    slovak: "za",
    english: "behind; for; in (time)",
    category: "Phrases",
    topics: ["Essentials"],
    examples: [
      { slovak: "Ďakujem za pomoc.", english: "Thank you for the help." },
      { slovak: "Za týždeň prídem.", english: "I will come in a week." },
    ],
    related: ["pre", "po", "od"],
  },
  {
    slug: "len",
    slovak: "len",
    english: "only; just",
    category: "Phrases",
    topics: ["Essentials"],
    examples: [
      { slovak: "Len jednu kávu, prosím.", english: "Just one coffee, please." },
      { slovak: "Len trochu.", english: "Just a little." },
    ],
    related: ["tiez", "este", "nie"],
  },
  {
    slug: "tiez",
    slovak: "tiež",
    english: "also; too",
    category: "Phrases",
    topics: ["Essentials"],
    examples: [
      { slovak: "Aj ja tiež.", english: "Me too." },
      { slovak: "Ona tiež rozumie.", english: "She understands too." },
    ],
    related: ["len", "a", "ano"],
  },
  {
    slug: "dobry-vecer",
    slovak: "dobrý večer",
    english: "good evening",
    category: "Phrases",
    topics: ["Greetings"],
    examples: [
      { slovak: "Dobrý večer, pán Kováč.", english: "Good evening, Mr. Kováč." },
      { slovak: "Dobrý večer všetkým.", english: "Good evening, everyone." },
    ],
    related: ["dobry-den", "dobru-noc", "ahoj"],
  },
  {
    slug: "dobru-noc",
    slovak: "dobrú noc",
    english: "good night",
    category: "Phrases",
    topics: ["Greetings"],
    examples: [
      { slovak: "Dobrú noc, mama.", english: "Good night, mom." },
      { slovak: "Dobrú noc a sladké sny.", english: "Good night and sweet dreams." },
    ],
    related: ["dobry-vecer", "dovidenia", "ahoj"],
  },
  {
    slug: "objatie",
    slovak: "objatie",
    english: "hug; embrace",
    category: "Nouns",
    topics: ["People"],
    examples: [
      {
        slovak: "Ďakujem za objatie.",
        english: "Thank you for the hug.",
        note: "Curated",
      },
      {
        slovak: "Dala mu dlhé objatie.",
        english: "She gave him a long hug.",
        note: "Curated",
      },
      {
        slovak: "Chýba mi tvoje objatie.",
        english: "I miss your hug.",
        note: "Curated",
      },
      {
        slovak: "Po víťazstve nasledovalo objatie.",
        english: "A hug followed the victory.",
        note: "Curated",
      },
    ],
    related: ["objat"],
  },
  {
    slug: "vynikajuci",
    slovak: "vynikajúci",
    english: "excellent; outstanding",
    category: "Adjectives",
    topics: ["Essentials"],
    examples: [
      {
        slovak: "Bol to vynikajúci výkon.",
        english: "It was an outstanding performance.",
        note: "Curated",
      },
      {
        slovak: "Je vynikajúca kuchárka.",
        english: "She is an outstanding cook.",
        note: "Curated",
      },
      {
        slovak: "Máme vynikajúce jedlo.",
        english: "We have excellent food.",
        note: "Curated",
      },
      {
        slovak: "Film bol vynikajúci.",
        english: "The film was excellent.",
        note: "Curated",
      },
    ],
    related: ["vynikajuco", "vynikat", "vyborny", "skvely"],
  },
  {
    slug: "kseft",
    slovak: "kšeft",
    english: "deal; hustle; bit of business",
    category: "Nouns",
    topics: ["Everyday life"],
    register: "slang",
    examples: [
      {
        slovak: "Mám dobrý kšeft.",
        english: "I've got a good deal.",
        note: "Curated",
      },
      {
        slovak: "Hľadám nejaký kšeft na leto.",
        english: "I'm looking for a gig for the summer.",
        note: "Curated",
      },
      {
        slovak: "Na tom kšefte sme veľa zarobili.",
        english: "We made a lot on that deal.",
        note: "Curated",
      },
      {
        slovak: "Toto nie je čistý kšeft.",
        english: "This isn't a clean deal.",
        note: "Curated",
      },
    ],
    related: ["obchod", "zakazka", "praca"],
  },
];
