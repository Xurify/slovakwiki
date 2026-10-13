import type {
  BuildExercise,
  ChoiceExercise,
  ClozeExercise,
  PracticeTask,
  TypedExercise,
} from "$lib/learning/types";
import { shuffleArray } from "$lib/learning/time/clock";
import {
  agreementHint,
  bodyPartHint,
  caseHint,
  fixedOwnerHint,
  instrumentalDativeHint,
  nameOwnerHint,
  svojHint,
  whoseHint,
} from "./hints";
import {
  CASE_FRAMES,
  CASES,
  DECLINABLE_NAMED_OWNERS,
  FIXED_OWNERS,
  NAME_OWNERS,
  NOUNS,
  OWNER_ENGLISH,
  SLOT_LABEL,
  capitalizeSlovak,
  caseFrame,
  isPluralSlot,
  nameOwnerForm,
  ownedEnglish,
  ownedSlovak,
  ownerLemma,
  pluralizeThisIs,
  possessiveEnglish,
  possessiveForm,
  prepositionalPronoun,
  whoseForm,
  withPreposition,
  type CaseFrame,
  type FixedOwnerId,
  type GrammaticalCase,
  type NameOwnerSlot,
  type NamedOwnerId,
  type NounEntry,
  type OwnerId,
  type Slot,
} from "./paradigm";

type Rng = () => number;

export type PossessiveTaskBuilder = (kind: string, rng: Rng) => PracticeTask;

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

function frameSentence(
  frame: CaseFrame,
  possessive: string,
  entry: NounEntry,
  subject = "Anna",
): string {
  const owned = `${possessive} ${entry.forms[frame.grammaticalCase]}`;
  return frame.slovak(owned, isPluralSlot(entry.slot)).replace(/^Anna\b/, subject);
}

function frameEnglish(frame: CaseFrame, owned: string, subject = "Anna"): string {
  return frame.english(owned).replace(/^Anna\b/, subject);
}

const GENDER_SLOTS = ["masculine-inanimate", "feminine", "neuter"] as const;
type GenderSlot = (typeof GENDER_SLOTS)[number];

/** Nominative gender for “wrong gender” distractors — both masculine slots share môj. */
function genderSlot(slot: Slot): GenderSlot {
  if (slot === "feminine" || slot === "neuter") return slot;
  return "masculine-inanimate";
}

function frameNouns(frame: CaseFrame): NounEntry[] {
  return nounsWhere((candidate) => !frame.people || candidate.person);
}

export function buildAgreementExercise(kind: string, rng: Rng): ChoiceExercise {
  const owner = pick(DECLINABLE_NAMED_OWNERS, rng);
  const entry = pick(
    nounsWhere((candidate) => !isPluralSlot(candidate.slot)),
    rng,
  );
  const correct = possessiveForm(owner, entry.slot, "nominative");
  const line = (form: string) => `To je ${form} ${entry.forms.nominative}.`;
  const english = `This is ${ownedEnglish(OWNER_ENGLISH[owner], entry)}.`;
  const noun = capitalizeSlovak(entry.forms.nominative);

  const distractors = GENDER_SLOTS.filter((slot) => slot !== genderSlot(entry.slot)).map(
    (slot, index) => {
      const wrong = possessiveForm(owner, slot, "nominative");
      return {
        id: `wrong-${index + 1}`,
        label: line(wrong),
        whyWrong: `**${capitalizeSlovak(wrong)}** goes with ${SLOT_LABEL[slot]} nouns.`,
      };
    },
  );

  return {
    id: `generated-${kind}`,
    type: "choice",
    practiceItemId: kind,
    prompt: english,
    choices: shuffleArray([{ id: "correct", label: line(correct) }, ...distractors], rng),
    answerId: "correct",
    hint: agreementHint,
    feedback: {
      correction: line(correct),
      english,
      why: `The possessive takes the gender of the thing owned. **${noun}** is ${SLOT_LABEL[entry.slot]}: **${correct} ${entry.forms.nominative}**.`,
    },
  };
}

export function buildPluralExercise(kind: string, rng: Rng): ChoiceExercise {
  const owner = pick(DECLINABLE_NAMED_OWNERS, rng);
  const entry = pick(
    nounsWhere((candidate) => isPluralSlot(candidate.slot)),
    rng,
  );
  const people = entry.slot === "plural-personal";
  const correct = possessiveForm(owner, entry.slot, "nominative");
  const otherPlural = possessiveForm(
    owner,
    people ? "plural" : "plural-personal",
    "nominative",
  );
  const singular = possessiveForm(owner, "masculine-inanimate", "nominative");
  const line = (form: string) => `To sú ${form} ${entry.forms.nominative}.`;
  const english = `These are ${ownedEnglish(OWNER_ENGLISH[owner], entry)}.`;

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
          whyWrong: people
            ? `**${capitalizeSlovak(otherPlural)}** is for every other plural: **${otherPlural} sestry**, **${otherPlural} kľúče**.`
            : `**${capitalizeSlovak(otherPlural)}** is only for masculine nouns that name people: **${otherPlural} priatelia**.`,
        },
        {
          id: "singular",
          label: line(singular),
          whyWrong: `**${capitalizeSlovak(singular)}** is singular — for one thing or person.`,
        },
      ],
      rng,
    ),
    answerId: "correct",
    hint: agreementHint,
    feedback: {
      correction: line(correct),
      english,
      why: people
        ? `Masculine nouns for people take **-i** in the plural: **${correct} ${entry.forms.nominative}**.`
        : `Every plural except masculine nouns for people takes **-e**: **${correct} ${entry.forms.nominative}**.`,
    },
  };
}

