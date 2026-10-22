import { shuffleArray } from "$lib/learning/time/clock";

import type { BuildTemplate } from "../types";

const WEEKDAYS = [
  { sk: "pondelok.", en: "Monday", prep: "v" },
  { sk: "utorok.", en: "Tuesday", prep: "v" },
  { sk: "stredu.", en: "Wednesday", prep: "v" },
  { sk: "štvrtok.", en: "Thursday", prep: "vo" },
  { sk: "piatok.", en: "Friday", prep: "v" },
  { sk: "sobotu.", en: "Saturday", prep: "v" },
  { sk: "nedeľu.", en: "Sunday", prep: "v" },
] as const;

export const dayAppointmentTemplate: BuildTemplate = {
  id: "day-appointment",
  materialize(rng) {
    const day = WEEKDAYS[Math.floor(rng() * WEEKDAYS.length)]!;
    const answer = ["Stretneme", "sa", day.prep, day.sk];
    const decoyDay = WEEKDAYS[(WEEKDAYS.indexOf(day) + 1) % WEEKDAYS.length]!.sk;
    const distractors = [decoyDay, "o"];
    const tiles = shuffleArray([...answer, ...distractors], rng);
    const correction = `Stretneme sa ${day.prep} ${day.sk.replace(/\.$/, "")}.`;

    return {
      prompt: `We are meeting on ${day.en}.`,
      answer,
      tiles,
      feedback: {
        correction,
        english: `We are meeting on ${day.en}.`,
        why: "Use **v** + accusative for “on” a day: **v utorok**, **v stredu** — but **vo štvrtok**.",
      },
    };
  },
};
