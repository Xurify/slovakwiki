import type { PracticeState } from "$lib/components/practice/practice-state";
import type { PracticeItem, PracticeTask } from "$lib/learning/types";
import { lessonById, lessonPath, lessonTracks } from "$lib/catalog/lessons";
import {
  practiceItemById,
  practiceItemHref,
  practiceSessionCount,
  practiceSets,
  type PracticeSet,
} from "$lib/catalog/practice";

export type PracticeHubDrill = {
  english: string;
  slovak: string;
};

/** Learner-facing exercise formats, in display order. */
export type PracticeTaskKind = "choose" | "fill" | "build" | "type" | "repair" | "select";

const TASK_KIND_ORDER: PracticeTaskKind[] = [
  "choose",
  "fill",
  "build",
  "type",
  "repair",
  "select",
];

export const practiceTaskKindLabel: Record<PracticeTaskKind, string> = {
  build: "Build",
  choose: "Choose",
  fill: "Fill the gap",
  repair: "Repair",
  select: "Select all",
  type: "Type",
};

/** "choose, build, and type" — formats as a lowercase prose list. */
export function practiceTaskKindsPhrase(kinds: PracticeTaskKind[]): string {
  const words = kinds.map((kind) => practiceTaskKindLabel[kind].toLowerCase());
  if (words.length <= 2) return words.join(" and ");
  return `${words.slice(0, -1).join(", ")}, and ${words.at(-1)}`;
}

export function practiceTaskKind(task: PracticeTask): PracticeTaskKind {
  switch (task.type) {
    case "choice":
      return "choose";
    case "cloze":
      return "fill";
    case "build":
      return "build";
    case "selectAll":
      return "select";
    case "typed":
      return task.task === "repair" ? "repair" : "type";
  }
}

/** Unique exercise formats in a set's pool, in display order. */
export function practiceSetTaskKinds(set: PracticeSet): PracticeTaskKind[] {
  const kinds = new Set<PracticeTaskKind>();
  for (const itemId of set.itemIds) {
    const item = practiceItemById.get(itemId);
    if (item) kinds.add(practiceTaskKind(item.task));
  }
  return TASK_KIND_ORDER.filter((kind) => kinds.has(kind));
}

/** Rough sitting time — ~35 s per exercise, never under a minute. */
export function estimatePracticeMinutes(exerciseCount: number): number {
  return Math.max(1, Math.round((exerciseCount * 35) / 60));
}

export type PracticeHubSheet = {
  completed: boolean;
  drill: PracticeHubDrill;
  exerciseCount: number;
  lessonHref: string | null;
  minutes: number;
  purpose: string;
  set: PracticeSet;
  taskKinds: PracticeTaskKind[];
  trackTitle: string;
};

/** Path step status on `/practice`; mirrored by `data-state` in the hub boot. */
export type PracticeStepState = "done" | "next" | "todo";

export function practiceStepState(
  sheet: PracticeHubSheet,
  featuredId: string,
): PracticeStepState {
  if (sheet.set.id === featuredId) return "next";
  return sheet.completed ? "done" : "todo";
}

export type PracticeHubRecent = {
  drill: PracticeHubDrill;
  href: string;
  id: string;
  sourceLabel: string;
};

export function drillLine(item: PracticeItem | undefined): PracticeHubDrill {
  if (!item) {
    return { slovak: "…", english: "" };
  }

  const clean = (value: string) =>
    value.includes("-") ? value.replace(/-/g, "").toLocaleLowerCase("sk-SK") : value;

  const task = item.task;

  if (task.type === "cloze") {
    return {
      slovak: task.frame.replace("{}", "______"),
      english: task.sentenceEn ?? task.gapEn,
    };
  }

  if (task.type === "choice") {
    const correction = item.feedback.correction?.trim() ?? "";
    const chosen =
      task.choices.find((choice) => choice.id === task.answerId)?.label ?? correction;
    return {
      slovak: clean(correction || chosen),
      english: item.feedback.english ?? "",
    };
  }

  if (task.type === "build") {
    return {
      slovak: task.answer.join(" "),
      english: item.feedback.english ?? "",
    };
  }

  if (task.type === "selectAll") {
    const correction = item.feedback.correction?.trim() ?? "";
    const correctLabels = task.choices
      .filter((choice) => choice.correct)
      .map((choice) => choice.label)
      .join(" / ");
    return {
      slovak: clean(correction || correctLabels),
      english: item.feedback.english ?? "",
    };
  }

  return {
    slovak: task.answer,
    english: item.feedback.english ?? "",
  };
}

export function buildPracticeSheets(practiceState: PracticeState): PracticeHubSheet[] {
  return practiceSets.map((set) => {
    const lesson = lessonById.get(set.lessonId);
    const previewItem = practiceItemById.get(set.previewItemId ?? set.itemIds[0] ?? "");
    const exerciseCount = practiceSessionCount(set);

    return {
      set,
      purpose: set.summary ?? lesson?.promise ?? "Work through this topic again.",
      exerciseCount,
      minutes: estimatePracticeMinutes(exerciseCount),
      taskKinds: practiceSetTaskKinds(set),
      lessonHref: lesson ? lessonPath(lesson) : null,
      completed: practiceState.completedLessonIds.includes(set.lessonId),
      drill: drillLine(previewItem),
      trackTitle:
        lessonTracks.find((entry) => entry.id === set.track)?.title ?? set.track,
    };
  });
}

export function groupSheetsByTrack(sheets: PracticeHubSheet[]) {
  return lessonTracks
    .map((track) => {
      const trackSheets = sheets.filter((sheet) => sheet.set.track === track.id);
      return {
        track,
        sheets: trackSheets,
        exerciseCount: trackSheets.reduce((sum, sheet) => sum + sheet.exerciseCount, 0),
      };
    })
    .filter((group) => group.sheets.length > 0);
}

export function pickFeaturedSheet(
  sheets: PracticeHubSheet[],
): PracticeHubSheet | undefined {
  return sheets.find((sheet) => !sheet.completed) ?? sheets[0];
}

export function practiceToday(sheets: PracticeHubSheet[]) {
  const featured = pickFeaturedSheet(sheets);

  if (!featured) return undefined;

  return {
    featured,
    siblings: sheets.filter(
      (sheet) =>
        sheet.set.track === featured.set.track && sheet.set.id !== featured.set.id,
    ),
    doneCount: sheets.filter((sheet) => sheet.completed).length,
    totalCount: sheets.length,
  };
}

export function buildRecentDrills(practiceState: PracticeState): PracticeHubRecent[] {
  const drills: PracticeHubRecent[] = [];

  for (const itemId of [...practiceState.recentItemIds].reverse()) {
    const item = practiceItemById.get(itemId);
    const href = practiceItemHref(itemId);
    if (!item || !href) continue;

    drills.push({
      id: item.id,
      href,
      sourceLabel: item.source.label,
      drill: drillLine(item),
    });

    if (drills.length >= 8) break;
  }

  return drills;
}

export function totalPracticeExercises(): number {
  return practiceSets.reduce((sum, set) => sum + practiceSessionCount(set), 0);
}