export function buildFormalExercise(kind: string, rng: Rng): ChoiceExercise {
  const formal = rng() < 0.5;
  const owner = formal ? "your-vy" : "your-ty";
  const other = formal ? "your-ty" : "your-vy";
  const entry = pick(
    nounsWhere((candidate) => !candidate.person && !isPluralSlot(candidate.slot)),
    rng,
  );
  const correct = possessiveForm(owner, entry.slot, "nominative");
  const wrongRegister = possessiveForm(other, entry.slot, "nominative");
  const wrongGenderSlot = pick(
    GENDER_SLOTS.filter((slot) => slot !== genderSlot(entry.slot)),
    rng,
  );
  const wrongGender = possessiveForm(owner, wrongGenderSlot, "nominative");
  const line = (form: string) => `Je to ${form} ${entry.forms.nominative}?`;
  const english = `Is this your ${entry.english}? (${formal ? "formal" : "informal"})`;

  return {
    id: `generated-${kind}`,
    type: "choice",
    practiceItemId: kind,
    prompt: english,
    choices: shuffleArray(
      [
        { id: "correct", label: line(correct) },
        {
          id: "register",
          label: line(wrongRegister),
          whyWrong: formal
            ? `**${capitalizeSlovak(wrongRegister)}** is informal (ty).`
            : `**${capitalizeSlovak(wrongRegister)}** is formal or plural (vy).`,
        },
        {
          id: "gender",
          label: line(wrongGender),
          whyWrong: `**${capitalizeSlovak(wrongGender)}** goes with ${SLOT_LABEL[wrongGenderSlot]} nouns.`,
        },
      ],
      rng,
    ),
    answerId: "correct",
    hint: agreementHint,
    feedback: {
      correction: line(correct),
      english: `Is this your ${entry.english}?`,
      why: formal
        ? `**Váš** is formal or plural you, and it agrees with the noun: **${correct} ${entry.forms.nominative}**.`
        : `**Tvoj** is informal you, and it agrees with the noun: **${correct} ${entry.forms.nominative}**.`,
    },
  };
}

/** A subject that can never own the noun, so jeho/jej/ich cannot be confused with svoj. */
function nonOwnerSubject(owner: FixedOwnerId): string {
  return owner === "her" ? "Tom" : "Anna";
}

export function buildThirdPersonExercise(kind: string, rng: Rng): ChoiceExercise {
  const owner = pick(FIXED_OWNERS, rng);
  const frame = pick(CASE_FRAMES, rng);
  const entry = pick(frameNouns(frame), rng);
  const subject = nonOwnerSubject(owner);
  const form = possessiveForm(owner, entry.slot, frame.grammaticalCase);
  const english = pluralizeThisIs(
    frameEnglish(frame, ownedEnglish(OWNER_ENGLISH[owner], entry), subject),
    isPluralSlot(entry.slot) && frame.grammaticalCase === "nominative",
  );
  const correction = frameSentence(frame, form, entry, subject);

  const distractors = FIXED_OWNERS.filter((candidate) => candidate !== owner).map(
    (wrong) => {
      const wrongForm = possessiveForm(wrong, entry.slot, frame.grammaticalCase);
      return {
        id: `owner-${wrong}`,
        label: frameSentence(frame, wrongForm, entry, subject),
        whyWrong: `**${capitalizeSlovak(wrongForm)}** means “${OWNER_ENGLISH[wrong]}”.`,
      };
    },
  );

  return {
    id: `generated-${kind}`,
    type: "choice",
    practiceItemId: kind,
    prompt: english,
    choices: shuffleArray([{ id: "correct", label: correction }, ...distractors], rng),
    answerId: "correct",
    hint: fixedOwnerHint,
    feedback: {
      correction,
      english,
      why: `**${capitalizeSlovak(form)}** never changes — it follows the owner, not the noun: **${form} ${entry.forms[frame.grammaticalCase]}**.`,
    },
  };
}

const PRONOUN_ENGLISH: Record<FixedOwnerId, string> = {
  his: "him",
  her: "her",
  their: "them",
};

