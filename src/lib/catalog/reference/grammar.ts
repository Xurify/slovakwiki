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
      "Match the adjective ending to the noun's gender: **-ý**, **-á**, or **-é**. After a long syllable the ending is short: **krásny**, **krásna**, **krásne**.",
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
    slovak: "čísla a číslovky",
    english: "numbers and numerals",
    category: "Numbers",
    kind: "grammar",
    summary: "Numbers change the form that follows them, especially from five upward.",
    body: [
      "Jeden (jedna, jedno) agrees with its noun and takes the singular: jeden lístok, jedna káva, jedno auto. Two has three forms: dve for feminine and neuter nouns (dve kávy, dve autá); dva for masculine things and animals (dva lístky, dva psy); dvaja for masculine nouns for people (dvaja bratia). Tri and štyri also have forms for people: traja, štyria. After 2–4 the noun is plural.",
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
      "**Jeden** (**jedna**, **jedno**) goes with a singular noun. **Dve** (feminine and neuter), **dva** (masculine things and animals), **dvaja** (masculine nouns for people), **tri**, and **štyri** take the plural: **dve kávy**, **dva lístky**, **dvaja bratia**.",
      "**Päť** and higher numbers usually take a genitive plural noun form.",
    ],
    pattern: {
      label: "Quantity patterns",
      lines: [
        "jeden lístok · one ticket",
        "dva / dvaja / dve, tri, štyri + plural",
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
    slovak: "byť v prítomnom čase",
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
      "Use **byť** for identity and location; use **mať** for age: **Mám dvadsať rokov**.",
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
      {
        wrong: "nieje",
        right: "nie je",
        why: "The negative of present **byť** is two words: **nie som**, **nie je**, **nie sú**.",
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
    slovak: "mať v prítomnom čase",
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
      "Use **mať** for age (**Mám dvadsať rokov**), and use **máte** for formal singular or plural you.",
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
    nextSlug: "past-tense",
    lessonLink: {
      href: "/lessons/grammar/mat-present",
      label: "Present forms of mať",
    },
  },
  {
    slug: "past-tense",
    slovak: "minulý čas",
    english: "past tense",
    category: "Verbs",
    kind: "grammar",
    summary:
      "The past tense is the -l form of the verb plus som, si, sme, or ste. The -l form also shows whether a man or a woman is speaking.",
    body: [
      "Build the -l form from the infinitive: drop -ť and add -l. robiť → robil, čítať → čítal, pracovať → pracoval. Verbs in -ieť take -el: vidieť → videl, chcieť → chcel.",
      "The -l form agrees with the subject: robil (masculine), robila (feminine), robilo (neuter), robili (plural). A man says Bol som doma; a woman says Bola som doma.",
      "Add som, si, sme, or ste for I, you, we, and you (formal or plural). The third person has no extra word: Peter pracoval. Formal vy takes the plural form, even for one person: Kde ste boli?",
      "A few common verbs have their own -l form: ísť → išiel, išla; jesť → jedol; môcť → mohol; niesť → niesol.",
    ],
    examples: [
      {
        slovak: "Čo si robil cez víkend?",
        english: "What did you do at the weekend?",
        demonstrates: "Asking a man. To a woman: **Čo si robila?**",
      },
      {
        slovak: "Dieťa spalo.",
        english: "The child was sleeping.",
        demonstrates: "**Dieťa** is neuter, so the **-l** form ends in **-lo**.",
      },
      {
        slovak: "Včera som bol doma.",
        english: "Yesterday I was at home.",
        demonstrates: "**Som** stands second in the sentence, right after **včera**.",
      },
      {
        slovak: "Anna pracovala celý deň.",
        english: "Anna worked all day.",
        demonstrates: "Third person: no **som**, just the **-l** form **pracovala**.",
      },
      {
        slovak: "Kde ste boli?",
        english: "Where were you?",
        demonstrates: "Formal **vy** takes the plural **boli**, even for one person.",
      },
    ],
    related: ["byt", "robit", "ist", "byt-present", "aspect", "negation"],
    source: languageSource,
    tags: ["verbs", "past tense", "beginner"],
    lookFor:
      "Find the verb ending in **-l**, **-la**, **-lo**, or **-li**. Then look for **som**, **si**, **sme**, or **ste** near it: that word says who.",
    pathGroup: "Verbs",
    order: 6,
    rule: [
      "Past = the **-l** form + **som**, **si**, **sme**, **ste**. In the third person, the **-l** form stands alone: **Peter pracoval**.",
      "The **-l** form agrees with the subject: **robil**, **robila**, **robilo**, **robili**.",
      "**Som** and **si** take second place in the sentence: **Včera som bol doma.**",
    ],
    pattern: {
      label: "Robiť — to do, in the past",
      rowLabel: "Person",
      columns: ["Masculine", "Feminine"],
      rows: [
        { label: "ja (I)", cells: ["robi[l] som", "robi[la] som"] },
        { label: "ty (you, informal)", cells: ["robi[l] si", "robi[la] si"] },
        { label: "on / ona (he, she)", cells: ["robi[l]", "robi[la]"] },
        { label: "my (we)", cells: ["robi[li] sme", "robi[li] sme"] },
        { label: "vy (you, formal or plural)", cells: ["robi[li] ste", "robi[li] ste"] },
        { label: "oni / ony (they)", cells: ["robi[li]", "robi[li]"] },
      ],
    },
    morePatterns: [
      {
        label: "From the infinitive to the -l form",
        rowLabel: "Meaning",
        columns: ["Infinitive", "-l form"],
        rows: [
          { label: "do", cells: ["robi[ť]", "robi[l]"] },
          { label: "read", cells: ["číta[ť]", "číta[l]"] },
          { label: "work", cells: ["pracova[ť]", "pracova[l]"] },
          { label: "drink", cells: ["pi[ť]", "pi[l]"] },
          { label: "see", cells: ["vid[ieť]", "vid[el]"] },
          { label: "want", cells: ["chc[ieť]", "chc[el]"] },
        ],
      },
      {
        label: "Verbs with their own -l form",
        rowLabel: "Meaning",
        columns: ["Infinitive", "Masculine", "Feminine"],
        rows: [
          { label: "go", cells: ["ís[ť]", "iš[iel]", "iš[la]"] },
          { label: "come", cells: ["prís[ť]", "priš[iel]", "priš[la]"] },
          { label: "eat", cells: ["jes[ť]", "jed[ol]", "jed[la]"] },
          { label: "can, be able", cells: ["môc[ť]", "moh[ol]", "moh[la]"] },
          { label: "carry", cells: ["nies[ť]", "nies[ol]", "nies[la]"] },
          { label: "forget", cells: ["zabudnú[ť]", "zabud[ol]", "zabud[la]"] },
        ],
        examples: [
          {
            slovak: "Prišla neskoro.",
            english: "She came late.",
            demonstrates: "**Prísť** → **prišiel**, **prišla**: learn both forms.",
          },
        ],
      },
    ],
    contrasts: {
      label: "Who did it?",
      intro:
        "The **-l** form shows a man or a woman. **Som**, **si**, **sme**, **ste** show the person; the third person has none.",
      frames: [
        {
          question: "A man, or a woman?",
          choices: [
            {
              slovak: markedText([
                { role: "contrast", text: "Bol" },
                " som unaven",
                { role: "ending", text: "ý" },
                ".",
              ]),
              english: "I was tired.",
              when: "a man says it",
              why: "Masculine: **bol**, **-ý**",
            },
            {
              slovak: markedText([
                { role: "contrast", text: "Bola" },
                " som unaven",
                { role: "ending", text: "á" },
                ".",
              ]),
              english: "I was tired.",
              when: "a woman says it",
              why: "Feminine: **bola**, **-á**",
            },
          ],
        },
        {
          question: "You, or him?",
          choices: [
            {
              slovak: markedText([
                "Včera ",
                { role: "contrast", text: "som pracoval" },
                ".",
              ]),
              english: "Yesterday I worked.",
              when: "you did",
              why: "**Som** marks I",
            },
            {
              slovak: markedText(["Včera ", { role: "contrast", text: "pracoval" }, "."]),
              english: "Yesterday he worked.",
              when: "he did",
              why: "No **som**: he",
            },
          ],
        },
        {
          question: "Who are you asking?",
          scene: "address",
          choices: [
            {
              at: "friend",
              slovak: markedText(["Kde ", { role: "contrast", text: "si bol" }, "?"]),
              english: "Where were you?",
              when: "a friend",
              why: "**Ty**: **si bol**",
            },
            {
              at: "formal",
              slovak: markedText(["Kde ", { role: "contrast", text: "ste boli" }, "?"]),
              english: "Where were you?",
              when: "a stranger, or more than one person",
              why: "**Vy**: **ste boli**",
            },
          ],
        },
      ],
    },
    watchOut: [
      {
        wrong: "Ja bol doma.",
        right: "Bol som doma.",
        why: "“I” needs **som**.",
      },
      {
        wrong: "Som bol doma.",
        right: "Bol som doma.",
        why: "**Som** never comes first.",
      },
      {
        wrong: "Peter je pracoval.",
        right: "Peter pracoval.",
        why: "No extra word in the third person.",
      },
      {
        wrong: "nie som bol",
        right: "nebol som",
        why: "**Ne-** joins the **-l** form.",
      },
    ],
    nextSlug: "aspect",
  },
  {
    slug: "aspect",
    slovak: "nedokonavý a dokonavý vid",
    english: "aspect: imperfective and perfective",
    aliases: [
      "imperfective",
      "perfective",
      "nedokonavý vid",
      "dokonavý vid",
      "nedokonavé slovesá",
      "dokonavé slovesá",
    ],
    category: "Verbs",
    kind: "grammar",
    summary:
      "Most Slovak verbs come in imperfective and perfective pairs — marking whether an action is ongoing and repeated, or a single completed result.",
    body: [
      "Most verbs come in imperfective / perfective pairs. The imperfective covers process, habit, or an unbounded activity. The perfective frames one completed or result-focused event.",
      "Pairs are built three ways. A prefix: písať → napísať, čítať → prečítať, robiť → urobiť. A different suffix: kupovať / kúpiť, dávať / dať. Or a different verb: brať / vziať, hovoriť / povedať. Each verb has its own prefix, so learn pairs in full sentences.",
      "Future tense depends on aspect: imperfective usually uses budem + infinitive (budem písať), while perfective uses a present-looking form with future meaning (napíšem).",
      "After začať, prestať, and skončiť, use the imperfective infinitive: Začal som sa učiť slovenčinu.",
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
    ],
    related: [
      "robit",
      "urobit",
      "pisat",
      "napisat",
      "citat",
      "precitat",
      "kupovat",
      "kupit",
      "past-tense",
      "future-tense",
      "motion-verbs",
    ],
    source: languageSource,
    tags: ["verbs", "aspect", "imperfective", "perfective", "intermediate"],
    lookFor:
      "Ask whether the speaker means the process/habit or the completed result — that choice is aspect.",
    pathGroup: "Verbs",
    order: 7,
    rule: [
      "Most verbs come in **imperfective** (**nedokonavý vid**) and **perfective** (**dokonavý vid**) pairs. The imperfective covers an ongoing process, a habit, or how long something lasted (**písať**); the perfective frames one completed result (**napísať**).",
      "Pairs are built in three ways: a prefix (**písať → napísať**, **robiť → urobiť**), a suffix change (**kupovať / kúpiť**, **dávať / dať**), or two stems (**brať / vziať**, **hovoriť / povedať**). When a prefix changes the meaning (**písať** write → **podpísať** sign), it forms a new imperfective (**podpisovať**).",
      "Perfective verbs have no present meaning: **napíšem** is always “I will write”, while the imperfective future uses **budem** + infinitive (**budem písať**). After **začať**, **prestať**, and **skončiť**, always use the imperfective infinitive: **Začal som sa učiť slovenčinu.**",
    ],
    pattern: {
      label: "A prefix: the same verb, finished",
      rowLabel: "Meaning",
      columns: ["Imperfective", "Perfective"],
      rows: [
        { label: "write", cells: ["písať", "napísať"] },
        { label: "read", cells: ["čítať", "prečítať"] },
        { label: "do", cells: ["robiť", "urobiť"] },
        { label: "cook", cells: ["variť", "uvariť"] },
        { label: "drink", cells: ["piť", "vypiť"] },
        { label: "call", cells: ["volať", "zavolať"] },
      ],
    },
    morePatterns: [
      {
        label: "A new suffix or a new verb: learn both",
        rowLabel: "Meaning",
        columns: ["Imperfective", "Perfective"],
        rows: [
          { label: "buy", cells: ["kupovať", "kúpiť"] },
          { label: "give", cells: ["dávať", "dať"] },
          { label: "open", cells: ["otvárať", "otvoriť"] },
          { label: "help", cells: ["pomáhať", "pomôcť"] },
          { label: "forget", cells: ["zabúdať", "zabudnúť"] },
          { label: "get up", cells: ["vstávať", "vstať"] },
          { label: "take", cells: ["brať", "vziať"] },
          { label: "say, tell", cells: ["hovoriť", "povedať"] },
        ],
        examples: [
          {
            slovak: "Každý deň kupujem chlieb.",
            english: "I buy bread every day.",
            demonstrates: "A habit: imperfective **kupovať**.",
          },
          {
            slovak: "Včera som kúpil nový telefón.",
            english: "Yesterday I bought a new phone.",
            demonstrates: "One purchase, done: perfective **kúpiť**.",
          },
        ],
      },
      {
        label: "Which aspect?",
        lines: [
          "Práve [píšem] e-mail. · Right now I am writing an email. · in progress: imperfective · písať",
          "Každé ráno [pijem] kávu. · Every morning I drink coffee. · a habit: imperfective · piť",
          "Dve hodiny som [čítal]. · I read for two hours. · how long: imperfective · čítať",
          "[Prečítal] som to za hodinu. · I finished reading it in an hour. · done, with a result: perfective · prečítať",
          "[Prišiel], [sadol si] a [otvoril] list. · He came in, sat down, and opened the letter. · one event after another: perfective · prísť → sadnúť si → otvoriť",
          "Keď som [varil], [zazvonil] telefón. · While I was cooking, the phone rang. · background, then an event: both · variť → zazvoniť",
        ],
        examples: [
          {
            slovak: "Začal som sa učiť slovenčinu.",
            english: "I started learning Slovak.",
            demonstrates: "After **začať**, the imperfective: **učiť sa**.",
          },
        ],
      },
    ],
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
        body: "Marks a completed, bounded, or result-focused event: the action reaches its end.",
        examples: ["Napísal som list.", "Zajtra to napíšem."],
      },
      {
        id: "habitual",
        term: "Habitual motion",
        body: "Motion verbs like **chodiť** cover repeated or multi-direction travel. **Ísť** covers one trip now or once. See [Motion verbs](/grammar/motion-verbs).",
        examples: ["Chodím do školy.", "Teraz idem do školy."],
      },
    ],
    contrasts: {
      label: "Imperfective or perfective?",
      intro:
        "Both sentences are correct. Are you talking about doing something, or about getting it done? Careful: **napíšem** looks like now, but it means “I will write”. The last pair is not aspect: **chodiť** and **ísť** are both imperfective; **chodiť** is for habits, **ísť** for one trip. More on [Motion verbs](/grammar/motion-verbs).",
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
              why: "Imperfective: in progress",
            },
            {
              at: "done",
              slovak: markedText([{ role: "contrast", text: "Napíšem" }, " e-mail."]),
              english: "I will write an email.",
              when: "later, and it gets done",
              why: "Perfective present: future, done",
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
              why: "Imperfective: the activity",
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
              why: "Perfective: the result",
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
              why: "**Chodiť**: a habit",
            },
            {
              at: "now",
              slovak: markedText([
                { role: "contrast", text: "Idem" },
                " do obchodu pešo.",
              ]),
              english: "I am walking to the shop.",
              when: "on your way now",
              why: "**Ísť**: one trip, now",
            },
          ],
        },
      ],
      more: [
        {
          question: "Busy, or finished?",
          scene: "past",
          choices: [
            {
              at: "ongoing",
              slovak: markedText([
                "Večer som ",
                { role: "contrast", text: "písal" },
                " list.",
              ]),
              english: "In the evening I was writing a letter.",
              when: "how the evening went",
              why: "Imperfective: the process",
            },
            {
              at: "done",
              slovak: markedText([
                "Večer som ",
                { role: "contrast", text: "napísal" },
                " list.",
              ]),
              english: "In the evening I wrote the letter.",
              when: "the letter is finished",
              why: "Perfective: the result",
            },
          ],
        },
        {
          question: "Have you read it?",
          choices: [
            {
              slovak: markedText([{ role: "contrast", text: "Čítal" }, " si tú knihu?"]),
              english: "Have you read that book?",
              when: "ever, even a page",
              why: "Imperfective: any reading",
            },
            {
              slovak: markedText([
                { role: "contrast", text: "Prečítal" },
                " si tú knihu?",
              ]),
              english: "Have you finished that book?",
              when: "all of it, to the end",
              why: "Perfective: to the end",
            },
          ],
        },
        {
          question: "Every week, or this once?",
          scene: "past",
          choices: [
            {
              at: "habit",
              slovak: markedText([
                { role: "contrast", text: "Volal" },
                " som mame každú nedeľu.",
              ]),
              english: "I called my mom every Sunday.",
              when: "every Sunday",
              why: "Imperfective: again and again",
            },
            {
              at: "done",
              slovak: markedText([
                "V nedeľu som ",
                { role: "contrast", text: "zavolal" },
                " mame.",
              ]),
              english: "On Sunday I called my mom.",
              when: "once, last Sunday",
              why: "Perfective: once",
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
      {
        wrong: "Začal som napísať list.",
        right: "Začal som písať list.",
        why: "After **začať**, the imperfective.",
      },
      "English tenses do not map onto aspect. Ask: process, or result?",
    ],
    nextSlug: "future-tense",
  },
  {
    slug: "future-tense",
    slovak: "budúci čas",
    english: "future tense",
    category: "Verbs",
    kind: "grammar",
    summary:
      "Imperfective verbs make the future with budem + infinitive. Perfective verbs use their present forms, which already mean the future.",
    body: [
      "Byť has its own future: budem, budeš, bude, budeme, budete, budú. Zajtra budem doma.",
      "Imperfective verbs add the infinitive to budem: budem pracovať, budeme čakať. This is the future of a process or a habit.",
      "Perfective verbs have no present meaning. Their present forms are the future: napíšem (I will write), zavolám (I will call), prídem (I will come).",
      "Ísť has its own future: pôjdem, pôjdeš, pôjde. Other one-trip motion verbs can take po- too: ponesiem, poletím, pobežím.",
    ],
    examples: [
      { slovak: "Budeš doma?", english: "Will you be at home?" },
      {
        slovak: "Budeme čakať pred kinom.",
        english: "We will wait in front of the cinema.",
        demonstrates: "**Budeme** + imperfective **čakať**.",
      },
      {
        slovak: "Zajtra budem celý deň doma.",
        english: "Tomorrow I will be at home all day.",
        demonstrates: "**Budem** is the future of **byť**.",
      },
    ],
    related: ["byt", "ist", "zavolat", "volat", "aspect", "motion-verbs"],
    source: languageSource,
    tags: ["verbs", "future tense", "aspect", "beginner"],
    lookFor:
      "Find **budem**, **budeš**, **bude**…: that is the future of an imperfective verb. No **budem**, but a perfective verb in a present form? That is the future too.",
    pathGroup: "Verbs",
    order: 8,
    rule: [
      "Imperfective: **budem** + infinitive: **budem písať**.",
      "Perfective: the present form is the future: **napíšem**. Never **budem** + perfective.",
    ],
    pattern: {
      label: "Budem — will (be)",
      lines: [
        "ja budem · I will",
        "ty budeš · you will (informal)",
        "on / ona / ono bude · he, she, it will",
        "my budeme · we will",
        "vy budete · you will (formal or plural)",
        "oni / ony budú · they will",
      ],
    },
    morePatterns: [
      {
        label: "Imperfective or perfective future",
        rowLabel: "Meaning",
        columns: ["Imperfective", "Perfective"],
        rows: [
          { label: "write", cells: ["[budem] písať", "[na]píšem"] },
          { label: "read", cells: ["[budem] čítať", "[pre]čítam"] },
          { label: "cook", cells: ["[budem] variť", "[u]varím"] },
          { label: "call", cells: ["[budem] volať", "[za]volám"] },
          { label: "buy", cells: ["[budem] kupovať", "kúpim"] },
        ],
        examples: [
          {
            slovak: "Zajtra ti to pošlem.",
            english: "I'll send it to you tomorrow.",
            demonstrates: "One act, then done: perfective **poslať** → **pošlem**.",
          },
          {
            slovak: "Večer ti zavolám.",
            english: "I'll call you in the evening.",
            demonstrates:
              "Perfective **zavolať**: the present form **zavolám** means the future.",
          },
        ],
      },
      {
        label: "One-trip motion verbs take po-",
        rowLabel: "Meaning",
        columns: ["Infinitive", "Future (I will)"],
        rows: [
          { label: "go", cells: ["ísť", "pôjdem"] },
          { label: "carry", cells: ["niesť", "[po]nesiem"] },
          { label: "fly", cells: ["letieť", "[po]letím"] },
          { label: "run", cells: ["bežať", "[po]bežím"] },
        ],
        examples: [
          {
            slovak: "V lete pôjdeme k moru.",
            english: "In summer we will go to the sea.",
            demonstrates:
              "**Ísť** makes its own future: **pôjdeme**. See [Motion verbs](/grammar/motion-verbs).",
          },
        ],
      },
    ],
    contrasts: {
      label: "Budem, or the perfective?",
      intro:
        "Both talk about later. **Budem** + imperfective is about the time you spend, or a habit. The perfective is about one result.",
      frames: [
        {
          question: "The weekend, or the book?",
          scene: "aspect",
          choices: [
            {
              at: "ongoing",
              slovak: markedText([
                "Cez víkend ",
                { role: "contrast", text: "budem čítať" },
                " tú knihu.",
              ]),
              english: "At the weekend I'll be reading that book.",
              when: "how you'll spend the weekend",
              why: "**Budem** + imperfective",
            },
            {
              at: "done",
              slovak: markedText([
                "Cez víkend ",
                { role: "contrast", text: "prečítam" },
                " tú knihu.",
              ]),
              english: "I'll read that book over the weekend.",
              when: "the book will be finished",
              why: "Perfective present: future",
            },
          ],
        },
        {
          question: "Every day, or once?",
          scene: "aspect",
          choices: [
            {
              at: "habit",
              slovak: markedText([
                "Každý deň ti ",
                { role: "contrast", text: "budem volať" },
                ".",
              ]),
              english: "I'll call you every day.",
              when: "again and again",
              why: "**Budem** + imperfective",
            },
            {
              at: "done",
              slovak: markedText([
                "Zajtra ti ",
                { role: "contrast", text: "zavolám" },
                ".",
              ]),
              english: "I'll call you tomorrow.",
              when: "once, tomorrow",
              why: "Perfective present: future",
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
      {
        wrong: "budem ísť",
        right: "pôjdem",
        why: "**Ísť** has its own future.",
      },
      {
        wrong: "Keď budeš prísť, zavolaj.",
        right: "Keď prídeš, zavolaj.",
        why: "**Prídeš** is already future.",
      },
      "**Napíšem** looks like the present, but it means “I will write”.",
    ],
    nextSlug: "motion-verbs",
  },
  {
    slug: "motion-verbs",
    slovak: "slovesá pohybu: ísť alebo chodiť",
    english: "motion verbs: ísť or chodiť",
    category: "Verbs",
    kind: "grammar",
    summary:
      "Most kinds of movement have two verbs: one for a single trip in one direction (ísť), one for habits and round trips (chodiť).",
    body: [
      "Ísť, niesť, viezť, letieť, and bežať describe one trip in one direction, now or at one moment. Chodiť, nosiť, voziť, lietať, and behať describe habits, round trips, ability, or moving around.",
      "Both verbs in a pair are imperfective. The one-trip verb makes its future with po-: pôjdem, ponesiem, poletím.",
      "A prefix gives the trip an end point and makes a perfective: prísť (arrive), odísť (leave), vojsť (go in), vyjsť (go out). Use it for one arrival or departure, seen as done. The imperfective partner in -chádzať (prichádzať, odchádzať) is for a habit, a timetable, or an arrival still going on.",
      "Ísť also covers travel by car or train: ísť autom, ísť vlakom. Pešo means on foot.",
    ],
    examples: [
      {
        slovak: "Bežím na autobus.",
        english: "I'm running for the bus.",
        demonstrates: "One run, right now: **bežať**.",
      },
      {
        slovak: "Každé ráno behám.",
        english: "I run every morning.",
        demonstrates: "A habit: **behať**.",
      },
      {
        slovak: "Nesiem ti kávu.",
        english: "I'm bringing you a coffee.",
        demonstrates: "Carrying it this moment, one way: **niesť**.",
      },
      {
        slovak: "Nosím okuliare.",
        english: "I wear glasses.",
        demonstrates: "Day after day: **nosiť**, which also means to wear.",
      },
      {
        slovak: "Veziem deti do školy.",
        english: "I'm driving the kids to school.",
        demonstrates: "One trip by car, now: **viezť**.",
      },
      {
        slovak: "Vozím deti do školy.",
        english: "I drive the kids to school.",
        demonstrates: "Every morning, there and back: **voziť**.",
      },
      {
        slovak: "Do práce chodím pešo.",
        english: "I walk to work.",
        demonstrates: "**Chodiť**: a habit, there and back every day.",
      },
      {
        slovak: "Dieťa už chodí.",
        english: "The child can already walk.",
        demonstrates: "**Chodiť** also means being able to walk.",
      },
      {
        slovak: "Deti behajú po dvore.",
        english: "The children are running around the yard.",
        demonstrates: "Running about, no single direction: **behať**, even right now.",
      },
    ],
    related: [
      "ist",
      "chodit",
      "niest",
      "nosit",
      "letiet",
      "lietat",
      "prist",
      "odist",
      "aspect",
      "future-tense",
    ],
    source: languageSource,
    tags: ["verbs", "motion", "aspect", "intermediate"],
    lookFor:
      "Ask: one trip in one direction, or a habit and round trips? One trip takes **ísť**, **niesť**, **letieť**; a habit takes **chodiť**, **nosiť**, **lietať**.",
    pathGroup: "Verbs",
    order: 9,
    rule: [
      "One trip, now or at one moment: **ísť**, **niesť**, **viezť**, **letieť**, **bežať**.",
      "A habit, round trips, moving about, or ability: **chodiť**, **nosiť**, **voziť**, **lietať**, **behať**.",
      "Both verbs in a pair are imperfective. The one-trip verb makes its future with **po-**: **pôjdem**, **ponesiem**, **poletím**, never *budem ísť*. More on [Future tense](/grammar/future-tense).",
      "A prefix gives the trip an end point: **prísť** is to arrive, **odísť** to leave. These verbs are perfective, for one arrival or departure seen as done, so their present form means the future: **prídem**, I will come. For a habit, a timetable, or an arrival still going on, use the imperfective partner in **-chádzať**: **prichádzať**, **odchádzať**. The full rule is on [Aspect](/grammar/aspect).",
      "**Ísť** also covers a car or a train: **ísť autom**, **ísť vlakom**. **Pešo** is on foot.",
    ],
    pattern: {
      label: "One trip, or a habit?",
      intro:
        "Both verbs in a pair are imperfective. The choice is about the shape of the trip, not about finishing it.",
      rowLabel: "Meaning",
      columns: ["One trip", "Habit, round trips"],
      rows: [
        { label: "go", cells: ["ísť", "chodiť"] },
        { label: "carry", cells: ["niesť", "nosiť"] },
        { label: "drive, take by car", cells: ["viezť", "voziť"] },
        { label: "fly", cells: ["letieť", "lietať"] },
        { label: "run", cells: ["bežať", "behať"] },
      ],
    },
    morePatterns: [
      {
        label: "Ísť — to go (one trip)",
        lines: [
          "ja idem · I go, I'm going",
          "ty ideš · you go (informal)",
          "on / ona / ono ide · he, she, it goes",
          "my ideme · we go",
          "vy idete · you go (formal or plural)",
          "oni / ony idú · they go",
        ],
        examples: [
          {
            slovak: "Idem do práce.",
            english: "I'm on my way to work.",
            demonstrates: "**Ísť**: one trip, happening now.",
          },
          {
            slovak: "Ideme autom alebo vlakom?",
            english: "Are we going by car or by train?",
            demonstrates: "**Ísť** covers a car or a train too: **autom**, **vlakom**.",
          },
          {
            slovak: "Zajtra pôjdeme na výlet.",
            english: "Tomorrow we'll go on a trip.",
            demonstrates: "The future of **ísť** is **pôjdem**, not *budem ísť*.",
          },
        ],
      },
      {
        label: "Arrive, leave, go in, go out",
        intro:
          "A short prefix on **ísť** or **niesť** gives the trip an end point: **pri-** arrives, **od-** leaves, **v-** goes in, **vy-** goes out, **pre-** crosses. The perfective is one arrival or departure, seen as done, and its present form means the future: **prídem**, I will come. The imperfective is a habit, a timetable, or something still going on. [Aspect](/grammar/aspect) explains the two in full.",
        rowLabel: "Meaning",
        columns: ["Perfective", "Imperfective"],
        rows: [
          { label: "arrive, come", cells: ["prísť", "prichádzať"] },
          { label: "leave", cells: ["odísť", "odchádzať"] },
          { label: "go in", cells: ["vojsť", "vchádzať"] },
          { label: "go out, go up", cells: ["vyjsť", "vychádzať"] },
          { label: "cross, go through", cells: ["prejsť", "prechádzať"] },
          { label: "bring", cells: ["priniesť", "prinášať"] },
        ],
        examples: [
          {
            slovak: "Kedy prídeš?",
            english: "When are you coming?",
            demonstrates:
              "One arrival, still ahead: perfective **prísť**, and **prídeš** means the future.",
          },
          {
            slovak: "Prišli sme domov o šiestej.",
            english: "We got home at six.",
            demonstrates: "One arrival, done: perfective **prísť**.",
          },
          {
            slovak: "Mama vždy prichádza načas.",
            english: "Mum always arrives on time.",
            demonstrates: "A habit: imperfective **prichádzať**.",
          },
          {
            slovak: "Vlak odchádza o ôsmej.",
            english: "The train leaves at eight.",
            demonstrates: "A timetable: imperfective **odchádzať**.",
          },
          {
            slovak: "Odišli pred hodinou.",
            english: "They left an hour ago.",
            demonstrates: "One departure, done: perfective **odísť**.",
          },
          {
            slovak: "Vošiel do obchodu a kúpil chlieb.",
            english: "He went into the shop and bought bread.",
            demonstrates:
              "One event after another: perfective **vojsť**, then **kúpiť**.",
          },
          {
            slovak: "Slnko vychádza o šiestej.",
            english: "The sun rises at six.",
            demonstrates:
              "Every day: imperfective **vychádzať**, which also means to rise.",
          },
          {
            slovak: "Prešli sme cez most.",
            english: "We crossed the bridge.",
            demonstrates: "One crossing, done: perfective **prejsť**.",
          },
          {
            slovak: "Prinesiem ti vodu.",
            english: "I'll bring you some water.",
            demonstrates:
              "Perfective **priniesť**: the present form **prinesiem** means the future.",
          },
        ],
      },
      {
        label: "Where, where to, where from",
        intro:
          "Where you are, where you are going, and where you come from each take their own form. **Kde** goes with **v** or **na**, **kam** with **do**, **na**, or **k**, and **odkiaľ** with **z** or **od**.",
        rowLabel: "Place",
        columns: ["Where? (kde)", "Where to? (kam)", "Where from? (odkiaľ)"],
        rows: [
          { label: "the shop", cells: ["v obchod[e]", "do obchod[u]", "z obchod[u]"] },
          { label: "the post office", cells: ["na pošt[e]", "na pošt[u]", "z pošt[y]"] },
          { label: "the doctor", cells: ["u lekár[a]", "k lekár[ovi]", "od lekár[a]"] },
          { label: "home", cells: ["doma", "domov", "z dom[u]"] },
          { label: "here", cells: ["tu", "sem", "odtiaľto"] },
        ],
        examples: [
          {
            slovak: "Som v obchode.",
            english: "I'm at the shop.",
            demonstrates: "Where? **V obchode**.",
          },
          {
            slovak: "Idem do obchodu.",
            english: "I'm going to the shop.",
            demonstrates: "Where to? **Do obchodu**.",
          },
          {
            slovak: "Idem z obchodu.",
            english: "I'm coming from the shop.",
            demonstrates: "Where from? **Z obchodu**.",
          },
          {
            slovak: "Idem k lekárovi.",
            english: "I'm going to the doctor.",
            demonstrates: "A person you go to takes **k**: **k lekárovi**.",
          },
          {
            slovak: "Boli sme u lekára.",
            english: "We were at the doctor's.",
            demonstrates: "At a person's place: **u lekára**.",
          },
          {
            slovak: "Idem domov.",
            english: "I'm going home.",
            demonstrates: "**Domov** is where to. **Doma** is where.",
          },
          {
            slovak: "Poď sem!",
            english: "Come here!",
            demonstrates: "**Sem** answers “where to?”. **Tu** answers “where?”.",
          },
        ],
      },
    ],
    contrasts: {
      label: "One trip, or again and again?",
      intro:
        "Both verbs mean “go”. **Ísť** is one trip in one direction. **Chodiť** is a habit, or there and back.",
      frames: [
        {
          question: "Today, or every day?",
          scene: "aspect",
          choices: [
            {
              at: "now",
              slovak: markedText([
                "Dnes ",
                { role: "contrast", text: "idem" },
                " do školy autobusom.",
              ]),
              english: "Today I'm going to school by bus.",
              when: "today, this one trip",
              why: "**Ísť**: one trip",
            },
            {
              at: "habit",
              slovak: markedText([
                "Do školy ",
                { role: "contrast", text: "chodím" },
                " autobusom.",
              ]),
              english: "I go to school by bus.",
              when: "every day",
              why: "**Chodiť**: a habit",
            },
          ],
        },
        {
          question: "One flight, or often?",
          choices: [
            {
              slovak: markedText([
                "Zajtra ",
                { role: "contrast", text: "letím" },
                " do Londýna.",
              ]),
              english: "Tomorrow I'm flying to London.",
              when: "one flight",
              why: "**Letieť**: one flight",
            },
            {
              slovak: markedText([
                "Často ",
                { role: "contrast", text: "lietam" },
                " do Londýna.",
              ]),
              english: "I often fly to London.",
              when: "often, there and back",
              why: "**Lietať**: again and again",
            },
          ],
        },
        {
          question: "The visit, or the trip?",
          choices: [
            {
              slovak: markedText([
                "Včera ",
                { role: "contrast", text: "som bol v kine" },
                ".",
              ]),
              english: "Yesterday I was at the cinema.",
              when: "you went and came back",
              why: "**Byť v** + locative: where you were",
            },
            {
              slovak: markedText([
                "Včera ",
                { role: "contrast", text: "som išiel do kina" },
                ".",
              ]),
              english: "Yesterday I went to the cinema.",
              when: "the trip there is the point",
              why: "**Ísť do** + genitive: where you headed",
            },
          ],
        },
      ],
    },
    watchOut: [
      {
        wrong: "Každý deň idem do práce.",
        right: "Každý deň chodím do práce.",
        why: "A habit takes **chodiť**.",
      },
      {
        wrong: "budem ísť",
        right: "pôjdem",
        why: "**Ísť** has its own future.",
      },
      {
        wrong: "Poď tu.",
        right: "Poď sem.",
        why: "**Sem** is where to.",
      },
    ],
    nextSlug: "imperative",
  },
  {
    slug: "imperative",
    slovak: "rozkazovací spôsob: príkazy a prosby",
    english: "imperative: commands and requests",
    category: "Verbs",
    kind: "grammar",
    summary:
      "The imperative tells someone to do something: Píš! Píšte! Píšme! Build it from the they-form of the present tense.",
    body: [
      "Take the oni form of the present and drop the ending: robia → rob, píšu → píš, čítajú → čítaj. That is the form for one person you call ty.",
      "Add -te for vy (one person formally, or several people), and -me for “let's”: robte, robme. When the stem ends in two consonants, add -i first: spia → spi, spite; myslia → mysli.",
      "A final t, d, n, or l turns soft: platia → plať, sedia → seď.",
      "Some common verbs have their own form: ísť → choď, prísť → príď, byť → buď, jesť → jedz, povedať → povedz. Poď means come here, or let's go: Poďme!",
      "For one request, use the perfective: Zatvor dvere. For “don't”, use the imperfective: Nezatváraj dvere. A warning against an accident keeps the perfective: Nezabudni si kľúče!",
    ],
    examples: [
      { slovak: "Čítaj nahlas.", english: "Read aloud." },
      {
        slovak: "Pite veľa vody.",
        english: "Drink a lot of water.",
        demonstrates: "General advice: imperfective **piť** → **pite**.",
      },
      {
        slovak: "Zatvor okno, prosím.",
        english: "Close the window, please.",
        demonstrates: "One request to a friend: perfective **zatvoriť** → **zatvor**.",
      },
      {
        slovak: "Nezabudni si kľúče!",
        english: "Don't forget your keys!",
        demonstrates:
          "A warning against an accident keeps the perfective: **nezabudni**.",
      },
    ],
    related: [
      "zatvorit",
      "zatvarat",
      "povedat",
      "zabudnut",
      "pomoct",
      "ty-vs-vy",
      "aspect",
    ],
    source: languageSource,
    tags: ["verbs", "imperative", "intermediate"],
    lookFor:
      "Find a verb with no person ending, often at the start: **Rob**, **Píšte**, **Poďme**. No ending means **ty**, **-te** means **vy**, and **-me** means “let's”.",
    pathGroup: "Verbs",
    order: 10,
    rule: [
      "Take the **oni** form and drop the ending: **píšu → píš**. Add **-te** for **vy** and **-me** for “let's”.",
      "One request: perfective (**zavolaj**). “Don't”: imperfective (**nevolaj**).",
    ],
    pattern: {
      label: "From the they-form",
      rowLabel: "Verb (they-form)",
      columns: ["ty", "vy", "my (let's)"],
      rows: [
        { label: "čítať (čítajú)", cells: ["čítaj", "čítajte", "čítajme"] },
        { label: "robiť (robia)", cells: ["rob", "robte", "robme"] },
        { label: "písať (píšu)", cells: ["píš", "píšte", "píšme"] },
        { label: "platiť (platia)", cells: ["plať", "plaťte", "plaťme"] },
        { label: "spať (spia)", cells: ["spi", "spite", "spime"] },
        { label: "piť (pijú)", cells: ["pi", "pite", "pime"] },
      ],
    },
    morePatterns: [
      {
        label: "Verbs with their own imperative",
        rowLabel: "Verb",
        columns: ["ty", "vy", "my (let's)"],
        rows: [
          { label: "ísť (go)", cells: ["choď", "choďte", "choďme"] },
          { label: "prísť (come)", cells: ["príď", "príďte", "príďme"] },
          { label: "byť (be)", cells: ["buď", "buďte", "buďme"] },
          { label: "jesť (eat)", cells: ["jedz", "jedzte", "jedzme"] },
          { label: "povedať (say, tell)", cells: ["povedz", "povedzte", "povedzme"] },
          { label: "pomôcť (help)", cells: ["pomôž", "pomôžte", "pomôžme"] },
          { label: "come here, come in, let's go", cells: ["poď", "poďte", "poďme"] },
        ],
        examples: [
          { slovak: "Poďme na kávu.", english: "Let's go for a coffee." },
          {
            slovak: "Poďte ďalej.",
            english: "Come in.",
            demonstrates: "**Poď**, **poďte**: come here, come in.",
          },
        ],
      },
      {
        label: "Nech: let someone do it",
        lines: [
          "Nech príde. · Let him come.",
          "Nech sa páči. · Here you are. / Go ahead.",
        ],
      },
    ],
    contrasts: {
      label: "Which form?",
      intro:
        "The person you talk to picks the ending. The situation picks the aspect: one request is perfective, “don't” is imperfective.",
      frames: [
        {
          question: "Who are you asking?",
          scene: "address",
          choices: [
            {
              at: "friend",
              slovak: markedText([{ role: "contrast", text: "Zavolaj" }, " mi zajtra."]),
              english: "Call me tomorrow.",
              when: "a friend",
              why: "**Ty** form",
            },
            {
              at: "formal",
              slovak: markedText([
                { role: "contrast", text: "Zavolajte" },
                " mi zajtra.",
              ]),
              english: "Call me tomorrow.",
              when: "a stranger, or more than one person",
              why: "**Vy** form: **-te**",
            },
          ],
        },
        {
          question: "Do it, or don't?",
          choices: [
            {
              slovak: markedText([{ role: "contrast", text: "Zatvor" }, " okno."]),
              english: "Close the window.",
              when: "one request: perfective",
              why: "**zatvoriť** → **zatvor**",
            },
            {
              slovak: markedText([{ role: "contrast", text: "Nezatváraj" }, " okno."]),
              english: "Don't close the window.",
              when: "don't: imperfective",
              why: "**ne-** + **zatváraj**",
            },
          ],
        },
        {
          question: "A rule, or a warning?",
          choices: [
            {
              slovak: markedText([
                { role: "contrast", text: "Nevolaj" },
                " mi po desiatej.",
              ]),
              english: "Don't call me after ten.",
              when: "a rule: imperfective",
              why: "**ne-** + **volaj**",
            },
            {
              slovak: markedText([
                { role: "contrast", text: "Nezabudni" },
                " mi zavolať.",
              ]),
              english: "Don't forget to call me.",
              when: "a warning: perfective",
              why: "**ne-** + **zabudni**",
            },
          ],
        },
      ],
    },
    watchOut: [
      {
        wrong: "Nezatvor okno.",
        right: "Nezatváraj okno.",
        why: "“Don't” takes the imperfective.",
      },
      {
        wrong: "Idi domov!",
        right: "Choď domov!",
        why: "**Ísť** has its own imperative.",
      },
      "Add **prosím** to make any request polite: **Zavolaj mi, prosím.**",
    ],
    nextSlug: "conditional",
  },
  {
    slug: "conditional",
    slovak: "podmieňovací spôsob: by",
    english: "conditional: would",
    category: "Verbs",
    kind: "grammar",
    summary:
      "The conditional is the -l form plus by: robil by som, “I would do”. Use it for wishes, polite requests, and imagined situations.",
    body: [
      "Take the past -l form and add by, then som, si, sme, or ste: robil by som, robila by si, robili by sme. The third person has only by: Peter by prišiel.",
      "By stands second in the sentence, like som: Rád by som išiel. Čo by si robil?",
      "Use it for polite requests (Mohli by ste mi pomôcť?) and wishes (Chcel by som kávu).",
      "In if-sentences, keby already contains by: Keby som mal čas, prišiel by som. Aby works the same way: Povedz mu, aby prišiel.",
      "For something that may really happen, use ak with the future instead: Ak bude pršať, zostaneme doma.",
    ],
    examples: [{ slovak: "Čo by si robil?", english: "What would you do?" }],
    related: ["chciet", "moct", "mat", "past-tense", "ty-vs-vy"],
    source: languageSource,
    tags: ["verbs", "conditional", "intermediate"],
    lookFor:
      "Find **by** (or **keby**, **aby**) and the **-l** form near it. Then **som**, **si**, **sme**, or **ste** tells you who.",
    pathGroup: "Verbs",
    order: 11,
    rule: [
      "Conditional = the **-l** form + **by** + **som**, **si**, **sme**, **ste**: **robil by som**.",
      "**Keby** and **aby** already contain **by**: **keby som mal čas**.",
    ],
    pattern: {
      label: "Robiť — would do",
      rowLabel: "Person",
      columns: ["Masculine", "Feminine"],
      rows: [
        { label: "ja (I)", cells: ["robi[l] by som", "robi[la] by som"] },
        { label: "ty (you, informal)", cells: ["robi[l] by si", "robi[la] by si"] },
        { label: "on / ona (he, she)", cells: ["robi[l] by", "robi[la] by"] },
        { label: "my (we)", cells: ["robi[li] by sme", "robi[li] by sme"] },
        {
          label: "vy (you, formal or plural)",
          cells: ["robi[li] by ste", "robi[li] by ste"],
        },
        { label: "oni / ony (they)", cells: ["robi[li] by", "robi[li] by"] },
      ],
    },
    morePatterns: [
      {
        label: "Polite phrases",
        lines: [
          "Chcel by som… · I would like… (a man)",
          "Chcela by som… · I would like… (a woman)",
          "Mohli by ste…? · Could you…? (formal)",
          "Mohol by si…? · Could you…? (to a friend)",
          "Bolo by dobré… · It would be good…",
        ],
        examples: [
          {
            slovak: "Chcel by som kávu, prosím.",
            english: "I'd like a coffee, please.",
            demonstrates:
              "**Chcel by som**: a polite way to ask. A woman says **chcela by som**.",
          },
          {
            slovak: "Mohli by ste mi pomôcť?",
            english: "Could you help me?",
            demonstrates: "Formal **vy** takes the plural **mohli**.",
          },
        ],
      },
      {
        label: "Ak, keby, aby",
        lines: [
          "Ak bude pršať, zostaneme doma. · If it rains, we'll stay at home.",
          "Keby pršalo, zostali by sme doma. · If it rained, we would stay at home.",
          "Povedz mu, aby prišiel. · Tell him to come.",
        ],
        examples: [
          {
            slovak: "Keby som mal čas, išiel by som s vami.",
            english: "If I had time, I would go with you.",
            demonstrates: "**Keby** already contains **by**: **keby som**.",
          },
        ],
      },
    ],
    contrasts: {
      label: "Real, or imagined?",
      intro:
        "**Ak** talks about something that may really happen. **Keby** and the conditional talk about something imagined, or ask politely.",
      frames: [
        {
          question: "Will it happen, or only maybe?",
          choices: [
            {
              slovak: markedText([
                { role: "contrast", text: "Ak budem mať" },
                " čas, ",
                { role: "contrast", text: "prídem" },
                ".",
              ]),
              english: "If I have time, I'll come.",
              when: "it may really happen",
              why: "**Ak** + future: real",
            },
            {
              slovak: markedText([
                { role: "contrast", text: "Keby som mal" },
                " čas, ",
                { role: "contrast", text: "prišiel by som" },
                ".",
              ]),
              english: "If I had time, I would come.",
              when: "you don't have time, but imagine",
              why: "**Keby**, **-l** form, **by**: imagined",
            },
          ],
        },
        {
          question: "Want, or would like?",
          choices: [
            {
              slovak: markedText([{ role: "contrast", text: "Chcem" }, " kávu."]),
              english: "I want a coffee.",
              when: "direct, a little blunt",
              why: "Plain present",
            },
            {
              slovak: markedText([{ role: "contrast", text: "Chcel by som" }, " kávu."]),
              english: "I'd like a coffee.",
              when: "polite",
              why: "**-l** form + **by som**",
            },
          ],
        },
        {
          question: "Can you, or could you?",
          choices: [
            {
              slovak: markedText([{ role: "contrast", text: "Môžete" }, " mi pomôcť?"]),
              english: "Can you help me?",
              when: "a plain question",
              why: "Plain present",
            },
            {
              slovak: markedText([
                { role: "contrast", text: "Mohli by ste" },
                " mi pomôcť?",
              ]),
              english: "Could you help me?",
              when: "softer, more polite",
              why: "**-li** form + **by ste**",
            },
          ],
        },
      ],
    },
    watchOut: [
      {
        wrong: "keby by som",
        right: "keby som",
        why: "**Keby** already contains **by**.",
      },
      {
        wrong: "By som chcel kávu.",
        right: "Chcel by som kávu.",
        why: "**By** never comes first.",
      },
      "Formal Slovak adds **bol** for the past: **bol by som prišiel**, “I would have come”.",
    ],
    nextSlug: "reflexive-verbs",
  },
  {
    slug: "reflexive-verbs",
    slovak: "zvratné slovesá: sa a si",
    english: "verbs with sa and si",
    category: "Verbs",
    kind: "grammar",
    summary:
      "Many verbs come with sa or si. Sa often keeps the action on the subject; si means for yourself. Some verbs always need one of them.",
    body: [
      "Some verbs always take sa or si: báť sa (be afraid), smiať sa (laugh), páčiť sa (be liked), všimnúť si (notice). Learn them with the small word.",
      "Others change meaning: umyť auto (wash the car), umyť sa (wash yourself); volať (call), volať sa (be called): Volám sa Anna.",
      "Si often means “for yourself”: Dám si kávu. Kúpil som si bicykel. It also goes with body parts: Umyl som si ruky.",
      "Sa and si stand second in the sentence, like som. In the past, ty needs both short words: Kde si sa narodil? Kúpil si si lístok?",
      "With a plural subject, sa and si can mean “each other”: Poznáme sa. Písali si.",
    ],
    examples: [
      {
        slovak: "Volám sa Peter.",
        english: "My name is Peter.",
        demonstrates:
          "**Volať sa**: to be called. Without **sa**, **volám** means “I call”.",
      },
      {
        slovak: "Dám si kávu.",
        english: "I'll have a coffee.",
        demonstrates: "**Si**: for yourself.",
      },
    ],
    related: ["bat", "smiat", "pacit", "umyt", "zobudit", "volat", "past-tense"],
    source: languageSource,
    tags: ["verbs", "reflexive", "beginner"],
    lookFor:
      "Find **sa** or **si** near the verb and look the two up together: **volať sa** is a different verb from **volať**.",
    pathGroup: "Verbs",
    order: 12,
    rule: [
      "**Sa**: the action stays with the subject (**umyť sa**, **zobudiť sa**), or the verb always needs it (**báť sa**).",
      "**Si**: for yourself or to yourself (**dám si**, **umyť si ruky**). Both take second place in the sentence.",
    ],
    pattern: {
      label: "With and without sa, si",
      lines: [
        "umyť auto · wash the car",
        "umyť sa · wash (yourself)",
        "umyť si ruky · wash your hands",
        "zobudiť dieťa · wake the child",
        "zobudiť sa · wake up",
        "volať mame · call mom",
        "volať sa · be called",
      ],
    },
    morePatterns: [
      {
        label: "Always with sa or si",
        lines: [
          "báť sa · be afraid",
          "smiať sa · laugh",
          "páčiť sa · be liked, please",
          "starať sa o · take care of",
          "všimnúť si · notice",
          "predstaviť si · imagine",
          "pamätať si · remember",
        ],
        examples: [
          {
            slovak: "Páči sa mi tvoja izba.",
            english: "I like your room.",
            demonstrates: "**Páčiť sa**: the thing you like is the subject.",
          },
          { slovak: "Predstav si, čo sa stalo!", english: "Imagine what happened!" },
          {
            slovak: "Bojím sa psov.",
            english: "I'm afraid of dogs.",
            demonstrates: "**Báť sa** + genitive: always with **sa**.",
          },
        ],
      },
      {
        label: "Sa and si in second place",
        lines: [
          "Ako sa voláš? · What's your name?",
          "Kúpil som si lístok. · I bought a ticket.",
          "Kde si sa narodil? · Where were you born?",
          "Kúpil si si lístok? · Did you buy a ticket?",
        ],
      },
    ],
    contrasts: {
      label: "Sa, si, or nothing?",
      intro:
        "The same verb can take an object, **sa**, or **si**. The small word says who the action is for.",
      frames: [
        {
          question: "The car, yourself, or your hands?",
          choices: [
            {
              slovak: markedText(["Umyl som ", { role: "contrast", text: "auto" }, "."]),
              english: "I washed the car.",
              when: "something else",
              why: "An object: **auto**",
            },
            {
              slovak: markedText(["Umyl som ", { role: "contrast", text: "sa" }, "."]),
              english: "I washed.",
              when: "yourself",
              why: "**Sa**: yourself",
            },
            {
              slovak: markedText([
                "Umyl som ",
                { role: "contrast", text: "si" },
                " ruky.",
              ]),
              english: "I washed my hands.",
              when: "a part of you",
              why: "**Si**: for yourself",
            },
          ],
        },
        {
          question: "Someone else, or you?",
          choices: [
            {
              slovak: markedText([
                "Zobudil som ",
                { role: "contrast", text: "dieťa" },
                ".",
              ]),
              english: "I woke the child.",
              when: "you woke someone else",
              why: "An object: **dieťa**",
            },
            {
              slovak: markedText(["Zobudil som ", { role: "contrast", text: "sa" }, "."]),
              english: "I woke up.",
              when: "you woke up yourself",
              why: "**Sa**: yourself",
            },
          ],
        },
        {
          question: "A phone call, or a name?",
          choices: [
            {
              slovak: markedText(["Volám ", { role: "contrast", text: "mame" }, "."]),
              english: "I'm calling mom.",
              when: "on the phone",
              why: "**Volať** + dative: **mame**",
            },
            {
              slovak: markedText(["Volám ", { role: "contrast", text: "sa" }, " Anna."]),
              english: "My name is Anna.",
              when: "your name",
              why: "**Volať sa**: to be called",
            },
          ],
        },
      ],
    },
    watchOut: [
      {
        wrong: "Volám Anna.",
        right: "Volám sa Anna.",
        why: "Your name takes **volať sa**.",
      },
      {
        wrong: "Sa volám Anna.",
        right: "Volám sa Anna.",
        why: "**Sa** never comes first.",
      },
      {
        wrong: "Kde si narodil?",
        right: "Kde si sa narodil?",
        why: "Keep both **si** and **sa**.",
      },
      {
        wrong: "Umyl som moje ruky.",
        right: "Umyl som si ruky.",
        why: "Body parts take **si**.",
      },
    ],
    nextSlug: "word-order",
  },
  {
    slug: "cases-overview",
    slovak: "prehľad pádov",
    english: "cases overview",
    aliases: ["pády", "pád"],
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
        explanation:
          "Marks company after **s** or **so** (**s priateľom**), and a tool or means on its own (**perom**, **autobusom**).",
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
    slovak: "ukazovacie zámená: ten, tento, tamten",
    english: "demonstratives: ten, tento, tamten",
    category: "Nouns",
    kind: "grammar",
    summary:
      "Ten, tento, and tamten point at people and things, and agree with their noun in gender, number, and case.",
    body: [
      "Ten (tá, to) is the everyday demonstrative. Slovak has no articles: most English “the” is simply left out, and ten points to a person or thing you both already know about. Tento (táto, toto) points at something near you; tamten (tamtá, tamto) at something over there.",
      "All three agree with their noun: ten muž, tá žena, to dievča. In the plural, only masculine nouns for people take tí; every other plural takes tie, including deti and ženy. In other cases they follow the noun: Poznám toho muža. Býva v tom dome. Idem s tou ženou.",
      "In To je… and To sú…, to stays the same whatever the noun's gender or number; only the verb changes, je for one and sú for more: To je môj brat. To sú moji rodičia.",
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
      { slovak: "Kto je ten muž?", english: "Who is that man?" },
      { slovak: "To sú moji rodičia.", english: "These are my parents." },
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
      "In **To je…** and **To sú…**, **to** stays **to** whatever the noun's gender or number; only the verb follows the noun: **To je** môj brat. **To sú** moji rodičia.",
    ],
    pattern: {
      label: "Nominative (agreement)",
      rowLabel: "Gender",
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
    },
    morePatterns: [
      {
        label: "Accusative (as the object)",
        rowLabel: "Gender",
        columns: ["the, that", "this", "that (over there)"],
        rows: [
          { label: "Masculine, a person or animal", cells: ["toho", "tohto", "tamtoho"] },
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
            demonstrates: "Accusative for a person or animal: **ten** becomes **toho**.",
          },
          {
            slovak: "Vidím ten dom.",
            english: "I see that house.",
            demonstrates: "Accusative for a thing: **ten** stays **ten**.",
          },
          { slovak: "Vidíš tamto auto?", english: "Do you see that car over there?" },
          { slovak: "Poznáš tých chlapcov?", english: "Do you know those boys?" },
          { slovak: "Kúpim si tieto topánky.", english: "I'll buy these shoes." },
          { slovak: "Dám si tento koláč.", english: "I'll have this cake." },
        ],
      },
      {
        label: "Locative (after v, na, o)",
        rowLabel: "Gender",
        columns: ["the, that", "this", "that (over there)"],
        rows: [
          { label: "Masculine and neuter", cells: ["tom", "tomto", "tamtom"] },
          { label: "Feminine", cells: ["tej", "tejto", "tamtej"] },
          { label: "Plural, every gender", cells: ["tých", "týchto", "tamtých"] },
        ],
        examples: [
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
        ],
      },
      {
        label: "Dative and instrumental",
        rowLabel: "Case and gender",
        columns: ["the, that", "this", "that (over there)"],
        rows: [
          {
            label: "Dative singular, masculine and neuter",
            cells: ["tomu", "tomuto", "tamtomu"],
          },
          { label: "Dative singular, feminine", cells: ["tej", "tejto", "tamtej"] },
          {
            label: "Instrumental singular, masculine and neuter",
            cells: ["tým", "týmto", "tamtým"],
          },
          { label: "Instrumental singular, feminine", cells: ["tou", "touto", "tamtou"] },
          { label: "Dative plural, every gender", cells: ["tým", "týmto", "tamtým"] },
          {
            label: "Instrumental plural, every gender",
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
          {
            slovak: "Pracujem s tou ženou.",
            english: "I work with that woman.",
            demonstrates:
              "After **s** (with), feminine **ten** takes the instrumental: **tou**.",
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
        body: "More than one; one is **jednotné číslo**. In the nominative, plural demonstratives split into masculine nouns for people (**tí**, **títo**) and everything else, women and children included (**tie**, **tieto**).",
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
              why: "**tá** + **-to**",
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
              why: "The base form",
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
              why: "**tam-** + **tá**",
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
              why: "**ten** + **-to**",
            },
            {
              at: "before",
              slovak: markedText([
                { role: "demonstrative", text: "Ten" },
                " víkend bol úžasný.",
              ]),
              english: "That weekend was amazing.",
              when: "one in the past",
              why: "The base form",
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
              why: "**tú** + **-to**",
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
              why: "The base form",
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
              why: "**tam-** + **tú**",
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
              why: "**tie** + **-to**",
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
              why: "The base form",
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
              why: "**tam-** + **tie**",
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
              why: "**tí** + **-to**",
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
              why: "The base form",
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
              why: "**tam-** + **tí**",
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
              why: "**toho** + **-to** → **tohto**",
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
              why: "The base form",
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
              why: "**tam-** + **toho**",
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
              why: "**tým** + **-to**",
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
              why: "The base form",
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
              why: "**tam-** + **tým**",
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
              why: "**tom** + **-to**",
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
              why: "The base form",
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
              why: "**tam-** + **tom**",
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
              why: "**tými** + **-to**",
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
              why: "The base form",
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
              why: "**tam-** + **tými**",
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
        why: "A man or an animal changes in the accusative; a thing doesn't.",
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
    slovak: "privlastňovacie zámená: môj, jeho, svoj",
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
      rowLabel: "Gender",
      columns: ["my", "your (ty)", "our", "your (vy)"],
      rows: [
        { label: "Masculine", cells: ["môj", "tvoj", "náš", "váš"] },
        { label: "Feminine", cells: ["moj[a]", "tvoj[a]", "naš[a]", "vaš[a]"] },
        { label: "Neuter", cells: ["moj[e]", "tvoj[e]", "naš[e]", "vaš[e]"] },
        {
          label: "Masculine nouns for people, plural",
          cells: ["moj[i]", "tvoj[i]", "naš[i]", "vaš[i]"],
        },
        {
          label: "Every other plural",
          cells: ["moj[e]", "tvoj[e]", "naš[e]", "vaš[e]"],
        },
      ],
    },
    morePatterns: [
      {
        label: "Môj and svoj in other cases",
        intro:
          "**Tvoj** and **svoj** take the same endings as **môj**: **svojho**, **svojmu**, **svojou**. In the accusative, a feminine noun takes **moju**, a masculine person or animal **môjho**, and masculine people in the plural **mojich**. Every other accusative looks like the nominative.",
        rowLabel: "Case",
        columns: ["Masculine and neuter", "Feminine", "Plural"],
        rows: [
          { label: "Genitive (of, from)", cells: ["môj[ho]", "moj[ej]", "moj[ich]"] },
          { label: "Dative (to)", cells: ["môj[mu]", "moj[ej]", "moj[im]"] },
          { label: "Locative (in, about)", cells: ["moj[om]", "moj[ej]", "moj[ich]"] },
          { label: "Instrumental (with)", cells: ["moj[ím]", "moj[ou]", "moj[imi]"] },
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
              "**Svojou**: the owner is **ja**, the subject. **Mojou** works too: **s mojou sestrou**.",
          },
          {
            slovak: "To je auto môjho brata.",
            english: "That is my brother's car.",
            demonstrates:
              "The owner comes after the thing, in the genitive: **môjho brata**.",
            practiceItemId: "grammar/possessive-genitive-build",
          },
        ],
      },
      {
        label: "Jeho, jej, ich never change",
        lines: [
          "[jeho] brat · his brother",
          "[jeho] sestra · his sister",
          "[jeho] auto · his car",
          "s [jeho] bratom · with his brother",
          "[jej] deti · her children",
          "[ich] dom · their house",
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
              why: "**Ty** → **tvoj**",
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
              why: "**Vy** → **váš**",
            },
          ],
        },
        {
          question: "Whose sister?",
          object: "person",
          label: { en: "accusative", sk: "akuzatív" },
          scene: "gender",
          choices: [
            {
              slovak: markedText([
                "Poznáš ",
                { role: "possessive", text: "jeho" },
                " sestr",
                { role: "ending", text: "u" },
                "?",
              ]),
              at: "his",
              english: "Do you know his sister?",
              when: "Peter's",
              why: "Owner is a man: **jeho**",
            },
            {
              slovak: markedText([
                "Poznáš ",
                { role: "possessive", text: "jej" },
                " sestr",
                { role: "ending", text: "u" },
                "?",
              ]),
              at: "hers",
              english: "Do you know her sister?",
              when: "Eva's",
              why: "Owner is a woman: **jej**",
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
              why: "Subject's own: **svoj**",
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
              why: "Someone else's: **jej**",
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
              why: "Subject's own: **svoj**",
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
              why: "Someone else's: **jeho**",
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
              why: "Subject's own: **svoj**",
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
              why: "Someone else's: **jej**",
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
        why: "**Svoj** points back to the subject, so it can't be part of the subject.",
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
      "Place known information earlier and new or emphasized information later. Put unstressed short words such as som, sa, mi, and ho in second place, after the first word or phrase: Včera som ho videl.",
    ],
    examples: [
      { slovak: "Peter číta knihu.", english: "Peter is reading a book." },
      { slovak: "Knihu číta Peter.", english: "It is Peter who is reading the book." },
    ],
    related: ["present-tense", "cases-overview", "ty-vs-vy"],
    source: languageSource,
    tags: ["sentences", "word order", "intermediate"],
    lookFor:
      "Compare what comes last. The end of the sentence carries the new or emphasized information.",
    pathGroup: "Sentence building",
    order: 4,
    rule: [
      "Slovak word order is flexible because case endings preserve grammatical roles.",
      "Neutral sentences often follow subject–verb–object; the word moved to the end receives the emphasis: **Knihu číta Peter.**",
    ],
    pattern: {
      label: "Position changes emphasis",
      lines: ["subject + verb + object → neutral", "word moved to the end → emphasis"],
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
      rowLabel: "Meaning",
      columns: ["ty · informal", "vy · formal or plural"],
      rows: [
        { label: "you are", cells: ["s[i]", "s[te]"] },
        { label: "you have", cells: ["má[š]", "má[te]"] },
        { label: "thank you", cells: ["ďakujem [ti]", "ďakujem [vám]"] },
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
              why: "**Ty**: **-š**",
            },
            {
              at: "formal",
              slovak: markedText([{ role: "contrast", text: "Máte" }, " čas?"]),
              english: "Do you have time?",
              when: "a stranger, a teacher, a colleague",
              why: "**Vy**: **-te**",
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
              why: "**Ty**: one person, **-š**",
            },
            {
              at: "group",
              slovak: markedText([{ role: "contrast", text: "Prídete" }, " zajtra?"]),
              english: "Will you come tomorrow?",
              when: "two friends at once",
              why: "**Vy**: more than one, **-te**",
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
      "Attach ne- to a finite verb: mám becomes nemám and rozumiem becomes nerozumiem. The present of byť is the exception and stays two words: nie som, nie si, nie je, nie sme, nie ste, nie sú. On its own, nie means “no.”",
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
      "Find **ne-** attached to the finite verb: **nemám**, **nerozumiem**, **neviem**. Present **byť** keeps **nie** apart: **nie je**.",
    pathGroup: "Sentence building",
    order: 6,
    rule: [
      "Form finite verb negatives with **ne-** attached to the verb. The present of **byť** is the one exception: **nie som**, **nie je**, **nie sú** stay two words.",
      "Use **nie** alone for a negative answer; do not usually say *nie mám* or *nie rozumiem*.",
    ],
    pattern: {
      label: "Ne- joins the verb, except present byť",
      lines: [
        "mám → nemám",
        "rozumiem → nerozumiem",
        "som → nie som",
        "je → nie je",
        "Nie, ďakujem. · No, thank you.",
      ],
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
      "Slovak halves and quarters look ahead to the next hour, and the verb agrees with the number.",
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
      "Hours follow 1 / 2–4 / 5+: **Je jedna hodina**, **Sú tri hodiny**, **Je päť hodín**. **Minúta** and **sekunda** follow the same pattern: **dve minúty**, **päť sekúnd**.",
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
        gloss: "half",
        body: "**Pol** names the coming hour in the genitive: **pol tretej** is halfway to three (02:30). Always **Je pol…**, never *Sú pol…*",
      },
      {
        id: "stvrt",
        term: "štvrť na",
        gloss: "quarter past",
        body: "**Štvrť na** + the next hour means quarter past the previous hour: **štvrť na tri** is 02:15. For 12:15, say **štvrť na jednu**, because **hodina** is feminine.",
      },
      {
        id: "tristvrte",
        term: "trištvrte na",
        gloss: "quarter to",
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
              why: "**O** + locative: a clock time",
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
              why: "**O** + accusative: a span",
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
      label: "Days and time",
    },
  },
];
