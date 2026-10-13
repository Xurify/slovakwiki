# slovak.wiki Content: Linguistic Checks

Use this when writing or reviewing Slovak that ships on slovak.wiki: lessons, practice items, dictionary entries, examples. It covers the linguistic side only. Product and format rules live in the repo:

- Lesson and practice copy, prompts, feedback: `docs/lessons-practice-content.md`
- Dictionary entry shape and example counts: `content/dictionary/README.md`
- Audio and search-index steps after content changes: `AGENTS.md`

## 1. How answers are graded

`normalizePracticeAnswer` in `src/lib/components/practice/practice-state.ts` lowercases, trims, collapses whitespace, and strips **trailing** punctuation only. Consequences:

- Capitalization and the final `.`/`?`/`!` never matter.
- **Internal punctuation and word order do matter.** `Áno, som.` and `Áno som` are different answers.
- A diacritics-only mismatch grades as "accents" (almost right), never as correct. Do not add diacritic-free variants to `acceptedAnswers`.
- Build exercises compare one fixed tile order (`answer: string[]`); there is no alternative list.

## 2. `acceptedAnswers`: list every correct Slovak answer the prompt allows

Before saving a typed or cloze item, enumerate the variants a fluent speaker would produce. Add each one that the prompt does not rule out:

| Variant type                | Example                                                                                                           |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| optional subject pronoun    | `Čítam noviny.` / `Ja čítam noviny.`                                                                              |
| neutral word-order variants | `Trochu hovorím po slovensky.` / `Hovorím trochu po slovensky.`                                                   |
| speaker gender              | `Bol som unavený.` / `Bola som unavená.`; `Mám rád kávu.` / `Mám rada kávu.`                                      |
| `ty` / `vy`                 | `Ako sa máš?` / `Ako sa máte?` (only if the scene leaves register open)                                           |
| synonyms of equal register  | `Dám si kávu.` / `Prosím si kávu.`                                                                                |
| optional internal comma     | add the comma-less version when the item is not about punctuation and the comma is optional (`prosím` insertions) |

Do not accept forms that are wrong in standard Slovak just because learners produce them. If the item is not testing a variable (gender, register), **fix it in the prompt or scene instead**: a named speaker, `(to a friend)`, `(formal)`. English prompts hide distinctions Slovak forces; see §4.

Clitic order limits word-order variants: `Včera som mu to povedal.` / `Povedal som mu to včera.` are both fine, but `*Som mu to povedal včera.` is not. Check every variant against second-position clitic placement ([syntax-and-style.md](syntax-and-style.md)).

## 3. Cloze and build design

- **Cloze**: exactly one `{}` gap, and the frame must force exactly one form. Test it: could another case, gender, person, or aspect fill the gap and still be correct? `Dnes {} knihu.` accepts `čítam`, `čítaš`, `kupujem`…; constrain with `gapEn`, `morphHint`, or a subject: `Peter dnes {} knihu.` + `morphHint: "čítať, present"`.
- If the gap is a noun form, the frame should contain the governor (preposition or verb) so the case is determined: `Idem do {}.` + `gapEn: "the school"` → `školy`.
- **Build**: choose tiles so that only one natural order exists, or accept that the most neutral order is the answer and avoid items where a different order is equally natural. Do not include distractor tiles that could form another valid sentence.
- **Repair**: the broken line must contain one clear error type (case, agreement, aspect, word order). Two errors in one line make the `why` muddy.

## 4. Writing prompts that fix what Slovak needs to know

English underspecifies things Slovak must encode. When the target answer depends on one of these, the prompt or scene has to settle it:

| Slovak needs                             | English prompt fix                                                                     |
| ---------------------------------------- | -------------------------------------------------------------------------------------- |
| speaker gender (past, `rád`, adjectives) | a named speaker in `context`, or a scene line                                          |
| `ty` vs. `vy`                            | who is being addressed (`Anna` = friend; `Receptionist` = formal)                      |
| aspect                                   | completion or repetition in the English: "I finished writing it" / "I write every day" |
| destination vs. location                 | "to the shop" vs. "in the shop"                                                        |
| plural `you`                             | "you (both)", "you all"                                                                |

