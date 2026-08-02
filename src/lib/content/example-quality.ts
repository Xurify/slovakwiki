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

/**
 * Detects thin fill-template residue that must not ship as reviewed curated examples.
 * Practice frames may still use safer classed templates; overrides must not.
 *
 * When `lemma` is provided, also flags bare one-token frames that only repeat the headword
 * (`Hľadám medaila.`, `Toto je kariéra.`). Legitimate uses like `Hľadám knihu.` for hľadať
 * are allowed.
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
    const escaped = lemma.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
    if (new RegExp(`^Toto je ${escaped}\\.$`, "u").test(sk)) return true;
    if (new RegExp(`^Hľadám ${escaped}\\.$`, "u").test(sk)) return true;
    if (new RegExp(`^Potrebujeme ${escaped}\\.$`, "u").test(sk)) return true;
  }

  return false;
}
