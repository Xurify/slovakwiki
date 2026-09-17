import { drillLine } from "$lib/catalog/practice/hub";
import {
  practiceItemById,
  practiceItemHref,
  practiceItems,
  practiceSets,
} from "$lib/catalog/practice";

export interface PracticeBootSheet {
  id: string;
  lessonId: string;
  title: string;
}

export interface PracticeBootItem {
  english: string;
  href: string;
  id: string;
  slovak: string;
  sourceLabel: string;
}

export interface PracticeBootPayload {
  items: PracticeBootItem[];
  sheets: PracticeBootSheet[];
}

/** Compact catalog slice the pre-paint hub boot needs. */
export function buildPracticeBootPayload(): PracticeBootPayload {
  const items: PracticeBootItem[] = [];

  for (const item of practiceItems) {
    const href = practiceItemHref(item.id);
    if (!href) continue;

    const drill = drillLine(practiceItemById.get(item.id));
    items.push({
      id: item.id,
      href,
      slovak: drill.slovak,
      english: drill.english,
      sourceLabel: item.source.label,
    });
  }

  return {
    sheets: practiceSets.map((set) => ({
      id: set.id,
      lessonId: set.lessonId,
      title: set.title,
    })),
    items,
  };
}
