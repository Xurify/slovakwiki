import type { ListeningEpisode } from "$lib/catalog/listening/types";

/** Flat line indexes covered by one chapter; `end` is exclusive. */
export interface ChapterRange {
  end: number;
  start: number;
}

export function chapterRanges(
  episode: Pick<ListeningEpisode, "chapters">,
): ChapterRange[] {
  const ranges: ChapterRange[] = [];
  let cursor = 0;

  for (const chapter of episode.chapters) {
    ranges.push({ start: cursor, end: cursor + chapter.lines.length });
    cursor += chapter.lines.length;
  }

  return ranges;
}

export function chapterIndexForLine(ranges: ChapterRange[], lineIndex: number): number {
  const index = ranges.findIndex(
    (range) => lineIndex >= range.start && lineIndex < range.end,
  );
  return index === -1 ? Math.max(0, ranges.length - 1) : index;
}

export function isLastLineOfChapter(ranges: ChapterRange[], lineIndex: number): boolean {
  return ranges.some((range) => range.end - 1 === lineIndex);
}

/** Position inside the chapter, 1-based, for "Line 3 of 12". */
export function lineNumberInChapter(ranges: ChapterRange[], lineIndex: number): number {
  const range = ranges[chapterIndexForLine(ranges, lineIndex)];
  return range ? lineIndex - range.start + 1 : 1;
}
