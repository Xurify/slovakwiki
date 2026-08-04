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
      { href: "https://slovake.eu/grammar", label: "Grammar index" },
    ],
  },
  {
    id: "e-slovak",
    group: "courses",
    name: "e-slovak (Studia Academica Slovaca)",
    href: "https://www.e-slovak.sk/",
    summary:
      "Free Moodle courses from Comenius University. Self-study A1/A2 run year-round; tutor-supported cohorts open on a schedule. Built around the Krížom-krážom textbook series.",
    note: "Register free. Prefer course landing pages over deep quiz URLs — those are session-specific.",
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
        href: "https://learn101.org/slovak_verbs.php",
        label: "Verbs",
      },
    ],
  },
  {
    id: "slovak-cooking-language",
    group: "courses",
    name: "Slovak Cooking — language lessons",
    href: "https://www.slovakcooking.com/language/",
    summary:
      "Short travel-dialog course (greetings, restaurant, numbers, song lyrics) with grammar notes and audio. Linked from Omniglot; still online as a free beginner side path.",
    cost: "free",
    level: "A1",
    note: "Blog-era UI (≈2009–2010). Start from the language hub, not old calendar URLs.",
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
    note: "Hosted on free AtSpace; no HTTPS. Linked from Omniglot (often misread as Slovak Cooking). Chatroom link is dead.",
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
    summary:
      "Conversation-led lessons with color-coded grammar notes and culture tips. Often free through public libraries.",
    cost: "paid",
    level: "Beginner+",
    note: "Check your local library before paying retail.",
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
    note: "Best once you can follow simple stories. Import content you already like.",
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
      "Community Slovak courses on Memrise’s older course platform. Official Memrise Slovak looks gone; pick a community course below.",
    cost: "freemium",
    level: "A1+",
    links: [
      {
        href: "https://community-courses.memrise.com/community/course/50432/basic-slovak/",
        label: "Basic Slovak",
        note: "Pronunciation and numbers first, then themed vocab that steps up in difficulty (by loeiten).",
      },
      {
        href: "https://community-courses.memrise.com/community/course/248886/hacking-slovak/",
        label: "Hacking Slovak",
        note: "Expanded Memrise-style “Hacking” course with material based on Krížom-krážom A1.",
      },
      {
        href: "https://community-courses.memrise.com/community/course/416264/slovak-phrases-with-audio/",
        label: "Slovak Phrases with audio",
        note: "Phrase- and sentence-first course with audio; learner-built with help from a Slovak speaker.",
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
    note: "No single official deck — skim ratings and sample cards before downloading.",
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
  },
  {
    id: "omniglot-slovak",
    group: "grammar",
    name: "Omniglot — Slovak",
    href: "https://www.omniglot.com/writing/slovak.htm",
    summary:
      "Alphabet chart with letter audio, UDHR sample recording, plus Omniglot’s own Slovak phrase, number, kinship, idiom, time, and tongue-twister tables. Hub page also lists many third-party links — most of those are dead; keep the Omniglot pages.",
    note: "Outbound audit: slovake.eu, dict.cc, Webslovník, Slovak Cooking, and Simply Put still work (listed separately). Dead/rot: polymath.org/slovak, learnslovak.com, Spectacular Slovakia language guide, Bratislava Guide (safebrowse), BBC Slovak (2014 archive), slobodka.org→RFE/RL. Affiliate chrome on Omniglot ignored.",
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
    note: "Interface and videos are in Slovak.",
    cost: "free",
    level: "A2+",
    links: [{ href: "https://www.youtube.com/@hlbavo", label: "YouTube" }],
  },

  // —— Dictionaries ——
  {
    id: "aktuality-slovnik",
    group: "dictionaries",
    name: "Aktuality SK–EN dictionary",
    href: "https://slovnik.aktuality.sk/preklad/slovensko-anglicky",
    summary: "Fast bilingual lookup for everyday words and phrases.",
    cost: "free",
    note: "Omniglot’s old Azet slovnik URL redirects here.",
  },
  {
    id: "webslovnik-zoznam",
    group: "dictionaries",
    name: "Webslovník (Zoznam) — EN↔SK",
    href: "https://webslovnik.zoznam.sk/anglicko-slovensky/",
    summary:
      "Slovak portal bilingual dictionary with alphabetical browse and recent-search tips. Linked from Omniglot’s older Zoznam URL (path still works).",
    cost: "free",
  },
  {
    id: "dict-cc-ensk",
    group: "dictionaries",
    name: "dict.cc — English–Slovak",
    href: "https://ensk.dict.cc/",
    summary:
      "Community EN↔SK dictionary (~117k translations), vocab trainer, and free downloadable vocabulary DB. Strong second lookup beside Aktuality / JÚĽŠ.",
    cost: "free",
    note: "Crowd-verified — check the [i] button when a gloss looks off.",
  },
  {
    id: "juls-slovnik",
    group: "dictionaries",
    name: "JÚĽŠ Slovak dictionary",
    href: "https://slovnik.juls.savba.sk/",
    summary:
      "Authoritative monolingual Slovak dictionary from the Ľudovít Štúr Institute of Linguistics. Best for forms and precise Slovak definitions.",
    cost: "free",
    note: "Also listed on our data References page as a site source.",
  },
  {
    id: "tatoeba-sk",
    group: "dictionaries",
    name: "Tatoeba — Slovak sentences",
    href: "https://tatoeba.org/en/sentences/search?from=slk&query=&to=eng",
    summary:
      "Search tool for SK→EN example sentences. Type a Slovak word or phrase, skim parallel translations, and hear audio when contributors recorded it.",
    cost: "free",
    note: "Crowd-sourced — quality varies. We also pull Tatoeba dumps into this site’s dictionary examples (see References).",
    links: [
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
      "Native-speaker recordings of individual words when you need a second listen.",
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
  },
  {
    id: "pocuvam-po-slovensky",
    group: "listening",
    name: "Počúvam po slovensky",
    href: "https://skpodcasty.sk/podcasty/pocuvam-po-slovensky/",
    summary:
      "Short A2–B1 episodes (~8 min) with practical language and a light grammar note at the end.",
    cost: "free",
    level: "A2–B1",
  },
  {
    id: "learn-slovak-stories-podcast",
    group: "listening",
    name: "Learn Slovak Through Stories",
    href: "https://www.youtube.com/@LearnSlovakwithStories/videos",
    summary:
      "Slow, clear story readings for listening practice. Also appears as LingQ course material.",
    cost: "free",
    level: "A1–B1",
  },
  {
    id: "rozpravkozem",
    group: "listening",
    name: "Rozprávkozem",
    href: "https://www.rozpravkozem.sk/",
    summary:
      "Kids’ fairy tales, riddles, tongue twisters, and rhymes in Slovak. Simple vocabulary and fun pronunciation practice.",
    cost: "free",
    level: "A1–A2",
    links: [
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
    summary: "Lesson-style videos aligned with the SlovakforU project.",
    cost: "free",
    level: "A1–A2",
  },
  {
    id: "yt-learn-slovak-stories",
    group: "channels",
    name: "Learn Slovak with Stories",
    href: "https://www.youtube.com/@LearnSlovakwithStories/videos",
    summary: "Story listening with clear, slowed narration.",
    cost: "free",
    level: "A1–B1",
  },
  {
    id: "yt-slovak-girl-tami",
    group: "channels",
    name: "Slovak Girl Tami",
    href: "https://www.youtube.com/@SlovakGirlTami/videos",
    summary: "Learner-friendly Slovak explanations and vocabulary videos.",
    cost: "free",
    level: "A1–A2",
  },
  {
    id: "yt-linguarte",
    group: "channels",
    name: "Linguarte Official",
    href: "https://www.youtube.com/@linguarteOfficial/videos",
    summary: "Channel from the Linguarte language school — lessons and promo content.",
    cost: "free",
    level: "A1+",
  },
  {
    id: "yt-learn-slovak",
    group: "channels",
    name: "Learn Slovak",
    href: "https://www.youtube.com/@learnslovak/videos",
    summary: "General Slovak learning video channel.",
    cost: "free",
    level: "A1+",
  },
  {
    id: "yt-memories-adrift",
    group: "channels",
    name: "Memories Adrift",
    href: "https://www.youtube.com/@memoriesadrift",
    summary: "Supplementary Slovak / Slovakia video content for immersion.",
    cost: "free",
  },

  // —— Tutors ——
  {
    id: "preply-slovak",
    group: "tutors",
    name: "Preply — Slovak tutors",
    href: "https://preply.com/en/online/slovak-tutors",
    summary:
      "Marketplace filtered to Slovak tutors. Book 1:1 online lessons; try a trial class before committing.",
    cost: "paid",
    level: "All",
    note: "Link opens the Slovak tutors listing, not Preply’s generic homepage.",
  },
  {
    id: "italki-slovak",
    group: "tutors",
    name: "italki — Slovak tutors",
    href: "https://www.italki.com/en/teachers/slovak",
    summary:
      "Another 1:1 tutor marketplace with a dedicated Slovak teacher list (professional + community tutors).",
    cost: "paid",
    level: "All",
    note: "Link opens the Slovak teachers filter on italki.",
  },
  {
    id: "linguarte-school",
    group: "tutors",
    name: "Linguarte",
    href: "https://www.linguarte.sk/",
    summary:
      "Bratislava language school offering Slovak (and other languages) for foreigners — group and private options.",
    cost: "paid",
    level: "All",
  },
  {
    id: "sas-summer",
    group: "tutors",
    name: "Studia Academica Slovaca (SAS)",
    href: "https://fphil.uniba.sk/katedry-a-odborne-pracoviska/sas/",
    summary:
      "Comenius University centre for Slovak as a foreign language — summer school, publications, and the e-slovak programme.",
    cost: "mixed",
    level: "All",
  },

  // —— Adjacent ——
  {
    id: "duolingo-czech",
    group: "adjacent",
    name: "Duolingo — Czech (not Slovak)",
    href: "https://www.duolingo.com/course/cs/en/Learn-Czech",
    summary:
      "Duolingo has no Slovak course. Czech is a close West Slavic neighbour — useful for transfer awareness, not a substitute for Slovak study.",
    note: "Expect false friends and different endings. Use only as a side path.",
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
