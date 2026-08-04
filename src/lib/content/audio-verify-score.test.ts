import { describe, expect, it } from "vitest";

import {
  lastWordDisagreement,
  nearMissEndings,
  prefersNearMissEnding,
  weakLastLogprob,
} from "../../../scripts/audio/judge";
import {
  editDistance,
  foldSlovak,
  scoreTranscript,
  tokenizeFolded,
} from "../../../scripts/audio/verify-score";
import type { SttResult } from "../../../scripts/audio/stt";

describe("foldSlovak", () => {
  it("strips diacritics and punct", () => {
    expect(foldSlovak("Mýlil.")).toBe("mylil");
    expect(foldSlovak("príliš hrdý")).toBe("prilis hrdy");
  });
});

describe("scoreTranscript", () => {
  it("passes clean match", () => {
    const expected = "Tom priznal, že má strach.";
    const got = "Tom priznal, že má strach.";
    const score = scoreTranscript(expected, got);
    expect(score.ok).toBe(true);
    expect(score.unmatched).toEqual([]);
  });

  it("fails mylil → myliu ending mangling", () => {
    const expected = "Tom bol príliš hrdý priznať, že Mária mala pravdu a on sa mýlil.";
    const got = "Tom bol príliš hrdý priznať, že Mária mala pravdu. A on sa myliu.";
    const score = scoreTranscript(expected, got);
    expect(score.ok).toBe(false);
    expect(score.unmatched.some((u) => u.includes("milil") || u.includes("ending:"))).toBe(
      true,
    );
  });

  it("fails even when score is otherwise high but last consonant drifts", () => {
    const expected = "on sa mýlil.";
    const got = "on sa mýliu.";
    const score = scoreTranscript(expected, got);
    expect(score.ok).toBe(false);
  });

  it("passes multilingual_v2 style transcript with í/ý fold", () => {
    const expected = "Tom bol príliš hrdý priznať, že Mária mala pravdu a on sa mýlil.";
    const got = "Tom bol príliš hrdý priznať, že Mária mala pravdu a on sa mílil.";
    const score = scoreTranscript(expected, got);
    expect(score.ok).toBe(true);
    expect(score.unmatched).toEqual([]);
  });

  it("tolerates Whisper-glued tokens (vojak ↔ ovojak)", () => {
    const score = scoreTranscript("povedal vojak.", "poveda ovojak.");
    expect(score.unmatched).not.toContain("vojak");
  });

  it("tolerates Whisper-split negation (nebol ↔ nie bol)", () => {
    const score = scoreTranscript("A preto nebol na stretnutí.", "a preto nie bol na stretnutí.");
    expect(score.unmatched).not.toContain("nebol");
  });

  it("tolerates Whisper š/ž noise on longer tokens", () => {
    const expected = "Tom bol príliš hrdý.";
    const got = "Tom bol príliž hrdý.";
    const score = scoreTranscript(expected, got);
    expect(score.ok).toBe(true);
  });

  it("fails lemma inflection drift kuchyna → kuchynie", () => {
    const score = scoreTranscript("kuchyňa", "Kuchynie.");
    expect(score.ok).toBe(false);
  });

  it("tokenizes", () => {
    expect(tokenizeFolded("A — B!")).toEqual(["a", "b"]);
    expect(editDistance("mylil", "myliu")).toBe(1);
  });
});

describe("near-miss / dual judge helpers", () => {
  it("builds mylil → myliu near miss", () => {
    expect(nearMissEndings("mýlil")).toContain("miliu");
  });

  it("detects Whisper preferring myliu over mylil", () => {
    const expected = "Tom bol príliš hrdý priznať, že Mária mala pravdu a on sa mýlil.";
    expect(prefersNearMissEnding(expected, "… a on sa myliu.")).toBe(true);
    expect(prefersNearMissEnding(expected, "… a on sa mýlil.")).toBe(false);
  });

  it("flags Scribe/Whisper last-word disagreement", () => {
    expect(
      lastWordDisagreement(
        "Tom bol príliš hrdý priznať, že Mária mala pravdu a on sa mýlil.",
        "Tom bol príliš hrdý priznať, že Mária mala pravdu a on sa mýliu.",
      ),
    ).toBe(true);
    expect(
      lastWordDisagreement(
        "Tom bol príliš hrdý priznať, že Mária mala pravdu a on sa mýlil.",
        "Tom bol príliš hrdý priznať, že Mária mala pravdu a on sa mílil.",
      ),
    ).toBe(false);
  });

  it("flags weak last-word logprob vs earlier words", () => {
    const stt: SttResult = {
      provider: "elevenlabs",
      text: "a on sa mýlil.",
      words: [
        { text: "on", logprob: -0.000001 },
        { text: "sa", logprob: -0.000001 },
        { text: "mýlil.", logprob: -0.009 },
      ],
    };
    expect(weakLastLogprob(stt)).toBe(true);

    const strong: SttResult = {
      provider: "elevenlabs",
      text: "a on sa mýlil.",
      words: [
        { text: "on", logprob: -0.000001 },
        { text: "sa", logprob: -0.000001 },
        { text: "mýlil.", logprob: -0.000002 },
      ],
    };
    expect(weakLastLogprob(strong)).toBe(false);
  });
});
