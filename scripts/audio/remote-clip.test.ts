import { describe, expect, it } from "vitest";

import { compareRemoteClip } from "./remote-clip";

const earlier = "2026-10-05T23:00:55.122Z";
const later = "2026-10-12T18:02:13.000Z";

describe("compareRemoteClip", () => {
  it("uploads when R2 has no object", () => {
    expect(compareRemoteClip({ bytes: 17598, generatedAt: earlier }, undefined)).toBe(
      "missing",
    );
  });

  it("skips the same take", () => {
    expect(
      compareRemoteClip(
        { bytes: 17598, generatedAt: earlier },
        { bytes: 17598, generatedAt: earlier },
      ),
    ).toBe("same");
  });

  it("re-uploads a retake even when the byte count matches", () => {
    expect(
      compareRemoteClip(
        { bytes: 17598, generatedAt: later },
        { bytes: 17598, generatedAt: earlier },
      ),
    ).toBe("local-newer");
  });

  it("never overwrites a newer take uploaded from elsewhere", () => {
    expect(
      compareRemoteClip(
        { bytes: 16344, generatedAt: earlier },
        { bytes: 17598, generatedAt: later },
      ),
    ).toBe("remote-newer");
  });

  it("trusts the manifest take over the file size", () => {
    expect(
      compareRemoteClip(
        { bytes: 16344, generatedAt: earlier },
        { bytes: 17598, generatedAt: earlier },
      ),
    ).toBe("same");
  });

  it("falls back to size without timestamps", () => {
    expect(
      compareRemoteClip(
        { bytes: 17598, generatedAt: undefined },
        { bytes: 17598, generatedAt: null },
      ),
    ).toBe("same");
    expect(
      compareRemoteClip(
        { bytes: 16344, generatedAt: earlier },
        { bytes: 17598, generatedAt: null },
      ),
    ).toBe("local-newer");
  });
});