export function buildJehoPrepositionExercise(kind: string, rng: Rng): ChoiceExercise {
  const owner = pick(FIXED_OWNERS, rng);
  const subject = nonOwnerSubject(owner);
  const grammaticalCase: "instrumental" | "locative" =
    rng() < 0.5 ? "instrumental" : "locative";
  const instrumental = grammaticalCase === "instrumental";
  const entry = pick(
    nounsWhere((candidate) => !instrumental || candidate.person),
    rng,
  );
  const fixed = possessiveForm(owner, entry.slot, grammaticalCase);
  const nounForm = entry.forms[grammaticalCase];
  const preposition = instrumental ? "s" : "o";
  const verb = instrumental ? "ide do kina" : "hovorí";

  const phrase = (word: string) => withPreposition(preposition, `${word} ${nounForm}`);
  const line = (word: string) => `${subject} ${verb} ${phrase(word)}.`;

  const pronoun = prepositionalPronoun(owner, grammaticalCase);
  const own = possessiveForm("own", entry.slot, grammaticalCase);
  const owned = ownedEnglish(OWNER_ENGLISH[owner], entry);
  const english = instrumental
    ? `${subject} is going to the cinema with ${owned}.`
    : `${subject} is talking about ${owned}.`;
  const correctPhrase = phrase(fixed);

  return {
    id: `generated-${kind}`,
    type: "choice",
    practiceItemId: kind,
    prompt: english,
    choices: shuffleArray(
      [
        { id: "correct", label: line(fixed) },
        {
          id: "pronoun",
          label: line(pronoun),
          whyWrong: `**${capitalizeSlovak(withPreposition(preposition, pronoun))}** means *${instrumental ? "with" : "about"} ${PRONOUN_ENGLISH[owner]}* on its own — it cannot stand before a noun.`,
        },
        {
          id: "own",
          label: line(own),
          whyWrong: `**${capitalizeSlovak(phrase(own))}** would mean ${subject}'s own ${entry.english}.`,
        },
      ],
      rng,
    ),
    answerId: "correct",
    hint: fixedOwnerHint,
    feedback: {
      correction: line(fixed),
      english,
      why: `After a preposition, **${fixed}** stays **${fixed}**: **${correctPhrase}**.`,
    },
  };
}

interface SvojSubject {
  fixed: "his" | "her";
  name: string;
  /** Someone else of the same gender, so “his (Peter's)” stays unambiguous. */
  other: string;
}

const SVOJ_SUBJECTS: readonly SvojSubject[] = [
  { name: "Tom", fixed: "his", other: "Peter's" },
  { name: "Marek", fixed: "his", other: "Peter's" },
  { name: "Anna", fixed: "her", other: "Lucia's" },
  { name: "Mária", fixed: "her", other: "Lucia's" },
];

interface SvojFrame {
  english: (subject: string, owned: string) => string;
  grammaticalCase: GrammaticalCase;
  people: boolean;
  reason: string;
  slovak: (subject: string, owned: string) => string;
}

const SVOJ_FRAMES: readonly SvojFrame[] = [
  {
    grammaticalCase: "dative",
    people: true,
    reason: "**Písať list** + to whom takes the dative",
    slovak: (subject, owned) => `${subject} píše list ${owned}.`,
    english: (subject, owned) => `${subject} is writing a letter to ${owned}.`,
  },
  {
    grammaticalCase: "dative",
    people: true,
    reason: "**Volať** (to phone) takes the dative",
    slovak: (subject, owned) => `${subject} volá ${owned}.`,
    english: (subject, owned) => `${subject} is calling ${owned}.`,
  },
  {
    grammaticalCase: "accusative",
    people: false,
    reason: "**Hľadať** takes the accusative",
    slovak: (subject, owned) => `${subject} hľadá ${owned}.`,
    english: (subject, owned) => `${subject} is looking for ${owned}.`,
  },
  {
    grammaticalCase: "locative",
    people: false,
    reason: "**O** (about) takes the locative",
    slovak: (subject, owned) => `${subject} hovorí o ${owned}.`,
    english: (subject, owned) => `${subject} is talking about ${owned}.`,
  },
  {
    grammaticalCase: "instrumental",
    people: true,
    reason: "**S** (with) takes the instrumental",
    slovak: (subject, owned) => `${subject} ide do kina ${withPreposition("s", owned)}.`,
    english: (subject, owned) => `${subject} is going to the cinema with ${owned}.`,
  },
  {
    grammaticalCase: "genitive",
    people: true,
    reason: "**U** (at someone's place) takes the genitive",
    slovak: (subject, owned) => `${subject} býva u ${owned}.`,
    english: (subject, owned) =>
      `${subject} is staying at ${possessiveEnglish(owned)} place.`,
  },
];

function svojNouns(frame: SvojFrame): NounEntry[] {
  return nounsWhere((candidate) => !frame.people || candidate.person);
}

/** Same owner, another case — the nominative first, since that is the usual slip. */
function wrongCasePhrase(
  owner: OwnerId,
  entry: NounEntry,
  grammaticalCase: GrammaticalCase,
): string {
  const correct = ownedSlovak(owner, entry, grammaticalCase);
  for (const candidate of CASES) {
    const phrase = ownedSlovak(owner, entry, candidate);
    if (phrase !== correct) return phrase;
  }
  throw new Error(`No distinct wrong case for ${entry.id}`);
}