## 5. `why` lines

One short teaching line that names the frame, with Slovak in `**bold**` (rendered as emphasis). Name the rule, not the symptom:

- `Use **do** + genitive for a destination: **do školy**.`
- `**Páčiť sa** takes the person in the dative: **páči sa mi**.`
- `One finished action: perfective **napísal**.`

Avoid: `Wrong ending.`, `Remember the case.`, long paradigms.

## 6. Dictionary entries

- **Headword** is the SNK lemma. Reflexive verbs are stored without `sa`/`si` (`báť`, `smiať`, `páčiť`) because that is how the corpus lemmatizes them. The gloss and the first example must show the reflexive: `english: "to be afraid (báť sa)"`, first example `Bojím sa tmy.` with `demonstrates: "báť sa + genitive"`.
- **Glosses**: verbs as `to …`; several senses separated by `; `; give the aspect partner in an example or `demonstrates` when it matters.
- **Examples**: the first four are displayed and voiced. Put one example per key frame first: case government (`čakať na + acc.`), aspect contrast, reflexive, common collocation. For verbs, mix persons and tenses.
- **Nouns**: show the gender-revealing forms in examples where possible (an adjective in agreement, a prepositional case).

## 7. Vetting corpus and Tatoeba sentences

Tatoeba Slovak is often translated from English by learners. Reject or replace a sentence (do not silently edit a line still marked `Tatoeba`) when it shows:

| Problem                                                       | Example                           | Natural Slovak               |
| ------------------------------------------------------------- | --------------------------------- | ---------------------------- |
| subject pronoun without contrast                              | `On je unavený.`                  | `Je unavený.`                |
| instrumental predicate with `byť` where nominative is natural | `On nemôže byť mladým.`           | `Nemôže byť mladý.`          |
| calqued passive                                               | `Je jasné, čo musí byť vykonané.` | `Je jasné, čo treba urobiť.` |
| possessive overuse                                            | `Zatvoril svoje oči.`             | `Zavrel oči.`                |
| English word order with clitics misplaced                     | `Ja som to mu povedal.`           | `Povedal som mu to.`         |
| Czech forms or words                                          | `Jedná sa o problém.`             | `Ide o problém.`             |
| missing diacritics, wrong quotes                              | `Dakujem.`, `"ahoj"`              | `Ďakujem.`, `„ahoj“`         |
| bookish or archaic style for a basic word                     | transgressives, `onen`            | plain modern sentence        |
| meaning drift from the English                                | Slovak adds or drops information  | rewrite both sides           |

Also check: the sentence uses the headword in a typical sense, not an obscure one; it is self-contained; it is safe for learners (`src/lib/catalog/dictionary/example-quality.ts` filters obvious problems but not style).

## 8. Lesson tables and explanations

- Form tables (`type: "form-table"`) must be complete for what they claim: if a table shows the present of `byť`, include all six persons and the negative where relevant (`nie som`…).
- Use the verified paradigms in [nouns.md](nouns.md), [adjectives-pronouns-numerals.md](adjectives-pronouns-numerals.md), and [verb-forms.md](verb-forms.md). Do not generate a paradigm from analogy for a lesson.
- Grammar labels for learners: say "dative", "genitive"; add the Slovak question (`komu?`, `koho?`) when it helps.
- Keep each lesson's Slovak inside its level: an A1 scene uses present tense, high-frequency nouns, and fixed chunks; do not slip in conditionals or participles unless the beat teaches them.

## 9. Before committing Slovak content

1. Production pass from [SKILL.md](../SKILL.md): agreement, government, aspect, register, naturalness.
2. Diacritics present; `„…“` quotes; sentence-case headings; `nie je` as two words.
3. Every typed or cloze answer has its valid variants in `acceptedAnswers`, or the prompt rules them out.
4. Each cloze gap has exactly one correct fill.
5. Dictionary examples: reflexive shown, first four are the best, no Tatoeba calques.
6. Then the repo steps in `AGENTS.md`: search index and audio generation.
