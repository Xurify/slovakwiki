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
  // Only an interjection in PSP and KSSJ; a cup competition is pohár.
  "cup",
  // KSSJ marks naviac as nonstandard for navyše.
  "naviac",
  // Archaic for "always"; as "everything" it is Czech (Slovak všetko).
  "vše",
  // SNK particle/conjunction fragments, inflected forms, vulgarities, non-standard Czechisms, or duplicate Latin spellings.
  "koncov",
  "neviem",
  "facto",
  "jest",
  "ho",
  "ono",
  "ver",
  "ná",
  "hm",
  "hmm",
  "hmmm",
  "ehm",
  "hovno",
  "prd",
  "čerta",
  "figu",
  "pána",
  "pánabeka",
  "bohyňu",
  "div",
  // Non-standard Czechism; standard Slovak uses pravdaže, samozrejme, or avšak.
  "ovšem",
  // PSP standard spelling is hyphenated viac-menej and two-word zatiaľ čo.
  "viacmenej",
  "zatiaľčo",
  // Duplicate Latin spellings of codified Slovak verzus and cirka.
  "versus",
  "circa",
  // Dialectal/non-standard forms of lebo, alebo, ako, bárs, skôr.
  "bo",
  "abo",
  "jak",
  "jako",
  "aba",
  "bár",
  "skorej",
  "prepytujem",
]);
