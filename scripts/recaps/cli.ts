import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import { ROOT } from "../lib/paths";

const recapsDir = path.join(ROOT, "recaps");
const command = process.argv[2];

if (command === "open") {
  await openRecap(process.argv[3]);
} else if (command === "shot") {
  await placeShot(process.argv[3], process.argv[4], process.argv[5]);
} else if (command === "index" || command === undefined) {
  await buildIndex();
} else {
  console.error(
    "Usage: bun scripts/recaps/cli.ts [index | open <slug> | shot <slug> <name> <capturedFile>]",
  );
  process.exit(1);
}

async function buildIndex(): Promise<void> {
  const files = await readdir(recapsDir);
  const slugs = files
    .filter(
      (name) => name.endsWith(".html") && name !== "index.html" && !name.startsWith("_"),
    )
    .map((name) => name.replace(/\.html$/, ""))
    .sort();

  const items: Array<{ slug: string; title: string; brief: string; meta: string }> = [];
  for (const slug of slugs) {
    const html = await readFile(path.join(recapsDir, `${slug}.html`), "utf8");
    const titleMatch = html.match(/<title>Recap\s*[—-]\s*(.+)<\/title>/);
    const briefMatch = html.match(/<p class="brief">\s*([\s\S]*?)\s*<\/p>/);
    const metaMatch = html.match(/<p class="meta">\s*([\s\S]*?)\s*<\/p>/);
    items.push({
      slug,
      title: titleMatch?.[1]?.trim() ?? slug,
      brief: briefMatch?.[1]?.replace(/\s+/g, " ").trim() ?? "",
      meta: metaMatch?.[1]?.replace(/\s+/g, " ").trim() ?? "",
    });
  }

  const body = items
    .map((item) => {
      const metaLine = item.meta
        ? `\n          <span class="muted">${escapeHtml(item.meta)}</span>`
        : "";
      return `        <li>
          <a href="./${item.slug}.html">
            <span class="title">${escapeHtml(item.title)}</span>${metaLine}
            <span class="muted">${escapeHtml(item.brief)}</span>
          </a>
        </li>`;
    })
    .join("\n");

  const indexHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Visual recaps</title>
    <link rel="stylesheet" href="./_shared.css" />
  </head>
  <body>
    <div class="wrap">
      <header>
        <h1>Visual recaps</h1>
        <p class="brief">Before and after notes on learner-facing changes.</p>
      </header>

      <ul class="recap-list">
${body}
      </ul>
    </div>
  </body>
</html>
`;

  await writeFile(path.join(recapsDir, "index.html"), indexHtml, "utf8");
  console.log(`recaps/index.html — ${slugs.length} recap(s)`);
}

/**
 * Move a browser capture into `recaps/<slug>/<name>.png`.
 *
 * chrome-devtools-mcp can only write to the OS temp directory unless it is started with
 * `--allowUnrestrictedPaths`, so screenshots land there first and get filed here.
 */
async function placeShot(
  slug: string | undefined,
  name: string | undefined,
  captured: string | undefined,
): Promise<void> {
  if (!slug || !name || !captured) {
    console.error("Usage: bun run recap:shot <slug> <name> <capturedFile>");
    process.exit(1);
  }

  if (!existsSync(captured)) {
    console.error(`No capture at ${captured}`);
    process.exit(1);
  }

  const targetDir = path.join(recapsDir, slug);
  await mkdir(targetDir, { recursive: true });

  const target = path.join(targetDir, `${name}.png`);
  await rename(captured, target);
  console.log(`recaps/${slug}/${name}.png`);
}

async function openRecap(slug: string | undefined): Promise<void> {
  if (!slug) {
    console.error("Usage: bun run recap:open <slug>");
    process.exit(1);
  }

  const file = path.join(recapsDir, `${slug}.html`);
  if (!existsSync(file)) {
    console.error(`Missing recaps/${slug}.html — copy recaps/_template.html first.`);
    process.exit(1);
  }

  const platform = process.platform;
  const cmd =
    platform === "win32"
      ? ["cmd", "/c", "start", "", file]
      : platform === "darwin"
        ? ["open", file]
        : ["xdg-open", file];

  spawn(cmd[0]!, cmd.slice(1), { detached: true, stdio: "ignore" }).unref();
  console.log(file);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
