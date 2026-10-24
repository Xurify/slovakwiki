import { describe, expect, it } from "vitest";

import { localAudioObjectKey } from "./dev-fallback";

describe("localAudioObjectKey", () => {
  it("keeps a content-addressed clip and drops the cache buster", () => {
    expect(
      localAudioObjectKey("/audio/example/6ac38159d2e0dc9b3895.mp3?v=0033758119"),
    ).toBe("example/6ac38159d2e0dc9b3895.mp3");
  });

  it("rejects anything that is not a clip", () => {
    expect(localAudioObjectKey("/audio/example/not-a-hash.mp3")).toBeNull();
    expect(localAudioObjectKey("/audio/voice-design/sample.mp3")).toBeNull();
    expect(localAudioObjectKey("/grammar/ty-vs-vy")).toBeNull();
    expect(localAudioObjectKey(undefined)).toBeNull();
  });
});
