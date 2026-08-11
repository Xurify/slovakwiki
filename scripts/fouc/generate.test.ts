import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { buildFoucBootIife, hashFoucBootScript, renderFoucBootModule } from "./generate";
import { FOUC_BOOTS } from "./registry";

describe("fouc boot generation", () => {
  it("committed generated boots match fresh bun build", () => {
    expect(FOUC_BOOTS.length).toBeGreaterThan(0);

    for (const target of FOUC_BOOTS) {
      const expected = renderFoucBootModule(
        target.exportName,
        buildFoucBootIife(target.entry),
      );
      const actual = readFileSync(target.out, "utf8");
      expect(hashFoucBootScript(actual), target.id).toBe(hashFoucBootScript(expected));
    }
  });
});
