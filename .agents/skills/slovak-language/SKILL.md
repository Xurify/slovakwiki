---
name: slovak-language
description: Use Slovak accurately for translation, writing, conversation, tutoring, correction, pronunciation coaching, grammar explanation, CEFR-aligned study plans, and cultural/register guidance. Trigger for Slovak (slovenčina) text or requests involving Slovak vocabulary, declension, conjugation, aspect, motion verbs, spelling and punctuation, word order, formal address, colloquial or regional usage, or Slovak-language learning from beginner through advanced, including slovak.wiki lessons, practice items, and dictionary entries.
---

# Slovak Language

Produce idiomatic standard Slovak, explain choices at the learner's level, and preserve the speaker's intended register. Use CEFR levels as flexible guidance, not as a substitute for context-sensitive editing.

## Select the task mode

| Request             | Do                                                                                                                                                                               |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Translate           | Establish audience, `ty`/`vy`, gender where forms require it, and level of formality. Translate meaning and natural collocation, not words one by one.                           |
| Write or rewrite    | State the register, use a natural Slovak opening/closing when relevant, then proofread agreement, case government, aspect, and diacritics.                                       |
| Correct             | Return a corrected version first. Then give only the highest-value explanations, labelled by error type. Preserve valid colloquial phrasing unless standard Slovak is requested. |
| Teach               | Diagnose the learner's level with a short production task. Teach one controlled pattern, contrast it with a near miss, then elicit new sentences.                                |
| Plan study          | Map the learner's goal and current ability to an appropriate A1–C1 progression. Use retrieval, spaced review, listening, speaking, reading, and writing.                         |
| Explain grammar     | Give the meaning/function first, then the smallest useful paradigm and 3-5 contextual examples. Do not dump every declension unless asked.                                       |
| Author site content | Follow [slovak-wiki-authoring.md](references/slovak-wiki-authoring.md) on top of the production pass.                                                                            |

Never omit Slovak diacritics in final Slovak text. Use `slovenčina` for the language and `Slovensko` for Slovakia. Mark uncertain gender-dependent translations with alternatives, e.g. `bol som / bola som`.

## Mandatory production pass

Before finalizing meaningful Slovak output, check:

1. **Agreement:** adjective, participle, past tense, and pronoun match gender, number, case, and animacy (`boli pripravení` vs. `boli pripravené`).
2. **Government:** choose the case demanded by the verb/preposition; distinguish location from destination (`v škole` / `do školy`).
3. **Aspect and time:** imperfective for process/habit, perfective for a bounded event; never `budem` + perfective; negative imperatives are imperfective.
4. **Forms:** genitive plurals, mobile vowels, irregular past participles (`išiel`, `niesol`, `mohol`), and imperatives are checked against the tables, not built by analogy.
5. **Register:** `Vy/Vám/Váš` capitalized for one formal addressee in correspondence; no mixing of `tykanie` and `vykanie`.
6. **Naturalness:** no English-style articles, unnecessary subject pronouns or possessives, calqued passives, or rigid English word order; clitics in second position.
7. **Interference:** no Czech forms (`jedná sa`, `ohľadne`, `byly`, `ř/ě/ů`) and no English false friends (`aktuálny` ≠ actual).
8. **Spelling and typography:** `i/y` and the selected words, `nie je` as two words, `s`/`z` prepositions, `„…“` quotes, decimal comma, sentence-case headings.

## Verify instead of guessing

A confident wrong form is worse than a flagged one. When any form, meaning, or norm is not certain:

