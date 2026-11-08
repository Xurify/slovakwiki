import { describe, expect, it } from "vitest";

import { buildSearchDocuments } from "../search/documents";
import { caseTopics } from "./cases";
import { grammarEntries } from "./grammar";

describe("grammar examples", () => {
  it("every example explains itself and bolds the word it is about", () => {
    for (const topic of grammarEntries) {
      for (const example of topic.examples) {
        expect(example.demonstrates, `${topic.slug}: ${example.slovak}`).toBeTruthy();
        expect(example.demonstrates, `${topic.slug}: ${example.slovak}`).toContain("**");
      }
    }
    for (const topic of caseTopics) {
      for (const example of topic.examples) {
        expect(example.demonstrates, `${topic.slug}: ${example.slovak}`).toContain("**");
      }
    }
  });

  it("the cases overview shows one example for each of the six cases", () => {
    const overview = grammarEntries.find((topic) => topic.slug === "cases-overview")!;
    const notes = overview.examples.map((example) => example.demonstrates ?? "");
    for (const grammaticalCase of [
      "nominative",
      "genitive",
      "dative",
      "accusative",
      "locative",
      "instrumental",
    ]) {
      expect(
        notes.some((note) => note.includes(grammaticalCase)),
        grammaticalCase,
      ).toBe(true);
    }
  });
});

describe("finding a case", () => {
  it("each case page is a search document titled with the case name", () => {
    const documents = buildSearchDocuments();
    for (const topic of caseTopics) {
      const document = documents.find(
        (entry) => entry.url === `/grammar/cases/${topic.slug}`,
      );
      expect(document?.title, topic.slug).toBe(topic.name);
    }
  });
});
