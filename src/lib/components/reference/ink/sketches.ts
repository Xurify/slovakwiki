import { CASE_SCENES } from "./case-sketches";
import type { SketchPart } from "./pieces";
import { TOPIC_SCENES } from "./topic-sketches";

export type { SketchPart, Tone } from "./pieces";

export function sketchParts(slug: string): SketchPart[] {
  return (CASE_SCENES[slug] ?? TOPIC_SCENES[slug])?.() ?? [];
}

export interface MarkedPart {
  text: string;
  marked: boolean;
}

export function markedParts(sentence: string): MarkedPart[] {
  return sentence
    .split("**")
    .map((text, index) => ({ text, marked: index % 2 === 1 }))
    .filter((part) => part.text !== "");
}
