import { estimateAbility } from "./estimate";
import { cefrForScore, type CefrLevel } from "./scale";
import type { ItemResponse, ProductionRecord, Skill } from "./types";

export const SKILLS: readonly Skill[] = ["reading", "listening", "writing", "speaking"];

export const SKILL_LABEL: Record<Skill, string> = {
  reading: "Reading",
  listening: "Listening",
  writing: "Writing",
  speaking: "Speaking",
};

export interface ScoreSummary {
  score: number;
  level: CefrLevel;
}

export type IntegratedSkill =
  "literacy" | "comprehension" | "conversation" | "production";

/** Integrated subscores, each the pair of skills it combines. */
export const INTEGRATED_SKILLS: Record<
  IntegratedSkill,
  { label: string; skills: [Skill, Skill] }
> = {
  literacy: { label: "Literacy", skills: ["reading", "writing"] },
  comprehension: { label: "Comprehension", skills: ["reading", "listening"] },
  conversation: { label: "Conversation", skills: ["listening", "speaking"] },
  production: { label: "Production", skills: ["writing", "speaking"] },
};

export interface LevelTestResult {
  overall: ScoreSummary | null;
  skills: Record<Skill, ScoreSummary | null>;
  integrated: Record<IntegratedSkill, ScoreSummary | null>;
}

function summary(score: number): ScoreSummary {
  const rounded = Math.round(score);
  return { score: rounded, level: cefrForScore(rounded) };
}

function mean(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function receptiveScore(responses: readonly ItemResponse[], skill: Skill): number | null {
  const observations = responses.filter((response) => response.skill === skill);
  if (observations.length === 0) return null;
  return estimateAbility(observations).theta;
}

function productionScores(
  production: readonly ProductionRecord[],
  skill: "writing" | "speaking",
): number[] {
  return production
    .filter(
      (record) => record.skill === skill && record.status === "scored" && record.result,
    )
    .map((record) => record.result?.score ?? 0);
}

/**
 * Reading and listening come from the item responses; writing from the AI
 * scores; speaking from Read Aloud (scored like items) plus the AI scores. The
 * overall score averages whichever skills were measured.
 */
export function computeResult(
  responses: readonly ItemResponse[],
  production: readonly ProductionRecord[],
): LevelTestResult {
  const readAloud = receptiveScore(responses, "speaking");
  const speakingParts = [
    ...(readAloud === null ? [] : [readAloud]),
    ...productionScores(production, "speaking"),
  ];

  const raw: Record<Skill, number | null> = {
    reading: receptiveScore(responses, "reading"),
    listening: receptiveScore(responses, "listening"),
    writing: mean(productionScores(production, "writing")),
    speaking: mean(speakingParts),
  };

  const skills = Object.fromEntries(
    SKILLS.map((skill) => {
      const value = raw[skill];
      return [skill, value === null ? null : summary(value)];
    }),
  ) as Record<Skill, ScoreSummary | null>;

  const measured = SKILLS.map((skill) => raw[skill]).filter(
    (value): value is number => value !== null,
  );
  const overallScore = mean(measured);

  const integrated = Object.fromEntries(
    (Object.keys(INTEGRATED_SKILLS) as IntegratedSkill[]).map((key) => {
      const parts = INTEGRATED_SKILLS[key].skills
        .map((skill) => raw[skill])
        .filter((value): value is number => value !== null);
      const value = mean(parts);
      return [key, value === null ? null : summary(value)];
    }),
  ) as Record<IntegratedSkill, ScoreSummary | null>;

  return {
    overall: overallScore === null ? null : summary(overallScore),
    skills,
    integrated,
  };
}