export function buildSvojChoiceExercise(kind: string, rng: Rng): ChoiceExercise {
  const subject = pick(SVOJ_SUBJECTS, rng);
  const frame = pick(SVOJ_FRAMES, rng);
  const entry = pick(svojNouns(frame), rng);
  const wantOwn = rng() < 0.65;

  const ownPhrase = ownedSlovak("own", entry, frame.grammaticalCase);
  const fixedPhrase = ownedSlovak(subject.fixed, entry, frame.grammaticalCase);
  const correctPhrase = wantOwn ? ownPhrase : fixedPhrase;
  const wrongCase = wrongCasePhrase(
    wantOwn ? "own" : subject.fixed,
    entry,
    frame.grammaticalCase,
  );
  const ownForm = possessiveForm("own", entry.slot, frame.grammaticalCase);
  const fixedForm = possessiveForm(subject.fixed, entry.slot, frame.grammaticalCase);

  const english = frame.english(
    subject.name,
    wantOwn
      ? `${subject.fixed} own ${entry.english}`
      : `${subject.fixed} (${subject.other}) ${entry.english}`,
  );
  const line = (owned: string) => frame.slovak(subject.name, owned);

  return {
    id: `generated-${kind}`,
    type: "choice",
    practiceItemId: kind,
    prompt: english,
    choices: shuffleArray(
      [
        { id: "correct", label: line(correctPhrase) },
        {
          id: wantOwn ? "fixed" : "own",
          label: line(wantOwn ? fixedPhrase : ownPhrase),
          whyWrong: wantOwn
            ? `**${capitalizeSlovak(fixedForm)}** would mean someone else's ${entry.english}.`
            : `**${capitalizeSlovak(ownForm)}** would mean ${subject.name}'s own ${entry.english}.`,
        },
        {
          id: "wrong-case",
          label: line(wrongCase),
          whyWrong: `**${capitalizeSlovak(wrongCase)}** is the wrong case. ${frame.reason}.`,
        },
      ],
      rng,
    ),
    answerId: "correct",
    hint: svojHint,
    feedback: {
      correction: line(correctPhrase),
      english,
      why: wantOwn
        ? `The owner is the subject (**${subject.name}**), so use **svoj** in the right case: **${ownPhrase}**.`
        : `The owner is not the subject, so use **${fixedForm}**: **${fixedPhrase}**.`,
    },
  };
}

/** Frames where the bare noun (no possessive) still reads as “their own”. */
const BARE_OK_FRAMES = SVOJ_FRAMES.filter(
  (frame) =>
    frame.grammaticalCase === "dative" || frame.grammaticalCase === "instrumental",
);

const ACCUSATIVE_SVOJ_FRAME = SVOJ_FRAMES.find(
  (frame) => frame.grammaticalCase === "accusative",
)!;

function bareLine(frame: SvojFrame, subject: string, entry: NounEntry): string {
  return frame.slovak(subject, entry.forms[frame.grammaticalCase]);
}

export function buildSvojRepairExercise(kind: string, rng: Rng): TypedExercise {
  const subject = pick(SVOJ_SUBJECTS, rng);
  const useThings = rng() < 0.4;
  const frame = useThings ? ACCUSATIVE_SVOJ_FRAME : pick(BARE_OK_FRAMES, rng);
  const entry = pick(
    nounsWhere((candidate) => candidate.person !== useThings),
    rng,
  );

  const ownPhrase = ownedSlovak("own", entry, frame.grammaticalCase);
  const broken = frame.slovak(
    subject.name,
    ownedSlovak(subject.fixed, entry, frame.grammaticalCase),
  );
  const answer = frame.slovak(subject.name, ownPhrase);
  const english = frame.english(subject.name, `${subject.fixed} own ${entry.english}`);
  const fixedForm = possessiveForm(subject.fixed, entry.slot, frame.grammaticalCase);

  return {
    id: `generated-${kind}`,
    type: "typed",
    task: "repair",
    practiceItemId: kind,
    context: [
      {
        id: "possessive-repair-line",
        speaker: "Sentence",
        slovak: broken,
        english,
      },
    ],
    prompt: "Repair this sentence.",
    inputLabel: "Correct Slovak sentence",
    answer,
    acceptedAnswers: [bareLine(frame, subject.name, entry)],
    feedback: {
      correction: answer,
      english,
      why: `**${capitalizeSlovak(fixedForm)}** points to someone else. ${subject.name} is the owner and the subject, so use **svoj**: **${ownPhrase}**.`,
    },
  };
}

