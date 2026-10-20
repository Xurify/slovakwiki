import { markedText } from "$lib/learning/marked-text";

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
    lookFor:
      "Match the adjective ending to the noun's gender: **-ý**, **-á**, or **-é**.",
    pathGroup: "Nouns",
    order: 1,
    rule: [
      "Every Slovak noun has a grammatical gender: masculine, feminine, or neuter.",
      "Learn each noun with its gender because it changes adjective endings, pronouns, and past-tense verbs.",
    ],
    pattern: {
      label: "Adjective endings follow gender",
      lines: ["Masculine: -ý", "Feminine: -á", "Neuter: -é"],
    },
    watchOut: ["The last letter is a hint, not a rule. Learn each noun with its gender."],
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
      "Notice whether the number is **jeden**, **dva / dve**, **tri / štyri**, or **päť** and higher. The noun form changes with the group.",
    pathGroup: "Numbers",
    order: 1,
    rule: [
      "**Jeden** goes with a singular noun; **dva / dve**, **tri**, and **štyri** use plural-like noun forms.",
      "**Päť** and higher numbers usually take a genitive plural noun form.",
    ],
    pattern: {
      label: "Quantity patterns",
      lines: [
        "jeden lístok · one ticket",
        "dva / dve, tri, štyri + quantity form",
        "päť+ + genitive plural",
      ],
    },
    watchOut: ["Start with whole phrases: **dvadsať rokov**, **päť eur**."],
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
        demonstrates: "The ending **-m** shows that I am the person reading.",
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
        "ja čítam · I read",
        "ty čítaš · you read (informal)",
        "on / ona číta · he, she reads",
        "my čítame · we read",
        "vy čítate · you read (formal or plural)",
        "oni / ony čítajú · they read",
      ],
    },
    watchOut: ["Learn each verb with its endings. The infinitive does not show them."],
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
      "Find the form of **byť**, then identify whether it gives an identity or a location.",
    pathGroup: "Verbs",
    order: 4,
    rule: [
      "Slovak usually leaves out the pronoun, because each form already says who is meant.",
      "Use **byť** for identity and location; use **mať** with **rokov** to state age.",
    ],
    pattern: {
      label: "Irregular — six forms to memorize",
      lines: [
        "ja som · I am",
        "ty si · you are (informal)",
        "on / ona / ono je · he, she, it is",
        "my sme · we are",
        "vy ste · you are (formal or plural)",
        "oni / ony sú · they are",
      ],
    },
    watchOut: [
      {
        wrong: "Som dvadsať rokov.",
        right: "Mám dvadsať rokov.",
        why: "Age uses **mať**.",
      },
    ],
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
      "Match the **mať** ending to the person, then notice **ne-** attached in negative forms.",
    pathGroup: "Verbs",
    order: 5,
    rule: [
      "Use **mať** for possession and availability, much like English “have.”",
      "Use **mať** with **rokov** for age, and use **máte** for formal singular or plural you.",
    ],
    pattern: {
      label: "Long á in every form except majú",
      lines: [
        "ja mám · I have",
        "ty máš · you have (informal)",
        "on / ona / ono má · he, she, it has",
        "my máme · we have",
        "vy máte · you have (formal or plural)",
        "oni / ony majú · they have",
      ],
    },
    watchOut: [
      {
        wrong: "Som dvadsať rokov.",
        right: "Mám dvadsať rokov.",
        why: "Age uses **mať**.",
      },
      { wrong: "nie mám", right: "nemám", why: "**Ne-** joins the verb." },
    ],
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
        demonstrates: "Imperfective **písať**: ongoing or unbounded writing.",
      },
      {
        slovak: "Napísal list.",
        english: "He wrote the letter (finished it).",
        demonstrates: "Perfective **napísať**: the letter is done.",
      },
      {
        slovak: "Chodím do práce.",
        english: "I go to work (habitually).",
        demonstrates: "Habitual motion verb **chodiť**: repeated trips, not one journey.",
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
      "Learn frequent pairs together (**robiť / urobiť**, **písať / napísať**) instead of translating English tense forms one-to-one.",
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
        term: "nedokonavý vid",
        gloss: "imperfective",
        body: "Marks process, habit, or an action without a fixed endpoint: what was going on, not that it finished.",
        examples: ["Písal som list.", "Každý deň píšem."],
      },
      {
        id: "perfective",
        term: "dokonavý vid",
        gloss: "perfective",
        body: "Marks a completed, bounded, or result-focused event: one trip to the finish line.",
        examples: ["Napísal som list.", "Zajtra to napíšem."],
      },
      {
        id: "habitual",
        term: "Habitual motion",
        body: "Motion verbs like **chodiť** cover repeated or multi-direction travel. **Ísť** covers one trip now or once.",
        examples: ["Chodím do školy.", "Teraz idem do školy."],
      },
    ],
    contrasts: {
      label: "Imperfective or perfective?",
      intro:
        "Both sentences are correct. Are you talking about doing something, or about getting it done? Careful: **napíšem** looks like now, but it means “I will write”.",
      frames: [
        {
          question: "Now, or later?",
          scene: "aspect",
          choices: [
            {
              at: "now",
              slovak: markedText([{ role: "contrast", text: "Píšem" }, " e-mail."]),
              english: "I am writing an email.",
              when: "right now",
            },
            {
              at: "done",
              slovak: markedText([{ role: "contrast", text: "Napíšem" }, " e-mail."]),
              english: "I will write an email.",
              when: "later, and it gets done",
            },
          ],
        },
        {
          question: "The evening, or the soup?",
          scene: "aspect",
          choices: [
            {
              at: "ongoing",
              slovak: markedText([
                "Večer ",
                { role: "contrast", text: "budem variť" },
                " polievku.",
              ]),
              english: "In the evening I will be cooking soup.",
              when: "how you'll spend the evening",
            },
            {
              at: "done",
              slovak: markedText([
                "Večer ",
                { role: "contrast", text: "uvarím" },
                " polievku.",
              ]),
              english: "In the evening I will cook soup.",
              when: "the soup will be ready",
            },
          ],
        },
        {
          question: "Every time, or right now?",
          scene: "aspect",
          choices: [
            {
              at: "habit",
              slovak: markedText([
                { role: "contrast", text: "Chodím" },
                " do obchodu pešo.",
              ]),
              english: "I walk to the shop.",
              when: "every time",
            },
            {
              at: "now",
              slovak: markedText([
                { role: "contrast", text: "Idem" },
                " do obchodu pešo.",
              ]),
              english: "I am walking to the shop.",
              when: "on your way now",
            },
          ],
        },
      ],
    },
    watchOut: [
      {
        wrong: "budem napísať",
        right: "napíšem",
        why: "No **budem** with a perfective verb.",
      },
      "English tenses do not map onto aspect. Ask: process, or result?",
    ],
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
          "Names the person, thing, or idea doing the action. In **Peter číta knihu**, **Peter** is nominative.",
      },
      {
        slug: "genitive",
        name: "Genitive",
        question: "Koho? Čoho? · Whose? Of what?",
        role: "Possession or source",
        explanation:
          "Marks possession, amounts, absence, and phrases after **z**, **od**, **do**, or **bez**.",
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
          "Appears after selected prepositions for location and topics, such as **v**, **na**, and **o**.",
      },
      {
        slug: "instrumental",
        name: "Instrumental",
        question: "S kým? S čím? · With whom? With what?",
        role: "Company or tool",
        explanation: "Marks company, tools, and means, especially after **s** or **so**.",
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
    watchOut: ["Don't learn all six tables at once. Start with whole phrases."],
    nextSlug: "demonstratives",
  },
  {
    slug: "demonstratives",
    slovak: "ukazovacie zámená",
    english: "demonstratives: ten, tento, tamten",
    category: "Nouns",
    kind: "grammar",
    summary:
      "Ten, tento, and tamten point at people and things, and agree with their noun in gender, number, and case.",
    body: [
      "Ten (tá, to) is the everyday demonstrative. Slovak has no article, so ten also does the job of English “the”. Tento (táto, toto) points at something near you; tamten (tamtá, tamto) at something over there.",
      "All three agree with their noun: ten muž, tá žena, to dievča. In the plural, only masculine nouns for people take tí; every other plural takes tie, including deti and ženy. In other cases they follow the noun: Poznám toho muža. Býva v tom dome. Idem s tou ženou.",
      "On its own, to means this, that, or it, and it never changes. Only the verb changes, je for one and sú for more: To je môj brat. To sú moji rodičia.",
    ],
    examples: [
      { slovak: "Kto je ten muž?", english: "Who is that man?" },
      { slovak: "Dám si tento koláč.", english: "I'll have this cake." },
      { slovak: "To sú moji rodičia.", english: "These are my parents." },
      {
        slovak: "Býva v tom dome vedľa nás.",
        english: "He lives in that house next to us.",
        demonstrates: "After **v** (in), **ten** takes the locative: **tom**.",
      },
      {
        slovak: "Bývame na tejto ulici.",
        english: "We live on this street.",
        demonstrates:
          "Feminine locative: **tej**, and **tento** adds **-to**: **tejto**.",
      },
      {
        slovak: "Pracujem s tou ženou.",
        english: "I work with that woman.",
        demonstrates:
          "After **s** (with), feminine **ten** takes the instrumental: **tou**.",
      },
    ],
    related: ["grammatical-gender", "cases-overview", "dievca", "dieta"],
    source: languageSource,
    tags: ["pronouns", "demonstratives", "agreement", "beginner"],
    lookFor:
      "Find the noun after **ten**. Its gender, number, and case decide the form: **ten muž**, **toho muža**, **s tou ženou**.",
    pathGroup: "Nouns",
    order: 3,
    rule: [
      "**Ten**, **tá**, **to** agree with the noun in gender, number, and case. **Tento** adds **-to** to every form, and **tamten** adds **tam-** in front.",
      "On its own, **to** never changes; only the verb follows the noun: **To je** môj brat. **To sú** moji rodičia.",
    ],
    pattern: {
      label: "Nominative (agreement)",
      columns: ["the, that", "this", "that (over there)"],
      rows: [
        { label: "Masculine", cells: ["ten", "tento", "tamten"] },
        { label: "Feminine", cells: ["tá", "táto", "tamtá"] },
        { label: "Neuter", cells: ["to", "toto", "tamto"] },
        {
          label: "Masculine nouns for people, plural",
          cells: ["tí", "títo", "tamtí"],
        },
        { label: "Every other plural", cells: ["tie", "tieto", "tamtie"] },
      ],
      examples: [
        { slovak: "Táto taška je moja.", english: "This bag is mine." },
        { slovak: "Toto mesto je krásne.", english: "This town is beautiful." },
        {
          slovak: "Tí chlapci hrajú futbal.",
          english: "Those boys are playing football.",
        },
        {
          slovak: "Tieto kľúče sú moje.",
          english: "These keys are mine.",
          demonstrates: "**Kľúč** is masculine, but keys are not people, so **tieto**.",
        },
      ],
    },
    morePatterns: [
      {
        label: "Accusative (as the object)",
        columns: ["the, that", "this", "that (over there)"],
        rows: [
          { label: "Masculine, a person", cells: ["toho", "tohto", "tamtoho"] },
          { label: "Masculine, a thing", cells: ["ten", "tento", "tamten"] },
          { label: "Feminine", cells: ["tú", "túto", "tamtú"] },
          { label: "Neuter", cells: ["to", "toto", "tamto"] },
          {
            label: "Masculine nouns for people, plural",
            cells: ["tých", "týchto", "tamtých"],
          },
          { label: "Every other plural", cells: ["tie", "tieto", "tamtie"] },
        ],
        examples: [
          { slovak: "Chcem tamtú tašku.", english: "I want that bag over there." },
          {
            slovak: "Poznám toho muža.",
            english: "I know that man.",
            demonstrates: "Accusative for a person: **ten** becomes **toho**.",
          },
          {
            slovak: "Vidím ten dom.",
            english: "I see that house.",
            demonstrates: "Accusative for a thing: **ten** stays **ten**.",
          },
          { slovak: "Vidíš tamto auto?", english: "Do you see that car over there?" },
          { slovak: "Poznáš tých chlapcov?", english: "Do you know those boys?" },
          { slovak: "Kúpim si tieto topánky.", english: "I'll buy these shoes." },
        ],
      },
      {
        label: "Dative and instrumental",
        columns: ["the, that", "this", "that (over there)"],
        rows: [
          {
            label: "Instrumental, with one person",
            cells: ["tým", "týmto", "tamtým"],
          },
          { label: "Dative plural, to them", cells: ["tým", "týmto", "tamtým"] },
          {
            label: "Instrumental plural, with them",
            cells: ["tými", "týmito", "tamtými"],
          },
        ],
        examples: [
          {
            slovak: "Idem na obed s týmto kolegom.",
            english: "I'm going to lunch with this colleague.",
            demonstrates: "Instrumental singular after **s** (with): **týmto**.",
          },
          {
            slovak: "Kúp tým deťom zmrzlinu.",
            english: "Buy those children some ice cream.",
            demonstrates: "Dative plural, “to them”: **tým**.",
          },
          {
            slovak: "Dnes večer ide s tými kolegami do kina.",
            english: "Tonight he's going to the cinema with those colleagues.",
            demonstrates: "Instrumental plural after **s** (with): **tými**.",
          },
        ],
      },
    ],
    termSections: [
      {
        id: "zivotny",
        term: "mužský rod životný",
        gloss: "masculine animate",
        body: "Masculine nouns for people and animals. In the accusative singular they all take **toho**. In the plural only people take **tí** and **tých**; animals take **tie**. Things are **mužský rod neživotný**, masculine inanimate.",
        examples: [
          "vidím toho muža",
          "vidím toho psa",
          "tí muži · tie psy",
          "vidím ten dom",
        ],
      },
      {
        id: "pad",
        term: "pád",
        gloss: "case",
        body: "Slovak has six: nominatív, genitív, datív, akuzatív, lokál, inštrumentál. A verb or a preposition picks the case; the noun takes it, and **ten**, **tento**, **tamten** follow the noun.",
        examples: ["bez toho muža", "o tom mužovi", "s tým mužom"],
      },
      {
        id: "mnozne-cislo",
        term: "množné číslo",
        gloss: "plural",
        body: "More than one; one is **jednotné číslo**. Plural demonstratives split into people (**tí**, **títo**) and everything else (**tie**, **tieto**).",
        examples: ["tí muži", "tie ženy", "tieto domy"],
      },
    ],
    contrasts: {
      label: "Tento, ten, or tamten?",
      frames: [
        {
          question: "Where is the shirt?",
          object: "shirt",
          label: { en: "nominative · feminine", sk: "nominatív · ženský rod" },
          scene: "space",
          choices: [
            {
              at: "me",
              slovak: markedText([
                "Páči sa mi ",
                { role: "demonstrative", text: "táto" },
                " košeľ",
                { role: "ending", text: "a" },
                ".",
              ]),
              english: "I like this shirt.",
              when: "in your hand, or on you",
            },
            {
              at: "them",
              slovak: markedText([
                "Páči sa mi ",
                { role: "demonstrative", text: "tá" },
                " košeľ",
                { role: "ending", text: "a" },
                ".",
              ]),
              english: "I like that shirt.",
              when: "on them, or one you both know",
            },
            {
              at: "far",
              slovak: markedText([
                "Páči sa mi ",
                { role: "demonstrative", text: "tamtá" },
                " košeľ",
                { role: "ending", text: "a" },
                ".",
              ]),
              english: "I like that shirt over there.",
              when: "across the shop",
            },
          ],
        },
        {
          question: "Which weekend?",
          label: {
            en: "nominative · masculine inanimate",
            sk: "nominatív · mužský rod neživotný",
          },
          scene: "time",
          choices: [
            {
              at: "now",
              slovak: markedText([
                { role: "demonstrative", text: "Tento" },
                " víkend bol úžasný.",
              ]),
              english: "This weekend was amazing.",
              when: "the one just ending",
            },
            {
              at: "before",
              slovak: markedText([
                { role: "demonstrative", text: "Ten" },
                " víkend bol úžasný.",
              ]),
              english: "That weekend was amazing.",
              when: "one in the past",
            },
          ],
        },
        {
          question: "Which book?",
          object: "book",
          label: { en: "accusative · feminine", sk: "akuzatív · ženský rod" },
          scene: "space",
          choices: [
            {
              at: "me",
              slovak: markedText([
                "Prečítaj si ",
                { role: "demonstrative", text: "túto" },
                " knih",
                { role: "ending", text: "u" },
                ".",
              ]),
              english: "Read this book.",
              when: "you're holding it out",
            },
            {
              at: "them",
              slovak: markedText([
                "Prečítaj si ",
                { role: "demonstrative", text: "tú" },
                " knih",
                { role: "ending", text: "u" },
                ".",
              ]),
              english: "Read that book.",
              when: "they're holding it, or you talked about it",
            },
            {
              at: "far",
              slovak: markedText([
                "Prečítaj si ",
                { role: "demonstrative", text: "tamtú" },
                " knih",
                { role: "ending", text: "u" },
                ".",
              ]),
              english: "Read that book over there.",
              when: "on a shelf across the room",
            },
          ],
        },
      ],
      more: [
        {
          question: "Which shoes?",
          object: "shoes",
          label: { en: "nominative · plural", sk: "nominatív · množné číslo" },
          scene: "space",
          choices: [
            {
              at: "me",
              slovak: markedText([
                { role: "demonstrative", text: "Tieto" },
                " topánk",
                { role: "ending", text: "y" },
                " sú pohodlné.",
              ]),
              english: "These shoes are comfortable.",
              when: "you're wearing them",
            },
            {
              at: "them",
              slovak: markedText([
                { role: "demonstrative", text: "Tie" },
                " topánk",
                { role: "ending", text: "y" },
                " sú pohodlné.",
              ]),
              english: "Those shoes are comfortable.",
              when: "they're wearing them",
            },
            {
              at: "far",
              slovak: markedText([
                { role: "demonstrative", text: "Tamtie" },
                " topánk",
                { role: "ending", text: "y" },
                " sú pohodlné.",
              ]),
              english: "Those shoes over there are comfortable.",
              when: "on a shelf across the shop",
            },
          ],
        },
        {
          question: "Which people?",
          object: "people",
          label: {
            en: "nominative · masculine animate, people, plural",
            sk: "nominatív · mužský rod životný, osoby, množné číslo",
          },
          scene: "space",
          choices: [
            {
              at: "me",
              slovak: markedText([
                { role: "demonstrative", text: "Títo" },
                " ľudi",
                { role: "ending", text: "a" },
                " čakajú na autobus.",
              ]),
              english: "These people are waiting for the bus.",
              when: "right next to you",
            },
            {
              at: "them",
              slovak: markedText([
                { role: "demonstrative", text: "Tí" },
                " ľudi",
                { role: "ending", text: "a" },
                " čakajú na autobus.",
              ]),
              english: "Those people are waiting for the bus.",
              when: "the ones you talked about",
            },
            {
              at: "far",
              slovak: markedText([
                { role: "demonstrative", text: "Tamtí" },
                " ľudi",
                { role: "ending", text: "a" },
                " čakajú na autobus.",
              ]),
              english: "Those people over there are waiting for the bus.",
              when: "at the stop across the street",
            },
          ],
        },
        {
          question: "Which dog?",
          object: "dog",
          label: {
            en: "genitive · masculine animate",
            sk: "genitív · mužský rod životný",
          },
          scene: "space",
          choices: [
            {
              at: "me",
              slovak: markedText([
                "Bojím sa ",
                { role: "demonstrative", text: "tohto" },
                " ps",
                { role: "ending", text: "a" },
                ".",
              ]),
              english: "I'm afraid of this dog.",
              when: "at your feet",
            },
            {
              at: "them",
              slovak: markedText([
                "Bojím sa ",
                { role: "demonstrative", text: "toho" },
                " ps",
                { role: "ending", text: "a" },
                ".",
              ]),
              english: "I'm afraid of that dog.",
              when: "the one you talked about",
            },
            {
              at: "far",
              slovak: markedText([
                "Bojím sa ",
                { role: "demonstrative", text: "tamtoho" },
                " ps",
                { role: "ending", text: "a" },
                ".",
              ]),
              english: "I'm afraid of that dog over there.",
              when: "behind a fence down the street",
            },
          ],
        },
        {
          question: "Which children?",
          object: "children",
          label: { en: "dative · plural", sk: "datív · množné číslo" },
          scene: "space",
          choices: [
            {
              at: "me",
              slovak: markedText([
                "Pomôž ",
                { role: "demonstrative", text: "týmto" },
                " deť",
                { role: "ending", text: "om" },
                ".",
              ]),
              english: "Help these children.",
              when: "standing with you",
            },
            {
              at: "them",
              slovak: markedText([
                "Pomôž ",
                { role: "demonstrative", text: "tým" },
                " deť",
                { role: "ending", text: "om" },
                ".",
              ]),
              english: "Help those children.",
              when: "the ones you talked about",
            },
            {
              at: "far",
              slovak: markedText([
                "Pomôž ",
                { role: "demonstrative", text: "tamtým" },
                " deť",
                { role: "ending", text: "om" },
                ".",
              ]),
              english: "Help those children over there.",
              when: "across the playground",
            },
          ],
        },
        {
          question: "Which house?",
          object: "house",
          label: {
            en: "locative · masculine inanimate",
            sk: "lokál · mužský rod neživotný",
          },
          scene: "space",
          choices: [
            {
              at: "me",
              slovak: markedText([
                "Bývam v ",
                { role: "demonstrative", text: "tomto" },
                " dom",
                { role: "ending", text: "e" },
                ".",
              ]),
              english: "I live in this house.",
              when: "you're standing in front of it",
            },
            {
              at: "them",
              slovak: markedText([
                "Bývam v ",
                { role: "demonstrative", text: "tom" },
                " dom",
                { role: "ending", text: "e" },
                ".",
              ]),
              english: "I live in that house.",
              when: "the one you talked about",
            },
            {
              at: "far",
              slovak: markedText([
                "Bývam v ",
                { role: "demonstrative", text: "tamtom" },
                " dom",
                { role: "ending", text: "e" },
                ".",
              ]),
              english: "I live in that house over there.",
              when: "further down the street",
            },
          ],
        },
        {
          question: "Which people?",
          object: "people",
          label: { en: "instrumental · plural", sk: "inštrumentál · množné číslo" },
          scene: "space",
          choices: [
            {
              at: "me",
              slovak: markedText([
                "Pracujem s ",
                { role: "demonstrative", text: "týmito" },
                " ľuď",
                { role: "ending", text: "mi" },
                ".",
              ]),
              english: "I work with these people.",
              when: "sitting around you",
            },
            {
              at: "them",
              slovak: markedText([
                "Pracujem s ",
                { role: "demonstrative", text: "tými" },
                " ľuď",
                { role: "ending", text: "mi" },
                ".",
              ]),
              english: "I work with those people.",
              when: "the ones you talked about",
            },
            {
              at: "far",
              slovak: markedText([
                "Pracujem s ",
                { role: "demonstrative", text: "tamtými" },
                " ľuď",
                { role: "ending", text: "mi" },
                ".",
              ]),
              english: "I work with those people over there.",
              when: "across the room",
            },
          ],
        },
      ],
    },
    watchOut: [
      { wrong: "tá dievča", right: "to dievča", why: "**Dievča** is neuter." },
      { wrong: "tá kolega", right: "ten kolega", why: "**Kolega** is masculine." },
      { wrong: "ten noc", right: "tá noc", why: "**Noc** is feminine." },
      {
        wrong: "Vidím ten muža.",
        right: "Vidím toho muža.",
        why: "A man changes in the accusative; a thing doesn't.",
      },
      "Czech is so close to Slovak that its forms slip in from TV, websites, and friends. Two that look right but aren't:",
      {
        wrong: "tohoto",
        right: "tohto",
        why: "It looks like **toho** + **-to**, and that is the Czech form. Slovak drops the middle o.",
      },
      {
        wrong: "tyto",
        right: "tieto",
        why: "The Czech plural. Slovak builds it from **tie**.",
      },
    ],
    nextSlug: "possessives",
    lessonLink: {
      href: "/lessons/grammar/demonstratives",
      label: "Demonstratives: ten, tento, tamten",
    },
  },
  {
    slug: "possessives",
    slovak: "privlastňovacie zámená",
    english: "possessives: môj, jeho, svoj",
    category: "Nouns",
    kind: "grammar",
    summary:
      "Môj, tvoj, náš, and váš agree with the thing owned. Jeho, jej, and ich never change. Svoj points back to the subject.",
    body: [
      "The owner picks the word: môj (my), tvoj (your, to one person you call ty), jeho (his, its), jej (her), náš (our), váš (your, formal or plural), ich (their).",
      "Môj, tvoj, náš, and váš then agree with the thing owned, like adjectives: môj brat, moja sestra, moje auto. The speaker does not matter; a woman also says môj brat. In the plural, only masculine nouns for people take moji. Every other plural takes moje, including deti and sestry.",
      "Jeho, jej, and ich never change, even after a preposition: s jeho bratom. Svoj means the subject's own. Use it when the owner is the subject of the same sentence: Anna hľadá svoje kľúče. Jej kľúče would be another woman's keys.",
    ],
    examples: [
      {
        slovak: "Tom píše list svojmu najlepšiemu priateľovi.",
        english: "Tom is writing a letter to his best friend.",
        demonstrates:
          "Tom is the subject and the owner, so **svoj**, in the dative: **svojmu**.",
        practiceItemId: "grammar/possessive-svoj-choice",
      },
      {
        slovak: "Idem do kina so svojou sestrou.",
        english: "I'm going to the cinema with my sister.",
        demonstrates:
          "With **ja** as the owner, **mojou** works too: **s mojou sestrou**.",
      },
      {
        slovak: "To je auto môjho brata.",
        english: "That is my brother's car.",
        demonstrates:
          "The owner comes after the thing, in the genitive: **môjho brata**.",
        practiceItemId: "grammar/possessive-genitive-build",
      },
    ],
    related: ["demonstratives", "grammatical-gender", "cases-overview", "ty-vs-vy"],
    source: languageSource,
    tags: ["pronouns", "possessives", "agreement", "beginner"],
    lookFor:
      "Find the owner first: it picks **môj**, **jeho**, or **svoj**. For **môj**, **tvoj**, **náš**, and **váš**, then find the noun. Its gender, number, and case pick the ending.",
    pathGroup: "Nouns",
    order: 4,
    rule: [
      "**Môj**, **tvoj**, **náš**, and **váš** agree with the noun in gender, number, and case. **Jeho**, **jej**, and **ich** never change.",
      "When the owner is the subject of the sentence, use **svoj** in the noun's case: Tom volá **svojej** mame.",
    ],
    pattern: {
      label: "Nominative (agreement)",
      columns: ["my", "your (ty)", "our", "your (vy)"],
      rows: [
        { label: "Masculine", cells: ["môj", "tvoj", "náš", "váš"] },
        { label: "Feminine", cells: ["moja", "tvoja", "naša", "vaša"] },
        { label: "Neuter", cells: ["moje", "tvoje", "naše", "vaše"] },
        {
          label: "Masculine nouns for people, plural",
          cells: ["moji", "tvoji", "naši", "vaši"],
        },
        { label: "Every other plural", cells: ["moje", "tvoje", "naše", "vaše"] },
      ],
      examples: [
        { slovak: "Tvoj byt je krásny.", english: "Your flat is beautiful." },
        {
          slovak: "To je moja sestra.",
          english: "This is my sister.",
          practiceItemId: "grammar/possessive-agreement",
        },
        {
          slovak: "To sú moji priatelia.",
          english: "These are my friends.",
          demonstrates: "**Priateľ** is masculine and a person, so **moji**.",
        },
        {
          slovak: "Naše deti chodia do školy.",
          english: "Our children go to school.",
          demonstrates: "**Deti** are people, but not a masculine noun, so **naše**.",
        },
      ],
    },
    morePatterns: [
      {
        label: "Jeho, jej, ich never change",
        lines: [
          "jeho brat · his brother",
          "jeho sestra · his sister",
          "jeho auto · his car",
          "s jeho bratom · with his brother",
          "jej deti · her children",
          "ich dom · their house",
        ],
        examples: [
          {
            slovak: "Jej brat je učiteľ.",
            english: "Her brother is a teacher.",
            practiceItemId: "grammar/possessive-third-person",
          },
          {
            slovak: "Anna ide do kina s jeho bratom.",
            english: "Anna is going to the cinema with his brother.",
            demonstrates:
              "After a preposition, **jeho** stays **jeho**. **S ním** means “with him” and cannot stand before a noun.",
            practiceItemId: "grammar/possessive-jeho-preposition",
          },
          {
            slovak: "Ich auto je červené.",
            english: "Their car is red.",
            demonstrates:
              "**Ich** never changes. The adjective still agrees with **auto**: **červené**.",
          },
        ],
      },
    ],
    contrasts: {
      label: "Who is the owner?",
      intro:
        "Look at who owns the thing. That picks the word, even when the English stays the same.",
      frames: [
        {
          question: "Who are you asking?",
          label: { en: "nominative", sk: "nominatív" },
          scene: "address",
          choices: [
            {
              at: "friend",
              slovak: markedText([
                "Je to ",
                { role: "possessive", text: "tvoj" },
                " kufor?",
              ]),
              english: "Is this your suitcase?",
              when: "a friend",
            },
            {
              at: "formal",
              slovak: markedText([
                "Je to ",
                { role: "possessive", text: "váš" },
                " kufor?",
              ]),
              english: "Is this your suitcase?",
              when: "a stranger, or more than one person",
            },
          ],
        },
        {
          question: "Whose sister?",
          label: { en: "accusative", sk: "akuzatív" },
          choices: [
            {
              slovak: markedText([
                "Poznáš ",
                { role: "possessive", text: "jeho" },
                " sestr",
                { role: "ending", text: "u" },
                "?",
              ]),
              english: "Do you know his sister?",
              when: "Peter's",
            },
            {
              slovak: markedText([
                "Poznáš ",
                { role: "possessive", text: "jej" },
                " sestr",
                { role: "ending", text: "u" },
                "?",
              ]),
              english: "Do you know her sister?",
              when: "Eva's",
            },
          ],
        },
        {
          question: "Whose keys?",
          object: "keys",
          label: { en: "accusative · plural", sk: "akuzatív · množné číslo" },
          scene: "owner",
          choices: [
            {
              at: "own",
              slovak: markedText([
                { role: "owner", text: "Anna" },
                " hľadá ",
                { role: "possessive", text: "svoje" },
                " kľúč",
                { role: "ending", text: "e" },
                ".",
              ]),
              english: "Anna is looking for her keys.",
              when: "Anna's own",
            },
            {
              at: "other",
              slovak: markedText([
                "Anna hľadá ",
                { role: "possessive", text: "jej" },
                " kľúč",
                { role: "ending", text: "e" },
                ".",
              ]),
              english: "Anna is looking for her keys.",
              when: "another woman's",
            },
          ],
        },
      ],
      more: [
        {
          question: "Whose mom?",
          object: "person",
          label: { en: "dative", sk: "datív" },
          scene: "owner",
          choices: [
            {
              at: "own",
              slovak: markedText([
                { role: "owner", text: "Tom" },
                " volá ",
                { role: "possessive", text: "svojej" },
                " mam",
                { role: "ending", text: "e" },
                ".",
              ]),
              english: "Tom is calling his mom.",
              when: "Tom's own",
            },
            {
              at: "other",
              slovak: markedText([
                "Tom volá ",
                { role: "possessive", text: "jeho" },
                " mam",
                { role: "ending", text: "e" },
                ".",
              ]),
              english: "Tom is calling his mom.",
              when: "another man's",
            },
          ],
        },
        {
          question: "Whose brother?",
          object: "person",
          label: { en: "instrumental", sk: "inštrumentál" },
          scene: "owner",
          choices: [
            {
              at: "own",
              slovak: markedText([
                { role: "owner", text: "Eva" },
                " ide do kina ",
                { role: "possessive", text: "so svojím" },
                " brat",
                { role: "ending", text: "om" },
                ".",
              ]),
              english: "Eva is going to the cinema with her brother.",
              when: "Eva's own",
            },
            {
              at: "other",
              slovak: markedText([
                "Eva ide do kina ",
                { role: "possessive", text: "s jej" },
                " brat",
                { role: "ending", text: "om" },
                ".",
              ]),
              english: "Eva is going to the cinema with her brother.",
              when: "another woman's",
            },
          ],
        },
      ],
    },
    watchOut: [
      {
        wrong: "moja brat",
        right: "môj brat",
        why: "Follows the noun, not the speaker.",
      },
      {
        wrong: "Svoj brat je učiteľ.",
        right: "Jej brat je učiteľ.",
        why: "**Svoj** is never the subject.",
      },
      {
        wrong: "s našim bratom",
        right: "s naším bratom",
        why: "“With our” has a long **í**.",
      },
    ],
    nextSlug: "present-tense",
    lessonLink: {
      href: "/lessons/grammar/possessives",
      label: "Possessives: môj, jeho, svoj",
    },
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
    watchOut: ["Flexible, not random: known things first, new or stressed things last."],
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
    lookFor:
      "Check whether the situation calls for **ty** or **vy**, then match the verb form.",
    pathGroup: "Sentence building",
    order: 5,
    rule: [
      "Use **ty** with one person informally and **vy** for formal address or more than one person.",
      "Formal **vy** uses plural verb forms; capitalize **Vy**, **Vám**, and **Váš** in letters to one formal addressee.",
    ],
    pattern: {
      label: "Informal and formal address",
      columns: ["ty · informal", "vy · formal or plural"],
      rows: [
        { label: "you are", cells: ["si", "ste"] },
        { label: "you have", cells: ["máš", "máte"] },
        { label: "thank you", cells: ["ďakujem ti", "ďakujem vám"] },
        { label: "sorry", cells: ["prepáč", "prepáčte"] },
      ],
    },
    contrasts: {
      label: "Ty or vy?",
      intro:
        "**Ty** is for one friend. **Vy** is for someone you don't know well, or for more than one person.",
      frames: [
        {
          question: "Who are you asking?",
          scene: "address",
          choices: [
            {
              at: "friend",
              slovak: markedText([{ role: "contrast", text: "Máš" }, " čas?"]),
              english: "Do you have time?",
              when: "a friend, a child, family",
            },
            {
              at: "formal",
              slovak: markedText([{ role: "contrast", text: "Máte" }, " čas?"]),
              english: "Do you have time?",
              when: "a stranger, a teacher, a colleague",
            },
          ],
        },
        {
          question: "How many people?",
          scene: "address",
          choices: [
            {
              at: "friend",
              slovak: markedText([{ role: "contrast", text: "Prídeš" }, " zajtra?"]),
              english: "Will you come tomorrow?",
              when: "one friend",
            },
            {
              at: "group",
              slovak: markedText([{ role: "contrast", text: "Prídete" }, " zajtra?"]),
              english: "Will you come tomorrow?",
              when: "two friends at once",
            },
          ],
        },
      ],
    },
    watchOut: [
      "Pick **ty** or **vy** and stay with it.",
      "Capitalize **Vy** only in a letter to one person.",
    ],
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
    lookFor:
      "Find **ne-** attached to the finite verb: **nemám**, **nerozumiem**, **neviem**.",
    pathGroup: "Sentence building",
    order: 6,
    rule: [
      "Form most finite verb negatives with **ne-** attached to the verb.",
      "Use **nie** alone for a negative answer; do not usually say *nie mám* or *nie rozumiem*.",
    ],
    pattern: {
      label: "Negation attaches to the verb",
      lines: ["mám → nemám", "rozumiem → nerozumiem", "Nie, ďakujem. · No, thank you."],
    },
    watchOut: [
      {
        wrong: "Nikto volal.",
        right: "Nikto nevolal.",
        why: "Slovak uses double negation.",
      },
    ],
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
    watchOut: [
      "No helper verb like English “do”. **Hovoríte po slovensky?** is complete.",
    ],
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
      "Is the number 1, 2–4, or 5+? That decides **je / sú** and **hodina / hodiny / hodín**. For halves and quarters, name the hour you are heading toward.",
    pathGroup: "Numbers",
    order: 2,
    rule: [
      "Hours follow 1 / 2–4 / 5+: **Je jedna hodina**, **Sú tri hodiny**, **Je päť hodín**. **Minúta** does the same; **sekunda** follows the numbers hub.",
      "Half and quarter name the coming hour: **pol tretej** is 02:30, not 03:30. Always **Je pol…**, never *Sú pol…*.",
      "Appointments use **o** + locative (**o tretej**); approximate time uses **okolo** (**okolo piatej**).",
      "Duration from now uses **o** + accusative (**o dve hodiny**, **o päť minút**), not a clock position.",
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
        term: "pol",
        body: "**Pol** names the coming hour in the genitive: **pol tretej** is halfway to three (02:30). Always **Je pol…**, never *Sú pol…*",
      },
      {
        id: "stvrt",
        term: "štvrť na",
        body: "**Štvrť na** + the next hour means quarter past the previous hour: **štvrť na tri** is 02:15. After twelve, prefer **štvrť na jednu**.",
      },
      {
        id: "tristvrte",
        term: "trištvrte na",
        body: "**Trištvrte na** + the next hour means three-quarters toward that hour: **trištvrte na tri** is 02:45.",
      },
      {
        id: "o-duration",
        term: "o + akuzatív",
        gloss: "in, from now",
        body: "To say in X hours or in X minutes from now, use **o** + accusative: **o dve hodiny**, **o päť minút**. Compare **o tretej** (at three, locative): a clock point, not a span of time.",
      },
    ],
    contrasts: {
      label: "At three or in three hours?",
      intro:
        "**O tretej** is a time on the clock. **O tri hodiny** is how long from now.",
      frames: [
        {
          question: "A time, or how long?",
          scene: "clock",
          choices: [
            {
              at: "clock",
              slovak: markedText([
                "Zavolám ti ",
                { role: "time", text: "o tretej" },
                ".",
              ]),
              english: "I will call you at three.",
              when: "3:00 on the clock",
            },
            {
              at: "span",
              slovak: markedText([
                "Zavolám ti ",
                { role: "time", text: "o tri hodiny" },
                ".",
              ]),
              english: "I will call you in three hours.",
              when: "three hours from now",
            },
          ],
        },
      ],
    },
    watchOut: [
      {
        wrong: "pol tretej = 3:30",
        right: "pol tretej = 2:30",
        why: "Slovak names the hour ahead.",
      },
      {
        wrong: "štvrť na jeden",
        right: "štvrť na jednu",
        why: "For 12:15: **hodina** is feminine.",
      },
    ],
    lessonLink: {
      href: "/lessons/everyday/days-dates-and-time",
      label: "Days, dates, and time",
    },
  },
];
