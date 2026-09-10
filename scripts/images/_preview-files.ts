import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { ROOT } from "../lib/paths";
import { USER_AGENT } from "./shared";

const DEST = path.join(ROOT, "scripts", "images", "_audit-check");
const files = process.argv.slice(2);
await mkdir(DEST, { recursive: true });

for (const file of files) {
  const title = file.startsWith("File:") ? file : `File:${file}`;
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  url.searchParams.set("action", "query");
  url.searchParams.set("format", "json");
  url.searchParams.set("formatversion", "2");
  url.searchParams.set("prop", "imageinfo");
  url.searchParams.set("titles", title);
  url.searchParams.set("iiprop", "url");
  url.searchParams.set("iiurlwidth", "640");
  const response = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  const data = (await response.json()) as {
    query?: {
      pages?: Array<{ imageinfo?: Array<{ thumburl?: string; url?: string }> }>;
    };
  };
  const src = data.query?.pages?.[0]?.imageinfo?.[0]?.thumburl;
  if (!src) {
    console.log(`MISS ${file}`);
    continue;
  }
  const slug = file
    .replace(/^File:/, "")
    .replace(/\.[^.]+$/, "")
    .replace(/[^\w.-]+/g, "_")
    .slice(0, 70);
  const ext = path.extname(file).toLowerCase() === ".png" ? ".png" : ".jpg";
  const dest = path.join(DEST, `b11-${slug}${ext}`);
  const img = await fetch(src, { headers: { "User-Agent": USER_AGENT } });
  if (!img.ok) {
    console.log(`FAIL ${file} ${img.status}`);
    continue;
  }
  await writeFile(dest, Buffer.from(await img.arrayBuffer()));
  console.log(`ok ${path.basename(dest)}`);
}