function buildFirstPersonOddOneOut(
  kind: string,
  rng: Rng,
  frame: SvojFrame,
  entry: NounEntry,
): ChoiceExercise {
  const instrumental = frame.grammaticalCase === "instrumental";
  const trapOwner: FixedOwnerId = rng() < 0.5 ? "his" : "her";
  const sentence = (owned: string) =>
    instrumental ? `Idem do kina ${withPreposition("s", owned)}.` : `Volám ${owned}.`;
  const english = instrumental
    ? `I'm going to the cinema with my ${entry.english}.`
    : `I'm calling my ${entry.english}.`;
  const own = sentence(ownedSlovak("own", entry, frame.grammaticalCase));
  const mine = sentence(ownedSlovak("my", entry, frame.grammaticalCase));
  const trap = sentence(ownedSlovak(trapOwner, entry, frame.grammaticalCase));
  const trapForm = possessiveForm(trapOwner, entry.slot, frame.grammaticalCase);

  return {
    id: `generated-${kind}`,
    type: "choice",
    practiceItemId: kind,
    choiceMode: "pickTrap",
    prompt: `Which sentence does not mean “${withoutFinalPunctuation(english)}”?`,
    choices: shuffleArray(
      [
        {
          id: "own",
          label: own,
          fits: true,
          whyWrong: `**${withoutFinalPunctuation(own)}** fits — with I as the owner, **svoj** is the standard choice.`,
        },
        {
          id: "mine",
          label: mine,
          fits: true,
          whyWrong: `**${withoutFinalPunctuation(mine)}** fits — with I or you as the owner, **môj** works too.`,
        },
        {
          id: "trap",
          label: trap,
          whyWrong: `**${capitalizeSlovak(trapForm)}** means “${OWNER_ENGLISH[trapOwner]}” — someone else's ${entry.english}.`,
        },
      ],
      rng,
    ),
    answerId: "trap",
    hint: svojHint,
    feedback: {
      correction: trap,
      english,
      why: `**${capitalizeSlovak(trapForm)}** means “${OWNER_ENGLISH[trapOwner]}”, so the ${entry.english} is someone else's. For your own, use **svoj** or **môj**.`,
    },
  };
}

export function buildSvojOddOneOutExercise(kind: string, rng: Rng): ChoiceExercise {
  const frame = pick(BARE_OK_FRAMES, rng);
  const entry = pick(svojNouns(frame), rng);
  if (rng() < 0.4) return buildFirstPersonOddOneOut(kind, rng, frame, entry);

  const subject = pick(SVOJ_SUBJECTS, rng);
  const english = frame.english(subject.name, `${subject.fixed} own ${entry.english}`);
  const own = frame.slovak(
    subject.name,
    ownedSlovak("own", entry, frame.grammaticalCase),
  );
  const bare = bareLine(frame, subject.name, entry);
  const trap = frame.slovak(
    subject.name,
    ownedSlovak(subject.fixed, entry, frame.grammaticalCase),
  );
  const fixedForm = possessiveForm(subject.fixed, entry.slot, frame.grammaticalCase);

  return {
    id: `generated-${kind}`,
    type: "choice",
    practiceItemId: kind,
    choiceMode: "pickTrap",
    prompt: `Which sentence does not mean “${withoutFinalPunctuation(english)}”?`,
    choices: shuffleArray(
      [
        {
          id: "own",
          label: own,
          fits: true,
          whyWrong: `**${withoutFinalPunctuation(own)}** fits — **svoj** points back to the subject, ${subject.name}.`,
        },
        {
          id: "bare",
          label: bare,
          fits: true,
          whyWrong: `**${withoutFinalPunctuation(bare)}** fits — Slovak often drops the possessive when the owner is obvious.`,
        },
        {
          id: "trap",
          label: trap,
          whyWrong: `**${capitalizeSlovak(fixedForm)}** would be someone else's ${entry.english}, not ${subject.name}'s own.`,
        },
      ],
      rng,
    ),
    answerId: "trap",
    hint: svojHint,
    feedback: {
      correction: trap,
      english,
      why: `With ${subject.name} as the subject, **${fixedForm}** means another person's ${entry.english}. ${subject.name}'s own takes **svoj**.`,
    },
  };
}

function caseOfForm(owner: OwnerId, slot: Slot, form: string): string {
  return CASES.filter(
    (grammaticalCase) => possessiveForm(owner, slot, grammaticalCase) === form,
  ).join(" or ");
}

const OBLIQUE_FRAMES = CASE_FRAMES.filter(
  (frame) => frame.grammaticalCase !== "nominative",
);

function pickCaseDrill(rng: Rng) {
  const owner = pick(DECLINABLE_NAMED_OWNERS, rng);
  const frame = pick(OBLIQUE_FRAMES, rng);
  const entry = pick(frameNouns(frame), rng);
  return { owner, frame, entry };
}

