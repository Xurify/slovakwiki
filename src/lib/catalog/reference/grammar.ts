import { languageSource } from "../sources";
import type { GrammarTopic } from "../types";

export const grammarEntries: GrammarTopic[] = [
  {
    slug: "grammatical-gender",
    slovak: "gramatický rod",
    english: "grammatical gender",
    category: "Nouns",
    kind: "grammar",
    summary: "Slovak nouns belong to masculine, feminine, or neuter gender.",
    body: [
      "Gender affects adjective endings, pronouns, and past-tense verbs. Learn a noun together with its gender.",
      "Many masculine nouns end in a consonant, many feminine nouns end in -a, and many neuter nouns end in -o or -e. These patterns help, but exceptions exist.",
    ],
    examples: [
      { slovak: "dobrý muž", english: "a good man" },
      { slovak: "dobrá žena", english: "a good woman" },
      { slovak: "dobré mesto", english: "a good city" },
    ],
    related: ["muz", "zena", "mesto"],
    source: languageSource,
    tags: ["nouns", "gender", "beginner"],
    lookFor: "Match the adjective ending to the noun's gender: -ý, -á, or -é.",
    pathGroup: "Nouns",
    order: 1,
    rule: [
      "Every Slovak noun has a grammatical gender: masculine, feminine, or neuter.",
      "Learn each noun with its gender because it changes adjective endings, pronouns, and past-tense verbs.",
    ],
    pattern: {
      label: "Adjective endings follow gender",
      lines: [
        "masculine adjective ending: -ý",
        "feminine adjective ending: -á",
        "neuter adjective ending: -é",
      ],
    },
    watchOut:
      "A final letter can suggest gender, but it does not guarantee it. Learn the noun and its pattern together.",
    nextSlug: "cases-overview",
  },
  {
    slug: "numbers-and-numerals",
    slovak: "číslovky",
    english: "numbers and numerals",
    category: "Numbers",
    kind: "grammar",
    summary: "Numbers change the form that follows them, especially from five upward.",
    body: [
      "Use jeden with a singular noun. Dva or dve, tri, and štyri use different quantity patterns; dva is masculine and neuter, while dve is feminine and neuter.",
      "With päť and higher numbers, the following noun usually uses a genitive plural form. Learn useful whole phrases for ages, prices, and quantities before tackling full declension tables.",
    ],
    examples: [
      {
        slovak: "Mám dvadsať rokov.",
        english: "I am twenty years old.",
        practiceItemId: "everyday/age-with-rokov",
      },
      {
        slovak: "Stojí to päť eur.",
        english: "It costs five euros.",
        practiceItemId: "everyday/how-much-does-it-cost",
      },
    ],
    related: ["grammatical-gender", "questions", "kolko", "mat-present", "telling-time"],
    source: languageSource,
    tags: ["nouns", "numbers", "beginner"],
    lookFor:
      "Notice whether the number is jeden, dva/dve, tri/štyri, or päť and higher. The noun form changes with the group.",
    pathGroup: "Numbers",
    order: 1,
    rule: [
      "Jeden goes with a singular noun; dva/dve, tri, and štyri use plural-like noun forms.",
      "Päť and higher numbers usually take a genitive plural noun form.",
    ],
    pattern: {
      label: "Quantity patterns",
      lines: [
        "jeden lístok · one ticket",
        "dva / dve, tri, štyri + quantity form",
        "päť+ + genitive plural",
      ],
    },
    watchOut:
      "Do not assume every number uses the same noun form. Start with fixed phrases such as dvadsať rokov and päť eur.",
    nextSlug: "telling-time",
  },
  {
    slug: "present-tense",
    slovak: "prítomný čas",
    english: "present tense",
    category: "Verbs",
    kind: "grammar",
    summary: "Present-tense endings show who performs an action.",
    body: [
      "Slovak often omits subject pronouns because the verb ending already identifies the person.",
      "Learn common verbs as full patterns. For rozumieť: rozumiem, rozumieš, rozumie, rozumieme, rozumiete, rozumejú.",
    ],
    examples: [
      { slovak: "Rozumiem.", english: "I understand." },
      { slovak: "Hovoríte po slovensky?", english: "Do you speak Slovak?" },
      {
        slovak: "Čítam knihu.",
        english: "I am reading a book.",
        demonstrates: "The ending -m shows that I am the person reading.",
        practiceItemId: "grammar/first-person-reading",
      },
    ],
    related: ["rozumiem", "hovorit", "ucit-sa", "byt-present", "mat-present"],
    source: languageSource,
    tags: ["verbs", "present tense", "beginner"],
    lookFor: "Find the final letters on the verb. They tell you who is doing the action.",
    pathGroup: "Verbs",
    order: 3,
    rule: [
      "Present-tense endings show who performs an action, so Slovak often omits the subject pronoun.",
      "Memorize common verbs as a complete pattern instead of translating one ending at a time.",
    ],
    pattern: {
      label: "Čítať — to read",
      lines: [
        "ja čítam",
        "ty čítaš",
        "on / ona číta",
        "my čítame",
        "vy čítate",
        "oni / ony čítajú",
      ],
    },
    watchOut:
      "The infinitive is not a shortcut to the present tense. Learn each verb's stem and endings together.",
    nextSlug: "byt-present",
    lessonLink: {
      href: "/lessons/grammar/present-tense-i",
      label: "Present-tense endings",
    },
  },
  {
    slug: "byt-present",
    slovak: "byť",
    english: "to be (present)",
    category: "Verbs",
    kind: "grammar",
    summary: "Use byť to say who or what someone is, and where someone or something is.",
    body: [
      "Byť is irregular in the present tense: som, si, je, sme, ste, sú. Slovak often leaves out the subject pronoun because the verb form already identifies it.",
      "Use byť for identity and location: Som študent. and Kaviareň je tu. Do not use byť for age; Slovak says Mám dvadsať rokov.",
    ],
    examples: [
      {
        slovak: "Som študent.",
        english: "I am a student.",
        practiceItemId: "grammar/byt-som",
      },
      {
        slovak: "Ste z Kanady?",
        english: "Are you from Canada?",
        practiceItemId: "grammar/byt-ste",
      },
      {
        slovak: "Kaviareň je tu.",
        english: "The café is here.",
        practiceItemId: "grammar/byt-je-location",
      },
    ],
    related: ["mat-present", "present-tense", "ty-vs-vy", "negation"],
    source: languageSource,
    tags: ["verbs", "present tense", "beginner"],
    lookFor:
      "Find the form of byť, then identify whether it gives an identity or a location.",
    pathGroup: "Verbs",
    order: 4,
    rule: [
      "The present forms of byť are som, si, je, sme, ste, and sú.",
      "Use byť for identity and location; use mať with rokov to state age.",
    ],
    pattern: {
      label: "Byť — to be",
      lines: ["ja som", "ty si", "on / ona / ono je", "my sme", "vy ste", "oni / ony sú"],
    },
    watchOut:
      "Do not translate English age with byť. Say Mám dvadsať rokov, literally “I have twenty years.”",
    nextSlug: "mat-present",
    lessonLink: {
      href: "/lessons/grammar/byt-present",
      label: "Present forms of byť",
    },
  },
  {
    slug: "mat-present",
    slovak: "mať",
    english: "to have (present)",
    category: "Verbs",
    kind: "grammar",
    summary: "Use mať to say what you have and how old you are.",
    body: [
      "Mať is irregular in the present tense: mám, máš, má, máme, máte, majú. Use it for possession, availability, and age.",
      "Slovak states age with mať: Mám dvadsať rokov. Máš is informal singular “you have”; máte is formal singular or plural “you have.”",
    ],
    examples: [
      {
        slovak: "Mám čas.",
        english: "I have time.",
        practiceItemId: "grammar/mat-mam",
      },
      {
        slovak: "Máš kartu?",
        english: "Do you have a card?",
        practiceItemId: "grammar/mat-mas",
      },
      {
        slovak: "Nemám hotovosť.",
        english: "I do not have cash.",
        practiceItemId: "grammar/mat-nemam",
      },
    ],
    related: ["byt-present", "numbers-and-numerals", "negation", "ty-vs-vy"],
    source: languageSource,
    tags: ["verbs", "present tense", "beginner"],
    lookFor:
      "Match the mať ending to the person, then notice ne- attached in negative forms.",
    pathGroup: "Verbs",
    order: 5,
    rule: [
      "The present forms of mať are mám, máš, má, máme, máte, and majú.",
      "Use mať with rokov for age, and use máte for formal singular or plural you.",
    ],
    pattern: {
      label: "Mať — to have",
      lines: [
        "ja mám",
        "ty máš",
        "on / ona / ono má",
        "my máme",
        "vy máte",
        "oni / ony majú",
      ],
    },
    watchOut:
      "Do not say Som dvadsať rokov for age. Use Mám dvadsať rokov; attach ne- to make nemám.",
    nextSlug: "aspect",
    lessonLink: {
      href: "/lessons/grammar/mat-present",
      label: "Present forms of mať",
    },
  },
  {
    slug: "aspect",
    slovak: "vid",
    english: "aspect",
    category: "Verbs",
    kind: "grammar",
    summary:
      "Slovak verbs mark whether an action is ongoing or completed — not just when it happens.",
    body: [
      "Most verbs come in imperfective / perfective pairs. The imperfective covers process, habit, or an unbounded activity. The perfective frames one completed or result-focused event.",
      "Prefixes often build perfectives: písať → napísať, čítať → prečítať, robiť → urobiť. The prefix can also change meaning, so learn common pairs in full sentences.",
      "Future tense depends on aspect: imperfective usually uses budem + infinitive (budem písať), while perfective uses a present-looking form with future meaning (napíšem).",
    ],
    examples: [
      {
        slovak: "Písal list.",
        english: "He was writing / wrote a letter (process).",
        demonstrates: "Imperfective písať — ongoing or unbounded writing.",
      },
      {
        slovak: "Napísal list.",
        english: "He wrote the letter (finished it).",
        demonstrates: "Perfective napísať — the letter is done.",
      },
      {
        slovak: "Chodím do práce.",
        english: "I go to work (habitually).",
        demonstrates: "Habitual motion verb chodiť — repeated trips, not one journey.",
      },
    ],
    related: [
      "robit",
      "urobit",
      "pisat",
      "napisat",
      "citat",
      "precitat",
      "ist",
      "chodit",
    ],
    source: languageSource,
    tags: ["verbs", "aspect", "intermediate"],
    lookFor:
      "Ask whether the speaker means the process/habit or the completed result — that choice is aspect.",
    pathGroup: "Verbs",
    order: 6,
    rule: [
      "Aspect is separate from tense: the same past time can be imperfective (process) or perfective (completed).",
      "Learn frequent pairs together (robiť / urobiť, písať / napísať) instead of translating English tense forms one-to-one.",
    ],
    pattern: {
      label: "Same idea, different aspect",
      lines: [
        "robiť → urobiť · do / get done",
        "písať → napísať · write / write to completion",
        "čítať → prečítať · read / read through",
        "ísť / chodiť · one trip vs habit",
      ],
    },
    termSections: [
      {
        id: "imperfective",
        title: "Imperfective",
        body: "Marks process, habit, or an action without a fixed endpoint — what was going on, not that it finished.",
      },
      {
        id: "perfective",
        title: "Perfective",
        body: "Marks a completed, bounded, or result-focused event — one trip to the finish line.",
      },
      {
        id: "habitual",
        title: "Habitual motion",
        body: "Motion verbs like chodiť cover repeated or multi-direction travel. Ísť covers one trip now or once.",
      },
    ],
    watchOut:
      "Do not map English progressive vs simple past onto aspect. Slovak chooses imperfective or perfective by how the event is framed, then places it in time.",
    nextSlug: "word-order",
  },
  {
    slug: "cases-overview",
    slovak: "pády",
    english: "cases overview",
    category: "Nouns",
    kind: "grammar",
    summary: "Six active cases change word endings according to their role.",
    body: [
      "Modern Slovak uses nominative, genitive, dative, accusative, locative, and instrumental forms. A limited vocative survives in a few expressions.",
      "Start by recognizing nominative subjects and accusative direct objects. Add other cases with common prepositions and phrases.",
    ],
    examples: [
      { slovak: "Mám kávu.", english: "I have coffee." },
      { slovak: "Bývam v meste.", english: "I live in the city." },
    ],
    related: ["kava", "mesto", "grammatical-gender"],
    source: languageSource,
    tags: ["cases", "nouns", "intermediate"],
    lookFor:
      "First, identify who or what performs the action. That noun is usually nominative.",
    caseOverview: [
      {
        slug: "nominative",
        name: "Nominative",
        question: "Kto? Čo? · Who? What?",
        role: "Subject",
        explanation:
          "Names the person, thing, or idea doing the action. In Peter číta knihu, Peter is nominative.",
      },
      {
        slug: "genitive",
        name: "Genitive",
        question: "Koho? Čoho? · Whose? Of what?",
        role: "Possession or source",
        explanation:
          "Marks possession, amounts, absence, and phrases after z, od, do, or bez.",
      },
      {
        slug: "dative",
        name: "Dative",
        question: "Komu? Čomu? · To whom? To what?",
        role: "Recipient",
        explanation: "Marks the person or thing receiving or benefiting from an action.",
      },
      {
        slug: "accusative",
        name: "Accusative",
        question: "Koho? Čo? · Whom? What?",
        role: "Direct object",
        explanation: "Marks the person or thing directly affected by an action.",
      },
      {
        slug: "locative",
        name: "Locative",
        question: "O kom? O čom? · About whom? About what?",
        role: "Location or topic",
        explanation:
          "Appears after selected prepositions for location and topics, such as v, na, and o.",
      },
      {
        slug: "instrumental",
        name: "Instrumental",
        question: "S kým? S čím? · With whom? With what?",
        role: "Company or tool",
        explanation: "Marks company, tools, and means, especially after s or so.",
      },
    ],
    pathGroup: "Nouns",
    order: 2,
    rule: [
      "Cases change noun endings according to the noun's role in a sentence.",
      "Begin by recognizing subjects in nominative and direct objects in accusative. Add other cases through common phrases.",
    ],
    pattern: {
      label: "The noun changes with its role",
      lines: ["Mám kávu. · I have coffee.", "Bývam v meste. · I live in the city."],
    },
    watchOut:
      "Do not try to memorize all six case tables at once. Start with patterns you can use in complete phrases.",
    nextSlug: "present-tense",
  },
  {
    slug: "word-order",
    slovak: "slovosled",
    english: "word order",
    category: "Sentence building",
    kind: "grammar",
    summary:
      "Slovak word order is flexible, but neutral sentences often follow subject–verb–object.",
    body: [
      "Case endings preserve grammatical roles, allowing speakers to move words for emphasis.",
      "Place known information earlier and new or emphasized information later. Keep unstressed short pronouns near the beginning.",
    ],
    examples: [
      { slovak: "Peter číta knihu.", english: "Peter is reading a book." },
      { slovak: "Knihu číta Peter.", english: "It is Peter who is reading the book." },
    ],
    related: ["present-tense", "cases-overview", "ty-vs-vy"],
    source: languageSource,
    tags: ["sentences", "word order", "intermediate"],
    lookFor: "Compare what moves to the front. That position receives emphasis.",
    pathGroup: "Sentence building",
    order: 4,
    rule: [
      "Slovak word order is flexible because case endings preserve grammatical roles.",
      "Neutral sentences often follow subject–verb–object, while a moved word receives emphasis.",
    ],
    pattern: {
      label: "Position changes emphasis",
      lines: ["subject + verb + object → neutral", "moved word → emphasis"],
    },
    watchOut:
      "Flexible does not mean random. Put familiar information earlier and the new or emphasized part later.",
    nextSlug: "ty-vs-vy",
  },
  {
    slug: "ty-vs-vy",
    slovak: "tykanie a vykanie",
    english: "informal and formal you",
    category: "Sentence building",
    kind: "grammar",
    summary:
      "Use ty with one person informally and vy for formal address or more than one person.",
    body: [
      "Use ty with friends, family, children, and people who invite you to be informal. Use vy with strangers, customers, older people, or professional contacts until they suggest ty.",
      "Vy takes plural verb forms even for one person: Máte čas? Informal ty uses singular forms: Máš čas? Use Prepáč informally and Prepáčte formally. In letters to one formal addressee, capitalize Vy, Vám, and Váš.",
    ],
    examples: [
      {
        slovak: "Ako sa máte?",
        english: "How are you? (formal)",
        practiceItemId: "everyday/formal-greeting",
      },
      {
        slovak: "Prepáč, nerozumiem.",
        english: "Sorry, I do not understand. (informal)",
      },
      {
        slovak: "Prepáčte, nerozumiem.",
        english: "Sorry, I do not understand. (formal)",
      },
    ],
    related: ["questions", "word-order", "byt-present", "mat-present"],
    source: languageSource,
    tags: ["sentences", "formality", "beginner"],
    lookFor: "Check whether the situation calls for ty or vy, then match the verb form.",
    pathGroup: "Sentence building",
    order: 5,
    rule: [
      "Use ty with one person informally and vy for formal address or more than one person.",
      "Formal vy uses plural verb forms; capitalize Vy, Vám, and Váš in letters to one formal addressee.",
    ],
    pattern: {
      label: "Informal and formal address",
      lines: [
        "ty máš · informal singular",
        "vy máte · formal singular or plural",
        "Prepáč · informal / Prepáčte · formal",
      ],
    },
    watchOut:
      "Do not mix ty forms with vy forms in one conversation. Formal Vy is capitalized in letters to one person, not in ordinary plural vy.",
    nextSlug: "negation",
    lessonLink: {
      href: "/lessons/everyday/meet-someone",
      label: "Greetings and introductions",
    },
  },
  {
    slug: "negation",
    slovak: "zápor",
    english: "negation",
    category: "Sentence building",
    kind: "grammar",
    summary: "Slovak usually makes a finite verb negative with ne-.",
    body: [
      "Attach ne- to a finite verb: mám becomes nemám and rozumiem becomes nerozumiem. Nie can stand alone as “no,” but it does not normally sit separately before a finite verb.",
      "Learn common negative verb forms as whole words. Slovak also regularly uses verbal negation with negative words such as nikto and nič.",
    ],
    examples: [
      {
        slovak: "Nie, ďakujem.",
        english: "No, thank you.",
        practiceItemId: "everyday/negative-answer",
      },
      {
        slovak: "Nerozumiem.",
        english: "I do not understand.",
        practiceItemId: "everyday/not-understand",
      },
      {
        slovak: "Nemám čas.",
        english: "I do not have time.",
        practiceItemId: "everyday/negative-verb-placement",
      },
    ],
    related: ["word-order", "questions", "nie", "rozumiem", "byt-present", "mat-present"],
    source: languageSource,
    tags: ["sentences", "negation", "beginner"],
    lookFor: "Find ne- attached to the finite verb: nemám, nerozumiem, neviem.",
    pathGroup: "Sentence building",
    order: 6,
    rule: [
      "Form most finite verb negatives with ne- attached to the verb.",
      "Use nie alone for a negative answer; do not usually say nie mám or nie rozumiem.",
    ],
    pattern: {
      label: "Negation attaches to the verb",
      lines: ["mám → nemám", "rozumiem → nerozumiem", "Nie, ďakujem. → No, thank you."],
    },
    watchOut: "Double negation is normal in Slovak: Nikto nevolal means “Nobody called.”",
    nextSlug: "questions",
    lessonLink: {
      href: "/lessons/everyday/negation-in-conversation",
      label: "Negation in conversation",
    },
  },
  {
    slug: "questions",
    slovak: "otázky",
    english: "questions",
    category: "Sentence building",
    kind: "grammar",
    summary:
      "Use question words for information, or statement order with rising intonation for yes/no questions.",
    body: [
      "Question words such as kto, čo, kde, odkiaľ, and koľko usually come first. The rest of the question keeps normal Slovak word order.",
      "Yes/no questions often keep statement order and use rising intonation in speech: Hovoríte po slovensky? There is no English-style do-support.",
    ],
    examples: [
      {
        slovak: "Odkiaľ ste?",
        english: "Where are you from?",
        practiceItemId: "everyday/ask-origin",
      },
      {
        slovak: "Koľko to stojí?",
        english: "How much does it cost?",
        practiceItemId: "everyday/how-much-does-it-cost",
      },
      {
        slovak: "O koľkej?",
        english: "At what time?",
        practiceItemId: "everyday/meeting-time",
      },
    ],
    related: [
      "word-order",
      "negation",
      "numbers-and-numerals",
      "ty-vs-vy",
      "kto",
      "co",
      "kde",
      "kolko",
    ],
    source: languageSource,
    tags: ["sentences", "questions", "beginner"],
    lookFor:
      "Identify the question word first, then notice that the rest keeps ordinary Slovak sentence order.",
    pathGroup: "Sentence building",
    order: 7,
    rule: [
      "Put a question word first when you ask for information.",
      "For many yes/no questions, keep statement order and signal the question with intonation.",
    ],
    pattern: {
      label: "Question word or intonation",
      lines: [
        "Odkiaľ ste? · Where are you from?",
        "Koľko to stojí? · How much does it cost?",
        "Hovoríte po slovensky? · Do you speak Slovak?",
      ],
    },
    watchOut:
      "Do not add an English-style auxiliary. Hovoríte po slovensky? is already a complete yes/no question.",
    lessonLink: {
      href: "/lessons/everyday/meet-someone",
      label: "Greetings and introductions",
    },
  },
  {
    slug: "telling-time",
    slovak: "koľko je hodín",
    english: "telling time",
    category: "Numbers",
    kind: "grammar",
    summary:
      "Slovak clock time looks ahead to the next hour, and the verb agrees with the number.",
    body: [
      "Ask Koľko je hodín? Answer with Je for one, Sú for two to four, and Je again for five and higher with a genitive plural noun form.",
      "Half and quarter phrases name the coming hour: pol tretej is 02:30, štvrť na tri is 02:15, and trištvrte na tri is 02:45.",
    ],
    examples: [
      {
        slovak: "Koľko je hodín?",
        english: "What time is it?",
      },
      {
        slovak: "Sú tri hodiny.",
        english: "It is three o’clock.",
      },
      {
        slovak: "Je pol tretej.",
        english: "It is half past two.",
        practiceItemId: "everyday/half-past-time",
      },
      {
        slovak: "Stretneme sa o tretej.",
        english: "We will meet at three.",
        practiceItemId: "everyday/meeting-time",
      },
      {
        slovak: "Zavolám ti o dve hodiny.",
        english: "I will call you in two hours.",
        practiceItemId: "everyday/o-duration",
      },
      {
        slovak: "Je trištvrte na tri.",
        english: "It is quarter to three.",
        practiceItemId: "everyday/quarter-time",
      },
    ],
    related: ["numbers-and-numerals", "questions", "kolko"],
    source: languageSource,
    tags: ["numbers", "time", "beginner"],
    lookFor:
      "Is the number 1, 2–4, or 5+? That decides je/sú and hodina/hodiny/hodín. For halves and quarters, name the hour you are heading toward.",
    pathGroup: "Numbers",
    order: 2,
    rule: [
      "Hours follow 1 / 2–4 / 5+: Je jedna hodina, Sú tri hodiny, Je päť hodín. Minúta does the same; sekunda follows the numbers hub.",
      "Half and quarter name the coming hour — pol tretej is 02:30, not 03:30. Always Je pol…, never Sú.",
      "Appointments use o + locative (O tretej); approximate time uses okolo (okolo piatej).",
      "Duration from now uses o + accusative (O dve hodiny, O päť minút) — not a clock position.",
    ],
    pattern: {
      label: "Hour agreement and looking ahead",
      lines: [
        "01:00 → Je jedna hodina.",
        "02:00 → Sú dve hodiny.",
        "02:15 → Je štvrť na tri.",
        "02:30 → Je pol tretej.",
        "02:45 → Je trištvrte na tri.",
        "03:00 → Sú tri hodiny.",
        "04:00 → Sú štyri hodiny.",
        "05:00 → Je päť hodín.",
        "10:05 → desať hodín a päť minút",
        "9:55 countdown → za päť minút desať",
        "At / around → o tretej · okolo piatej",
        "Duration → o dve hodiny · o päť minút",
        "Day parts → ráno · doobeda/dopoludnia · naobed/napoludnie · poobede/popoludní · večer · v noci",
        "24-hour → Je pätnásť hodín",
        "Midday / midnight → poludnie · polnoc",
      ],
    },
    termSections: [
      {
        id: "pol",
        title: "pol",
        body: "Pol names the coming hour in the genitive: pol tretej is halfway to three (02:30). Always Je pol…, never Sú pol…",
      },
      {
        id: "stvrt",
        title: "štvrť na",
        body: "Štvrť na + the next hour means quarter past the previous hour: štvrť na tri is 02:15. After twelve, prefer štvrť na jednu.",
      },
      {
        id: "tristvrte",
        title: "trištvrte na",
        body: "Trištvrte na + the next hour means three-quarters toward that hour: trištvrte na tri is 02:45.",
      },
      {
        id: "o-duration",
        title: "o + accusative (duration)",
        body: "To say in X hours or in X minutes from now, use o + accusative: o dve hodiny, o päť minút. Compare o tretej (at three, locative) — a clock point, not a span of time.",
      },
    ],
    watchOut:
      "Pol tretej is 02:30, not 03:30 — Slovak names the hour it is heading toward. At 12:15, prefer Je štvrť na jednu, not *jeden*.",
    lessonLink: {
      href: "/lessons/everyday/days-dates-and-time",
      label: "Days, dates, and time",
    },
  },
];
