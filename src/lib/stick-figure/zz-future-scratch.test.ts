import { it } from "vitest";
import { listeningEpisodes } from "$lib/catalog/listening";
import { checkEpisode } from "./episode-checks";
it("future findings", () => {
  const ep = listeningEpisodes.find((e) => e.slug === "future-tense")!;
  require("node:fs").writeFileSync(
    "/tmp/claude-0/-home-user/76f87521-a398-5634-beda-8d8848fa0620/scratchpad/future/findings.txt",
    checkEpisode(ep)
      .map((f) => [f.level, f.chapter, f.line ?? "", f.rule, "|", f.message].join(" "))
      .join("\n"),
  );
});