export function buildCaseChoiceExercise(kind: string, rng: Rng): ChoiceExercise {
  const { owner, frame, entry } = pickCaseDrill(rng);
  const correct = possessiveForm(owner, entry.slot, frame.grammaticalCase);
  const correctPhrase = `${correct} ${entry.forms[frame.grammaticalCase]}`;
  const english = frame.english(ownedEnglish(OWNER_ENGLISH[owner], entry));
  const thingAccusative =
    frame.grammaticalCase === "accusative" && entry.slot === "masculine-inanimate";

  const wrongForms: string[] = [];
  if (thingAccusative) {
    wrongForms.push(possessiveForm(owner, "masculine-animate", "accusative"));
  }
  for (const candidate of shuffleArray(CASES, rng)) {
    if (wrongForms.length >= 2) break;
    const form = possessiveForm(owner, entry.slot, candidate);
    if (form !== correct && !wrongForms.includes(form)) wrongForms.push(form);
  }

  const distractors = wrongForms.map((wrong, index) => ({
    id: `wrong-${index + 1}`,
    label: frameSentence(frame, wrong, entry),
    whyWrong:
      thingAccusative && index === 0
        ? `**${capitalizeSlovak(wrong)}** is for people in the accusative (**${wrong} brata**). A thing keeps the basic form.`
        : `**${capitalizeSlovak(wrong)}** is the ${caseOfForm(owner, entry.slot, wrong)} form.`,
  }));

  return {
    id: `generated-${kind}`,
    type: "choice",
    practiceItemId: kind,
    prompt: english,
    choices: shuffleArray(
      [{ id: "correct", label: frameSentence(frame, correct, entry) }, ...distractors],
      rng,
    ),
    answerId: "correct",
    hint: caseHint,
    feedback: {
      correction: frameSentence(frame, correct, entry),
      english,
      why: `${frame.because}, and the possessive follows its noun: **${correctPhrase}**.`,
    },
  };
}

export function buildCaseClozeExercise(kind: string, rng: Rng): ClozeExercise {
  const { owner, frame, entry } = pickCaseDrill(rng);
  const answer = possessiveForm(owner, entry.slot, frame.grammaticalCase);
  const nounForm = entry.forms[frame.grammaticalCase];
  const english = frame.english(ownedEnglish(OWNER_ENGLISH[owner], entry));

  return {
    id: `generated-${kind}`,
    type: "cloze",
    practiceItemId: kind,
    prompt: `Fill the gap with “${OWNER_ENGLISH[owner]}”.`,
    frame: frameSentence(frame, "{}", entry),
    answer,
    gapEn: OWNER_ENGLISH[owner],
    sentenceEn: english,
    morphHint: `${ownerLemma(owner)} → ${answer}`,
    hint: {
      chip: `${capitalizeSlovak(frame.grammaticalCase)} case`,
      grammarTopicId: "cases-overview",
      note: `${frame.because}. The possessive takes the same case and gender as **${nounForm}**.`,
      reveal: [
        `The dictionary form is ${ownerLemma(owner)}.`,
        `${capitalizeSlovak(entry.forms.nominative)} is ${SLOT_LABEL[entry.slot]}.`,
        `${answer.slice(0, 2)} …`,
      ],
    },
    feedback: {
      correction: frameSentence(frame, answer, entry),
      english,
      why: `${frame.because}: **${answer} ${nounForm}**.`,
    },
  };
}

export function buildGenitiveBuildExercise(kind: string, rng: Rng): BuildExercise {
  const owner = pick(DECLINABLE_NAMED_OWNERS, rng);
  const possessor = pick(
    nounsWhere((candidate) => candidate.person),
    rng,
  );
  const thing = pick(
    nounsWhere((candidate) => !candidate.person && !isPluralSlot(candidate.slot)),
    rng,
  );
  const genitiveOwner = possessiveForm(owner, possessor.slot, "genitive");
  const answer = [
    "To",
    "je",
    thing.forms.nominative,
    genitiveOwner,
    `${possessor.forms.genitive}.`,
  ];
  const distractors = [
    possessiveForm(owner, possessor.slot, "nominative"),
    `${possessor.forms.nominative}.`,
  ].filter((tile) => !answer.includes(tile));
  const english = `This is ${possessiveEnglish(ownedEnglish(OWNER_ENGLISH[owner], possessor))} ${thing.english}.`;
  const ownerPhrase = `${thing.forms.nominative} ${genitiveOwner} ${possessor.forms.genitive}`;

  return {
    id: `generated-${kind}`,
    type: "build",
    practiceItemId: kind,
    prompt: english,
    tiles: shuffleArray([...answer, ...distractors], rng),
    answer,
    feedback: {
      correction: `To je ${ownerPhrase}.`,
      english,
      why: `The owner comes after the thing, in the genitive — possessive included: **${ownerPhrase}**.`,
    },
  };
}

