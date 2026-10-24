import type { LevelTestResult, ScoreSummary } from "$lib/level-test/results";
import type { Skill, TestMode } from "$lib/level-test/types";

export const LEVEL_TEST_STORAGE_KEY = "slovak.wiki.level-test.v1";

export interface SavedResult {
  version: 1;
  takenAt: string;
  mode: TestMode;
  overall: ScoreSummary;
  skills: Partial<Record<Skill, ScoreSummary>>;
}

export function saveResult(mode: TestMode, result: LevelTestResult): void {
  if (!result.overall) return;
  const skills: Partial<Record<Skill, ScoreSummary>> = {};
  for (const [skill, summary] of Object.entries(result.skills)) {
    if (summary) skills[skill as Skill] = summary;
  }
  const saved: SavedResult = {
    version: 1,
    takenAt: new Date().toISOString(),
    mode,
    overall: result.overall,
    skills,
  };
  try {
    localStorage.setItem(LEVEL_TEST_STORAGE_KEY, JSON.stringify(saved));
  } catch {
    // Private mode or full storage: the result still shows on screen.
  }
}

export function readSavedResult(): SavedResult | null {
  try {
    const raw = localStorage.getItem(LEVEL_TEST_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SavedResult>;
    if (parsed.version !== 1 || !parsed.overall || typeof parsed.takenAt !== "string")
      return null;
    return parsed as SavedResult;
  } catch {
    return null;
  }
}

const SEEN_STORAGE_KEY = "slovak.wiki.level-test.seen.v1";

/** About ten full tests' worth; older items may come round again after that. */
const SEEN_LIMIT = 1500;

/** Items shown in earlier runs on this device, so a retake picks others first. */
export function readSeenItems(): Set<string> {
  try {
    const raw = localStorage.getItem(SEEN_STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return new Set(
      Array.isArray(parsed)
        ? parsed.filter((id): id is string => typeof id === "string")
        : [],
    );
  } catch {
    return new Set();
  }
}

export function rememberSeenItems(ids: Iterable<string>): void {
  try {
    const merged = [...readSeenItems()];
    for (const id of ids) if (!merged.includes(id)) merged.push(id);
    localStorage.setItem(SEEN_STORAGE_KEY, JSON.stringify(merged.slice(-SEEN_LIMIT)));
  } catch {
    // Private mode or full storage: the next run just may repeat items.
  }
}
