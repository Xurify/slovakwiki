<script lang="ts">
  import { spotWord, type SpotPick } from "./spot";

  let {
    words,
    pick,
    onpick,
    submitted,
    wrongIndex,
    solved,
  }: {
    words: string[];
    pick: SpotPick;
    onpick: (next: SpotPick) => void;
    submitted: boolean;
    /** The wrong word, or null when nothing is wrong. Shown only once checked. */
    wrongIndex: number | null;
    /** The learner found and fixed it, or rightly said nothing was wrong. */
    solved: boolean;
  } = $props();

  // Graded states leave the idle colors out: Tailwind orders same-property utilities
  // by name, so `bg-surface` would hide `bg-rose-50`.
  const wordShape =
    "rounded-(--control-radius) px-1 py-0.5 font-serif text-xl leading-snug transition-[background-color,box-shadow,color] duration-150 ease-out disabled:cursor-default";
  const wordIdleClass = `${wordShape} cursor-pointer text-slate-900 underline decoration-slate-300 decoration-dotted underline-offset-[6px] enabled:hover:bg-blue-50 enabled:hover:text-blue-900 aria-pressed:bg-blue-50 aria-pressed:text-blue-900 aria-pressed:no-underline aria-pressed:shadow-[inset_0_0_0_2px_var(--accent)]`;

  const noneShape =
    "mt-5 inline-flex min-h-10 items-center rounded-(--control-radius) border px-4 font-sans text-sm font-semibold transition-[border-color,background-color,box-shadow,color] duration-150 ease-out disabled:cursor-default";
  const noneIdleClass = `${noneShape} cursor-pointer border-slate-300 bg-surface text-slate-700 enabled:hover:border-slate-400 enabled:hover:bg-subtle aria-pressed:border-blue-600 aria-pressed:bg-blue-50 aria-pressed:text-blue-900 aria-pressed:shadow-[inset_0_0_0_1px_var(--accent)]`;

  const rightTone =
    "bg-emerald-50 text-slate-900 shadow-[inset_0_0_0_2px_var(--color-emerald-600)]";
  const wrongTone =
    "bg-rose-50 text-slate-900 shadow-[inset_0_0_0_2px_var(--color-rose-600)]";

  function wordClass(index: number): string {
    if (!submitted) return wordIdleClass;
    if (index === wrongIndex) return `${wordShape} ${solved ? rightTone : wrongTone}`;
    if (index === pick) {
      return `${wordShape} text-slate-900 outline-1 -outline-offset-1 outline-dashed outline-slate-400`;
    }
    return `${wordShape} text-slate-900`;
  }

  function wordLabel(index: number): string {
    const word = spotWord(words, index);
    if (!submitted) return word;
    if (index === wrongIndex) return `${word}, the wrong word`;
    if (index === pick) return `${word}, your pick`;
    return word;
  }

  const noneClass = $derived.by(() => {
    if (!submitted) return noneIdleClass;
    if (wrongIndex === null) {
      return `${noneShape} border-emerald-600 bg-emerald-50 text-slate-900 shadow-[inset_0_0_0_1px_var(--color-emerald-600)]`;
    }
    if (pick === "none") {
      return `${noneShape} border-rose-600 bg-rose-50 text-slate-900 shadow-[inset_0_0_0_1px_var(--color-rose-600)]`;
    }
    return `${noneShape} border-slate-200 bg-surface text-slate-500`;
  });

  function choose(next: SpotPick): void {
    if (submitted) return;
    onpick(pick === next ? null : next);
  }
</script>

<div class="mt-6">
  <!-- The words' own padding is the space between them; -mx-1 lines the first word up with the prompt. -->
  <p class="m-0 -mx-1 flex flex-wrap items-baseline gap-y-1" lang="sk">
    {#each words as word, index (index)}
      <button
        class={wordClass(index)}
        type="button"
        disabled={submitted}
        aria-pressed={pick === index}
        aria-label={wordLabel(index)}
        onclick={() => choose(index)}
      >
        {word}
      </button>
    {/each}
  </p>

  <button
    class={noneClass}
    type="button"
    disabled={submitted}
    aria-pressed={pick === "none"}
    onclick={() => choose("none")}
  >
    No mistake
  </button>
</div>
