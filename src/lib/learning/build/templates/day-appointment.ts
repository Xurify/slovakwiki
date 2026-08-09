import { shuffleArray } from "$lib/learning/time/clock";

import type { BuildTemplate } from "../types";

const WEEKDAYS = [
  { sk: "pondelok.", en: "Monday" },
  { sk: "utorok.", en: "Tuesday" },
  { sk: "stredu.", en: "Wednesday" },
  { sk: "štvrtok.", en: "Thursday" },
  { sk: "piatok.", en: "Friday" },
  { sk: "sobotu.", en: "Saturday" },
  { sk: "nedeľu.", en: "Sunday" },
] as const;

export const dayAppointmentTemplate: BuildTemplate = {
  id: "day-appointment",
  materialize(rng) {
    const day = WEEKDAYS[Math.floor(rng() * WEEKDAYS.length)]!;
    const answer = ["Stretneme", "sa", "v", day.sk];
    const decoyDay = WEEKDAYS[(WEEKDAYS.indexOf(day) + 1) % WEEKDAYS.length]!.sk;
    const distractors = [decoyDay, "o", day.sk];
    const tiles = shuffleArray([...answer, ...distractors], rng);
    const correction = `Stretneme sa v ${day.sk.replace(/\.$/, "")}.`;

    return {
      prompt: `We are meeting on ${day.en}.`,
      answer,
      tiles,
      feedback: {
        correction,
        english: `We are meeting on ${day.en}.`,
        why: "Use **v** + the day of the week for an appointment day: **v utorok**.",
      },
    };
  },
};
