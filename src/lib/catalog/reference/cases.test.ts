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
  mesto: {
    singular: ["mesto", "mesta", "mestu", "mesto", "meste", "mestom"],
    plural: ["mestá", "miest", "mestám", "mestá", "mestách", "mestami"],
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

describe("case endings tables", () => {
  it.each(CASE_SLUGS)(
    "%s shows its four reference nouns, with the paradigm's forms",
    (slug) => {
      const topic = caseTopics.find((entry) => entry.slug === slug)!;
      const rows = topic.forms!.rows;
      expect(rows.map((row) => row.label.split(": ").pop())).toEqual(
        Object.keys(PARADIGMS),
      );
      const index = CASE_SLUGS.indexOf(slug);
      for (const row of rows) {
        const noun = row.label.split(": ").pop()!;
        expect(row.cells.map(plain), `${slug}: ${noun}`).toEqual([
          PARADIGMS[noun]!.singular[index],
          PARADIGMS[noun]!.plural[index],
        ]);
      }
    },
  );
});
