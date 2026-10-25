import { markRoleClass, type TextRole } from "$lib/learning/marked-text";

/** Shared classes for grammar study pages. Slovak stays serif; English stays readable. */

/** The part of a form the pattern is about: an ending, a prefix. */
export const grammarEndingClass = "text-blue-800";

export function grammarMarkClass(role: TextRole): string {
  return role === "owner" || role === "ending" ? markRoleClass(role) : grammarEndingClass;
}

export const grammarFormClass =
  "font-serif text-xl leading-snug font-semibold text-slate-900";

export const grammarGlossClass = "text-[0.95rem] leading-snug text-slate-600";

export const grammarHeadingClass = "m-0 font-serif text-xl tracking-tight text-slate-900";

/**
 * 75ch is the upper end of a comfortable measure. Paired with the narrower
 * 680px grammar page shell, body text (~1.02rem) runs the full column and
 * this cap only bites on the smaller text-sm paragraphs.
 */
export const grammarProseClass =
  "m-0 max-w-[75ch] text-[1.02rem] leading-relaxed text-pretty text-slate-800";

export const grammarIntroClass =
  "m-0 max-w-[75ch] text-sm leading-relaxed text-slate-600";
