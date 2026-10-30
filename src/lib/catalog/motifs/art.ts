import type { PracticeGraphicId } from "../practice/motifs";

/** Public full-size art in `static/lessons/motifs/{id}.webp`. */
export function motifArtSrc(id: string): string {
  return `/lessons/motifs/${id}.webp`;
}

/** Mean paper color along each tile's side edges; banners extend the tile with it. */
export const motifPaper: Record<PracticeGraphicId, string> = {
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
