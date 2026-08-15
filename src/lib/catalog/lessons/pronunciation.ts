import type { Lesson } from "$lib/learning/types";
import { withStressExercises } from "./beats";

export const pronunciationLessons: Lesson[] = [
  {
    id: "pronunciation/first-syllable-stress",
    track: "pronunciation",
    slug: "first-syllable-stress",
    title: "First-syllable stress",
    promise: "Hear the regular first-syllable stress in common Slovak words.",
    scene: [
      {
        id: "anna-thanks",
        speaker: "Anna",
        slovak: "Ďakujem za pomoc.",
        english: "Thank you for the help.",
        audio: { transcript: "Ďakujem za pomoc." },
      },
      {
        id: "stress-mark",
        speaker: "Notice",
        slovak: "ĎA-ku-jem",
        english: "The first syllable takes the steady beat.",
        audio: { transcript: "ďakujem" },
      },
    ],
    keyPhrases: [
      {
        slovak: "ĎA-ku-jem",
        english: "thank you",
        note: "Stress the first syllable. Keep the other two lighter.",
        audio: { transcript: "ďakujem" },
      },
      {
        slovak: "BRA-ti-sla-va",
        english: "Bratislava",
        note: "The same first-syllable pattern.",
        audio: { transcript: "Bratislava" },
      },
    ],
    pattern: {
      title: "Stress is usually first",
      body: "In ordinary Slovak words, the first syllable carries the main beat. This is separate from vowel length: a long vowel is held longer, not automatically stressed.",
    },
    beats: withStressExercises(
      {
        id: "stress-choose",
        type: "choice",
        practiceItemId: "pronunciation/dakujem-stress",
        prompt: "Where is the main beat in ďakujem?",
        choices: [
          { id: "first", label: "ďa — the first syllable" },
          {
            id: "middle",
            label: "ku — the middle syllable",
            whyWrong:
              "Slovak stress normally stays on the **first syllable**, not the middle.",
          },
          {
            id: "last",
            label: "jem — the last syllable",
            whyWrong:
              "Slovak stress normally stays on the **first syllable**, not the last.",
          },
        ],
        answerId: "first",
        feedback: {
          correction: "ĎA-ku-jem",
          why: "Slovak normally puts the main stress on the **first syllable** of a word.",
        },
      },
      {
        id: "stress-build",
        type: "build",
        practiceItemId: "pronunciation/thanks-phrase",
        prompt: "Thank you for the help.",
        tiles: ["pomoc.", "Ďakujem", "za"],
        answer: ["Ďakujem", "za", "pomoc."],
        feedback: {
          correction: "Ďakujem za pomoc.",
          english: "Thank you for the help.",
          why: "Keep the first beat on **ĎA-** in **ďakujem**, then say the rest of the phrase evenly.",
        },
      },
      {
        id: "stress-personal",
        type: "personal",
        prompt: "Listen, then say these aloud: ďakujem, Bratislava, prosím.",
      },
    ),
    referenceLinks: [
      { href: "/pronunciation/first-syllable-stress", label: "First-syllable stress" },
      { href: "/dictionary/dakujem", label: "ďakujem" },
    ],
  },
];
