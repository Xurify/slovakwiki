import type { BuildExercise, PracticeItem } from "$lib/learning/types";
import { shuffleArray } from "$lib/learning/time/clock";

const MEETING_DAYS = [
  { tile: "pondelok.", en: "Monday", prep: "v", inPhrase: "pondelok" },
  { tile: "utorok.", en: "Tuesday", prep: "v", inPhrase: "utorok" },
  { tile: "stredu.", en: "Wednesday", prep: "v", inPhrase: "stredu" },
  { tile: "štvrtok.", en: "Thursday", prep: "vo", inPhrase: "štvrtok" },
  { tile: "piatok.", en: "Friday", prep: "v", inPhrase: "piatok" },
  { tile: "sobotu.", en: "Saturday", prep: "v", inPhrase: "sobotu" },
  { tile: "nedeľu.", en: "Sunday", prep: "v", inPhrase: "nedeľu" },
] as const;

function assertBuildTask(item: PracticeItem): BuildExercise {
  if (item.task.type !== "build") {
    throw new Error(`Expected build task for ${item.id}`);
  }
  return item.task;
}

function materializeDayMeetingItem(
  catalog: PracticeItem,
  rng: () => number,
): PracticeItem {
  const task = assertBuildTask(catalog);
  const dayIndex = Math.floor(rng() * MEETING_DAYS.length);
  const day = MEETING_DAYS[dayIndex] ?? MEETING_DAYS[1]!;

  const distractorTiles = shuffleArray(
    MEETING_DAYS.filter((candidate) => candidate.tile !== day.tile).map(
      (candidate) => candidate.tile,
    ),
    rng,
  ).slice(0, 2);

  const answer = ["Stretneme", "sa", day.prep, day.tile];
  const tiles = shuffleArray(
    [day.prep, "Stretneme", "sa", day.tile, ...distractorTiles],
    rng,
  );
  const correction = `Stretneme sa ${day.prep} ${day.inPhrase}.`;
  const feedback = {
    correction,
    english: `We are meeting on ${day.en}.`,
    why: "Use **v** + accusative for “on” a day: **v utorok**, **v stredu** — but **vo štvrtok**.",
  };

  return {
    ...catalog,
    task: {
      ...task,
      id: `generated-${catalog.id}`,
      prompt: `We are meeting on ${day.en}.`,
      tiles,
      answer,
      feedback,
    },
    feedback,
  };
}

export function materializeBuildItem(
  catalog: PracticeItem,
  rng: () => number = Math.random,
): PracticeItem {
  if (catalog.id === "everyday/day-meeting") {
    return materializeDayMeetingItem(catalog, rng);
  }

  const task = assertBuildTask(catalog);

  return {
    ...catalog,
    task: {
      ...task,
      id: `generated-${catalog.id}`,
      tiles: shuffleArray(task.tiles, rng),
      answer: [...task.answer],
    },
  };
}

export function maybeMaterializeBuildItem(
  item: PracticeItem,
  rng: () => number = Math.random,
): PracticeItem {
  if (item.task.type !== "build") return item;
  return materializeBuildItem(item, rng);
}
