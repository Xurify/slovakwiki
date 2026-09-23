import { describe, expect, it } from "vitest";

import { practiceTaskKindsPhrase } from "./hub";

describe("practiceTaskKindsPhrase", () => {
  it("joins formats as a lowercase prose list", () => {
    expect(practiceTaskKindsPhrase([])).toBe("");
    expect(practiceTaskKindsPhrase(["type"])).toBe("type");
    expect(practiceTaskKindsPhrase(["choose", "type"])).toBe("choose and type");
    expect(practiceTaskKindsPhrase(["choose", "build", "type"])).toBe(
      "choose, build, and type",
    );
    expect(practiceTaskKindsPhrase(["fill", "select"])).toBe(
      "fill the gap and select all",
    );
  });
});
