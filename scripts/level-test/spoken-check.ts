import path from "node:path";

import { readJsonFile } from "../lib/json-file";
import { ROOT } from "../lib/paths";

export const SPOKEN_CHECK_PATH = path.join(
  ROOT,
  "content",
  "level-test",
  "spoken-check.json",
);

export interface SpokenCheck {
  heard: string;
  /** True when every word heard is attested Slovak and is not the pseudoword itself. */
  heardAsReal: boolean;
}

export function loadSpokenChecks(): Promise<Record<string, SpokenCheck>> {
  return readJsonFile<Record<string, SpokenCheck>>(SPOKEN_CHECK_PATH, {});
}