1. **The repo's own data**: `content/dictionary/words.json` and the curated seed (`src/lib/catalog/entries.ts`) show how a lemma is already presented.
2. **JÚĽŠ dictionaries** at [slovnik.juls.savba.sk](https://slovnik.juls.savba.sk/): KSSJ (meaning, register labels, aspect `dok./nedok.`), PSP (spelling and inflected forms), SSSJ (detailed modern usage), and the synonym dictionary.
3. **Slovak National Corpus** at [korpus.sk](https://korpus.sk/) to check whether a collocation is actually used and how often.
4. **Jazyková poradňa JÚĽŠ** for normative questions (bohemisms, disputed constructions).

If you cannot verify, say so in your answer and give the safest standard alternative. Never invent a paradigm, idiom, or "rule" to fill a gap.

## Reference routing

Read only the reference required by the task.

| Need                                                                                               | Read                                                                                                                                         |
| -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| quick grammar overview: cases, agreement, verbs, aspect, prepositions                              | [grammar-core.md](references/grammar-core.md)                                                                                                |
| a noun form: full paradigms, plurals, genitive plural, names, place names                          | [nouns.md](references/nouns.md)                                                                                                              |
| adjective, comparison, adverb, pronoun, or any number/time/money form                              | [adjectives-pronouns-numerals.md](references/adjectives-pronouns-numerals.md)                                                                |
| a verb form: conjugation classes, irregulars, past, future, imperative, participles                | [verb-forms.md](references/verb-forms.md)                                                                                                    |
| which aspect; aspect pairs; motion verbs and their prefixes; kde/kam/odkiaľ                        | [aspect-and-motion.md](references/aspect-and-motion.md)                                                                                      |
| morphology overview, word formation                                                                | [morphology-reference.md](references/morphology-reference.md)                                                                                |
| verb government, prepositions, infinitive vs. `aby`                                                | [valency-and-prepositions.md](references/valency-and-prepositions.md)                                                                        |
| clause structure, clitics, negation, word order, register editing                                  | [syntax-and-style.md](references/syntax-and-style.md)                                                                                        |
| particles, connectors, `sa/si` types, possession, writing genres                                   | [discourse-and-verb-precision.md](references/discourse-and-verb-precision.md)                                                                |
| passive and impersonal, frequentatives, diminutives, vocative, correspondence                      | [advanced-forms-and-usage.md](references/advanced-forms-and-usage.md)                                                                        |
| English → Slovak word choice, false friends, calques, Czech interference                           | [lexical-choice-and-interference.md](references/lexical-choice-and-interference.md)                                                          |
| spelling (`i/y`, selected words), capitalization, commas, numbers, quotes                          | [orthography-and-punctuation.md](references/orthography-and-punctuation.md)                                                                  |
| sounds, stress, pronunciation coaching                                                             | [phonology-and-orthography.md](references/phonology-and-orthography.md), [pronunciation-and-usage.md](references/pronunciation-and-usage.md) |
| colloquial speech, register labels, dialects, names and titles, greetings, wishes, customs, idioms | [spoken-slovak-and-variation.md](references/spoken-slovak-and-variation.md)                                                                  |
| beginner and lower-intermediate patterns with examples                                             | [foundations-and-core-communication.md](references/foundations-and-core-communication.md)                                                    |
| intermediate to advanced, professional and public Slovak                                           | [intermediate-and-advanced-communication.md](references/intermediate-and-advanced-communication.md)                                          |
| everyday vocabulary domains, case frames, writing templates                                        | [communication-and-vocabulary.md](references/communication-and-vocabulary.md)                                                                |
| drills, assessment, study plans                                                                    | [practice-and-progression.md](references/practice-and-progression.md)                                                                        |
| geography, public and cultural language, advanced reading                                          | [slovakia-context-handbook.md](references/slovakia-context-handbook.md)                                                                      |
| slovak.wiki lessons, practice items, `acceptedAnswers`, dictionary examples, Tatoeba vetting       | [slovak-wiki-authoring.md](references/slovak-wiki-authoring.md)                                                                              |

## Teaching defaults

- Prefer complete chunks: `Mám rád kávu.`, `Idem do mesta.`, `Som v meste.`
- Introduce nouns with gender and a usable form: `stôl (m. inan.)`, `žena (f.)`, `mesto (n.)`.
- Introduce verbs with aspect partner and key forms: `písať (ipf.) / napísať (pf.) – píšem – píšu`.
- Teach case through a verb/preposition frame before abstract labels: `čakám na + acc.`, `hovorím o + loc.`, `pomáham + dat.`
- Make the learner produce both directions of every spatial contrast: `v Bratislave` / `do Bratislavy`, `na stole` / `na stôl`.
- Separate recognition from production. Make learners say or write a personalized sentence before moving on.
- Correct one recurring form error at a time; maintain an error log for case, aspect, and soft/hard spelling errors.

## Scope and limits

The references cover Slovak from beginner through advanced level: pronunciation, full inflection, aspect and motion, valency, spelling and punctuation, lexical choice, interaction, register and regional variation, writing, culture, and site authoring. They are working references, not the norm itself: for rare forms and disputed usage, verify as above. Verify current legal, political, institutional, medical, or specialist facts from authoritative current sources before presenting them as fact.
