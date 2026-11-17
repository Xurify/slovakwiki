import { foldLine, lineWords } from "./slovak-text";

export const STICK_PICTURE_IDS = [
  "clock-2-00",
  "clock-2-15",
  "clock-2-30",
  "clock-2-45",
  "clock-5-00",
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
  "photo-house",
  "photo-man-dog",
  "photo-mother-girl",
] as const;

export type StickPictureId = (typeof STICK_PICTURE_IDS)[number];

/** What each picture shows, for notes in the lab. */
export const STICK_PICTURE_NAMES: Record<StickPictureId, string> = {
  "clock-2-00": "Clock face: two o'clock",
  "clock-2-15": "Clock face: quarter past two",
  "clock-2-30": "Clock face: half past two",
  "clock-2-45": "Clock face: quarter to three",
  "clock-5-00": "Clock face: five o'clock",
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
  "photo-house": "Photo: a house by the trees, a car in front",
  "photo-man-dog": "Photo: a man with a big dog",
  "photo-mother-girl": "Photo: a woman with a small girl",
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

/** The hands of a clock-face picture, or null for any other picture. */
export function clockHands(
  picture: StickPictureId,
): { hour: number; minute: number } | null {
  const match = /^clock-(\d+)-(\d+)$/.exec(picture);
  return match ? { hour: Number(match[1]), minute: Number(match[2]) } : null;
}

/** Pictures a line calls up, each once, by the index of the word that names it. */
export function linePictures(
  slovak: string,
): Array<{ picture: StickPictureId; word: number }> {
  const found: Array<{ picture: StickPictureId; word: number }> = [];
  const words = lineWords(slovak);

  words.forEach((word, index) => {
    const folded = foldLine(word);
    // The podcast's name is a name, not Slovakia: a flag on it covered the studio's on-air sign.
    if (folded === "slovak" && foldLine(words[index + 1] ?? "") === "wiki") return;
    const picture = PICTURE_STEMS.find(([stem]) => folded.startsWith(stem))?.[1];
    if (picture && !found.some((cue) => cue.picture === picture)) {
      found.push({ picture, word: index });
    }
  });

  return found;
}
