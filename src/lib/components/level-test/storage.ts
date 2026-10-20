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
