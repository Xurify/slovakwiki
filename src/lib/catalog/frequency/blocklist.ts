/**
 * Lemmas to never publish from frequency lists (quality / pedagogy).
 * Checked by lemma (Slovak) case-insensitively.
 */
export const FREQUENCY_PUBLISH_BLOCKLIST = new Set([
  "sex",
  "pohlavie",
  // SNK lemmatizer artifact: every corpus hit is "mám" (I have), not a noun.
  "mam",
  // Czech "for"; Slovak says za. Not in PSP or KSSJ.
  "pro",
  // Only the second half of compounds (dvojčlenný); "member" is členský.
  "členný",
  // Dated for "last time" and not in PSP or KSSJ; Slovak says naposledy or minule.
  "posledne",
]);
