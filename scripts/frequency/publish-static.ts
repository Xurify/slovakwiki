import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";

const files = ["verbs.json", "nouns.json", "adjectives.json", "adverbs.json"] as const;
const sourceDir = path.join(process.cwd(), "content", "frequency");
const targetDir = path.join(process.cwd(), "static", "frequency");

await mkdir(targetDir, { recursive: true });

for (const file of files) {
  await copyFile(path.join(sourceDir, file), path.join(targetDir, file));
}

console.log(`Copied ${files.join(", ")} → static/frequency/`);
