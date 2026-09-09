import { describe, expect, it } from "vitest";

import {
  attachAiPicks,
  fingerprintsMatch,
  hitFingerprints,
  parseJudgeJson,
} from "./image-judge";
import type { ImageSourcePreviewRow } from "./image-source-preview";

const hit = (fileTitle: string) => ({
  fileTitle,
  thumbUrl: `https://example.com/${fileTitle}`,
});

const row = (hits: ImageSourcePreviewRow["hits"]): ImageSourcePreviewRow => ({
  category: "Nouns",
  english: "cake; pastry",
  hits,
  slovak: "koláč",
  slug: "kolac",
});

describe("parseJudgeJson", () => {
  it("reads fenced JSON and normalizes pick", () => {
    expect(
      parseJudgeJson('```json\n{"pick":"SK","confidence":"low","reason":"pastry"}\n```'),
    ).toEqual({ pick: "sk", confidence: "low", reason: "pastry" });
  });

  it("rejects unknown sources", () => {
    expect(() => parseJudgeJson('{"pick":"flickr","reason":"x"}')).toThrow(
      /pick invalid/,
    );
  });

  it("accepts live", () => {
    expect(parseJudgeJson('{"pick":"live","reason":"keep catalog"}')).toEqual({
      pick: "live",
      confidence: "high",
      reason: "keep catalog",
    });
  });
});

describe("attachAiPicks", () => {
  it("attaches only when filenames still match", () => {
    const current = row({ sk: hit("Koláčky.jpg"), en: hit("Pound.jpg") });
    const stale = row({ sk: hit("Old.jpg"), en: hit("Pound.jpg") });
    const judge = {
      judgedAt: "2026-01-01T00:00:00.000Z",
      model: "gpt-4o-mini",
      picks: {
        kolac: {
          confidence: "high" as const,
          fileTitle: "Koláčky.jpg",
          fingerprints: hitFingerprints(current.hits),
          model: "gpt-4o-mini",
          reason: "Slovak pastry",
          sourceId: "sk" as const,
        },
      },
    };
    expect(attachAiPicks([current], judge)[0]?.aiPick?.sourceId).toBe("sk");
    expect(attachAiPicks([stale], judge)[0]?.aiPick).toBeUndefined();
  });

  it("treats missing vs present fingerprint as mismatch", () => {
    expect(fingerprintsMatch({ sk: "a.jpg" }, { sk: "a.jpg", en: "b.jpg" })).toBe(false);
  });
});
