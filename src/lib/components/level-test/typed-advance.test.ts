import { describe, expect, it } from "vitest";

import { createTypedAdvance } from "./typed-advance";

describe("typed advance", () => {
  it("sends a Backspace right after a typed letter back to that letter's box", () => {
    const advance = createTypedAdvance<string>();
    advance.moved("box 1", "box 2");
    expect(advance.backspaceTarget("box 2")).toBe("box 1");
  });

  it("handles only the first Backspace", () => {
    const advance = createTypedAdvance<string>();
    advance.moved("box 1", "box 2");
    advance.backspaceTarget("box 2");
    expect(advance.backspaceTarget("box 2")).toBeNull();
  });

  it("leaves a Backspace alone after another key or click", () => {
    const advance = createTypedAdvance<string>();
    advance.moved("box 1", "box 2");
    advance.forget();
    expect(advance.backspaceTarget("box 2")).toBeNull();
  });

  it("leaves a Backspace in another box alone", () => {
    const advance = createTypedAdvance<string>();
    advance.moved("box 1", "box 2");
    expect(advance.backspaceTarget("box 3")).toBeNull();
  });

  it("does nothing when the focus stayed put", () => {
    const advance = createTypedAdvance<string>();
    advance.moved("box 3", "box 3");
    expect(advance.backspaceTarget("box 3")).toBeNull();
    advance.moved("box 3", null);
    expect(advance.backspaceTarget("box 3")).toBeNull();
  });
});
