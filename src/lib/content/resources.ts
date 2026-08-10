/** Curated external Slovak-learning tools and media for /resources. */

export type ResourceGroupId =
  | "courses"
  | "apps"
  | "grammar"
  | "dictionaries"
  | "textbooks"
  | "listening"
  | "channels"
  | "tutors"
  | "adjacent";

export type ResourceCost = "free" | "freemium" | "paid" | "mixed";

export interface ResourceLink {
  href: string;
  label: string;
  note?: string;
}

export interface LearningResource {
  id: string;
  group: ResourceGroupId;
  name: string;
  href: string;
  summary: string;
  /** Short caveat or how to use it well. */
  note?: string;
  cost: ResourceCost;
  level?: string;
  featured?: boolean;
  links?: ResourceLink[];
}

export interface ResourceGroup {
  id: ResourceGroupId;
  title: string;
  summary: string;
}

export const resourceGroups: ResourceGroup[] = [
  {
    id: "courses",
    title: "Courses and platforms",
    summary: "Structured paths with lessons, quizzes, and progress tracking.",
  },
  {
    id: "apps",
    title: "Apps and drills",
    summary: "Daily practice, sentence repetition, and cloze vocabulary work.",
  },
  {
    id: "grammar",
    title: "Grammar references",
    summary: "External explanations and tables to pair with this site.",
  },
  {
    id: "dictionaries",
    title: "Dictionaries",
    summary: "Lookups for meaning, inflection, and example sentences.",
  },
  {
    id: "textbooks",
    title: "Textbooks and materials",
    summary: "Print and university series that many formal courses follow.",
  },
  {
    id: "listening",
    title: "Listening and reading",
    summary: "Podcasts, radio lessons, kids’ texts, and learner news.",
  },
  {
    id: "channels",
    title: "YouTube and video",
    summary: "Channels that teach, narrate stories, or show everyday Slovak.",
  },
  {
    id: "tutors",
    title: "Tutors and schools",
    summary: "Paid conversation practice and classroom options.",
  },
  {
    id: "adjacent",
    title: "Adjacent and transfer",
    summary: "Useful nearby tools that are not Slovak courses — read the notes.",
  },
];

