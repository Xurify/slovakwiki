import type { BuildExercise, PracticeItem } from "$lib/learning/types";
import { shuffleArray } from "$lib/learning/time/clock";

const MEETING_DAYS = [
  { tile: "pondelok.", en: "Monday", inPhrase: "pondelok" },
  { tile: "utorok.", en: "Tuesday", inPhrase: "utorok" },
  { tile: "stredu.", en: "Wednesday", inPhrase: "stredu" },
  { tile: "štvrtok.", en: "Thursday", inPhrase: "štvrtok" },
  { tile: "piatok.", en: "Friday", inPhrase: "piatok" },
  { tile: "sobotu.", en: "Saturday", inPhrase: "sobotu" },
  { tile: "nedeľu.", en: "Sunday", inPhrase: "nedeľu" },
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

  const answer = ["Stretneme", "sa", "v", day.tile];
  const tiles = shuffleArray(
    ["v", "Stretneme", "sa", day.tile, ...distractorTiles],
    rng,
  );
  const correction = `Stretneme sa v ${day.inPhrase}.`;
  const feedback = {
    correction,
    english: `We are meeting on ${day.en}.`,
    why: "Use **v** + the day of the week for an appointment day: **v utorok**.",
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
