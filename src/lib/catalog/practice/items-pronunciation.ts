import type { PracticeItem } from "$lib/learning/types";

export const pronunciationPracticeItems: PracticeItem[] = [
  {
    id: "pronunciation/dakujem-stress",
    source: {
      kind: "lesson",
      label: "First-syllable stress",
      href: "/lessons/pronunciation/first-syllable-stress",
    },
    task: {
      id: "review-dakujem-stress",
      type: "choice",
      practiceItemId: "pronunciation/dakujem-stress",
      prompt: "Where is the main beat in ďakujem?",
      choices: [
        { id: "first", label: "ĎA-ku-jem" },
        {
          id: "middle",
          label: "ďa-KU-jem",
          whyWrong:
            "Slovak stress normally stays on the **first syllable**, not the middle.",
        },
        {
          id: "last",
          label: "ďa-ku-JEM",
          whyWrong:
            "Slovak stress normally stays on the **first syllable**, not the last.",
        },
      ],
      answerId: "first",
      feedback: {
        correction: "ĎA-ku-jem",
        why: "Slovak normally stresses the **first syllable**. Say it once aloud after checking.",
      },
    },
    feedback: {
      correction: "ĎA-ku-jem",
      why: "Slovak normally stresses the **first syllable**. Say it once aloud after checking.",
    },
  },
  {
    id: "pronunciation/thanks-phrase",
    source: {
      kind: "lesson",
      label: "First-syllable stress",
      href: "/lessons/pronunciation/first-syllable-stress",
    },
    task: {
      id: "review-thanks-phrase",
      type: "typed",
      task: "complete",
      practiceItemId: "pronunciation/thanks-phrase",
      context: [
        {
          id: "review-thanks-help",
          speaker: "Anna",
          slovak: "Pomôžem vám.",
          english: "I will help you.",
        },
      ],
      prompt: "Thank you for the help.",
      inputLabel: "Your Slovak answer",
      answer: "Ďakujem za pomoc.",
      feedback: {
        correction: "Ďakujem za pomoc.",
        english: "Thank you for the help.",
        why: "**Ďakujem** is stressed on its first syllable. Say **ĎA-ku-jem**, then keep the rest of the phrase even.",
      },
    },
    feedback: {
      correction: "Ďakujem za pomoc.",
      english: "Thank you for the help.",
      why: "**Ďakujem** is stressed on its first syllable. Say **ĎA-ku-jem**, then keep the rest of the phrase even.",
    },
  },
  {
    id: "pronunciation/bratislava-stress",
    source: {
      kind: "lesson",
      label: "First-syllable stress",
      href: "/lessons/pronunciation/first-syllable-stress",
    },
    task: {
      id: "review-bratislava-stress",
      type: "choice",
      practiceItemId: "pronunciation/bratislava-stress",
      prompt: "Where is the main stress in Bratislava?",
      choices: [
        { id: "first", label: "BRA-ti-sla-va" },
        {
          id: "middle",
          label: "bra-TI-sla-va",
          whyWrong:
            "Standard Slovak stress normally stays on the **first syllable**, not the middle.",
        },
        {
          id: "later",
          label: "bra-ti-SLA-va",
          whyWrong:
            "Standard Slovak stress normally stays on the **first syllable**, not a later syllable.",
        },
      ],
      answerId: "first",
      feedback: {
        correction: "BRA-ti-sla-va",
        why: "Standard Slovak normally places the main stress on the **first syllable**.",
      },
    },
    feedback: {
      correction: "BRA-ti-sla-va",
      why: "Standard Slovak normally places the main stress on the **first syllable**.",
    },
  },
  {
    id: "pronunciation/pomozem-stress",
    source: {
      kind: "lesson",
      label: "First-syllable stress",
      href: "/lessons/pronunciation/first-syllable-stress",
    },
    task: {
      id: "review-pomozem-stress",
      type: "choice",
      practiceItemId: "pronunciation/pomozem-stress",
      prompt: "Where is the main stress in pomôžem?",
      choices: [
        { id: "first", label: "PO-mô-žem" },
        {
          id: "middle",
          label: "po-MÔ-žem",
          whyWrong:
            "Slovak stress normally stays on the **first syllable**, not the middle.",
        },
        {
          id: "last",
          label: "po-mô-ŽEM",
          whyWrong:
            "Slovak stress normally stays on the **first syllable**, not the last.",
        },
      ],
      answerId: "first",
      feedback: {
        correction: "PO-mô-žem",
        why: "Stress the **first syllable**. The long **ô** remains long, but vowel length does not move the stress.",
      },
    },
    feedback: {
      correction: "PO-mô-žem",
      why: "Stress the **first syllable**. The long **ô** remains long, but vowel length does not move the stress.",
    },
  },
];
