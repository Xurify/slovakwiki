/** Named-turn label in practice/lesson bubbles. Hidden for system speakers. */
export const DIALOGUE_SPEAKER_CLASS =
  "text-[0.64rem] font-bold tracking-[0.14em] text-slate-500 uppercase";

const HIDDEN_DIALOGUE_SPEAKERS = new Set(["Notice", "Scene", "Sentence"]);

export function dialogueSpeakerLabel(speaker: string): string | null {
  if (!speaker || HIDDEN_DIALOGUE_SPEAKERS.has(speaker)) return null;
  return speaker;
}
