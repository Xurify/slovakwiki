import {
  arrow,
  building,
  closedBook,
  eye,
  figure,
  ground,
  note,
  office,
  openBook,
  patch,
  stroke,
  type SketchPart,
} from "./pieces";
import { lineD } from "./ink-paths";

export const CASE_SCENES: Record<string, () => SketchPart[]> = {
  nominative: () => [
    ...ground(),
    patch(150, 68, 26, 42, 5),
    ...figure(150, 21, 1),
    ...openBook(170, 54, 41),
    note(168, 126, "kto"),
  ],

  genitive: () => [
    ...ground(),
    patch(116, 63, 44, 56, 6),
    ...office(85, 12),
    ...arrow([116, 92], [200, 88], 32, -6),
    ...figure(236, 22, 1),
    note(168, 126, "z"),
  ],

  dative: () => [
    ...ground(),
    ...figure(62, 23, 1),
    ...closedBook(90, 54, 51),
    ...arrow([148, 74], [236, 72], 33, 4),
    patch(268, 68, 26, 40, 7),
    ...figure(268, 24),
    note(168, 126, "komu"),
  ],

  accusative: () => [
    ...ground(),
    ...figure(70, 25),
    ...eye(106, 59, 76),
    ...arrow([126, 60], [220, 61], 78, -3),
    patch(248, 68, 26, 40, 8),
    ...figure(248, 26),
    note(160, 126, "vidím"),
  ],

  locative: () => [
    ...ground(),
    patch(169, 62, 112, 50, 9),
    ...building(70, 42, 70, 61),
    ...building(116, 40, 92, 62),
    ...figure(190, 29),
    ...building(226, 46, 78, 63),
    note(169, 126, "v"),
  ],

  instrumental: () => [
    ...ground(),
    ...figure(124, 27, 1),
    patch(188, 68, 26, 40, 11),
    ...figure(188, 28, -1),
    stroke(lineD([146, 68], [166, 68], 35), "mark", 2.1),
    note(156, 126, "s"),
  ],
};
