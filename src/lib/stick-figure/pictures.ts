import { foldLine, lineWords } from "./slovak-text";

export const STICK_PICTURE_IDS = [
  "computing",
  "flag-at",
  "flag-ca",
  "flag-cz",
  "flag-de",
  "flag-fr",
  "flag-hu",
  "flag-it",
  "flag-pl",
  "flag-sk",
  "flag-ua",
  "flag-us",
] as const;

export type StickPictureId = (typeof STICK_PICTURE_IDS)[number];

/** What each picture shows, for notes in the lab. */
export const STICK_PICTURE_NAMES: Record<StickPictureId, string> = {
  computing: "Working it out",
  "flag-at": "Austrian flag",
  "flag-ca": "Canadian flag",
  "flag-cz": "Czech flag",
  "flag-de": "German flag",
  "flag-fr": "French flag",
  "flag-hu": "Hungarian flag",
  "flag-it": "Italian flag",
  "flag-pl": "Polish flag",
  "flag-sk": "Slovak flag",
  "flag-ua": "Ukrainian flag",
  "flag-us": "American flag",
};

/**
 * Folded word stems that call up a picture. Stems catch every case and the
 * related words: `z Kanady`, `v Kanade`, `Kanaďan`; `po slovensky`,
 * `Slovensko`, `slovenčina`.
 */
const PICTURE_STEMS: Array<[string, StickPictureId]> = [
  ["rakus", "flag-at"],
  ["kanad", "flag-ca"],
  ["cesk", "flag-cz"],
  ["cech", "flag-cz"],
  ["nemeck", "flag-de"],
  ["nemec", "flag-de"],
  ["nemcin", "flag-de"],
  ["francuz", "flag-fr"],
  ["madar", "flag-hu"],
  ["talian", "flag-it"],
  ["polsk", "flag-pl"],
  ["poliak", "flag-pl"],
  ["sloven", "flag-sk"],
  ["slovak", "flag-sk"],
  ["ukrajin", "flag-ua"],
  ["amerik", "flag-us"],
];

/** Pictures a line calls up, each once, by the index of the word that names it. */
export function linePictures(
  slovak: string,
): Array<{ picture: StickPictureId; word: number }> {
  const found: Array<{ picture: StickPictureId; word: number }> = [];

  lineWords(slovak).forEach((word, index) => {
    const folded = foldLine(word);
    const picture = PICTURE_STEMS.find(([stem]) => folded.startsWith(stem))?.[1];
    if (picture && !found.some((cue) => cue.picture === picture)) {
      found.push({ picture, word: index });
    }
  });

  return found;
}
