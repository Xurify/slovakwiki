import type { PracticeState } from "$lib/client/practice-state";
import type { PracticeItem } from "$lib/learning/types";
import { lessonById, lessonTracks } from "$lib/content/lessons";
import {
  practiceItemById,
  practiceItemHref,
  practiceSessionCount,
  practiceSets,
  type PracticeSet,
} from "$lib/content/practice";

export type PracticeHubDrill = {
  english: string;
  slovak: string;
};

export type PracticeHubSheet = {
  completed: boolean;
  drill: PracticeHubDrill;
  exerciseCount: number;
  purpose: string;
  set: PracticeSet;
  trackTitle: string;
};

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

  return {
    slovak: task.answer,
    english: item.feedback.english ?? "",
  };
}

export function buildPracticeSheets(practiceState: PracticeState): PracticeHubSheet[] {
  return practiceSets.map((set) => {
    const lesson = lessonById.get(set.lessonId);
    const previewItem = practiceItemById.get(set.previewItemId ?? set.itemIds[0] ?? "");

    return {
      set,
      purpose: set.summary ?? lesson?.promise ?? "Work through this topic again.",
      exerciseCount: practiceSessionCount(set),
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
