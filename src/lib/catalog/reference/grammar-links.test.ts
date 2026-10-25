import { describe, expect, it } from "vitest";

import { caseTopics } from "./cases";
import { grammarEntries } from "./grammar";

const LINK = /\[[^\]]+\]\(([^)\s]+)\)/g;

function strings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) value.forEach((item) => strings(item, out));
  else if (value && typeof value === "object") {
    Object.values(value).forEach((item) => strings(item, out));
  }
  return out;
}

describe("links in grammar copy", () => {
  it("point at a grammar page that exists", () => {
    const pages = new Set([
      ...grammarEntries.map((entry) => `/grammar/${entry.slug}`),
      ...caseTopics.map((topic) => `/grammar/cases/${topic.slug}`),
    ]);
    const broken: string[] = [];

    for (const entry of grammarEntries) {
      for (const text of strings(entry)) {
        for (const match of text.matchAll(LINK)) {
          const href = match[1] ?? "";
          if (!pages.has(href.split("#")[0] ?? "")) broken.push(`${entry.slug}: ${href}`);
        }
      }
    }

    expect(broken).toEqual([]);
  });

  it("exist in both directions between aspect and motion verbs", () => {
    const linksTo = (from: string, to: string) =>
      strings(grammarEntries.find((entry) => entry.slug === from)).some((text) =>
        text.includes(`](/grammar/${to})`),
      );

    expect(linksTo("motion-verbs", "aspect")).toBe(true);
    expect(linksTo("aspect", "motion-verbs")).toBe(true);
  });
});
