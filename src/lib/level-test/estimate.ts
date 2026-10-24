import { SCALE_MAX, SCALE_MIN, clampScale, probabilityCorrect } from "./scale";

/**
 * One graded response. `score` is soft (0–1), like the DET's probabilistic
 * grading: a dictation that is 80% right counts as 0.8 of a correct answer.
 */
export interface Observation {
  difficulty: number;
  score: number;
  guess?: number;
}

export interface AbilityEstimate {
  /** Posterior mean on the 0–100 scale. */
  theta: number;
  /** Posterior standard deviation; shrinks as responses come in. */
  se: number;
  count: number;
}

export interface AbilityPrior {
  mean: number;
  sd: number;
}

/** Most visitors are beginners; a wide prior still lets three good answers reach B1. */
export const DEFAULT_PRIOR: AbilityPrior = { mean: 25, sd: 25 };

const GRID_STEP = 0.5;

const GRID: readonly number[] = Array.from(
  { length: (SCALE_MAX - SCALE_MIN) / GRID_STEP + 1 },
  (_, index) => SCALE_MIN + index * GRID_STEP,
);

/** Keeps log() finite when a response is fully certain. */
const EPSILON = 1e-6;

/**
 * Expected-a-posteriori ability over a fixed grid. Unlike maximum likelihood it
 * stays finite when every answer so far is right (or wrong), which is the
 * normal state of a test's first few items.
 */
export function estimateAbility(
  observations: readonly Observation[],
  prior: AbilityPrior = DEFAULT_PRIOR,
): AbilityEstimate {
  const logPosterior = GRID.map((theta) => {
    const z = (theta - prior.mean) / prior.sd;
    let total = -0.5 * z * z;

    for (const observation of observations) {
      const p = Math.min(
        1 - EPSILON,
        Math.max(
          EPSILON,
          probabilityCorrect(theta, observation.difficulty, observation.guess),
        ),
      );
      const score = Math.min(1, Math.max(0, observation.score));
      total += score * Math.log(p) + (1 - score) * Math.log(1 - p);
    }

    return total;
  });

  const peak = Math.max(...logPosterior);
  const weights = logPosterior.map((value) => Math.exp(value - peak));
  const mass = weights.reduce((sum, value) => sum + value, 0);

  let mean = 0;
  for (let index = 0; index < GRID.length; index++) {
    mean += (GRID[index] ?? 0) * (weights[index] ?? 0);
  }
  mean /= mass;

  let variance = 0;
  for (let index = 0; index < GRID.length; index++) {
    const delta = (GRID[index] ?? 0) - mean;
    variance += delta * delta * (weights[index] ?? 0);
  }
  variance /= mass;

  return {
    theta: clampScale(mean),
    se: Math.sqrt(variance),
    count: observations.length,
  };
}