export const learningResources: LearningResource[] = [
  // —— Courses ——
  {
    id: "slovake-eu",
    group: "courses",
    name: "slovake.eu",
    href: "https://slovake.eu/",
    summary:
      "Free multilingual portal with A1–B2 courses, exercises, tests, and a full grammar section. One of the strongest free structured paths for English speakers.",
    cost: "free",
    level: "A1–B2",
    featured: true,
    links: [
      { href: "https://slovake.eu/courses", label: "Courses" },
      { href: "https://slovake.eu/courses/a1", label: "A1 course" },
      { href: "https://slovake.eu/courses/a2", label: "A2 course" },
      { href: "https://slovake.eu/courses/b1", label: "B1 course" },
      { href: "https://slovake.eu/courses/b2", label: "B2 course" },
      { href: "https://slovake.eu/grammar", label: "Grammar index" },
      { href: "https://slovake.eu/dictionary", label: "Dictionary" },
    ],
  },
  {
    id: "e-slovak",
    group: "courses",
    name: "e-slovak (Studia Academica Slovaca)",
    href: "https://www.e-slovak.sk/",
    summary:
      "Free Moodle courses from Comenius University. Self-study A1/A2 run year-round; tutor-supported cohorts open on a schedule. Built around the Krížom-krážom textbook series.",
    note: "Free account required. Bookmark the A1/A2 course pages — deep quiz links die with the Moodle session.",
    cost: "free",
    level: "A1–A2",
    featured: true,
    links: [
      {
        href: "https://www.e-slovak.sk/course/view.php?id=22",
        label: "Self-study A1",
      },
      {
        href: "https://www.e-slovak.sk/course/view.php?id=46",
        label: "Self-study A2",
      },
    ],
  },
  {
    id: "slovakforu",
    group: "courses",
    name: "SlovakforU",
    href: "https://www.slovakforu.sk/",
    summary:
      "Everyday Slovak lessons with a strong podcast and YouTube presence. Originally aimed at Ukrainian newcomers; still useful for any beginner who wants clear spoken input.",
    cost: "free",
    level: "A1–A2",
    links: [
      {
        href: "https://open.spotify.com/show/6MvnsnHhqilfzXgUDVpQAu",
        label: "Podcast on Spotify",
      },
      {
        href: "https://www.youtube.com/@slovakforu6661/videos",
        label: "YouTube",
      },
    ],
  },
  {
    id: "learn101-slovak",
    group: "courses",
    name: "Learn101 — Slovak",
    href: "https://learn101.org/slovak.php",
    summary:
      "Free step-by-step Slovak lessons with clickable audio: alphabet, phrases, grammar basics, vocab lists, and verbs. Simple pages — good quick reference for beginners.",
    cost: "free",
    level: "A1",
    links: [
      {
        href: "https://learn101.org/slovak_alphabet.php",
        label: "Alphabet",
      },
      {
        href: "https://learn101.org/slovak_phrases.php",
        label: "Phrases",
      },
      {
        href: "https://learn101.org/slovak_numbers.php",
        label: "Numbers",
      },
      {
        href: "https://learn101.org/slovak_grammar.php",
        label: "Grammar basics",
      },
      {
        href: "https://learn101.org/slovak_verbs.php",
        label: "Verbs",
      },
      {
        href: "https://learn101.org/slovak_vocabulary.php",
        label: "Vocabulary lists",
      },
      {
        href: "https://learn101.org/slovak_nouns.php",
        label: "Nouns",
      },
      {
        href: "https://learn101.org/slovak_adjectives.php",
        label: "Adjectives",
      },
    ],
  },
  {
    id: "slovak-cooking-language",
    group: "courses",
    name: "Slovak Cooking — language lessons",
    href: "https://www.slovakcooking.com/language/",
    summary:
      "Short travel-dialog course: greetings, restaurant talk, numbers, and a song lyric lesson — each with grammar notes and audio.",
    cost: "free",
    level: "A1",
    note: "2009-era blog layout. Start from the language hub; lesson pages still work.",
    links: [
      {
        href: "https://www.slovakcooking.com/2009/language/ja-som-american/",
        label: "Lesson 1 — Ja som …",
      },
      {
        href: "https://www.slovakcooking.com/2009/language/hungry/",
        label: "Lesson 2 — restaurant dialog",
      },
      {
        href: "https://www.slovakcooking.com/2009/language/numbers/",
        label: "Numbers vocab",
      },
    ],
  },
  {
    id: "simply-put-slovak",
    group: "courses",
    name: "Simply Put — Slovak for beginners",
    href: "http://simplyput.atspace.com/slovak/",
    summary:
      "Free plain-English beginner course (Gary Lord, 2005): alphabet → cases, verbs, past tense across 9 pages. Written by a TEFL teacher who lived in Slovakia — explanations stay light on jargon.",
    cost: "free",
    level: "A1",
    note: "Free AtSpace host — HTTP only (browser may warn).",
    links: [
      {
        href: "http://simplyput.atspace.com/slovak/Slovak1.htm",
        label: "Page 1 — alphabet, numbers, greetings",
      },
      {
        href: "http://simplyput.atspace.com/slovak/Slovak2.htm",
        label: "Page 2 — to be, present verbs",
      },
      {
        href: "http://simplyput.atspace.com/slovak/Slovak3.htm",
        label: "Page 3 — nouns, accusative, food",
      },
      {
        href: "http://simplyput.atspace.com/index.htm",
        label: "Simply Put hub (also PT, ES)",
      },
    ],
  },
  {
    id: "comprehensible-slovak",
    group: "courses",
    name: "Comprehensible Slovak",
    href: "https://www.comprehensibleslovak.com/",
    summary:
      "Comprehensible-input site: beginner video lessons plus News in Easy Slovak (B1–B2) with transcripts. Strong complement to grammar-heavy courses.",
    cost: "free",
    level: "A1–B2",
    featured: true,
    links: [
      {
        href: "https://www.comprehensibleslovak.com/content/video",
        label: "A1–A2 videos",
      },
      {
        href: "https://www.comprehensibleslovak.com/content/audio",
        label: "News in Easy Slovak",
      },
    ],
  },
  {
    id: "mango-slovak",
    group: "courses",
    name: "Mango Languages — Slovak",
    href: "https://mangolanguages.com/available-languages/slovak/",
    summary: "Conversation-led lessons with color-coded grammar notes and culture tips.",
    cost: "paid",
    level: "Beginner+",
    note: "Often free via public libraries — check yours before buying a retail plan.",
  },
  {
    id: "lingq-slovak",
    group: "courses",
    name: "LingQ — Slovak",
    href: "https://www.lingq.com/en/learn/sk/web/library",
    summary:
      "Read and listen with clickable vocabulary tracking. Import your own texts; community libraries include SlovakforU and Learn Slovak with Stories courses.",
    cost: "freemium",
    level: "A2+",
    note: "Best after A1: import stories or podcasts you already follow, then mine vocab from them.",
  },

  // —— Apps ——
  {
    id: "glossika-slovak",
    group: "apps",
    name: "Glossika — Slovak",
    href: "https://ai.glossika.com/app/slovak/dashboard",
    summary:
      "Full-sentence spaced repetition with heavy audio. Builds spoken rhythm and pattern memory rather than isolated vocab lists.",
    cost: "paid",
    level: "A1+",
  },
  {
    id: "mondly-slovak",
    group: "apps",
    name: "Mondly — Slovak",
    href: "https://www.mondly.com/",
    summary:
      "Short gamified lessons with speech recognition and chatbot practice. Handy for daily streaks; thinner on deep grammar.",
    cost: "freemium",
    level: "Beginner",
    links: [{ href: "https://app.mondly.com/", label: "Open Mondly app" }],
  },
  {
    id: "ling-slovak",
    group: "apps",
    name: "Ling — Slovak",
    href: "https://ling-app.com/learn-slovak/",
    summary:
      "Gamified Slovak course with native audio, dialog practice, and bite-sized reviews. Built for beginners who want speaking early.",
    cost: "freemium",
    level: "A1–A2",
  },
  {
    id: "funeasylearn-slovak",
    group: "apps",
    name: "FunEasyLearn — Slovak",
    href: "https://www.funeasylearn.com/learn-slovak",
    summary:
      "Large offline-friendly Slovak word and phrase bank with illustrated topics and games. Strong for travel and everyday vocab.",
    cost: "freemium",
    level: "A1–B1",
  },
  {
    id: "memrise-slovak",
    group: "apps",
    name: "Memrise — Slovak (community)",
    href: "https://community-courses.memrise.com/community/courses/english/slovak/",
    summary:
      "Community Slovak decks on Memrise’s older course platform. Official Memrise Slovak is gone — pick one of the community courses below.",
    cost: "freemium",
    level: "A1+",
    links: [
      {
        href: "https://community-courses.memrise.com/community/course/50432/basic-slovak/",
        label: "Basic Slovak",
        note: "Sounds and numbers first, then themed word lists that ramp up.",
      },
      {
        href: "https://community-courses.memrise.com/community/course/248886/hacking-slovak/",
        label: "Hacking Slovak",
        note: "Broader deck built around Krížom-krážom A1 material.",
      },
      {
        href: "https://community-courses.memrise.com/community/course/416264/slovak-phrases-with-audio/",
        label: "Slovak Phrases with audio",
        note: "Phrases and sentences with audio; community-made with a native helper.",
      },
    ],
  },
  {
    id: "clozemaster-slovak",
    group: "apps",
    name: "Clozemaster — Slovak",
    href: "https://www.clozemaster.com/languages/expand-slovak-vocabulary",
    summary:
      "Fill-in-the-blank sentences ranked by word frequency. Excellent post-beginner vocab drill once you know the basics.",
    cost: "freemium",
    level: "A2+",
  },
  {
    id: "anki-slovak",
    group: "apps",
    name: "Anki — shared Slovak decks",
    href: "https://ankiweb.net/shared/decks?search=slovak",
    summary:
      "Spaced-repetition flashcards. Browse shared Slovak decks on AnkiWeb, then import into the free Anki desktop/mobile apps.",
    cost: "free",
    level: "All",
    note: "No official Slovak deck — open a few, read ratings and sample cards, then import.",
  },
  {
    id: "quia-slovak",
    group: "apps",
    name: "Quia — Slovak activities",
    href: "https://www.quia.com/jg/435090list.html",
    summary:
      "Older browser flashcard and matching games. Still useful for quick vocab drills if you ignore the dated UI.",
    cost: "free",
    level: "A1–A2",
  },

  // —— Grammar ——
  {
    id: "slovake-grammar",
    group: "grammar",
    name: "slovake.eu Grammar",
    href: "https://slovake.eu/grammar",
    summary:
      "Pronunciation, orthography, parts of speech, cases, verbs, word order, and more — a free companion grammar you can open beside any course.",
    cost: "free",
    level: "All",
    featured: true,
    links: [
      {
        href: "https://slovake.eu/grammar/pronunciation",
        label: "Alphabet & pronunciation",
      },
      {
        href: "https://slovake.eu/grammar/classes/cases",
        label: "Cases",
      },
      {
        href: "https://slovake.eu/grammar/classes/verbs",
        label: "Verbs",
      },
      {
        href: "https://slovake.eu/grammar/classes/prepositions",
        label: "Prepositions",
      },
      {
        href: "https://slovake.eu/grammar/classes/numbers",
        label: "Numbers",
      },
      {
        href: "https://slovake.eu/grammar/sentences",
        label: "Word order",
      },
      {
        href: "https://slovake.eu/grammar/sentences/questions",
        label: "Questions",
      },
    ],
  },
  {
    id: "omniglot-slovak",
    group: "grammar",
    name: "Omniglot — Slovak",
    href: "https://www.omniglot.com/writing/slovak.htm",
    summary:
      "Alphabet chart with letter audio, a sample reading, plus Omniglot’s own phrase, number, kinship, idiom, time, and tongue-twister tables.",
    note: "Use Omniglot’s own alphabet and phrase pages. Many outbound “learn Slovak” links on that hub are dead.",
    cost: "free",
    level: "A1",
    links: [
      {
        href: "https://www.omniglot.com/language/phrases/slovak.php",
        label: "Useful phrases (+ audio zip)",
      },
      {
        href: "https://www.omniglot.com/language/numbers/slovak.htm",
        label: "Numbers (cardinal + ordinal)",
      },
      {
        href: "https://www.omniglot.com/language/kinship/slovak.htm",
        label: "Family / kinship words",
      },
      {
        href: "https://www.omniglot.com/language/idioms/slovak.php",
        label: "Idioms",
      },
      {
        href: "https://www.omniglot.com/language/time/slovak.htm",
        label: "Telling the time",
      },
      {
        href: "https://www.omniglot.com/language/tonguetwisters/index.htm#slovak",
        label: "Tongue twisters",
      },
      {
        href: "https://www.omniglot.com/babel/slovak.htm",
        label: "Tower of Babel (reading sample)",
      },
    ],
  },
  {
    id: "hlbavo",
    group: "grammar",
    name: "Hĺbavo",
    href: "https://www.hlbavo.sk/",
    summary:
      "Illustrated grammar explainers aimed at Slovak school learners (L1). Handy for adults who want clear native-language explanations of connectors, prepositions, and morphology.",
    note: "UI and videos are in Slovak — useful once you can follow basic grammar terms.",
    cost: "free",
    level: "A2+",
    links: [
      {
        href: "https://www.hlbavo.sk/vzdelavacie-videa",
        label: "Video library",
      },
      {
        href: "https://www.hlbavo.sk/vzdelavacie-videa/predlozky-47",
        label: "Predložky (prepositions)",
      },
      {
        href: "https://www.hlbavo.sk/vzdelavacie-videa/predlozky-vokalizacia-49",
        label: "Preposition vocalization (vo/ku/so…)",
      },
      {
        href: "https://www.hlbavo.sk/vzdelavacie-videa/spojky-48",
        label: "Spojky (conjunctions)",
      },
      {
        href: "https://www.hlbavo.sk/vzdelavacie-videa/slovesa-slovesny-vid-36",
        label: "Slovesný vid (aspect)",
      },
      {
        href: "https://www.hlbavo.sk/vzdelavacie-videa/slovne-druhy-ohybne-a-neohybne-7",
        label: "Parts of speech",
      },
      { href: "https://www.youtube.com/@hlbavo", label: "YouTube" },
    ],
  },
  {
    id: "ucimesaslovencinu",
    group: "grammar",
    name: "Učíme (sa) slovenčinu",
    href: "https://ucimesaslovencinu.sk/",
    summary:
      "Native teacher Lenka’s Slovak-as-foreign-language site: free grammar and conversation posts, drills, plus a paid club and 1:1 lessons — explained in Slovak for real situations.",
    note: "Free blog + drills; club and 1:1 are paid. Posts are in Slovak — keep an EN grammar note nearby if you’re still A1.",
    cost: "freemium",
    level: "A1–B2",
    links: [
      {
        href: "https://ucimesaslovencinu.sk/clanok/kolko-je-hodin-po-slovensky/",
        label: "Koľko je hodín? (telling the time)",
      },
      {
        href: "https://ucimesaslovencinu.sk/clanok/minuly-cas/",
        label: "Minulý čas (past tense)",
      },
      {
        href: "https://ucimesaslovencinu.sk/clanok/podmienovaci-sposob/",
        label: "Kondicionál (conditional mood)",
      },
      {
        href: "https://ucimesaslovencinu.sk/clanok/podmienkove-vety/",
        label: "Podmienkové vety (if-clauses)",
      },
      {
        href: "https://ucimesaslovencinu.sk/clanok/blahozelania-po-slovensky/",
        label: "Blahoželania a priania (wishes)",
      },
      {
        href: "https://ucimesaslovencinu.sk/clanok/ako-hovorit-o-praci-po-slovensky/",
        label: "Hovoriť o práci (work talk)",
      },
      {
        href: "https://ucimesaslovencinu.sk/clanok/slovenske-prislovia/",
        label: "Slovenské príslovia (proverbs)",
      },
      {
        href: "https://ucimesaslovencinu.sk/ucim-sa-slovencinu/",
        label: "Free exercises",
      },
    ],
  },

  // —— Dictionaries ——
  {
    id: "aktuality-slovnik",
    group: "dictionaries",
    name: "Aktuality SK–EN dictionary",
    href: "https://slovnik.aktuality.sk/preklad/slovensko-anglicky",
    summary:
      "Quick SK↔EN bilingual dictionary for everyday words and phrases — a fast first lookup.",
    cost: "free",
    links: [
      {
        href: "https://slovnik.aktuality.sk/preklad/slovensko-anglicky",
        label: "Slovak → English",
      },
      {
        href: "https://slovnik.aktuality.sk/preklad/anglicko-slovensky",
        label: "English → Slovak",
      },
    ],
  },
  {
    id: "webslovnik-zoznam",
    group: "dictionaries",
    name: "Webslovník (Zoznam) — EN↔SK",
    href: "https://webslovnik.zoznam.sk/anglicko-slovensky/",
    summary: "EN↔SK bilingual dictionary on the Zoznam portal — search plus A–Z browse.",
    cost: "free",
  },
  {
    id: "dict-cc-ensk",
    group: "dictionaries",
    name: "dict.cc — English–Slovak",
    href: "https://ensk.dict.cc/",
    summary:
      "Community EN↔SK dictionary (~117k translations) with a vocab trainer and free downloadable vocabulary DB.",
    cost: "free",
    note: "Community translations (~99% verified). Hit the [i] button beside a line if a gloss looks wrong.",
    links: [
      {
        href: "https://users.dict.cc/vocabulary-trainer/",
        label: "Vocabulary trainer",
      },
      {
        href: "https://www1.dict.cc/translation_file_request.php?l=ensk",
        label: "Download vocabulary DB",
      },
    ],
  },
  {
    id: "juls-slovnik",
    group: "dictionaries",
    name: "JÚĽŠ Slovak dictionary",
    href: "https://slovnik.juls.savba.sk/",
    summary:
      "Authoritative monolingual Slovak dictionary from the Ľudovít Štúr Institute of Linguistics. Best for forms and precise Slovak definitions.",
    cost: "free",
  },
  {
    id: "tatoeba-sk",
    group: "dictionaries",
    name: "Tatoeba — Slovak sentences",
    href: "https://tatoeba.org/en/sentences/search?from=slk&query=&to=eng",
    summary:
      "Search tool for SK→EN example sentences. Type a Slovak word or phrase, skim parallel translations, and hear audio when contributors recorded it.",
    cost: "free",
    note: "Crowd-sourced sentences — quality varies; skim a few parallels before trusting one gloss.",
    links: [
      {
        href: "https://tatoeba.org/en/sentences/search?from=slk&query=&to=eng",
        label: "Search SK → EN",
      },
      {
        href: "https://tatoeba.org/en/sentences/search?from=eng&to=slk&query=",
        label: "Search EN → SK",
      },
      {
        href: "https://tatoeba.org/en/downloads",
        label: "Downloads / corpus exports",
      },
    ],
  },
  {
    id: "forvo-slovak",
    group: "dictionaries",
    name: "Forvo — Slovak pronunciations",
    href: "https://forvo.com/languages/sk/",
    summary:
      "Native-speaker audio of individual Slovak words — useful when you want a second pronunciation listen.",
    cost: "freemium",
  },

  // —— Textbooks ——
  {
    id: "krizom-krazom",
    group: "textbooks",
    name: "Krížom-krážom (SAS)",
    href: "https://fphil.uniba.sk/katedry-a-odborne-pracoviska/sas/edicna-cinnost-publications/krizom-krazom-a1-b2/",
    summary:
      "The standard university textbook series for Slovak as a foreign language (A1–B2). e-slovak tracks this series closely.",
    cost: "paid",
    level: "A1–B2",
    featured: true,
    links: [
      {
        href: "https://www.panorama.sk/en/books/krizom-krazom-cvicebnica/2057",
        label: "Workbook listing (Panorama)",
      },
    ],
  },
  {
    id: "colloquial-slovak",
    group: "textbooks",
    name: "Colloquial Slovak (Routledge)",
    href: "https://www.routledge.com/Colloquial-Slovak-The-Complete-Course-for-Beginners/Naughton/p/book/9781138960206",
    summary:
      "Self-study beginner course with dialogues, grammar summaries, and free downloadable audio.",
    cost: "paid",
    level: "A1–A2",
    links: [
      {
        href: "https://routledgetextbooks.com/textbooks/colloquial/language/slovak.php",
        label: "Free audio downloads",
      },
    ],
  },

  // —— Listening ——
  {
    id: "slovak-sound-check",
    group: "listening",
    name: "Slovak Sound Check (Rádio RSI)",
    href: "https://enrsi.stvr.sk/articles/so-slovak",
    summary:
      "Free radio mini-lessons from Radio Slovakia International: greetings, survival phrases, and everyday topics with clear EN framing.",
    cost: "free",
    level: "A1–A2",
    featured: true,
    links: [
      {
        href: "https://enrsi.stvr.sk/articles/so-slovak/402210/slovak-sound-check-episode-1-greet-like-a-pro",
        label: "Ep. 1 — greetings",
      },
      {
        href: "https://enrsi.stvr.sk/articles/so-slovak/403206/slovak-sound-check-episode-2-own-your-intro",
        label: "Ep. 2 — introduce yourself",
      },
      {
        href: "https://enrsi.stvr.sk/articles/so-slovak/410324/slovak-sound-check-episode-12-order-like-a-local-cafe-edition",
        label: "Ep. 12 — café orders",
      },
      {
        href: "https://enrsi.stvr.sk/articles/so-slovak/412193/slovak-sound-check-episode-14-chat-about-weather",
        label: "Ep. 14 — weather",
      },
      {
        href: "https://enrsi.stvr.sk/articles/so-slovak/431293/slovak-sound-check-episode-34-mark-the-date",
        label: "Ep. 34 — dates",
      },
    ],
  },
  {
    id: "pocuvam-po-slovensky",
    group: "listening",
    name: "Počúvam po slovensky",
    href: "https://skpodcasty.sk/podcasty/pocuvam-po-slovensky/",
    summary:
      "A2–B1 learner podcast from Jazyková dielňa (~8 min): everyday topics, then new words and a short grammar tip.",
    cost: "free",
    level: "A2–B1",
  },
  {
    id: "learn-slovak-stories-podcast",
    group: "listening",
    name: "Learn Slovak Through Stories",
    href: "https://www.youtube.com/@LearnSlovakwithStories/videos",
    summary:
      "Slow, clear story readings on YouTube for A1–B1 listening. Also packaged as LingQ course material.",
    cost: "free",
    level: "A1–B1",
  },
  {
    id: "rozpravkozem",
    group: "listening",
    name: "Rozprávkozem",
    href: "https://www.rozpravkozem.sk/",
    summary:
      "Kids’ fairy tales, riddles, tongue twisters, and rhymes in Slovak — simple vocab and pronunciation practice.",
    cost: "free",
    level: "A1–A2",
    links: [
      { href: "https://www.rozpravkozem.sk/rozpravky/", label: "Fairy tales" },
      { href: "https://www.rozpravkozem.sk/hadanky/", label: "Riddles" },
      {
        href: "https://www.rozpravkozem.sk/slovenske-jazykolamy/",
        label: "Tongue twisters",
      },
      { href: "https://www.rozpravkozem.sk/riekanky/", label: "Rhymes" },
    ],
  },
  {
    id: "lyricstranslate",
    group: "listening",
    name: "LyricsTranslate",
    href: "https://lyricstranslate.com/en/translations/113/32/none/none/none",
    summary:
      "Song lyrics with community translations. Use for pleasure listening once you know basic vocabulary — not a syllabus.",
    cost: "free",
    level: "A2+",
  },

  // —— Channels ——
  {
    id: "yt-slovakforu",
    group: "channels",
    name: "SlovakforU (YouTube)",
    href: "https://www.youtube.com/@slovakforu6661/videos",
    summary:
      "Video lessons from the SlovakforU project — everyday A1–A2 Slovak, same material as the podcast/site (originally for Ukrainian newcomers).",
    cost: "free",
    level: "A1–A2",
  },
  {
    id: "yt-learn-slovak-stories",
    group: "channels",
    name: "Learn Slovak with Stories",
    href: "https://www.youtube.com/@LearnSlovakwithStories/videos",
    summary:
      "YouTube home for the slow story-reading series — clear, slowed narration aimed at A1–B1 listening.",
    cost: "free",
    level: "A1–B1",
  },
  {
    id: "yt-slovak-girl-tami",
    group: "channels",
    name: "Slovak Girl Tami",
    href: "https://www.youtube.com/@SlovakGirlTami/videos",
    summary:
      "Tami’s beginner Slovak in English: short A1–A2 stories, themed vocab quizzes, travel phrases, and grammar explainers.",
    cost: "free",
    level: "A1–A2",
  },
  {
    id: "yt-linguarte",
    group: "channels",
    name: "Linguarte Official",
    href: "https://www.youtube.com/@linguarteOfficial/videos",
    summary:
      "Bratislava school channel — themed Slovak vocab and grammar clips mixed with Spanish lessons; search titles for “Slovak”.",
    cost: "free",
    level: "A1+",
    links: [
      {
        href: "https://www.youtube.com/watch?v=zA4BM4APDwA",
        label: "Dialects in Slovak",
        note: "Regional accents and main dialect differences (~5 min).",
      },
    ],
  },
  {
    id: "yt-learn-slovak",
    group: "channels",
    name: "Learn Slovak with Filip",
    href: "https://www.youtube.com/@learnslovak/videos",
    summary:
      "Filip’s short beginner series: alphabet, greetings, numbers, first conversations, and mini grammar (verbs). Links out to slovakteacher.com.",
    cost: "free",
    level: "A1+",
  },
  {
    id: "yt-memories-adrift",
    group: "channels",
    name: "Memories Adrift (Slovak with Sam)",
    href: "https://www.youtube.com/@memoriesadrift",
    summary:
      "Older “Slovak with Sam” beginner series: vowels, consonants, greetings, gender, sentence structure. Last uploads ~6 years ago — still solid basics.",
    cost: "free",
    level: "A1",
  },

  // —— Tutors ——
  {
    id: "preply-slovak",
    group: "tutors",
    name: "Preply — Slovak tutors",
    href: "https://preply.com/en/online/slovak-tutors",
    summary:
      "Book 1:1 online Slovak tutors from a filtered marketplace — try a trial lesson before committing.",
    cost: "paid",
    level: "All",
  },
  {
    id: "italki-slovak",
    group: "tutors",
    name: "italki — Slovak tutors",
    href: "https://www.italki.com/en/teachers/slovak",
    summary:
      "1:1 Slovak tutors (professional and community). Filter teachers, book a trial, then schedule online lessons.",
    cost: "paid",
    level: "All",
  },
  {
    id: "linguarte-school",
    group: "tutors",
    name: "Linguarte",
    href: "https://www.linguarte.sk/",
    summary:
      "Bratislava language school with Slovak (and Spanish and other languages) for foreigners — group and private options.",
    cost: "paid",
    level: "All",
  },
  {
    id: "sas-summer",
    group: "tutors",
    name: "Studia Academica Slovaca (SAS)",
    href: "https://fphil.uniba.sk/katedry-a-odborne-pracoviska/sas/",
    summary:
      "Comenius University centre for Slovak as a foreign language — summer school, textbooks, and the free e-slovak programme.",
    cost: "mixed",
    level: "All",
    links: [
      {
        href: "https://fphil.uniba.sk/katedry-a-odborne-pracoviska/sas/studium-courses/",
        label: "Courses & summer schools",
      },
      {
        href: "https://fphil.uniba.sk/katedry-a-odborne-pracoviska/sas/edicna-cinnost-publications/",
        label: "Publications",
      },
      {
        href: "https://fphil.uniba.sk/katedry-a-odborne-pracoviska/sas/edicna-cinnost-publications/krizom-krazom-a1-b2/",
        label: "Krížom-krážom series",
      },
      { href: "https://www.e-slovak.sk/", label: "e-slovak online courses" },
    ],
  },

  // —— Adjacent ——
  {
    id: "duolingo-czech",
    group: "adjacent",
    name: "Duolingo — Czech (not Slovak)",
    href: "https://www.duolingo.com/course/cs/en/Learn-Czech",
    summary:
      "No Slovak course on Duolingo. Czech is the nearest West Slavic option — useful for spotting cognates, not for learning Slovak itself.",
    note: "Close but not the same — false friends and different endings. Side path only, not a Slovak course.",
    cost: "freemium",
  },
];

