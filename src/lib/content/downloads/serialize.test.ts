import { describe, expect, it } from "vitest";

import {
  buildDownloadFilenames,
  buildDownloadPayloads,
  projectExport,
  toDelimited,
} from "./serialize";
import type { ExportWord } from "./types";

const sampleWords: ExportWord[] = [
  {
    slug: "hovorit",
    slovak: "hovoriť",
    english: "to speak",
    category: "Verbs",
    related: ["povedať", "rozumiem"],
    examples: [
      {
        slovak: "Hovorím po slovensky.",
        english: "I speak Slovak.",
      },
    ],
  },
  {
    slug: "dom",
    slovak: "dom",
    english: "house",
    category: "Nouns",
    related: [],
    examples: [
      {
        slovak: "Mám dom.",
        english: "I have a house.",
      },
    ],
  },
];

describe("projectExport", () => {
  it("drops unchecked word fields", () => {
    const projected = projectExport(sampleWords, {
      format: "json",
      fields: ["slug", "slovak"],
    });

    expect(projected.wordsJson[0]).toEqual({ slug: "hovorit", slovak: "hovoriť" });
    expect(projected.includeExamples).toBe(false);
    expect(projected.exampleRows).toHaveLength(0);
  });

  it("filters by category", () => {
    const projected = projectExport(sampleWords, {
      format: "json",
      fields: ["slug", "category"],
      categories: ["Nouns"],
    });

    expect(projected.wordsJson).toHaveLength(1);
    expect(projected.wordsJson[0]?.slug).toBe("dom");
  });

  it("emits example rows with slug + spelled lemma", () => {
    const projected = projectExport(sampleWords, {
      format: "csv",
      fields: ["slug", "examples"],
    });

    expect(projected.includeExamples).toBe(true);
    expect(projected.exampleRows).toHaveLength(2);
    expect(projected.exampleRows[0]).toEqual({
      slug: "hovorit",
      lemma: "hovoriť",
      slovak: "Hovorím po slovensky.",
      english: "I speak Slovak.",
    });
  });

  it("supports examples-only (no lemma columns)", () => {
    const projected = projectExport(sampleWords, {
      format: "tsv",
      fields: ["examples"],
    });

    expect(projected.wordRows).toHaveLength(0);
    expect(projected.exampleRows).toHaveLength(2);
    expect(projected.wordsJson[0]).toEqual({
      slug: "hovorit",
      lemma: "hovoriť",
      examples: [
        {
          slovak: "Hovorím po slovensky.",
          english: "I speak Slovak.",
        },
      ],
    });
  });

  it("keeps spelled related and omits internal example metadata in nested JSON", () => {
    const projected = projectExport(sampleWords, {
      format: "json",
      fields: ["slug", "slovak", "related", "examples"],
    });

    expect(projected.wordsJson[0]).toEqual({
      slug: "hovorit",
      slovak: "hovoriť",
      related: ["povedať", "rozumiem"],
      examples: [
        {
          slovak: "Hovorím po slovensky.",
          english: "I speak Slovak.",
        },
      ],
    });
  });
});

describe("toDelimited", () => {
  it("quotes commas and quotes", () => {
    const text = toDelimited(
      [{ slovak: 'a, "b"', english: "x" }],
      ["slovak", "english"],
      ",",
    );

    expect(text).toContain('"a, ""b"""');
    expect(text.startsWith("slovak,english\n")).toBe(true);
  });

  it("adds attribution comment", () => {
    const text = toDelimited([{ a: "1" }], ["a"], "\t", { comment: "# hello" });
    expect(text.startsWith("# hello\n")).toBe(true);
  });

  it("can omit header for Anki-style imports", () => {
    const text = toDelimited(
      [{ slovak: "Ahoj.", english: "Hi." }],
      ["slovak", "english"],
      "\t",
      { includeHeader: false },
    );
    expect(text).toBe("Ahoj.\tHi.\n");
  });
});

describe("buildDownloadFilenames", () => {
  it("names dual tabular files when examples included", () => {
    expect(
      buildDownloadFilenames("csv", {
        includeExamples: true,
        wordsOnly: false,
        examplesOnly: false,
      }),
    ).toEqual({
      words: "slovak-wiki-words.csv",
      examples: "slovak-wiki-examples.csv",
    });
  });
});

describe("buildDownloadPayloads", () => {
  const meta = {
    generatedAt: "2026-08-04T00:00:00.000Z",
    source: "slovak.wiki",
    attribution: "test",
  };

  it("returns one JSON file", () => {
    const projected = projectExport(sampleWords, {
      format: "json",
      fields: ["slug", "slovak", "english", "category", "related", "examples"],
    });
    const payloads = buildDownloadPayloads(meta, projected, {
      format: "json",
      fields: ["slug", "slovak", "english", "category", "related", "examples"],
    });

    expect(payloads).toHaveLength(1);
    expect(payloads[0]?.filename).toBe("slovak-wiki-dictionary.json");
    expect(JSON.parse(payloads[0]!.body).words).toHaveLength(2);
  });

  it("returns words + examples for CSV with examples", () => {
    const options = {
      format: "csv" as const,
      fields: ["slug", "slovak", "english", "category", "examples"] as const,
    };
    const projected = projectExport(sampleWords, options);
    const payloads = buildDownloadPayloads(meta, projected, options);

    expect(payloads.map((p) => p.filename)).toEqual([
      "slovak-wiki-words.csv",
      "slovak-wiki-examples.csv",
    ]);
    expect(payloads[1]?.body).toContain("slug,lemma,slovak,english");
    expect(payloads[1]?.body).toContain("hovorit,hovoriť,");
  });

  it("returns only examples file for examples-only TSV", () => {
    const options = {
      format: "tsv" as const,
      fields: ["examples"] as const,
    };
    const projected = projectExport(sampleWords, options);
    const payloads = buildDownloadPayloads(meta, projected, options);

    expect(payloads).toHaveLength(1);
    expect(payloads[0]?.filename).toBe("slovak-wiki-examples.tsv");
  });

  it("builds Anki phrases TSV without header or comment", () => {
    const options = {
      format: "tsv" as const,
      fields: ["examples"] as const,
      exampleFields: ["slovak", "english"] as const,
      includeHeader: false,
      includeAttributionComment: false,
    };
    const projected = projectExport(sampleWords, options);
    const payloads = buildDownloadPayloads(meta, projected, options);

    expect(payloads).toHaveLength(1);
    expect(payloads[0]?.filename).toBe("slovak-wiki-anki-phrases.tsv");
    expect(payloads[0]?.body).toBe(
      "Hovorím po slovensky.\tI speak Slovak.\nMám dom.\tI have a house.\n",
    );
  });
});
