import type { PracticeItem } from "$lib/learning/types";
import { materializeBuildItem } from "$lib/learning/exercises/materialize-build";
import { analogFace, appointmentPhrase, type ClockFaceTime } from "./clock";
import { daysDatesTimePracticeItems } from "./practice-catalog";
import type { DaysDatesTimeKind } from "./session-kinds";

export function catalogItem(kind: DaysDatesTimeKind): PracticeItem | undefined {
  return daysDatesTimePracticeItems.find((item) => item.id === kind);
}

export function dayMeetingItem(rng: () => number): PracticeItem {
  const catalog = catalogItem("everyday/day-meeting");
  if (!catalog) throw new Error("Missing everyday/day-meeting catalog item");
  return materializeBuildItem(catalog, rng);
}

export function choiceIdForTime(time: ClockFaceTime): string {
  const face = analogFace(time);
  return `face-${face.hour}-${face.minute}`;
}

export function appointmentBarePhrase(time: ClockFaceTime): string {
  const phrase = appointmentPhrase(time).replace(/\.$/, "");
  // Quarters quote without leading O („pol tretej“); on the hour keep o („o tretej“).
  if (time.minute === 0) return phrase.replace(/^O /, "o ");
  return phrase.replace(/^O /, "");
}

export function phraseForWhy(phrase: string): string {
  return phrase.replace(/\.$/, "");
}

export function pickTrapChoiceTask(
  task: Omit<Extract<PracticeItem["task"], { type: "choice" }>, "type" | "choiceMode">,
): Extract<PracticeItem["task"], { type: "choice" }> {
  return { type: "choice", choiceMode: "pickTrap", ...task };
}

export function wrapTask(
  kind: DaysDatesTimeKind,
  task: PracticeItem["task"],
): PracticeItem {
  const catalog = catalogItem(kind);
  if (!catalog) throw new Error(`Missing catalog item: ${kind}`);

  return {
    id: kind,
    source: catalog.source,
    task,
    feedback: task.feedback,
  };
}
