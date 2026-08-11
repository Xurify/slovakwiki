import { describe, expect, it } from "vitest";

import type { LessonsBootPayload } from "$lib/lessons/boot-payload";
import { buildLessonsProgressView } from "$lib/lessons/progress-view";

const lesson = (
  id: string,
  track: "everyday" | "grammar" | "pronunciation",
  slug: string,
  title: string,
) => ({
  id,
  track,
  slug,
  title,
  promise: `${title} promise`,
  phraseSk: `${title} sk`,
  phraseEn: `${title} en`,
});

const indexPayload: LessonsBootPayload = {
  scopedTrackId: null,
  tracks: [
    {
      id: "everyday",
      title: "Everyday",
      lessonIds: ["everyday.a", "everyday.b"],
    },
    {
      id: "grammar",
      title: "Grammar",
      lessonIds: ["grammar.a"],
    },
  ],
  lessons: [
    lesson("everyday.a", "everyday", "a", "A"),
    lesson("everyday.b", "everyday", "b", "B"),
    lesson("grammar.a", "grammar", "a", "G"),
  ],
};

const scopedPayload: LessonsBootPayload = {
  scopedTrackId: "everyday",
  tracks: [
    {
      id: "everyday",
      title: "Everyday",
      lessonIds: ["everyday.a", "everyday.b"],
    },
  ],
  lessons: [
    lesson("everyday.a", "everyday", "a", "A"),
    lesson("everyday.b", "everyday", "b", "B"),
  ],
};

describe("buildLessonsProgressView", () => {
  it("empty storage focuses first lesson and zeros track progress", () => {
    const view = buildLessonsProgressView(indexPayload, new Set());

    expect(view.focusLessonId).toBe("everyday.a");
    expect(view.tracks).toEqual([
      { id: "everyday", doneCount: 0, percent: 0 },
      { id: "grammar", doneCount: 0, percent: 0 },
    ]);
    expect(view.scopedProgressPct).toBeNull();
    expect(view.trackContinue).toBeNull();
    expect(view.continueCard).toMatchObject({
      lessonTitle: "A",
      trackTitle: "Everyday",
      ctaLabel: "Continue",
      ctaHref: "/lessons/everyday/a",
      lessonNumber: 1,
      lessonTotal: 2,
      progressPercent: 0,
      motifLessonId: "everyday.a",
    });
    expect(view.lessonStatuses["everyday.a"]).toBe("active");
    expect(view.lessonStatuses["everyday.b"]).toBe("upcoming");
    expect(view.lessonStatuses["grammar.a"]).toBe("upcoming");
  });

  it("skips completed lessons for continue focus", () => {
    const view = buildLessonsProgressView(indexPayload, new Set(["everyday.a"]));

    expect(view.focusLessonId).toBe("everyday.b");
    expect(view.tracks[0]).toEqual({ id: "everyday", doneCount: 1, percent: 50 });
    expect(view.continueCard).toMatchObject({
      lessonTitle: "B",
      ctaLabel: "Continue",
      ctaHref: "/lessons/everyday/b",
      lessonNumber: 2,
      progressPercent: 50,
    });
    expect(view.lessonStatuses["everyday.a"]).toBe("complete");
    expect(view.lessonStatuses["everyday.b"]).toBe("active");
  });

  it("all-done track uses review CTA and focuses first lesson", () => {
    const view = buildLessonsProgressView(
      indexPayload,
      new Set(["everyday.a", "everyday.b", "grammar.a"]),
    );

    expect(view.focusLessonId).toBe("everyday.a");
    expect(view.continueCard).toMatchObject({
      ctaLabel: "Review lesson",
      ctaHref: "/lessons/everyday/a",
      progressPercent: 100,
    });
    expect(view.lessonStatuses["everyday.a"]).toBe("complete");
  });

  it("scoped track paints track continue and progress pct", () => {
    const view = buildLessonsProgressView(scopedPayload, new Set(["everyday.a"]));

    expect(view.focusLessonId).toBe("everyday.b");
    expect(view.scopedProgressPct).toBe(50);
    expect(view.continueCard).toBeNull();
    expect(view.trackContinue).toEqual({
      ctaLabel: "Continue learning",
      ctaHref: "/lessons/everyday/b",
    });
  });

  it("scoped all-done uses review learning CTA", () => {
    const view = buildLessonsProgressView(
      scopedPayload,
      new Set(["everyday.a", "everyday.b"]),
    );

    expect(view.scopedProgressPct).toBe(100);
    expect(view.trackContinue).toEqual({
      ctaLabel: "Review lesson",
      ctaHref: "/lessons/everyday/a",
    });
  });
});
