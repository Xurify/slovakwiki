import type { PracticeItem } from "$lib/learning/types";

export const everydayPracticeItems: PracticeItem[] = [
  {
    id: "everyday/formal-greeting",
    source: {
      kind: "lesson",
      label: "Greetings and introductions",
      href: "/lessons/everyday/meet-someone",
    },
    task: {
      id: "review-formal-greeting",
      type: "choice",
      practiceItemId: "everyday/formal-greeting",
      prompt: "Hello; good day.",
      choices: [
        { id: "formal", label: "Dobrý deň." },
        {
          id: "informal",
          label: "Ahoj!",
          whyWrong:
            "**Ahoj** is informal — use **Dobrý deň** with someone you meet for the first time.",
        },
        {
          id: "leaving",
          label: "Dovidenia.",
          whyWrong: "**Dovidenia** means goodbye — not a greeting.",
        },
      ],
      answerId: "formal",
      feedback: {
        correction: "Dobrý deň.",
        english: "Hello; good day.",
        why: "This is a new, polite interaction. Use **Dobrý deň**; **Ahoj** is informal.",
      },
    },
    feedback: {
      correction: "Dobrý deň.",
      english: "Hello; good day.",
      why: "This is a new, polite interaction. Use **Dobrý deň**; **Ahoj** is informal.",
    },
  },
  {
    id: "everyday/introduction",
    source: {
      kind: "lesson",
      label: "Greetings and introductions",
      href: "/lessons/everyday/meet-someone",
    },
    task: {
      id: "review-introduction",
      type: "build",
      practiceItemId: "everyday/introduction",
      prompt:
        "A colleague says Volám sa Marta. Build your reply: “Hello. My name is Alex.”",
      tiles: ["Alex.", "sa", "Dobrý deň.", "Volám"],
      answer: ["Dobrý deň.", "Volám", "sa", "Alex."],
      feedback: {
        correction: "Dobrý deň. Volám sa Alex.",
        english: "Hello. My name is Alex.",
        why: "**Volám sa** is the natural everyday introduction. **Sa** belongs with **volám**.",
      },
    },
    feedback: {
      correction: "Dobrý deň. Volám sa Alex.",
      english: "Hello. My name is Alex.",
      why: "**Volám sa** is the natural everyday introduction. **Sa** belongs with **volám**.",
    },
  },
  {
    id: "everyday/origin",
    source: {
      kind: "lesson",
      label: "Greetings and introductions",
      href: "/lessons/everyday/meet-someone",
    },
    task: {
      id: "review-origin",
      type: "typed",
      task: "complete",
      practiceItemId: "everyday/origin",
      context: [
        {
          id: "review-origin-question",
          speaker: "Anna",
          slovak: "Odkiaľ ste?",
          english: "Where are you from?",
        },
      ],
      prompt: "I am from Canada.",
      inputLabel: "Your Slovak answer",
      answer: "Som z Kanady.",
      feedback: {
        correction: "Som z Kanady.",
        english: "I am from Canada.",
        why: "Use **Som z …** for your origin. The country takes its Slovak form after **z**.",
      },
    },
    feedback: {
      correction: "Som z Kanady.",
      english: "I am from Canada.",
      why: "Use **Som z …** for your origin. The country takes its Slovak form after **z**.",
    },
    newUse: "Now answer once with your own country.",
  },
  {
    id: "everyday/age-with-rokov",
    source: {
      kind: "lesson",
      label: "Numbers and personal details",
      href: "/lessons/everyday/numbers-and-personal-details",
    },
    task: {
      id: "review-age-with-rokov",
      type: "typed",
      task: "complete",
      practiceItemId: "everyday/age-with-rokov",
      context: [
        {
          id: "review-age-question",
          speaker: "Mária",
          slovak: "Koľko máte rokov?",
          english: "How old are you?",
        },
      ],
      prompt: "I am twenty years old.",
      inputLabel: "Your Slovak answer",
      answer: "Mám dvadsať rokov.",
      feedback: {
        correction: "Mám dvadsať rokov.",
        english: "I am twenty years old.",
        why: "Slovak says I have twenty years: **mám** + number + **rokov**.",
      },
    },
    feedback: {
      correction: "Mám dvadsať rokov.",
      english: "I am twenty years old.",
      why: "Slovak says I have twenty years: **mám** + number + **rokov**.",
    },
    newUse: "Say your own age with Mám … rokov.",
  },
  {
    id: "everyday/phone-number-digits",
    source: {
      kind: "lesson",
      label: "Numbers and personal details",
      href: "/lessons/everyday/numbers-and-personal-details",
    },
    task: {
      id: "review-phone-number-digits",
      type: "build",
      practiceItemId: "everyday/phone-number-digits",
      prompt: "Zero nine zero five.",
      tiles: ["päť.", "deväť", "nula", "nula", "deväť", "nula"],
      answer: ["nula", "deväť", "nula", "päť."],
      feedback: {
        correction: "Nula deväť nula päť.",
        english: "Zero nine zero five.",
        why: "Phone numbers are normally read **digit by digit**, not as one whole number.",
      },
    },
    feedback: {
      correction: "Nula deväť nula päť.",
      english: "Zero nine zero five.",
      why: "Phone numbers are normally read **digit by digit**, not as one whole number.",
    },
  },
  {
    id: "everyday/how-much-does-it-cost",
    source: {
      kind: "lesson",
      label: "Numbers and personal details",
      href: "/lessons/everyday/numbers-and-personal-details",
    },
    task: {
      id: "review-how-much-does-it-cost",
      type: "choice",
      practiceItemId: "everyday/how-much-does-it-cost",
      prompt: "It costs five euros.",
      choices: [
        { id: "price", label: "Stojí to päť eur." },
        {
          id: "age",
          label: "Mám päť rokov.",
          whyWrong: "**Mám … rokov** states your age — not a price.",
        },
        {
          id: "time",
          label: "O piatej.",
          whyWrong: "**O piatej** gives a time — not an answer to **Koľko to stojí?**",
        },
      ],
      answerId: "price",
      feedback: {
        correction: "Stojí to päť eur.",
        english: "It costs five euros.",
        why: "**Koľko to stojí?** asks the price. Use **Stojí to** + number + **eur**.",
      },
    },
    feedback: {
      correction: "Stojí to päť eur.",
      english: "It costs five euros.",
      why: "**Koľko to stojí?** asks the price. Use **Stojí to** + number + **eur**.",
    },
  },
  {
    id: "everyday/negative-answer",
    source: {
      kind: "lesson",
      label: "Negation in conversation",
      href: "/lessons/everyday/negation-in-conversation",
    },
    task: {
      id: "review-negative-answer",
      type: "choice",
      practiceItemId: "everyday/negative-answer",
      prompt: "No, thank you.",
      choices: [
        { id: "no-thanks", label: "Nie, ďakujem." },
        {
          id: "yes-thanks",
          label: "Áno, ďakujem.",
          whyWrong: "**Áno, ďakujem** accepts the offer — you want to decline.",
        },
        {
          id: "understand",
          label: "Rozumiem.",
          whyWrong: "**Rozumiem** means I understand — it does not decline the bag.",
        },
      ],
      answerId: "no-thanks",
      feedback: {
        correction: "Nie, ďakujem.",
        english: "No, thank you.",
        why: "**Nie** gives a polite no. Add **ďakujem** to decline courteously.",
      },
    },
    feedback: {
      correction: "Nie, ďakujem.",
      english: "No, thank you.",
      why: "**Nie** gives a polite no. Add **ďakujem** to decline courteously.",
    },
  },
  {
    id: "everyday/not-understand",
    source: {
      kind: "lesson",
      label: "Negation in conversation",
      href: "/lessons/everyday/negation-in-conversation",
    },
    task: {
      id: "review-not-understand",
      type: "typed",
      task: "complete",
      practiceItemId: "everyday/not-understand",
      context: [
        {
          id: "review-not-understand-question",
          speaker: "Receptionist",
          slovak: "Vyplňte tento formulár.",
          english: "Fill in this form.",
        },
      ],
      prompt: "I do not understand.",
      inputLabel: "Your Slovak answer",
      answer: "Nerozumiem.",
      feedback: {
        correction: "Nerozumiem.",
        english: "I do not understand.",
        why: "Negation attaches to the verb: **rozumiem** becomes **nerozumiem**.",
      },
    },
    feedback: {
      correction: "Nerozumiem.",
      english: "I do not understand.",
      why: "Negation attaches to the verb: **rozumiem** becomes **nerozumiem**.",
    },
    newUse: "Follow with Prosím, pomalšie. — “Please, more slowly.”",
  },
  {
    id: "everyday/negative-verb-placement",
    source: {
      kind: "lesson",
      label: "Negation in conversation",
      href: "/lessons/everyday/negation-in-conversation",
    },
    task: {
      id: "review-negative-verb-placement",
      type: "build",
      practiceItemId: "everyday/negative-verb-placement",
      prompt: "I do not have time.",
      tiles: ["čas.", "Nie", "Nemám", "čas."],
      answer: ["Nemám", "čas."],
      feedback: {
        correction: "Nemám čas.",
        english: "I do not have time.",
        why: "**Nie** attaches to the verb as a negative form: **mám** becomes **nemám**, not **nie mám**.",
      },
    },
    feedback: {
      correction: "Nemám čas.",
      english: "I do not have time.",
      why: "**Nie** attaches to the verb as a negative form: **mám** becomes **nemám**, not **nie mám**.",
    },
  },
  {
    id: "everyday/nice-to-meet-you",
    source: {
      kind: "lesson",
      label: "Greetings and introductions",
      href: "/lessons/everyday/meet-someone",
    },
    task: {
      id: "review-nice-to-meet-you",
      type: "choice",
      practiceItemId: "everyday/nice-to-meet-you",
      prompt: "Which reply means “Nice to meet you too”?",
      choices: [
        { id: "too", label: "Aj mňa teší." },
        {
          id: "thanks",
          label: "Ďakujem za pomoc.",
          whyWrong:
            "**Ďakujem za pomoc** thanks someone for help — not a reply to **Teší ma**.",
        },
        {
          id: "goodbye",
          label: "Dovidenia.",
          whyWrong: "**Dovidenia** means goodbye — not **nice to meet you too**.",
        },
      ],
      answerId: "too",
      feedback: {
        correction: "Aj mňa teší.",
        english: "Nice to meet you too.",
        why: "**Aj** means too or also. **Aj mňa teší** returns the same polite sentiment.",
      },
    },
    feedback: {
      correction: "Aj mňa teší.",
      english: "Nice to meet you too.",
      why: "**Aj** means too or also. **Aj mňa teší** returns the same polite sentiment.",
    },
  },
  {
    id: "everyday/ask-origin",
    source: {
      kind: "lesson",
      label: "Greetings and introductions",
      href: "/lessons/everyday/meet-someone",
    },
    task: {
      id: "review-ask-origin",
      type: "build",
      practiceItemId: "everyday/ask-origin",
      prompt: "Where are you from?",
      tiles: ["ste?", "Odkiaľ", "Som", "z"],
      answer: ["Odkiaľ", "ste?"],
      feedback: {
        correction: "Odkiaľ ste?",
        english: "Where are you from?",
        why: "**Odkiaľ** asks from where. **Ste** keeps the question polite or addresses more than one person.",
      },
    },
    feedback: {
      correction: "Odkiaľ ste?",
      english: "Where are you from?",
      why: "**Odkiaľ** asks from where. **Ste** keeps the question polite or addresses more than one person.",
    },
  },
  {
    id: "everyday/speak-a-little",
    source: {
      kind: "lesson",
      label: "Greetings and introductions",
      href: "/lessons/everyday/meet-someone",
    },
    task: {
      id: "review-speak-a-little",
      type: "typed",
      task: "complete",
      practiceItemId: "everyday/speak-a-little",
      context: [
        {
          id: "review-speak-a-little-question",
          speaker: "Anna",
          slovak: "Hovoríte po slovensky?",
          english: "Do you speak Slovak?",
        },
      ],
      prompt: "I speak a little Slovak.",
      inputLabel: "Your Slovak answer",
      answer: "Hovorím trochu po slovensky.",
      acceptedAnswers: ["Trochu hovorím po slovensky."],
      feedback: {
        correction: "Hovorím trochu po slovensky.",
        english: "I speak a little Slovak.",
        why: "**Hovorím** is I speak. **Po slovensky** names the language used.",
      },
    },
    feedback: {
      correction: "Hovorím trochu po slovensky.",
      english: "I speak a little Slovak.",
      why: "**Hovorím** is I speak. **Po slovensky** names the language used.",
    },
  },
];
