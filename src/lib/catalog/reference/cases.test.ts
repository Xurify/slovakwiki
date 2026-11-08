import { describe, expect, it } from "vitest";

import { caseTopics } from "./cases";

/** Forms from the paradigm tables of English Wikipedia "Slovak declension", in case order N G D A L I. */
const PARADIGMS: Record<string, { singular: string[]; plural: string[] }> = {
  brat: {
    singular: ["brat", "brata", "bratovi", "brata", "bratovi", "bratom"],
    plural: ["bratia", "bratov", "bratom", "bratov", "bratoch", "bratmi"],
  },
  dom: {
    singular: ["dom", "domu", "domu", "dom", "dome", "domom"],
    plural: ["domy", "domov", "domom", "domy", "domoch", "domami"],
  },
  ruka: {
    singular: ["ruka", "ruky", "ruke", "ruku", "ruke", "rukou"],
    plural: ["ruky", "rúk", "rukám", "ruky", "rukách", "rukami"],
  },
  ulica: {
    singular: ["ulica", "ulice", "ulici", "ulicu", "ulici", "ulicou"],
    plural: ["ulice", "ulíc", "uliciam", "ulice", "uliciach", "ulicami"],
  },
  kosť: {
    singular: ["kosť", "kosti", "kosti", "kosť", "kosti", "kosťou"],
    plural: ["kosti", "kostí", "kostiam", "kosti", "kostiach", "kosťami"],
  },
  mesto: {
    singular: ["mesto", "mesta", "mestu", "mesto", "meste", "mestom"],
    plural: ["mestá", "miest", "mestám", "mestá", "mestách", "mestami"],
  },
  srdce: {
    singular: ["srdce", "srdca", "srdcu", "srdce", "srdci", "srdcom"],
    plural: ["srdcia", "sŕdc", "srdciam", "srdcia", "srdciach", "srdcami"],
  },
};

const CASE_SLUGS = [
  "nominative",
  "genitive",
  "dative",
  "accusative",
  "locative",
  "instrumental",
];

const plain = (cell: string) => cell.replace(/[[\]]/g, "");

const TABLES = [
  { key: "forms", nouns: ["brat", "dom", "ruka", "mesto"] },
  { key: "otherForms", nouns: ["ulica", "kosť", "srdce"] },
] as const;

describe("case endings tables", () => {
  it.each(CASE_SLUGS)("%s shows every noun pattern with its paradigm forms", (slug) => {
    const topic = caseTopics.find((entry) => entry.slug === slug)!;
    const index = CASE_SLUGS.indexOf(slug);
    for (const { key, nouns } of TABLES) {
      const rows = topic[key]!.rows;
      expect(
        rows.map((row) => row.label.split(": ").pop()),
        `${slug} ${key}`,
      ).toEqual(nouns);
      for (const row of rows) {
        const noun = row.label.split(": ").pop()!;
        expect(row.cells.map(plain), `${slug}: ${noun}`).toEqual([
          PARADIGMS[noun]!.singular[index],
          PARADIGMS[noun]!.plural[index],
        ]);
      }
    }
  });
});
