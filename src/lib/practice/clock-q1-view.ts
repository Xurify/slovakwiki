import type { PracticeItem } from "$lib/learning/types";

import { practiceTaskKicker } from "./task-kicker";

export type ClockQ1Clock = { hour: number; minute: number };

export type ClockQ1Choice = {
  clock: ClockQ1Clock | null;
  id: string;
  label: string;
};

export type ClockQ1SceneLine = {
  english: string;
  id: string;
  slovak: string;
  speaker: string;
};

export interface ClockQ1View {
  choiceStyle: "text" | "clock";
  choices: ClockQ1Choice[] | null;
  hintChip: string | null;
  inputLabel: string | null;
  kicker: string | null;
  prompt: string;
  promptClock: ClockQ1Clock | null;
  promptLang: "sk" | null;
  promptSk: string | null;
  scene: ClockQ1SceneLine[];
  sourceHref: string | null;
  sourceLabel: string;
  tiles: string[] | null;
  typed: boolean;
}

export function buildClockQ1View(item: PracticeItem): ClockQ1View {
  const task = item.task;
  const scene =
    task.type === "typed" && task.task === "repair"
      ? []
      : (task.context ?? []).map((line) => ({
          english: line.english,
          id: line.id,
          slovak: line.slovak,
          speaker: line.speaker,
        }));

  const choices =
    task.type === "choice" || task.type === "selectAll"
      ? task.choices.map((choice) => ({
          clock: "clock" in choice && choice.clock ? choice.clock : null,
          id: choice.id,
          label: choice.label ?? "",
        }))
      : null;

  return {
    choiceStyle:
      task.type === "choice" && task.choiceStyle === "clock" ? "clock" : "text",
    choices,
    hintChip:
      (task.type === "choice" || task.type === "selectAll") && task.hint
        ? task.hint.chip
        : null,
    inputLabel: task.type === "typed" ? task.inputLabel : null,
    kicker: scene.length > 0 ? null : practiceTaskKicker(task) || null,
    prompt: task.prompt,
    promptClock:
      task.type === "choice" || task.type === "selectAll" ? (task.clock ?? null) : null,
    promptLang: task.promptLang === "sk" ? "sk" : null,
    promptSk: task.promptSk ?? null,
    scene,
    sourceHref: item.source.href ?? null,
    sourceLabel: item.source.label,
    tiles: task.type === "build" ? [...task.tiles] : null,
    typed: task.type === "typed",
  };
}
