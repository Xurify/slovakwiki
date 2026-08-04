# Content expansion roadmap — 2026-08-03

Keep pronunciation separate from grammar. Ship alphabet reference + Everyday pack + grammar refs.

## Locked IDs

| Area          | ID / slug                               |
| ------------- | --------------------------------------- |
| Pronunciation | `slovak-alphabet`                       |
| Everyday      | `everyday/numbers-and-personal-details` |
| Everyday      | `everyday/days-dates-and-time`          |
| Everyday      | `everyday/negation-in-conversation`     |
| Grammar       | `numbers-and-numerals`                  |
| Grammar       | `negation`                              |
| Grammar       | `questions`                             |

### Practice items

- `everyday/age-with-rokov`
- `everyday/phone-number-digits`
- `everyday/simple-price`
- `everyday/day-meeting`
- `everyday/meeting-time`
- `everyday/half-past-time`
- `everyday/negative-answer`
- `everyday/not-understand`
- `everyday/negative-verb-placement`

### Practice sets (primary)

| Set ID                         | lessonId                                |
| ------------------------------ | --------------------------------------- |
| `numbers-and-personal-details` | `everyday/numbers-and-personal-details` |
| `days-dates-and-time`          | `everyday/days-dates-and-time`          |
| `negation-in-conversation`     | `everyday/negation-in-conversation`     |

Total practice sets: **5 → 8**.

## Owners

| Work          | Files                                                                  |
| ------------- | ---------------------------------------------------------------------- |
| Alphabet UI   | `SlovakAlphabetIllustration.svelte`, `PronunciationTopicDetail.svelte` |
| Alphabet data | `data.ts` pronunciationEntries                                         |
| Lessons       | `lessons.ts`                                                           |
| Practice      | `practice.ts`                                                          |
| Grammar       | `data.ts` grammarEntries                                               |
| Tests         | `content.test.ts`                                                      |

## Out of scope (v1)

Alphabet lesson/practice set, full numeral declension, café/town/shopping units, merging pronunciation into grammar.
