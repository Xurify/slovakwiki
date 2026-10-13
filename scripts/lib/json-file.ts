import { readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { ROOT } from "./paths";

/**
 * Parse a JSON file, or return `fallback` when it does not exist yet.
 * Any other failure throws: a truncated or corrupt manifest read as `{}` would be
 * written back on the next save and silently drop every entry it held.
 */
export async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  let raw: string;
  try {
    raw = await readFile(filePath, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return fallback;
    throw error;
  }

  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `${path.relative(ROOT, filePath)} is not valid JSON (${message}). ` +
        "Restore it from git before re-running.",
    );
  }
}

/**
 * Write through a temp file + rename, so a run killed mid-write leaves the old
 * file intact instead of a truncated one.
 */
export async function writeFileAtomic(filePath: string, contents: string): Promise<void> {
  const tempPath = `${filePath}.${process.pid}.tmp`;
  await writeFile(tempPath, contents, "utf8");

  try {
    await rename(tempPath, filePath);
  } catch (error) {
    await rm(tempPath, { force: true });
    // Windows refuses to replace a file another process holds open; keep the
    // previous in-place write there rather than failing the run.
    if (process.platform !== "win32") throw error;
    await writeFile(filePath, contents, "utf8");
  }
}