export function resourcesByGroup(groupId: ResourceGroupId): LearningResource[] {
  return learningResources.filter((resource) => resource.group === groupId);
}

export function featuredResources(): LearningResource[] {
  return learningResources.filter((resource) => resource.featured);
}

export function resourceCostLabel(cost: ResourceCost): string {
  switch (cost) {
    case "free":
      return "Free";
    case "freemium":
      return "Free + paid";
    case "paid":
      return "Paid";
    case "mixed":
      return "Mixed";
  }
}

/** Local favicon path for a curated resource (see scripts/resources/fetch-icons.ts). */
const youtubeResourceIds = new Set([
  "learn-slovak-stories-podcast",
  "yt-slovakforu",
  "yt-learn-slovak-stories",
  "yt-slovak-girl-tami",
  "yt-linguarte",
  "yt-learn-slovak",
  "yt-memories-adrift",
]);

const resourceIconFiles: Partial<Record<string, string>> = {
  "ling-slovak": "ling-slovak.svg",
  "slovake-grammar": "slovake-eu.png",
};

export function resourceIconUrl(resourceId: string): string {
  if (youtubeResourceIds.has(resourceId)) {
    return "/icons/resources/youtube.png";
  }

  const file = resourceIconFiles[resourceId] ?? `${resourceId}.png`;
  return `/icons/resources/${file}`;
}
