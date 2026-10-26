import { writeFileSync } from "node:fs";
import { it } from "vitest";
import { listeningEpisodes } from "$lib/catalog/listening";
import type { DialogueTurn, ListenerPath } from "$lib/learning/types";
import { NO_PICK } from "$lib/listening/listener-path";
import { PLACES } from "$lib/stick-figure/places";

// The critic reads which lines play on which path, so it can walk each one: an echo that only fits after a pick is a blocker on the path where nobody picked.
function pathLabel(when: ListenerPath, lines: readonly DialogueTurn[]): string {
  if ("unaided" in when) return "only if the listener picked nothing";
  if ("score" in when) return `only at score ${when.score.join(" or ")}`;
  const ask = lines.findIndex((l) => l.id === when.ask);
  const picks = when.picks.map((p) =>
    p === NO_PICK
      ? "no pick (Marek answers)"
      : (lines[ask]?.ask?.choices.find((c) => c.id === p)?.label ?? p),
  );
  return `only if #${ask + 1} got ${picks.join(" or ")}`;
}

// Writes an episode's script as tables for the critics: SLUG=<slug> OUT=<file.md> bunx vitest run scripts/critic/dump-script.test.ts
it.skipIf(!process.env.SLUG)("dumps the script for a critic", () => {
  const episode = listeningEpisodes.find((e) => e.slug === process.env.SLUG);
  if (!episode) throw new Error(`No listed episode "${process.env.SLUG}"`);
  const rows: string[] = [`# ${episode.titleSk} (${episode.title})`, ""];
  for (const chapter of episode.chapters) {
    // Furniture and phone calls come with the stage work, so they may be missing from these types.
    const place: {
      things: readonly { word: string }[];
      furniture?: readonly { kind: string }[];
    } = PLACES[chapter.stage ?? "studio"];
    const drawn = [
      ...place.things.map((t) => t.word),
      ...(place.furniture ?? []).map((f) => f.kind),
    ];
    rows.push(
      `## ${chapter.titleSk} (${chapter.title})`,
      "",
      `Drawn on the set: ${drawn.join(", ") || "(nothing named)"}`,
      "",
      "| # | Speaker | Slovak | English | Voice direction, path |",
      "|---|---|---|---|---|",
    );
    chapter.lines.forEach((turn, i) => {
      const line = turn as typeof turn & { ring?: string; overPhone?: boolean };
      const said = line.audio?.transcript ?? "";
      const tags = [...said.matchAll(/\[(\w+)\]/g)]
        .map((m) => m[1])
        .filter((t) => t !== "pause");
      const extra = [
        line.ring ? `phone ${line.ring}` : "",
        line.overPhone ? "over the phone" : "",
        line.to ? `to ${line.to}` : "",
        line.ask
          ? `asks the listener: ${line.ask.choices.map((c) => (c.id === line.ask!.answerId ? `${c.label} (right)` : c.label)).join(" / ")}`
          : "",
        line.when ? pathLabel(line.when, chapter.lines) : "",
      ].filter(Boolean);
      rows.push(
        `| ${i + 1} | ${line.speaker} | ${line.slovak.replace(/\|/g, "/")} | ${line.english.replace(/\|/g, "/")} | ${[...tags, ...extra].join(", ")} |`,
      );
    });
    rows.push("");
  }
  writeFileSync(process.env.OUT!, rows.join("\n"));
});
