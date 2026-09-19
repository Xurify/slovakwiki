import type { PracticeTask } from "$lib/learning/types";

/** Same label PracticePlayer shows above the prompt (empty = hide). */
export function practiceTaskKicker(task: PracticeTask | undefined): string {
  if (!task) return "";
  if (task.type === "typed" && task.task === "repair") return "Repair this sentence";
  if (task.type === "cloze") return "Fill the gap";
  if (task.type === "selectAll") return "";
  if (task.type === "choice" && task.clock) return "";
  if (task.type === "choice" && task.promptSk) return "";
  if (task.type === "choice") return "Choose the answer";
  if (task.type === "build" && task.promptSk) return "";
  if (task.type === "build") return "";
  if (task.type === "typed") return "Write the sentence";
  return "Practice";
}
