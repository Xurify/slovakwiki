import type {
  AnswerMistake,
  BuildExercise,
  ChoiceExercise,
  ClozeExercise,
  PracticeTask,
  FindMistakeExercise,
  TypedExercise,
} from "$lib/learning/types";
import { shuffleArray } from "$lib/learning/time/clock";
import {
  agreementHint,
  animateHint,
  caseHint,
  pluralHint,
  roleHint,
  seriesHint,
  toJeHint,
  tymHint,
} from "./hints";
import {
  CASE_FRAMES,
  CASES,
  GOES_WITH,
  NOUNS,
  SERIES_ENGLISH,
  SLOT_LABEL,
  capitalizeSlovak,
  caseFrame,
  casesOfForm,
  demonstrativeEnglish,
  demonstrativeForm,
  demonstrativePhrase,
  isPluralSlot,
  type DemonstrativeSeries,
  type GrammaticalCase,
  type NounEntry,
  type Slot,
} from "./paradigm";

type Rng = () => number;

export type DemonstrativeTaskBuilder = (kind: string, rng: Rng) => PracticeTask;

function pick<T>(items: readonly T[], rng: Rng): T {
  const item = items[Math.floor(rng() * items.length)];
  if (item === undefined) throw new Error("pick() from an empty pool");
  return item;
}

function nounsWhere(filter: (entry: NounEntry) => boolean): NounEntry[] {
  return NOUNS.filter(filter);
}

function withoutFinalPunctuation(sentence: string): string {
  return sentence.replace(/[.?!]$/, "");
}

