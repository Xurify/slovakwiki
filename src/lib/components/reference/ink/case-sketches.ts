import { dashed, footprints } from "./marks";
import { briefcase } from "./objects";
import { faceEye, person } from "./people";
import {
  arrow,
  building,
  ground,
  note,
  office,
  openBook,
  patch,
  type SketchPart,
} from "./pieces";

export const CASE_SCENES: Record<string, () => SketchPart[]> = {
  nominative: () => [
    ...ground(),
    patch(170, 68, 34, 42, 5),
    ...person(170, 91, { grip: [192, 68] }),
    note(170, 62.5, "?", { size: "tiny" }),
    ...openBook(188, 54, 41),
    note(176, 126, "**kto**?"),
  ],

  genitive: () => [
    ...ground(),
    patch(116, 63, 44, 56, 6),
    ...office(85, 12),
    footprints(130, 180, 40),
    ...person(210, 22, { walking: true }),
    ...faceEye(210, 24),
    ...briefcase(191, 88, 45),
    note(168, 126, "**z** práce"),
  ],

  dative: () => [
    ...ground(),
    ...person(54, 23, { grip: [78, 68] }),
    ...openBook(80, 52, 51),
    ...arrow([128, 72], [232, 72], 33, 4),
    patch(268, 68, 26, 40, 7),
    ...person(268, 24, { grip: [246, 70] }),
    note(168, 126, "komu?"),
  ],

  accusative: () => [
    ...ground(),
    ...person(66, 25),
    ...faceEye(66, 27),
    dashed([76, 55], [234, 46], 61),
    dashed([76, 62], [234, 80], 71),
    patch(252, 68, 26, 40, 8),
    ...person(252, 26, { dress: true }),
    note(160, 126, "vidím"),
  ],

  locative: () => [
    ...ground(),
    patch(169, 62, 112, 50, 9),
    ...building(70, 42, 70, 61),
    ...building(116, 40, 92, 62),
    ...person(190, 29),
    ...building(226, 46, 78, 63),
    note(169, 126, "**v** meste"),
  ],

  instrumental: () => [
    ...ground(),
    ...person(134, 27, { grip: [151, 90], walking: true, scale: 0.78 }),
    patch(170, 68, 28, 42, 11),
    ...person(170, 28, { grip: [151, 90], walking: true, dress: true }),
    note(152, 126, "**s** mamou"),
  ],
};
