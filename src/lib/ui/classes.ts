/** Minimal shared helpers — prefer ui components for styling. */

/** Join class strings, skipping falsy values. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
