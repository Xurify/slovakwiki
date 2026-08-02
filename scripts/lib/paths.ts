import path from "node:path";
import { fileURLToPath } from "node:url";

/** Repo root (`slovak.wiki/`). Resolves from `scripts/lib/`. */
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
