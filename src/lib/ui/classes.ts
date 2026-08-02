/** Shared Tailwind class strings — prefer these over custom CSS in styles.css. */

export const sectionLabel =
  "m-0 mb-2 font-sans text-[0.67rem] font-bold tracking-[0.1em] text-accent uppercase";

export const railLabel =
  "m-0 mb-3 font-sans text-[0.64rem] font-bold tracking-[0.1em] leading-tight text-muted uppercase";

export const shell =
  "mx-auto w-[min(var(--workspace-max),calc(100%-64px))] max-[800px]:w-[min(100%-28px,680px)]";

export const page =
  "py-14 pb-20 max-[800px]:py-[30px] max-[800px]:pb-[50px]";

export const lead =
  "mt-3.5 max-w-[680px] font-serif text-[1.04rem] text-slate-600";

export const textLink =
  "text-[0.82rem] font-bold text-blue-800 underline decoration-[color-mix(in_srgb,var(--accent)_55%,transparent)] underline-offset-[3px]";

export const button =
  "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-(--control-radius) border-0 bg-rose-600 px-4 font-sans font-bold text-white shadow-none transition-[background-color,box-shadow,transform,scale] hover:bg-rose-700 active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-65";

export const buttonSecondary =
  "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-(--control-radius) border-0 bg-transparent px-4 font-sans font-bold text-blue-800 shadow-(--shadow-border) transition-[background-color,box-shadow,transform,scale] hover:bg-blue-50 hover:shadow-(--shadow-border-hover) active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-65";

export const surfacePanel =
  "rounded-(--frame-radius) border border-slate-200 shadow-none transition-[box-shadow,transform] duration-160 ease-out focus-within:shadow-[0_0_0_3px_var(--accent-soft)]";

export const card =
  "rounded-(--frame-radius) border border-slate-200 bg-surface shadow-none transition-[box-shadow,transform] duration-160 ease-out hover:shadow-[0_3px_0_var(--line-strong)]";

export const contextRail = "grid gap-8 [&_section]:min-w-0";

export const sectionHeading =
  "flex items-start justify-between gap-6 border-b border-slate-200 pb-4";

/** Join class strings, skipping falsy values. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