function capitalizeEnglish(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

const GENDER_SLOTS = ["masculine-inanimate", "feminine", "neuter"] as const;
type GenderSlot = (typeof GENDER_SLOTS)[number];

/** Both masculine slots share ten in the nominative. */
function genderSlot(slot: Slot): GenderSlot {
  if (slot === "feminine" || slot === "neuter") return slot;
  return "masculine-inanimate";
}

function tenOrTento(rng: Rng): DemonstrativeSeries {
  return rng() < 0.6 ? "ten" : "tento";
}

/** “Where is this key?” makes no sense — tento asks who someone is or what something costs. */
function fitsQuestion(series: DemonstrativeSeries, entry: NounEntry): boolean {
  return series === "ten" || entry.person || entry.sold;
}

/** Who / how much / where — whichever question fits the noun. */
function nominativeQuestion(
  series: DemonstrativeSeries,
  entry: NounEntry,
  form: string,
): { english: string; slovak: string } {
  const plural = isPluralSlot(entry.slot);
  const phrase = `${form} ${entry.forms.nominative}`;
  const english = demonstrativeEnglish(series, entry);

  if (entry.person) {
    return {
      slovak: `Kto ${plural ? "sú" : "je"} ${phrase}?`,
      english: `Who ${plural ? "are" : "is"} ${english}?`,
    };
  }
  if (series === "tento" && entry.sold) {
    return {
      slovak: `Koľko ${plural ? "stoja" : "stojí"} ${phrase}?`,
      english: `How much ${plural ? "are" : "is"} ${english}?`,
    };
  }
  return {
    slovak: `Kde ${plural ? "sú" : "je"} ${phrase}?`,
    english: `Where ${plural ? "are" : "is"} ${english}?`,
  };
}

function agreementWhy(entry: NounEntry, form: string): string {
  const noun = entry.forms.nominative;
  if (entry.person && entry.slot === "neuter") {
    return `**${capitalizeSlovak(noun)}** is a person, but the noun is neuter: **${form} ${noun}**.`;
  }
  return `**${capitalizeSlovak(noun)}** is ${SLOT_LABEL[entry.slot]}, so: **${form} ${noun}**.`;
}

export function buildAgreementExercise(kind: string, rng: Rng): ChoiceExercise {
  const series = tenOrTento(rng);
  const entry = pick(
    nounsWhere(
      (candidate) => !isPluralSlot(candidate.slot) && fitsQuestion(series, candidate),
    ),
    rng,
  );
  const correct = demonstrativeForm(series, entry.slot, "nominative");
  const { english, slovak } = nominativeQuestion(series, entry, correct);

  const distractors = GENDER_SLOTS.filter((slot) => slot !== genderSlot(entry.slot)).map(
    (slot) => {
      const wrong = demonstrativeForm(series, slot, "nominative");
      return {
        id: `gender-${slot}`,
        label: nominativeQuestion(series, entry, wrong).slovak,
        whyWrong: `**${capitalizeSlovak(wrong)}** goes with ${GOES_WITH[slot]}.`,
      };
    },
  );

  return {
    id: `generated-${kind}`,
    type: "choice",
    practiceItemId: kind,
    prompt: english,
    choices: shuffleArray([{ id: "correct", label: slovak }, ...distractors], rng),
    answerId: "correct",
    hint: agreementHint,
    feedback: {
      correction: slovak,
      english,
      why: agreementWhy(entry, correct),
    },
  };
}

export function buildPluralExercise(kind: string, rng: Rng): ChoiceExercise {
  const series = tenOrTento(rng);
  const entry = pick(
    nounsWhere(
      (candidate) => isPluralSlot(candidate.slot) && fitsQuestion(series, candidate),
    ),
    rng,
  );
  const personal = entry.slot === "plural-personal";
  const noun = entry.forms.nominative;
  const correct = demonstrativeForm(series, entry.slot, "nominative");
  const otherPlural = demonstrativeForm(
    series,
    personal ? "plural" : "plural-personal",
    "nominative",
  );
  const singular = demonstrativeForm(series, "masculine-inanimate", "nominative");
  const line = (form: string) => nominativeQuestion(series, entry, form).slovak;
  const { english } = nominativeQuestion(series, entry, correct);

  let why = `Every plural except masculine nouns for people takes **${correct}**: **${correct} ${noun}**.`;
  if (personal) {
    why = `Masculine nouns for people take **${correct}** in the plural: **${correct} ${noun}**.`;
  } else if (entry.person) {
    why = `**${capitalizeSlovak(noun)}** are people, but only masculine nouns for people take **${otherPlural}**. Use **${correct} ${noun}**.`;
  }

  return {
    id: `generated-${kind}`,
    type: "choice",
    practiceItemId: kind,
    prompt: english,
    choices: shuffleArray(
      [
        { id: "correct", label: line(correct) },
        {
          id: "other-plural",
          label: line(otherPlural),
          whyWrong: personal
            ? `**${capitalizeSlovak(otherPlural)}** is for every other plural: **${otherPlural} ženy**, **${otherPlural} kľúče**.`
            : `**${capitalizeSlovak(otherPlural)}** is only for masculine nouns for people: **${otherPlural} muži**.`,
        },
        {
          id: "singular",
          label: line(singular),
          whyWrong: `**${capitalizeSlovak(singular)}** is singular — for one masculine person or thing.`,
        },
      ],
      rng,
    ),
    answerId: "correct",
    hint: pluralHint,
    feedback: { correction: line(correct), english, why },
  };
}

export function buildToJeExercise(kind: string, rng: Rng): ChoiceExercise {
  // Neuter singular is left out: its agreeing form would be to, the right answer.
  const entry = pick(
    nounsWhere((candidate) => !candidate.person && candidate.slot !== "neuter"),
    rng,
  );
  const plural = isPluralSlot(entry.slot);
  const noun = entry.forms.nominative;
  const verb = plural ? "sú" : "je";
  const correct = `To ${verb} ${noun}.`;
  const agreeing = demonstrativeForm("ten", entry.slot, "nominative");
  const english = plural ? `They're ${entry.english}.` : `It's a ${entry.english}.`;

  return {
    id: `generated-${kind}`,
    type: "choice",
    practiceItemId: kind,
    context: [
      {
        id: "demonstrative-to-je-question",
        speaker: "Anna",
        slovak: "Čo je to?",
        english: "What is that?",
      },
    ],
    prompt: english,
    choices: shuffleArray(
      [
        { id: "correct", label: correct },
        {
          id: "agreeing",
          label: `${capitalizeSlovak(agreeing)} ${verb} ${noun}.`,
          whyWrong: `**${capitalizeSlovak(agreeing)}** agrees only with a noun right after it (**${agreeing} ${noun}**). On its own, use **to**.`,
        },
        {
          id: "verb",
          label: `To ${plural ? "je" : "sú"} ${noun}.`,
          whyWrong: plural
            ? `**${capitalizeSlovak(noun)}** is plural, so the verb is **sú**. **To** stays the same.`
            : `**Sú** is plural. One ${entry.english} takes **je**.`,
        },
      ],
      rng,
    ),
    answerId: "correct",
    hint: toJeHint,
    feedback: {
      correction: correct,
      english,
      why: `On its own, **to** never changes. Only the verb changes, **je** for one and **sú** for more: **${withoutFinalPunctuation(correct)}**.`,
    },
  };
}

/** Wrong tiles for “Chcem túto tašku, nie tamtú”, each with its note. */
function thisNotThatTraps(
  entry: NounEntry,
): Array<{ near: string; far: string; why: (form: string) => string }> {
  const noun = entry.forms.accusative;
  const near = demonstrativeForm("tento", entry.slot, "accusative");
  const far = demonstrativeForm("tamten", entry.slot, "accusative");

  if (entry.slot === "feminine") {
    return [
      {
        near: demonstrativeForm("tento", "feminine", "nominative"),
        far: demonstrativeForm("tamten", "feminine", "nominative"),
        why: (form) =>
          `**${capitalizeSlovak(form)}** is the subject form. **Chcieť** takes the accusative: **${near} ${noun}**, **${far}**.`,
      },
    ];
  }
  if (isPluralSlot(entry.slot)) {
    return [
      {
        near: demonstrativeForm("tento", "plural-personal", "nominative"),
        far: demonstrativeForm("tamten", "plural-personal", "nominative"),
        why: (form) =>
          `**${capitalizeSlovak(form)}** is only for masculine nouns for people. **${capitalizeSlovak(noun)}** takes **${near}**, **${far}**.`,
      },
    ];
  }

  const wrongSlot: GenderSlot =
    entry.slot === "neuter" ? "masculine-inanimate" : "neuter";
  return [
    {
      near: demonstrativeForm("tento", wrongSlot, "accusative"),
      far: demonstrativeForm("tamten", wrongSlot, "accusative"),
      why: (form) =>
        `**${capitalizeSlovak(form)}** goes with ${GOES_WITH[wrongSlot]}. **${capitalizeSlovak(entry.forms.nominative)}** is ${SLOT_LABEL[entry.slot]}: **${near} ${noun}**.`,
    },
  ];
}

export function buildThisNotThatExercise(kind: string, rng: Rng): BuildExercise {
  const entry = pick(
    nounsWhere((candidate) => candidate.sold),
    rng,
  );
  const plural = isPluralSlot(entry.slot);
  const near = demonstrativeForm("tento", entry.slot, "accusative");
  const far = demonstrativeForm("tamten", entry.slot, "accusative");
  const answer = ["Chcem", near, `${entry.forms.accusative},`, "nie", `${far}.`];
  const english = plural
    ? `I want these ${entry.english}, not those.`
    : `I want this ${entry.english}, not that one.`;

  const traps = thisNotThatTraps(entry);
  const trapTiles = traps.flatMap((trap) => [trap.near, `${trap.far}.`]);
  const mistakes: AnswerMistake[] = traps.flatMap((trap) => [
    { wrong: trap.near, whyWrong: trap.why(trap.near) },
    { wrong: trap.far, whyWrong: trap.why(trap.far) },
  ]);

  return {
    id: `generated-${kind}`,
    type: "build",
    practiceItemId: kind,
    prompt: english,
    tiles: shuffleArray([...answer, ...trapTiles], rng),
    answer,
    mistakes,
    feedback: {
      correction: answer.join(" "),
      english,
      why: `**Tento** points at the one near you and **tamten** at the one over there. **Chcieť** takes the accusative, and both agree with **${entry.forms.accusative}**: **${near}**, **${far}**.`,
    },
  };
}

/** “genitive”, “genitive or accusative”, “genitive, accusative, or locative”. */
function caseNames(series: DemonstrativeSeries, slot: Slot, form: string): string {
  const names = casesOfForm(series, slot, form);
  if (names.length < 3) return names.join(" or ");
  return `${names.slice(0, -1).join(", ")}, or ${names.at(-1)}`;
}

export function buildCaseChoiceExercise(kind: string, rng: Rng): ChoiceExercise {
  const frame = pick(CASE_FRAMES, rng);
  const entry = pick(nounsWhere(frame.nouns), rng);
  const correct = demonstrativeForm("ten", entry.slot, frame.grammaticalCase);
  const noun = entry.forms[frame.grammaticalCase];
  const english = frame.english(demonstrativeEnglish("ten", entry));
  const thingAccusative =
    frame.grammaticalCase === "accusative" && entry.slot === "masculine-inanimate";

  const wrongForms: string[] = [];
  if (thingAccusative) {
    wrongForms.push(demonstrativeForm("ten", "masculine-animate", "accusative"));
  }
  for (const candidate of shuffleArray(CASES, rng)) {
    if (wrongForms.length >= 2) break;
    const form = demonstrativeForm("ten", entry.slot, candidate);
    if (form !== correct && !wrongForms.includes(form)) wrongForms.push(form);
  }

  const distractors = wrongForms.map((wrong, index) => ({
    id: `wrong-${index + 1}`,
    label: frame.slovak(`${wrong} ${noun}`),
    whyWrong:
      thingAccusative && index === 0
        ? `**${capitalizeSlovak(wrong)}** is for people in the accusative (**${wrong} muža**). A thing keeps **${correct}**.`
        : `**${capitalizeSlovak(wrong)}** is the ${caseNames("ten", entry.slot, wrong)} form.`,
  }));

  return {
    id: `generated-${kind}`,
    type: "choice",
    practiceItemId: kind,
    prompt: english,
    choices: shuffleArray(
      [{ id: "correct", label: frame.slovak(`${correct} ${noun}`) }, ...distractors],
      rng,
    ),
    answerId: "correct",
    hint: caseHint,
    feedback: {
      correction: frame.slovak(`${correct} ${noun}`),
      english,
      why: `${frame.because}, and the demonstrative takes the same case: **${correct} ${noun}**.`,
    },
  };
}

export function buildCaseClozeExercise(kind: string, rng: Rng): ClozeExercise {
  const series = tenOrTento(rng);
  const frame = pick(CASE_FRAMES, rng);
  const entry = pick(nounsWhere(frame.nouns), rng);
  const answer = demonstrativeForm(series, entry.slot, frame.grammaticalCase);
  const noun = entry.forms[frame.grammaticalCase];
  const english = frame.english(demonstrativeEnglish(series, entry));
  const gloss = SERIES_ENGLISH[series][isPluralSlot(entry.slot) ? "plural" : "singular"];
  const czechNote = answer === "tohto" ? " Not **tohoto** — that is Czech." : "";

  return {
    id: `generated-${kind}`,
    type: "cloze",
    practiceItemId: kind,
    prompt: `Fill the gap with “${gloss}” (${series}).`,
    frame: frame.slovak(`{} ${noun}`),
    answer,
    gapEn: gloss,
    sentenceEn: english,
    morphHint: `${series} → ${answer}`,
    hint: {
      chip: `${capitalizeSlovak(frame.grammaticalCase)} case`,
      grammarTopicId: "demonstratives",
      note: `${frame.because}. The demonstrative takes the same case and gender as **${noun}**.`,
      reveal: [
        `The dictionary form is ${series}.`,
        `${capitalizeSlovak(entry.forms.nominative)} is ${SLOT_LABEL[entry.slot]}.`,
        `${answer.slice(0, 2)} …`,
      ],
    },
    feedback: {
      correction: frame.slovak(`${answer} ${noun}`),
      english,
      why: `${frame.because}: **${answer} ${noun}**.${czechNote}`,
    },
  };
}

export function buildAnimateAccusativeExercise(kind: string, rng: Rng): ChoiceExercise {
  const series = tenOrTento(rng);
  const roll = rng();
  const slot: Slot =
    roll < 0.25
      ? "plural-personal"
      : roll < 0.625
        ? "masculine-animate"
        : "masculine-inanimate";
  const entry = pick(
    nounsWhere((candidate) => candidate.slot === slot),
    rng,
  );
  const person = entry.person;
  const { accusative, genitive, nominative } = entry.forms;
  const subjectForm = demonstrativeForm(series, slot, "nominative");
  const objectForm = demonstrativeForm(series, slot, "accusative");
  const line = (phrase: string) => (person ? `Poznáš ${phrase}?` : `Vidíš ${phrase}?`);
  const english = person
    ? `Do you know ${demonstrativeEnglish(series, entry)}?`
    : `Do you see ${demonstrativeEnglish(series, entry)}?`;
  const correct = line(`${objectForm} ${accusative}`);

  let distractors: Array<{ id: string; label: string; whyWrong: string }>;
  let why: string;

  if (slot === "masculine-inanimate") {
    const animateForm = demonstrativeForm(series, "masculine-animate", "accusative");
    distractors = [
      {
        id: "animate",
        label: line(`${animateForm} ${nominative}`),
        whyWrong: `**${capitalizeSlovak(animateForm)}** is for people in the accusative (**${animateForm} muža**). **${capitalizeSlovak(nominative)}** is a thing, so it keeps **${objectForm}**.`,
      },
      {
        id: "genitive",
        label: line(`${animateForm} ${genitive}`),
        whyWrong: `**${capitalizeSlovak(animateForm)} ${genitive}** is the genitive. **Vidieť** takes the accusative: **${objectForm} ${accusative}**.`,
      },
    ];
    why = `Masculine things keep the basic form in the accusative: **${objectForm} ${accusative}**.`;
  } else if (slot === "masculine-animate") {
    distractors = [
      {
        id: "half",
        label: line(`${subjectForm} ${accusative}`),
        whyWrong: `**${capitalizeSlovak(accusative)}** is already accusative, so **${subjectForm}** has to change with it: **${objectForm} ${accusative}**.`,
      },
      {
        id: "nominative",
        label: line(`${subjectForm} ${nominative}`),
        whyWrong: `**${capitalizeSlovak(subjectForm)} ${nominative}** is the subject form. **Poznať** takes the accusative.`,
      },
    ];
    why = `Masculine nouns for people change in the accusative, and **${subjectForm}** changes with them: **${objectForm} ${accusative}**.`;
  } else {
    const thingForm = demonstrativeForm(series, "plural", "accusative");
    distractors = [
      {
        id: "things",
        label: line(`${thingForm} ${accusative}`),
        whyWrong: `**${capitalizeSlovak(thingForm)}** is the accusative for every other plural (**${thingForm} kľúče**). Masculine nouns for people take **${objectForm}**.`,
      },
      {
        id: "nominative",
        label: line(`${subjectForm} ${nominative}`),
        whyWrong: `**${capitalizeSlovak(subjectForm)} ${nominative}** is the subject form. **Poznať** takes the accusative.`,
      },
    ];
    why = `Masculine nouns for people take **${objectForm}** in the accusative plural: **${objectForm} ${accusative}**.`;
  }

  return {
    id: `generated-${kind}`,
    type: "choice",
    practiceItemId: kind,
    prompt: english,
    choices: shuffleArray([{ id: "correct", label: correct }, ...distractors], rng),
    answerId: "correct",
    hint: animateHint,
    feedback: { correction: correct, english, why },
  };
}

interface RepairItem {
  acceptedAnswers?: string[];
  answer: string;
  broken: string;
  english: string;
  mistakes: AnswerMistake[];
  why: string;
}

const REPAIR_ITEMS: readonly RepairItem[] = [
  {
    broken: "Tá dievča je moja sestra.",
    answer: "To dievča je moja sestra.",
    english: "That girl is my sister.",
    mistakes: [
      {
        wrong: "tá",
        whyWrong: "**Tá** goes with feminine nouns. **Dievča** is neuter: **to dievča**.",
      },
      {
        wrong: "ten",
        whyWrong:
          "**Ten** goes with masculine nouns. **Dievča** is neuter: **to dievča**.",
      },
    ],
    why: "**Dievča** means a girl, but the noun is neuter: **to dievča**.",
  },
  {
    broken: "Tí deti sa hrajú vonku.",
    answer: "Tie deti sa hrajú vonku.",
    english: "Those children are playing outside.",
    mistakes: [
      {
        wrong: "tí",
        whyWrong:
          "**Tí** is only for masculine nouns for people. **Deti** takes **tie**.",
      },
    ],
    why: "Only masculine nouns for people take **tí**. **Deti** are people, but the noun isn't masculine: **tie deti**.",
  },
  {
    broken: "Poznáš ten muža?",
    answer: "Poznáš toho muža?",
    english: "Do you know that man?",
    mistakes: [
      {
        wrong: "ten",
        whyWrong:
          "**Ten** is the subject form. With **muža** in the accusative, use **toho**.",
      },
    ],
    why: "**Poznať** takes the accusative. Masculine nouns for people change, and so does **ten**: **toho muža**.",
  },
  {
    broken: "Vidíš toho dom?",
    answer: "Vidíš ten dom?",
    english: "Do you see that house?",
    mistakes: [
      {
        wrong: "toho",
        whyWrong:
          "**Toho** is for people in the accusative. **Dom** is a thing, so it keeps **ten**.",
      },
      {
        wrong: "domu",
        whyWrong:
          "**Domu** is the genitive. **Vidieť** takes the accusative: **ten dom**.",
      },
    ],
    why: "Masculine things keep the basic form in the accusative: **ten dom**.",
  },
  {
    broken: "Koľko stoja tyto knihy?",
    answer: "Koľko stoja tieto knihy?",
    acceptedAnswers: ["Koľko stoja tie knihy?"],
    english: "How much are these books?",
    mistakes: [
      { wrong: "tyto", whyWrong: "**Tyto** is Czech. Slovak says **tieto**." },
      {
        wrong: "títo",
        whyWrong:
          "**Títo** is only for masculine nouns for people. **Knihy** takes **tieto**.",
      },
    ],
    why: "**Tyto** is Czech. Slovak plurals other than masculine nouns for people take **tieto**: **tieto knihy**.",
  },
  {
    broken: "Poznáš tohoto muža?",
    answer: "Poznáš tohto muža?",
    acceptedAnswers: ["Poznáš toho muža?"],
    english: "Do you know this man?",
    mistakes: [
      {
        wrong: "tohoto",
        whyWrong: "**Tohoto** is Czech. Slovak drops the middle **o**: **tohto**.",
      },
    ],
    why: "**Tento** adds **-to** to **toho** and drops one **o**: **tohto muža**.",
  },
  {
    broken: "Anna ide do kina s tým ženou.",
    answer: "Anna ide do kina s tou ženou.",
    english: "Anna is going to the cinema with that woman.",
    mistakes: [
      {
        wrong: "tým",
        whyWrong:
          "**Tým** is masculine or neuter (**s tým mužom**). **Žena** is feminine: **s tou ženou**.",
      },
      {
        wrong: "tú",
        whyWrong:
          "**Tú** is the accusative. **S** takes the instrumental: **s tou ženou**.",
      },
    ],
    why: "**S** takes the instrumental, and its feminine form is **tou**: **s tou ženou**.",
  },
];

export function buildRepairExercise(kind: string, rng: Rng): TypedExercise {
  const item = pick(REPAIR_ITEMS, rng);

  return {
    id: `generated-${kind}`,
    type: "typed",
    task: "repair",
    practiceItemId: kind,
    context: [
      {
        id: "demonstrative-repair-line",
        speaker: "Sentence",
        slovak: item.broken,
        english: item.english,
      },
    ],
    prompt: "Repair this sentence.",
    inputLabel: "Correct Slovak sentence",
    answer: item.answer,
    acceptedAnswers: item.acceptedAnswers,
    mistakes: item.mistakes,
    feedback: {
      correction: item.answer,
      english: item.english,
      why: item.why,
    },
  };
}

export function buildTymTymiExercise(kind: string, rng: Rng): ChoiceExercise {
  const series: DemonstrativeSeries = rng() < 0.7 ? "ten" : "tento";
  const instrumental = rng() < 0.5;
  const frame = caseFrame(instrumental ? "instrumental" : "dative");
  const entry = pick(
    nounsWhere((candidate) => candidate.person && isPluralSlot(candidate.slot)),
    rng,
  );
  const noun = entry.forms[frame.grammaticalCase];
  const correct = demonstrativeForm(series, entry.slot, frame.grammaticalCase);
  const lengthTrap = demonstrativeForm(
    series,
    entry.slot,
    instrumental ? "dative" : "instrumental",
  );
  const caseTrap = demonstrativeForm(series, entry.slot, "genitive");
  const english = frame.english(demonstrativeEnglish(series, entry));
  const singularInstrumental = demonstrativeForm(
    series,
    "masculine-animate",
    "instrumental",
  );

  return {
    id: `generated-${kind}`,
    type: "choice",
    practiceItemId: kind,
    prompt: english,
    choices: shuffleArray(
      [
        { id: "correct", label: frame.slovak(`${correct} ${noun}`) },
        {
          id: "length",
          label: frame.slovak(`${lengthTrap} ${noun}`),
          whyWrong: instrumental
            ? `**${capitalizeSlovak(lengthTrap)}** is instrumental singular (**s ${singularInstrumental} chlapcom**) or dative plural (**${lengthTrap} deťom**).`
            : `**${capitalizeSlovak(lengthTrap)}** is instrumental plural: **s ${lengthTrap} ${entry.forms.instrumental}**.`,
        },
        {
          id: "case",
          label: frame.slovak(`${caseTrap} ${noun}`),
          whyWrong: `**${capitalizeSlovak(caseTrap)}** is the ${caseNames(series, entry.slot, caseTrap)} plural.`,
        },
      ],
      rng,
    ),
    answerId: "correct",
    hint: tymHint,
    feedback: {
      correction: frame.slovak(`${correct} ${noun}`),
      english,
      why: instrumental
        ? `Instrumental plural ends in **-mi**, on the demonstrative too: **s ${correct} ${noun}**.`
        : `Dative plural is **${correct}**, the same form as instrumental singular: **${correct} ${noun}**.`,
    },
  };
}

export function buildTypedExercise(kind: string, rng: Rng): TypedExercise {
  const entry = pick(
    nounsWhere((candidate) => candidate.sold),
    rng,
  );
  const plural = isPluralSlot(entry.slot);
  const noun = entry.forms.nominative;
  const verb = plural ? "stoja" : "stojí";
  const near = demonstrativeForm("tento", entry.slot, "nominative");
  const plain = demonstrativeForm("ten", entry.slot, "nominative");
  const answer = `Koľko ${verb} ${near} ${noun}?`;
  const english = `How much ${plural ? "are" : "is"} ${demonstrativeEnglish("tento", entry)}?`;

  const wrongSlots: Slot[] = plural
    ? ["plural-personal", "masculine-inanimate"]
    : GENDER_SLOTS.filter((slot) => slot !== genderSlot(entry.slot));
  const mistakes: AnswerMistake[] = wrongSlots.map((slot) => {
    const wrong = demonstrativeForm("tento", slot, "nominative");
    return {
      wrong,
      whyWrong: `**${capitalizeSlovak(wrong)}** goes with ${GOES_WITH[slot]}. **${capitalizeSlovak(noun)}** takes **${near}**.`,
    };
  });
  mistakes.push(
    plural
      ? {
          wrong: "stojí",
          whyWrong: `**Stojí** is singular. **${capitalizeSlovak(noun)}** is plural: **stoja**.`,
        }
      : {
          wrong: "stoja",
          whyWrong: `**Stoja** is plural. One ${entry.english}: **stojí**.`,
        },
  );

  return {
    id: `generated-${kind}`,
    type: "typed",
    task: "complete",
    practiceItemId: kind,
    prompt: english,
    inputLabel: "Your Slovak answer",
    answer,
    acceptedAnswers: [`Koľko ${verb} ${plain} ${noun}?`],
    mistakes,
    feedback: {
      correction: answer,
      english,
      why: plural
        ? `Plurals other than masculine nouns for people take **${near}**: **${near} ${noun}**.`
        : `**${capitalizeSlovak(noun)}** is ${SLOT_LABEL[entry.slot]}, so: **${near} ${noun}**.`,
    },
  };
}

const ROLE_VERBS = [
  { first: "Poznám", third: "pozná", english: "I know", thirdEnglish: "knows" },
  {
    first: "Hľadám",
    third: "hľadá",
    english: "I'm looking for",
    thirdEnglish: "is looking for",
  },
] as const;

export function buildRoleOddOneOutExercise(kind: string, rng: Rng): ChoiceExercise {
  const entry = pick(
    nounsWhere(
      (candidate) =>
        candidate.person &&
        (candidate.slot === "masculine-animate" || candidate.slot === "feminine"),
    ),
    rng,
  );
  const verb = pick(ROLE_VERBS, rng);
  const object = demonstrativePhrase("ten", entry, "accusative");
  const subject = demonstrativePhrase("ten", entry, "nominative");
  const thatPerson = demonstrativeEnglish("ten", entry);
  const english = `${verb.english} ${thatPerson}.`;

  const plain = `${verb.first} ${object}.`;
  const fronted = `${capitalizeSlovak(object)} ${verb.first.toLocaleLowerCase("sk-SK")}.`;
  const trap = `${capitalizeSlovak(subject)} ma ${verb.third}.`;
  const trapEnglish = `${capitalizeEnglish(thatPerson)} ${verb.thirdEnglish} me`;

  return {
    id: `generated-${kind}`,
    type: "choice",
    practiceItemId: kind,
    choiceMode: "pickTrap",
    prompt: `Which sentence does not mean “${withoutFinalPunctuation(english)}”?`,
    choices: shuffleArray(
      [
        {
          id: "plain",
          label: plain,
          fits: true,
          whyWrong: `**${withoutFinalPunctuation(plain)}** fits — **${object}** is in the accusative, so it is the person you mean.`,
        },
        {
          id: "fronted",
          label: fronted,
          fits: true,
          whyWrong: `**${withoutFinalPunctuation(fronted)}** fits — the word order moved, but **${object}** is still the accusative.`,
        },
        {
          id: "trap",
          label: trap,
          whyWrong: `**${withoutFinalPunctuation(trap)}** means “${trapEnglish}” — **${subject}** is the subject.`,
        },
      ],
      rng,
    ),
    answerId: "trap",
    hint: roleHint,
    feedback: {
      correction: trap,
      english: `${trapEnglish}.`,
      why: `**${capitalizeSlovak(subject)}** is the subject form, so the sentence turns around: “${trapEnglish}”. The person you mean takes the accusative: **${object}**.`,
    },
  };
}

export function buildTentoTamtenExercise(kind: string, rng: Rng): ChoiceExercise {
  const entry = pick(
    nounsWhere((candidate) => candidate.sold),
    rng,
  );
  const near = rng() < 0.5;
  const series: DemonstrativeSeries = near ? "tento" : "tamten";
  const otherSeries: DemonstrativeSeries = near ? "tamten" : "tento";
  const noun = entry.forms.accusative;
  const correct = demonstrativeForm(series, entry.slot, "accusative");
  const other = demonstrativeForm(otherSeries, entry.slot, "accusative");
  const line = (form: string) => `Chcem ${form} ${noun}.`;
  const english = `I want ${demonstrativeEnglish(series, entry)}.`;

  let agreementTrap: { form: string; whyWrong: string };
  if (entry.slot === "feminine") {
    const form = demonstrativeForm(series, "feminine", "nominative");
    agreementTrap = {
      form,
      whyWrong: `**${capitalizeSlovak(form)}** is the subject form. **Chcieť** takes the accusative: **${correct} ${noun}**.`,
    };
  } else if (isPluralSlot(entry.slot)) {
    const form = demonstrativeForm(series, "plural-personal", "nominative");
    agreementTrap = {
      form,
      whyWrong: `**${capitalizeSlovak(form)}** is only for masculine nouns for people.`,
    };
  } else {
    const wrongSlot: GenderSlot =
      entry.slot === "neuter" ? "masculine-inanimate" : "neuter";
    const form = demonstrativeForm(series, wrongSlot, "accusative");
    agreementTrap = {
      form,
      whyWrong: `**${capitalizeSlovak(form)}** goes with ${GOES_WITH[wrongSlot]}.`,
    };
  }

  return {
    id: `generated-${kind}`,
    type: "choice",
    practiceItemId: kind,
    prompt: english,
    choices: shuffleArray(
      [
        { id: "correct", label: line(correct) },
        {
          id: "distance",
          label: line(other),
          whyWrong: near
            ? `**${capitalizeSlovak(other)}** points at something over there, not the one near you.`
            : `**${capitalizeSlovak(other)}** is this one, near you.`,
        },
        {
          id: "agreement",
          label: line(agreementTrap.form),
          whyWrong: agreementTrap.whyWrong,
        },
      ],
      rng,
    ),
    answerId: "correct",
    hint: seriesHint,
    feedback: {
      correction: line(correct),
      english,
      why: near
        ? `**Tento** points at the one near you, and it agrees with **${noun}**: **${correct} ${noun}**.`
        : `**Tamten** points at the one over there, and it agrees with **${noun}**: **${correct} ${noun}**.`,
    },
  };
}

const SHARE_WITHOUT_MISTAKE = 0.25;

const DEMONSTRATIVE_PLACEHOLDER = "\u0000";

const SINGULAR_SLOTS: readonly Slot[] = [
  "masculine-animate",
  "masculine-inanimate",
  "feminine",
  "neuter",
];
const PLURAL_SLOTS: readonly Slot[] = ["plural-personal", "plural"];

interface MistakeSentence {
  english: string;
  grammaticalCase: GrammaticalCase;
  whyRightForm: (form: string) => string;
  words: string[];
}

function mistakeSentence(
  series: DemonstrativeSeries,
  entry: NounEntry,
  rng: Rng,
): MistakeSentence {
  const frames = CASE_FRAMES.filter((frame) => frame.nouns(entry));
  const asQuestion = !frames.length || (fitsQuestion(series, entry) && rng() < 0.35);

  if (asQuestion) {
    const { english, slovak } = nominativeQuestion(
      series,
      entry,
      DEMONSTRATIVE_PLACEHOLDER,
    );
    return {
      english,
      grammaticalCase: "nominative",
      whyRightForm: (form) => agreementWhy(entry, form),
      words: slovak.split(" "),
    };
  }

  const frame = pick(frames, rng);
  const noun = entry.forms[frame.grammaticalCase];
  return {
    english: frame.english(demonstrativeEnglish(series, entry)),
    grammaticalCase: frame.grammaticalCase,
    whyRightForm: (form) =>
      `${frame.because}, and the demonstrative takes the same case: **${form} ${noun}**.`,
    words: frame.slovak(`${DEMONSTRATIVE_PLACEHOLDER} ${noun}`).split(" "),
  };
}

function sameNumberSlots(slot: Slot): readonly Slot[] {
  return isPluralSlot(slot) ? PLURAL_SLOTS : SINGULAR_SLOTS;
}

function plausibleWrongForms(
  series: DemonstrativeSeries,
  entry: NounEntry,
  grammaticalCase: GrammaticalCase,
): string[] {
  const correct = demonstrativeForm(series, entry.slot, grammaticalCase);
  const otherGenderForms = sameNumberSlots(entry.slot).map((slot) =>
    demonstrativeForm(series, slot, grammaticalCase),
  );
  const otherCaseForms = CASES.map((other) =>
    demonstrativeForm(series, entry.slot, other),
  );
  const isQuestion = grammaticalCase === "nominative";
  const forms = isQuestion ? otherGenderForms : [...otherGenderForms, ...otherCaseForms];
  return [...new Set(forms)].filter((form) => form !== correct);
}

const GENDER_SERVED_BY_FORM: Record<Slot, string> = {
  "masculine-animate": "masculine",
  "masculine-inanimate": "masculine",
  feminine: "feminine",
  neuter: "neuter",
  "plural-personal": "for masculine people in the plural",
  plural: "for plurals other than masculine people",
};

function gendersUsingForm(
  series: DemonstrativeSeries,
  entry: NounEntry,
  grammaticalCase: GrammaticalCase,
  form: string,
): string {
  const labels = sameNumberSlots(entry.slot)
    .filter((slot) => demonstrativeForm(series, slot, grammaticalCase) === form)
    .map((slot) => GENDER_SERVED_BY_FORM[slot]);
  return [...new Set(labels)].join(" or ");
}

function whyFormIsWrong(
  series: DemonstrativeSeries,
  entry: NounEntry,
  grammaticalCase: GrammaticalCase,
  wrong: string,
): string {
  const correct = demonstrativeForm(series, entry.slot, grammaticalCase);
  const Wrong = capitalizeSlovak(wrong);

  if (grammaticalCase === "accusative" && entry.slot === "masculine-inanimate") {
    if (wrong === demonstrativeForm(series, "masculine-animate", "accusative")) {
      return `**${Wrong}** is for people in the accusative (**${wrong} muža**). A thing keeps **${correct}**.`;
    }
  }
  if (grammaticalCase === "accusative" && entry.slot === "masculine-animate") {
    if (wrong === demonstrativeForm(series, "masculine-inanimate", "accusative")) {
      return `**${Wrong}** is the accusative for things. A person takes **${correct}**.`;
    }
  }
  if (casesOfForm(series, entry.slot, wrong).length) {
    return `**${Wrong}** is the ${caseNames(series, entry.slot, wrong)} form.`;
  }

  const gender = gendersUsingForm(series, entry, grammaticalCase, wrong);
  if (grammaticalCase === "nominative") return `**${Wrong}** is ${gender}.`;
  return `**${Wrong}** is ${gender}, but **${entry.forms.nominative}** is ${SLOT_LABEL[entry.slot]}.`;
}

export function buildFindMistakeExercise(kind: string, rng: Rng): FindMistakeExercise {
  const series = tenOrTento(rng);
  const entry = pick(NOUNS, rng);
  const sentence = mistakeSentence(series, entry, rng);
  const correct = demonstrativeForm(series, entry.slot, sentence.grammaticalCase);
  const demonstrativeIndex = sentence.words.findIndex((word) =>
    word.startsWith(DEMONSTRATIVE_PLACEHOLDER),
  );
  const fill = (form: string) =>
    sentence.words.map((word) => word.replace(DEMONSTRATIVE_PLACEHOLDER, form));
  const correction = fill(correct).join(" ");
  const whyRight = sentence.whyRightForm(correct);
  const nominativeHint = isPluralSlot(entry.slot) ? pluralHint : agreementHint;
  const hint = sentence.grammaticalCase === "nominative" ? nominativeHint : caseHint;
  const base = {
    id: `generated-${kind}`,
    type: "findMistake" as const,
    practiceItemId: kind,
    prompt: sentence.english,
    hint,
  };

  if (rng() < SHARE_WITHOUT_MISTAKE) {
    return {
      ...base,
      words: fill(correct),
      wrongWordIndex: null,
      answer: "",
      feedback: { correction, english: sentence.english, why: whyRight },
    };
  }

  const wrong = pick(plausibleWrongForms(series, entry, sentence.grammaticalCase), rng);
  return {
    ...base,
    words: fill(wrong),
    wrongWordIndex: demonstrativeIndex,
    answer: correct,
    feedback: {
      correction,
      english: sentence.english,
      why: `${whyFormIsWrong(series, entry, sentence.grammaticalCase, wrong)} ${whyRight}`,
    },
  };
}