export function buildTypedExercise(kind: string, rng: Rng): TypedExercise {
  const owner = pick<NamedOwnerId>([...DECLINABLE_NAMED_OWNERS, ...FIXED_OWNERS], rng);
  const entry = pick(NOUNS, rng);
  const plural = isPluralSlot(entry.slot);
  const form = possessiveForm(owner, entry.slot, "nominative");
  const owned = `${form} ${entry.forms.nominative}`;
  const answer = `${plural ? "To sú" : "To je"} ${owned}.`;
  const english = pluralizeThisIs(
    `This is ${ownedEnglish(OWNER_ENGLISH[owner], entry)}.`,
    plural,
  );
  const fixed = FIXED_OWNERS.some((candidate) => candidate === owner);

  return {
    id: `generated-${kind}`,
    type: "typed",
    task: "complete",
    practiceItemId: kind,
    prompt: english,
    inputLabel: "Your Slovak answer",
    answer,
    acceptedAnswers: [
      `${plural ? "Toto sú" : "Toto je"} ${owned}.`,
      `${plural ? "Sú to" : "Je to"} ${owned}.`,
    ],
    feedback: {
      correction: answer,
      english,
      why: fixed
        ? `**${capitalizeSlovak(form)}** never changes, whatever the noun: **${owned}**.`
        : `**${capitalizeSlovak(entry.forms.nominative)}** is ${SLOT_LABEL[entry.slot]}, so the possessive agrees: **${owned}**.`,
    },
  };
}

const WHOSE_LABEL: Record<string, string> = {
  čí: "masculine",
  čia: "feminine",
  čie: "neuter or plural",
};

export function buildWhoseExercise(kind: string, rng: Rng): ChoiceExercise {
  const entry = pick(
    nounsWhere((candidate) => !candidate.person),
    rng,
  );
  const plural = isPluralSlot(entry.slot);
  const correct = whoseForm(entry.slot);
  const line = (form: string) =>
    `${capitalizeSlovak(form)} ${plural ? "sú" : "je"} to ${entry.forms.nominative}?`;
  const english = plural
    ? `Whose ${entry.english} are these?`
    : `Whose ${entry.english} is this?`;

  const distractors = ["čí", "čia", "čie"]
    .filter((form) => form !== correct)
    .map((wrong) => ({
      id: `whose-${wrong}`,
      label: line(wrong),
      whyWrong: `**${capitalizeSlovak(wrong)}** goes with ${WHOSE_LABEL[wrong]} nouns.`,
    }));

  return {
    id: `generated-${kind}`,
    type: "choice",
    practiceItemId: kind,
    prompt: english,
    choices: shuffleArray([{ id: "correct", label: line(correct) }, ...distractors], rng),
    answerId: "correct",
    hint: whoseHint,
    feedback: {
      correction: line(correct),
      english,
      why: `**Čí** agrees with the thing, like **môj**: **${withoutFinalPunctuation(line(correct))}**.`,
    },
  };
}

const NAME_SLOTS: readonly NameOwnerSlot[] = [
  "masculine-inanimate",
  "feminine",
  "neuter",
  "plural",
];

function nameSlot(slot: Slot): NameOwnerSlot {
  if (slot === "masculine-animate") return "masculine-inanimate";
  if (slot === "plural-personal") return "plural";
  return slot;
}

export function buildNameAdjectiveExercise(kind: string, rng: Rng): ChoiceExercise {
  const owner = pick(NAME_OWNERS, rng);
  const entry = pick(
    nounsWhere((candidate) => candidate.slot !== "plural-personal"),
    rng,
  );
  const slot = nameSlot(entry.slot);
  const plural = isPluralSlot(entry.slot);
  const correct = nameOwnerForm(owner, slot);
  const line = (form: string) =>
    `${plural ? "To sú" : "To je"} ${form} ${entry.forms.nominative}.`;
  const english = pluralizeThisIs(`This is ${owner.english} ${entry.english}.`, plural);
  const wrongSlots = shuffleArray(
    NAME_SLOTS.filter((candidate) => candidate !== slot),
    rng,
  ).slice(0, 2);

  return {
    id: `generated-${kind}`,
    type: "choice",
    practiceItemId: kind,
    prompt: english,
    choices: shuffleArray(
      [
        { id: "correct", label: line(correct) },
        ...wrongSlots.map((wrongSlot) => {
          const wrong = nameOwnerForm(owner, wrongSlot);
          return {
            id: `name-${wrongSlot}`,
            label: line(wrong),
            whyWrong: `**${capitalizeSlovak(wrong)}** goes with ${SLOT_LABEL[wrongSlot]} nouns.`,
          };
        }),
      ],
      rng,
    ),
    answerId: "correct",
    hint: nameOwnerHint,
    feedback: {
      correction: line(correct),
      english,
      why: `One named owner becomes an adjective that agrees with the thing: **${correct} ${entry.forms.nominative}**.`,
    },
  };
}

