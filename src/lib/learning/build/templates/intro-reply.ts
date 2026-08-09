import { shuffleArray } from "$lib/learning/time/clock";

import type { BuildTemplate } from "../types";

const NAMES = ["Alex.", "Marta.", "Peter."] as const;

export const introReplyTemplate: BuildTemplate = {
  id: "intro-reply",
  materialize(rng) {
    const name = NAMES[Math.floor(rng() * NAMES.length)]!;
    const englishName = name.replace(/\.$/, "");
    const answer = ["Dobrý deň.", "Volám", "sa", name];
    const distractors = ["Ahoj!", "Som", name === "Alex." ? "Marta." : "Alex."];
    const tiles = shuffleArray([...answer, ...distractors], rng);
    const correction = `Dobrý deň. Volám sa ${name}`;

    return {
      prompt: `A colleague says Volám sa Marta. Build your reply: “Hello. My name is ${englishName}.”`,
      answer,
      tiles,
      feedback: {
        correction,
        english: `Hello. My name is ${englishName}.`,
        why: "**Volám sa** is the natural everyday introduction. **Sa** belongs with **volám**.",
      },
    };
  },
};
