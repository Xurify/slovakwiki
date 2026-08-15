/** Learner-safety and structural checks for dictionary example sentences. */

const BLOCKED_PATTERN =
  /(?<!\p{L})(sex|sexual|porn|porno|orgasm|penis|vagina|vagína|boobs?|tits?|nude|nudes|horny|masturb|cock|dick|pussy|whore|fuck|fucked|fucking|shit|jeba|jebal|jebali|jebať|piča|piču|kurv|sračk|sračky|erection|blowjob|handjob)(?!\p{L})/iu;

/** Extra substrings that are unsafe even inside larger tokens. */
const BLOCKED_SUBSTRINGS = [
  "jeba",
  "piča",
  "piču",
  "srač",
  "kurv",
  "fuck",
  "vagín",
  "vagina",
];

/** Glossary / meta fragments that are not usable learner sentences. */
const META_FRAGMENT =
  /\b(imperfective|perfective|see also|cf\.|syn\.|ant\.|n\.\s|v\.\s|adj\.\s)\b/iu;

export function isCleanExample(slovak: string, english: string): boolean {
  const blob = `${slovak} ${english}`;

  if (BLOCKED_PATTERN.test(blob)) return false;

  const lower = blob.toLocaleLowerCase("sk");
  for (const fragment of BLOCKED_SUBSTRINGS) {
    if (lower.includes(fragment)) return false;
  }

  return true;
}

