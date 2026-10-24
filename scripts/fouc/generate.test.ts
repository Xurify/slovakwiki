import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  buildFoucBootIife,
  foucBunMismatchMessage,
  hashFoucBootScript,
  renderFoucBootModule,
  requiredFoucBunVersion,
} from "./generate";
import { FOUC_BOOTS } from "./registry";

describe("fouc boot generation", () => {
  it("requires the packageManager bun version", () => {
    expect(requiredFoucBunVersion("bun@1.4.4")).toBe("1.4.4");
    expect(() => requiredFoucBunVersion("npm@10.0.0")).toThrow(/packageManager/);
    expect(foucBunMismatchMessage("1.4.4\n", "1.4.4")).toBeNull();
    expect(foucBunMismatchMessage("1.4.3", "1.4.4")).toContain("bun 1.4.4");
    expect(foucBunMismatchMessage("1.4.3", "1.4.4")).toContain("bun-v1.4.4");
  });

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
