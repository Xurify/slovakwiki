import { describe, expect, it } from "vitest";

import { classifyPlayFailure } from "./story-audio";

describe("classifyPlayFailure", () => {
  it("treats NotAllowedError as autoplay block", () => {
    expect(classifyPlayFailure(new DOMException("blocked", "NotAllowedError"))).toBe(
      "autoplay",
    );
  });

  it("treats AbortError as in-flight replace", () => {
    expect(classifyPlayFailure(new DOMException("aborted", "AbortError"))).toBe("abort");
  });

  it("treats other failures as hard errors so dwell can advance", () => {
    expect(classifyPlayFailure(new DOMException("bad src", "NotSupportedError"))).toBe(
      "error",
    );
    expect(classifyPlayFailure(new Error("404"))).toBe("error");
    expect(classifyPlayFailure(undefined)).toBe("error");
  });
});
