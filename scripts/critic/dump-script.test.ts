import { writeFileSync } from "node:fs";
import { it } from "vitest";
import { listeningEpisodes } from "$lib/catalog/listening";
import { PLACES } from "$lib/stick-figure/places";

// Writes an episode's script as tables for the critics: SLUG=<slug> OUT=<file.md> bunx vitest run scripts/critic/dump-script.test.ts
it.skipIf(!process.env.SLUG)("dumps the script for a critic", () => {
  const episode = listeningEpisodes.find((e) => e.slug === process.env.SLUG);
  if (!episode) throw new Error(`No listed episode "${process.env.SLUG}"`);
  const rows: string[] = [`# ${episode.titleSk} (${episode.title})`, ""];
  for (const chapter of episode.chapters) {
    const place = PLACES[chapter.stage ?? "studio"] as {
      things: { word: string }[];
      furniture?: { kind: string }[];
    };
    const drawn = [
      ...place.things.map((t) => t.word),
      ...(place.furniture ?? []).map((f) => f.kind),
    ];
    rows.push(
      `## ${chapter.titleSk} (${chapter.title})`,
      "",
      `Drawn on the set: ${drawn.join(", ") || "(nothing named)"}`,
      "",
      "| # | Speaker | Slovak | English | Voice direction |",
      "|---|---|---|---|---|",
    );
    chapter.lines.forEach((line, i) => {
      const said = line.audio?.transcript ?? "";
      const tags = [...said.matchAll(/\[(\w+)\]/g)]
        .map((m) => m[1])
        .filter((t) => t !== "pause");
      const extra = [
        line.ring ? `phone ${line.ring}` : "",
        line.overPhone ? "over the phone" : "",
        line.to ? `to ${line.to}` : "",
      ].filter(Boolean);
      rows.push(
        `| ${i + 1} | ${line.speaker} | ${line.slovak.replace(/\|/g, "/")} | ${line.english.replace(/\|/g, "/")} | ${[...tags, ...extra].join(", ")} |`,
      );
    });
    rows.push("");
  }
  writeFileSync(process.env.OUT!, rows.join("\n"));
});
