import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { ROOT } from "../lib/paths";
import type { AudioManifest, AudioRuntimeIndex } from "./shared";

const AUDIO = path.join(ROOT, "content", "audio");

/**
 * The site plays every clip the runtime index lists from R2. One generated
 * but never uploaded is a silent line on the preview and in production, and
 * on a linked machine the upload can fail without anyone seeing it.
 */
describe("audio on R2", () => {
  const manifest = JSON.parse(
    readFileSync(path.join(AUDIO, "manifest.json"), "utf8"),
  ) as AudioManifest;
  const index = JSON.parse(
    readFileSync(path.join(AUDIO, "runtime-index.json"), "utf8"),
  ) as AudioRuntimeIndex;

  it("has every clip the runtime index plays uploaded", () => {
    const missing = Object.entries(index)
      .filter(([hash]) => !manifest[hash]?.uploadedAt)
      .map(
        ([hash, entry]) =>
          `${entry.k}/${hash}.mp3 ${manifest[hash]?.text ?? "(not in the manifest)"}`,
      );

    expect(
      missing,
      "Run `bun scripts/audio/upload.ts` from a machine that reaches R2, then commit content/audio/manifest.json.",
    ).toEqual([]);
  });
});
