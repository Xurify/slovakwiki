import type { PracticeGraphicId } from "../practice/motifs";

/** Public full-size art in `static/lessons/motifs/{id}.webp`. */
export function motifArtSrc(id: string): string {
  return `/lessons/motifs/${id}.webp`;
}

/** The paper-cut tile of one case, in `static/lessons/motifs/case-{slug}.webp`. */
export function caseTileSrc(slug: string): string {
  return `/lessons/motifs/case-${slug}.webp`;
}

/** Mean paper color along each tile's side edges; banners extend the tile with it. */
export const motifPaper: Record<PracticeGraphicId, string> = {
  "grammatical-gender": "#ede5d1",
  "cases-overview": "#ede5d1",
  "future-tense": "#ede5d1",
  "past-tense": "#ede5d1",
  aspect: "#ede5d1",
  "motion-verbs": "#ede5d1",
  imperative: "#ede5d1",
  conditional: "#ede5d1",
  "reflexive-verbs": "#ede5d1",
  possessives: "#ede5d1",
  "word-order": "#ede5d1",
  byt: "#ece5d3",
  default: "#f0e8d4",
  demonstratives: "#efe7d3",
  greetings: "#efe4cd",
  mat: "#f5efde",
  negation: "#eee1c8",
  numbers: "#f2ecd9",
  "phrase-stress": "#ece4cf",
  "present-tense": "#eee6d1",
  questions: "#f1e8d5",
  stress: "#f2ead5",
  time: "#efe9dc",
};