export function buildInstrumentalDativeExercise(kind: string, rng: Rng): ChoiceExercise {
  const owner = pick(DECLINABLE_NAMED_OWNERS, rng);
  const instrumental = rng() < 0.5;
  const entry = pick(
    nounsWhere((candidate) =>
      instrumental
        ? candidate.person &&
          (candidate.slot === "masculine-animate" || candidate.slot === "neuter")
        : candidate.slot === "plural-personal",
    ),
    rng,
  );
  const frame = caseFrame(instrumental ? "instrumental" : "dative");
  const correct = possessiveForm(owner, entry.slot, frame.grammaticalCase);
  const lengthTrap = instrumental
    ? possessiveForm(owner, "plural-personal", "dative")
    : possessiveForm(owner, "masculine-animate", "instrumental");
  const caseTrap = possessiveForm(
    owner,
    entry.slot,
    instrumental ? "locative" : "genitive",
  );
  const correctPhrase = `${correct} ${entry.forms[frame.grammaticalCase]}`;
  const english = frame.english(ownedEnglish(OWNER_ENGLISH[owner], entry));

  return {
    id: `generated-${kind}`,
    type: "choice",
    practiceItemId: kind,
    prompt: english,
    choices: shuffleArray(
      [
        { id: "correct", label: frameSentence(frame, correct, entry) },
        {
          id: "length",
          label: frameSentence(frame, lengthTrap, entry),
          whyWrong: instrumental
            ? `**${capitalizeSlovak(lengthTrap)}** with a short **i** is dative plural: **${lengthTrap} rodičom**.`
            : `**${capitalizeSlovak(lengthTrap)}** with a long **í** is instrumental singular: **s ${lengthTrap} bratom**.`,
        },
        {
          id: "case",
          label: frameSentence(frame, caseTrap, entry),
          whyWrong: `**${capitalizeSlovak(caseTrap)}** is the ${caseOfForm(owner, entry.slot, caseTrap)} form.`,
        },
      ],
      rng,
    ),
    answerId: "correct",
    hint: instrumentalDativeHint,
    feedback: {
      correction: frameSentence(frame, correct, entry),
      english,
      why: instrumental
        ? `Instrumental singular has a long **-ím**: **${correctPhrase}**.`
        : `Dative plural has a short **-im**: **${correctPhrase}**.`,
    },
  };
}

interface BodyPartItem {
  correct: string;
  english: string;
  why: string;
  wrong: Array<{ label: string; whyWrong: string }>;
}

const BODY_PART_ITEMS: readonly BodyPartItem[] = [
  {
    english: "I'm washing my hands.",
    correct: "Umývam si ruky.",
    why: "Your own body takes **si**, not a possessive: **Umývam si ruky**.",
    wrong: [
      {
        label: "Umývam moje ruky.",
        whyWrong: "**Moje** is redundant — whose hands but your own would you wash?",
      },
      {
        label: "Umývam svoje ruky.",
        whyWrong:
          "**Svoje ruky** stresses *your own*, as if the hands could be someone else's.",
      },
    ],
  },
  {
    english: "I'm brushing my teeth.",
    correct: "Čistím si zuby.",
    why: "Your own body takes **si**, not a possessive: **Čistím si zuby**.",
    wrong: [
      {
        label: "Čistím moje zuby.",
        whyWrong: "**Moje** is redundant — whose teeth but your own would you brush?",
      },
      {
        label: "Čistím svoje zuby.",
        whyWrong:
          "**Svoje zuby** stresses *your own*, as if the teeth could be someone else's.",
      },
    ],
  },
  {
    english: "I'm putting on my coat.",
    correct: "Obliekam si kabát.",
    why: "Clothes you put on take **si**: **Obliekam si kabát**.",
    wrong: [
      {
        label: "Obliekam môj kabát.",
        whyWrong:
          "Without **si**, **obliekať** means dressing something else. Say **Obliekam si kabát**.",
      },
      {
        label: "Obliekam svoj kabát.",
        whyWrong:
          "Without **si**, **obliekať** means dressing something else. Say **Obliekam si kabát**.",
      },
    ],
  },
  {
    english: "He broke his arm.",
    correct: "Zlomil si ruku.",
    why: "**Si** says he broke his own arm: **Zlomil si ruku**.",
    wrong: [
      {
        label: "Zlomil jeho ruku.",
        whyWrong: "**Jeho ruku** is another man's arm — he'd have broken someone else's!",
      },
      {
        label: "Zlomil svoju ruku.",
        whyWrong: "Slovak does not add **svoju** to a body part.",
      },
    ],
  },
  {
    english: "My head hurts.",
    correct: "Bolí ma hlava.",
    why: "Pain names the person with **ma** (me), not a possessive: **Bolí ma hlava**.",
    wrong: [
      {
        label: "Moja hlava bolí.",
        whyWrong: "**Moja hlava bolí** copies the English word for word.",
      },
      {
        label: "Bolí moja hlava.",
        whyWrong: "**Bolí moja hlava** keeps the English possessive and drops **ma**.",
      },
    ],
  },
];

export function buildBodyPartExercise(kind: string, rng: Rng): ChoiceExercise {
  const item = pick(BODY_PART_ITEMS, rng);

  return {
    id: `generated-${kind}`,
    type: "choice",
    practiceItemId: kind,
    prompt: item.english,
    choices: shuffleArray(
      [
        { id: "correct", label: item.correct },
        ...item.wrong.map((wrong, index) => ({
          id: `wrong-${index + 1}`,
          label: wrong.label,
          whyWrong: wrong.whyWrong,
        })),
      ],
      rng,
    ),
    answerId: "correct",
    hint: bodyPartHint,
    feedback: {
      correction: item.correct,
      english: item.english,
      why: item.why,
    },
  };
}
