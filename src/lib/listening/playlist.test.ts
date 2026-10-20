import { describe, expect, it } from "vitest";

import {
  chapterIndexForLine,
  chapterRanges,
  isLastLineOfChapter,
  lineNumberInChapter,
} from "./playlist";

const episode = {
  chapters: [{ lines: [{}, {}, {}] }, { lines: [{}] }, { lines: [{}, {}] }],
} as never;

describe("playlist ranges", () => {
  it("lays chapters end to end", () => {
    expect(chapterRanges(episode)).toEqual([
      { start: 0, end: 3 },
      { start: 3, end: 4 },
      { start: 4, end: 6 },
    ]);
  });

  it("finds the chapter and position of a line", () => {
    const ranges = chapterRanges(episode);
    expect(chapterIndexForLine(ranges, 0)).toBe(0);
    expect(chapterIndexForLine(ranges, 3)).toBe(1);
    expect(chapterIndexForLine(ranges, 5)).toBe(2);
    expect(chapterIndexForLine(ranges, 99)).toBe(2);
    expect(lineNumberInChapter(ranges, 2)).toBe(3);
    expect(lineNumberInChapter(ranges, 4)).toBe(1);
  });

  it("marks the last line of each chapter", () => {
    const ranges = chapterRanges(episode);
    expect([0, 1, 2, 3, 4, 5].map((index) => isLastLineOfChapter(ranges, index))).toEqual(
      [false, false, true, true, false, true],
    );
  });
});
