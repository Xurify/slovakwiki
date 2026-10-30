/**
 * The test's 0–100 ability scale. Each CEFR level sits on a fixed anchor, as in
 * Settles et al. (2020), "Machine Learning–Driven Language Assessment", Table 1.
 */
export const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

export type CefrLevel = (typeof CEFR_LEVELS)[number];

export const CEFR_ANCHOR: Record<CefrLevel, number> = {
  A1: 0,
  A2: 20,
  B1: 40,
  B2: 60,
  C1: 80,
  C2: 100,
};

export const SCALE_MIN = 0;
export const SCALE_MAX = 100;

/**
 * Scale points per logit in the Rasch curve. Ten makes one CEFR step (20 points)
 * two logits: a learner one level above an item gets it right ~88% of the time.
 */
export const SCALE_POINTS_PER_LOGIT = 10;

export function clampScale(value: number): number {
  return Math.min(SCALE_MAX, Math.max(SCALE_MIN, value));
}

/** Band edges sit halfway between anchors, so A2 covers 10–30. */
export function cefrForScore(score: number): CefrLevel {
  const clamped = clampScale(score);
  let best: CefrLevel = "A1";
  for (const level of CEFR_LEVELS) {
    if (clamped >= CEFR_ANCHOR[level] - 10) best = level;
  }
  return best;
}

/** Position inside the level's band, 0 at its lower edge and 1 at its upper edge. */
export function progressWithinLevel(score: number): number {
  const level = cefrForScore(score);
  const lower = Math.max(SCALE_MIN, CEFR_ANCHOR[level] - 10);
  const upper = Math.min(SCALE_MAX, CEFR_ANCHOR[level] + 10);
  if (upper === lower) return 1;
  return (clampScale(score) - lower) / (upper - lower);
}

/**
 * Rasch item response function on the 0–100 scale, with an optional floor for
 * two-way formats (real word or not) where a blind guess is right half the time.
 */
export function probabilityCorrect(theta: number, difficulty: number, guess = 0): number {
  const rasch = 1 / (1 + Math.exp((difficulty - theta) / SCALE_POINTS_PER_LOGIT));
  return guess + (1 - guess) * rasch;
}
