import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { lessonCoverSrc, lessons } from "$lib/catalog/lessons";

describe("lesson covers", () => {
  it("has a still of its scene for every lesson", () => {
    const staticDir = new URL("../../../../static/", import.meta.url);
    for (const lesson of lessons) {
      const file = fileURLToPath(new URL(`.${lessonCoverSrc(lesson)}`, staticDir));
      expect(existsSync(file), `${file}: run bun run lessons:covers`).toBe(true);
    }
  });
});
