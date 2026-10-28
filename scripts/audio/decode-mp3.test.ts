import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { ROOT } from "../lib/paths";
import { decodeMp3 } from "./decode-mp3";

const clip = (name: string) =>
  readFile(path.join(ROOT, "content/audio/sounds/dog", `${name}.mp3`));

describe("decodeMp3", () => {
  // Sample counts from ffmpeg, which mouth tracks were measured with before.
  it("decodes as many samples as ffmpeg", async () => {
    const haf = await decodeMp3(await clip("haf"));
    expect(haf.sampleRate).toBe(44_100);
    expect(haf.samples.length).toBe(15_435);
    expect((await decodeMp3(await clip("growl"))).samples.length).toBe(54_243);
  });

  it("keeps clips decoded side by side apart", async () => {
    const [haf, growl] = await Promise.all([
      clip("haf").then(decodeMp3),
      clip("growl").then(decodeMp3),
    ]);
    expect(haf.samples).toEqual((await decodeMp3(await clip("haf"))).samples);
    expect(growl.samples.length).toBe(54_243);
  });

  it("rejects bytes that are not MP3", async () => {
    await expect(decodeMp3(new Uint8Array(64))).rejects.toThrow();
    expect((await decodeMp3(await clip("haf"))).samples.length).toBe(15_435);
  });
});
