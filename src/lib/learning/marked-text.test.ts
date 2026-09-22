import { describe, expect, it } from "vitest";

import {
  markedText,
  markRoleClass,
  sanitizeMarks,
  segmentsFromMarks,
  type TextMark,
} from "./marked-text";

describe("markedText", () => {
  it("builds offsets from pieces so the plain string stays the source of truth", () => {
    const built = markedText([
      "Stretneme sa ",
      { role: "day", text: "v sobotu" },
      " ",
      { role: "time", text: "o druhej" },
      "?",
    ]);

    expect(built.text).toBe("Stretneme sa v sobotu o druhej?");
    expect(built.text.slice(built.marks[0]!.start, built.marks[0]!.end)).toBe("v sobotu");
    expect(built.text.slice(built.marks[1]!.start, built.marks[1]!.end)).toBe("o druhej");
    expect(built.marks.map((mark) => mark.role)).toEqual(["day", "time"]);
  });

  it("skips empty spans", () => {
    const built = markedText(["Áno. ", { role: "time", text: "" }, "O druhej."]);
    expect(built).toEqual({ text: "Áno. O druhej.", marks: [] });
  });
});

describe("sanitizeMarks", () => {
  const text = "Stretneme sa v sobotu o druhej?";

  it("drops out-of-range, inverted, and unknown roles", () => {
    const marks = [
      { start: -1, end: 4, role: "day" },
      { start: 3, end: 3, role: "time" },
      { start: 1, end: 99, role: "day" },
      { start: 0, end: 4, role: "case" },
      { start: 13, end: 21, role: "day" },
    ] as unknown as TextMark[];

    expect(sanitizeMarks(text, marks)).toEqual([{ start: 13, end: 21, role: "day" }]);
  });

  it("keeps the longer span when two start together and drops anything inside it", () => {
    const marks: TextMark[] = [
      { start: 13, end: 16, role: "day" },
      { start: 13, end: 21, role: "time" },
      { start: 16, end: 21, role: "day" },
      { start: 22, end: 30, role: "time" },
    ];

    expect(sanitizeMarks(text, marks)).toEqual([
      { start: 13, end: 21, role: "time" },
      { start: 22, end: 30, role: "time" },
    ]);
  });
});

describe("segmentsFromMarks", () => {
  it("returns one plain run when there are no marks", () => {
    expect(segmentsFromMarks("O tretej.", undefined)).toEqual([
      { text: "O tretej.", role: null },
    ]);
    expect(segmentsFromMarks("", [])).toEqual([]);
  });

  it("splits around adjacent roles without empty gaps", () => {
    const built = markedText([
      { role: "day", text: "V sobotu" },
      " ",
      { role: "time", text: "o druhej" },
    ]);

    expect(segmentsFromMarks(built.text, built.marks)).toEqual([
      { text: "V sobotu", role: "day" },
      { text: " ", role: null },
      { text: "o druhej", role: "time" },
    ]);
  });
});

describe("markRoleClass", () => {
  it("maps day and time onto shared theme classes", () => {
    expect(markRoleClass("day")).toBe("text-mark-day");
    expect(markRoleClass("time")).toBe("text-mark-time");
  });
});