export function isWellFormedExample(slovak: string, english: string): boolean {
  const sk = slovak.trim();
  const en = english.trim();

  if (sk.length < 8 || sk.length > 140) return false;
  if (en.length < 4 || en.length > 160) return false;
  if (!/[.!?…]["”']?$/u.test(sk)) return false;
  if (!/[.!?…]["”']?$/u.test(en)) return false;
  if (sk === en) return false;
  if (/^[A-ZÁÄČĎÉÍĽĹŇÓÔŔŠŤÚÝŽ][^.!?…]{0,8}$/u.test(sk)) return false;
  if (META_FRAGMENT.test(sk) || META_FRAGMENT.test(en)) return false;
  if (/[|;•]/.test(sk) || /[|;•]/.test(en)) return false;
  if (/\s{2,}/.test(sk) || /\s{2,}/.test(en)) return false;

  return true;
}

export function isAcceptableCorpusExample(slovak: string, english: string): boolean {
  return isCleanExample(slovak, english) && isWellFormedExample(slovak, english);
}

export type ExampleLike = {
  demonstrates?: string;
  english: string;
  isPracticeFrame?: boolean;
  slovak: string;
};

function escapeLemma(lemma: string): string {
  return lemma.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

function lemmaBoundInfinitiveFrame(slovak: string, lemma: string): boolean {
  const escaped = escapeLemma(lemma);
  return (
    new RegExp(`^Chcem ${escaped}\\.$`, "u").test(slovak) ||
    new RegExp(`^Je ťažké ${escaped}\\.$`, "u").test(slovak) ||
    new RegExp(`^Môže to ${escaped}\\.$`, "u").test(slovak) ||
    new RegExp(`^To môže ${escaped}\\.$`, "u").test(slovak) ||
    new RegExp(`^Snažím sa ${escaped}\\.$`, "u").test(slovak) ||
    new RegExp(`^Chcem ťa ${escaped}\\.$`, "u").test(slovak) ||
    new RegExp(`^Chcem s tebou ${escaped}\\.$`, "u").test(slovak)
  );
}

/**
 * Detects thin fill-template residue that must not ship as reviewed curated examples.
 * Practice frames may still use safer classed templates; reviewed curated must not.
 *
 * When `lemma` is provided, also flags bare one-token frames that only repeat the headword
 * (`Hľadám medaila.`, `Toto je kariéra.`, `Chcem ospravedlňovať.`). Legitimate uses like
 * `Hľadám knihu.` for hľadať or `Chcem označiť správnu odpoveď.` are allowed.
 */
export function isDamagedExampleTemplate(slovak: string, lemma?: string): boolean {
  const sk = slovak.trim();

  // Forced adjective hosts from weak fill frames.
  if (/^Hľadám \p{L}+ byt\.$/u.test(sk)) return true;
  if (/^(Potrebujeme|Hľadáme) \p{L}+ plán\.$/u.test(sk)) return true;
  if (/^To je \p{L}+ podnik\.$/u.test(sk)) return true;
  if (/^Je to \p{L}+ výraz\.$/u.test(sk)) return true;
  if (/^Ten muž je \p{L}+\.$/u.test(sk)) return true;
  if (/^Ten projekt je \p{L}+\.$/u.test(sk)) return true;
  if (/^Ten dom je \p{L}+\.$/u.test(sk)) return true;
  if (/^Začínam \p{L}+\.$/u.test(sk)) return true;
  if (/^Niekto môže /u.test(sk)) return true;

  if (lemma) {
    const escaped = escapeLemma(lemma);
    if (new RegExp(`^Toto je ${escaped}\\.$`, "u").test(sk)) return true;
    if (new RegExp(`^Hľadám ${escaped}\\.$`, "u").test(sk)) return true;
    if (new RegExp(`^Potrebujeme ${escaped}\\.$`, "u").test(sk)) return true;
    if (lemmaBoundInfinitiveFrame(sk, lemma)) return true;
  }

  return false;
}

/**
 * Weak dictionary fill stubs — including fake-`Curated` verb infinitive frames.
 * Does not require `isPracticeFrame`. Pattern (`demonstrates`) rows are never weak.
 * Does not blanket-ban `Chcem …` with a real complement (`Chcem označiť správnu odpoveď.`).
 */
export function isWeakFillTemplate(example: ExampleLike, lemma?: string): boolean {
  if (example.demonstrates) return false;

  const slovak = example.slovak.trim();
  const english = example.english.trim();

  if (isDamagedExampleTemplate(slovak, lemma)) return true;

  // Verb infinitive fills: citation lemma as the only complement.
  if (/^Chcem \p{L}+\.$/u.test(slovak) && /^I want to /i.test(english)) return true;
  if (/^Chcem ťa \p{L}+\.$/u.test(slovak) && /^I want to /i.test(english)) return true;
  if (/^Chcem s tebou \p{L}+\.$/u.test(slovak) && /^I want to /i.test(english))
    return true;
  if (/^Chcem si to \p{L}+\.$/u.test(slovak) && /^I want to /i.test(english)) return true;
  if (
    /^Chcem \p{L}+ kvalitu\.$/u.test(slovak) &&
    /^I want to .+ the quality\.$/i.test(english)
  ) {
    return true;
  }
  if (/^Je ťažké \p{L}+\.$/u.test(slovak) && /^It is hard /i.test(english)) return true;
  if (/^Môže to \p{L}+\.$/u.test(slovak) && /^It can /i.test(english)) return true;
  if (/^Môže sa to \p{L}+\.$/u.test(slovak) && /^It can /i.test(english)) return true;
  if (/^To môže \p{L}+\.$/u.test(slovak) && /^That can /i.test(english)) return true;
  if (/^Snažím sa \p{L}+\.$/u.test(slovak) && /^I'm trying to /i.test(english))
    return true;
  if (/^Musím \p{L}+, že som sa mýlil\.$/u.test(slovak)) return true;
  if (/^Začínam \p{L}+\.$/u.test(slovak) && /^I'm starting to /i.test(english))
    return true;
  if (/^Je možné \p{L}+\.$/u.test(slovak) && /^It is possible /i.test(english))
    return true;
  if (/^Niekto môže \p{L}+\.$/u.test(slovak) && /^Someone can /i.test(english))
    return true;
  if (/^Také veci môžu \p{L}+\.$/u.test(slovak) && /^Such things can /i.test(english)) {
    return true;
  }

  if (lemma && lemmaBoundInfinitiveFrame(slovak, lemma)) return true;

  // Conjugation stamps from the old fill/author templates — unique agent sentences only.
  if (/^Prečo sa \S+\?$/u.test(slovak) && /^Why do you /i.test(english)) return true;
  if (/^Prečo to \S+\?$/u.test(slovak) && /^Why do you /i.test(english)) return true;
  if (/^Prečo si to \S+\?$/u.test(slovak) && /^Why do you /i.test(english)) return true;
  if (/^\S+ sa za to\.$/u.test(slovak) && / for that\.$/i.test(english)) return true;
  if (/^Ona si to \S+\.$/u.test(slovak)) return true;
  if (/^\S+ to často\.$/u.test(slovak) && /often /i.test(english)) return true;
  if (/^Včera sa \S+\.$/u.test(slovak) && /yesterday/i.test(english)) return true;
  if (/^Včera si to \S+\.$/u.test(slovak) && /yesterday/i.test(english)) return true;
  if (/^\S+ to včera\.$/u.test(slovak) && /yesterday/i.test(english)) return true;
  if (/^Teraz to \S+\.$/u.test(slovak) && / now\.$/i.test(english)) return true;
  if (/^\S+ som to včera\.$/u.test(slovak) && /yesterday/i.test(english)) return true;
  if (/^\S+ som sa včera\.$/u.test(slovak) && /yesterday/i.test(english)) return true;
  if (/^\S+ som si to včera\.$/u.test(slovak) && /yesterday/i.test(english)) return true;

  // Broader noun/adj/adverb fills: still require the practice flag so real
  // curated sentences (`Toto je bežný problém.`, `Hľadám knihu.`) survive.
  if (example.isPracticeFrame !== true) return false;

  if (/^Chcem .+\.$/u.test(slovak) && /^I want to /i.test(english)) return true;
  if (/^Môže to .+\.$/u.test(slovak) && /^It can /i.test(english)) return true;
  if (/^Môže sa to .+\.$/u.test(slovak) && /^It can /i.test(english)) return true;
  if (/^To môže .+\.$/u.test(slovak) && /^That can /i.test(english)) return true;
  if (/^Také veci môžu .+\.$/u.test(slovak) && /^Such things can /i.test(english)) {
    return true;
  }
  if (/^Je možné .+\.$/u.test(slovak) && /^It is possible /i.test(english)) return true;
  if (/^Je ťažké .+\.$/u.test(slovak) && /^It is hard /i.test(english)) return true;
  if (/^Niekto môže .+\.$/u.test(slovak) && /^Someone can /i.test(english)) return true;
  if (/^Začínam .+\.$/u.test(slovak) && /^I'm starting to /i.test(english)) return true;
  if (/^Snažím sa .+\.$/u.test(slovak) && /^I'm trying to /i.test(english)) return true;
  if (
    /^Chcem .+ kvalitu\.$/u.test(slovak) &&
    /^I want to .+ the quality\.$/i.test(english)
  ) {
    return true;
  }
  if (
    /^Je to .+ výraz\.$/u.test(slovak) &&
    /^(It is|This is an expression)/i.test(english)
  ) {
    return true;
  }
  if (/^Sloveso „.+“ je bežné\.$/u.test(slovak)) return true;
  if (
    /^Sloveso „[^“]+“ znamená „[^“]+“\.$/u.test(slovak) &&
    /^The verb /i.test(english)
  ) {
    return true;
  }
  if (/^Rozumiem slovesu „.+“\.$/u.test(slovak)) return true;
  if (/^Mám .+ problém\.$/u.test(slovak) && /^I have a .+ problem\.$/i.test(english)) {
    return true;
  }
  if (/^To je .+ príklad\.$/u.test(slovak) && /^That is a .+ example\.$/i.test(english)) {
    return true;
  }
  if (/^Ten príklad je .+\.$/u.test(slovak) && /^That example is /i.test(english)) {
    return true;
  }
  if (/^Ten muž je .+\.$/u.test(slovak) && /^That man is /i.test(english)) return true;
  if (/^Ten dom je .+\.$/u.test(slovak) && /^That house is /i.test(english)) return true;
  if (/^Ten projekt je .+\.$/u.test(slovak) && /^That project is /i.test(english)) {
    return true;
  }
  if (/^To mesto je .+\.$/u.test(slovak) && /^That city is /i.test(english)) return true;
  if (/^To riešenie je .+\.$/u.test(slovak) && /^That solution is /i.test(english)) {
    return true;
  }
  if (/^To je .+\.$/u.test(slovak) && /^That is /i.test(english)) return true;
  if (/^Tá práca je .+\.$/u.test(slovak)) return true;
  if (/^Je to .+ človek\.$/u.test(slovak) && /^That is /i.test(english)) return true;
  if (/^Hľadám .+ byt\.$/u.test(slovak) && /^I'm looking for /i.test(english))
    return true;
  if (/^Hľadáme .+ riešenie\.$/u.test(slovak) && /^We're looking for /i.test(english)) {
    return true;
  }
  if (/^Hľadáme .+ plán\.$/u.test(slovak) && /^We're looking for /i.test(english)) {
    return true;
  }
  if (/^Hľadáme .+ prácu\.$/u.test(slovak) && /^We're looking for /i.test(english)) {
    return true;
  }
  if (/^Potrebujeme .+ plán\.$/u.test(slovak) && /^We need /i.test(english)) return true;
  if (/^Pracuje v .+ podniku\.$/u.test(slovak) && /^He works at /i.test(english)) {
    return true;
  }
  if (/^To je .+ podnik\.$/u.test(slovak) && /^That is /i.test(english)) return true;
  if (/^Potrebujeme .+\.$/u.test(slovak) && /^We need /i.test(english)) return true;
  if (/^Hľadám .+\.$/u.test(slovak) && /^I'm looking for /i.test(english)) return true;
  if (/^Toto je .+\.$/u.test(slovak) && /^This is /i.test(english)) return true;
  if (/^Toto sú .+\.$/u.test(slovak) && /^These are /i.test(english)) return true;
  if (/^Kde je .+\?$/u.test(slovak) && /^Where is /i.test(english)) return true;
  if (/^Jeden .+ stačí\.$/u.test(slovak) && /^One .+ is enough\.$/i.test(english)) {
    return true;
  }
  if (/^Jedna .+ stačí\.$/u.test(slovak) && /^One .+ is enough\.$/i.test(english)) {
    return true;
  }
  if (/^Jedno .+ stačí\.$/u.test(slovak) && /^One .+ is enough\.$/i.test(english)) {
    return true;
  }
  if (/^Potrebujem .+\.$/u.test(slovak) && /^I need /i.test(english)) return true;
  if (/^Volá sa .+\.$/u.test(slovak) && /^His\/her name is /i.test(english)) return true;
  if (/^Navštívim .+\.$/u.test(slovak) && /^I'll visit /i.test(english)) return true;
  if (/^Tu je .+\.$/u.test(slovak) && /^Here is /i.test(english)) return true;
  if (/^.+ je pekné mesto\.$/u.test(slovak) && / is a nice city\.$/i.test(english)) {
    return true;
  }
  if (/^Urobím to .+\.$/u.test(slovak) && /^I'll do it /i.test(english)) return true;
  if (/^Stalo sa to .+\.$/u.test(slovak) && /^It happened /i.test(english)) return true;
  if (/^Ide to .+\.$/u.test(slovak) && /^It's going /i.test(english)) return true;
  if (/^Hovorí .+\.$/u.test(slovak) && /^He\/she speaks /i.test(english)) return true;
  if (
    /^Robíme to .+ opatrne\.$/u.test(slovak) &&
    /^We're doing it .+ carefully\.$/i.test(english)
  ) {
    return true;
  }
  if (
    /^.+ pracujeme na tom\.$/u.test(slovak) &&
    / we are working on it\.$/i.test(english)
  ) {
    return true;
  }
  if (/^.+ som odišiel skôr\.$/u.test(slovak) && / I left earlier\.$/i.test(english)) {
    return true;
  }

  return false;
}
