<script lang="ts">
  import type { AnswerGrade } from "$lib/components/practice/practice-state";

  let {
    grade,
    oncontinue,
    onwhy,
    why,
    whyOpen = false,
  }: {
    grade: AnswerGrade;
    oncontinue: () => void;
    onwhy?: () => void;
    why?: string;
    whyOpen?: boolean;
  } = $props();

  const incorrect = $derived(grade === "incorrect");
  const accents = $derived(grade === "accents");
  const showWhy = $derived((incorrect || accents) && Boolean(why) && Boolean(onwhy));
</script>

<div
  class={[
    "shrink-0 border-t px-4 py-4 sm:px-8 sm:py-5",
    incorrect
      ? "border-rose-200 bg-rose-50"
      : accents
        ? "border-blue-200 bg-blue-50"
        : "border-emerald-200 bg-emerald-50",
  ].join(" ")}
  role="status"
  aria-live="polite"
>
  <div class="mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-4">
    <div class="flex min-w-0 flex-1 flex-col gap-2">
      <div class="flex flex-wrap items-center gap-2.5">
        <span
          class={[
            "inline-flex items-center gap-1.5 text-sm font-bold",
            incorrect ? "text-rose-700" : accents ? "text-blue-800" : "text-emerald-700",
          ].join(" ")}
        >
          {#if incorrect}
            <svg
              class="size-3.5 fill-none stroke-current"
              viewBox="0 0 24 24"
              stroke-width="3"
              stroke-linecap="round"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
            Incorrect
          {:else if accents}
            <svg
              class="size-3.5 fill-none stroke-current"
              viewBox="0 0 24 24"
              stroke-width="3"
              stroke-linecap="round"
              aria-hidden="true"
            >
              <path d="M12 7v6M12 17h.01" />
            </svg>
            Almost — check the accents
          {:else}
            <svg
              class="size-3.5 fill-none stroke-current"
              viewBox="0 0 24 24"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12l5 5L20 7" />
            </svg>
            Correct!
          {/if}
        </span>

        {#if showWhy}
          <button
            type="button"
            class={[
              "cursor-pointer rounded-(--control-radius) bg-white/70 px-2.5 py-1 text-sm font-bold underline-offset-2 transition-[background-color] duration-150 hover:bg-white hover:underline",
              incorrect ? "text-rose-700" : "text-blue-800",
            ].join(" ")}
            aria-expanded={whyOpen}
            onclick={onwhy}
          >
            Why?
          </button>
        {/if}
      </div>

      {#if whyOpen && why}
        <p
          class={[
            "m-0 max-w-prose text-sm leading-relaxed",
            incorrect ? "text-rose-900" : "text-blue-900",
          ].join(" ")}
        >
          {why.replace(/\*\*/g, "")}
        </p>
      {/if}
    </div>

    <button
      type="button"
      class={[
        "inline-flex min-h-11 min-w-36 shrink-0 cursor-pointer items-center justify-center rounded-(--control-radius) px-6 font-sans text-sm font-bold text-white transition-[background-color,transform] duration-150 active:scale-[0.96]",
        incorrect
          ? "bg-rose-700 hover:bg-rose-800"
          : accents
            ? "bg-blue-700 hover:bg-blue-800"
            : "bg-emerald-600 hover:bg-emerald-700",
      ].join(" ")}
      onclick={oncontinue}
    >
      Continue
    </button>
  </div>
</div>
