/** Block crude / sexual / vulgar Tatoeba lines from learner-facing examples. */

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

export function isCleanExample(slovak: string, english: string): boolean {
  const blob = `${slovak} ${english}`;

  if (BLOCKED_PATTERN.test(blob)) return false;

  const lower = blob.toLocaleLowerCase("sk");
  for (const fragment of BLOCKED_SUBSTRINGS) {
    if (lower.includes(fragment)) return false;
  }

  return true;
}
