<script lang="ts">
  import { practiceSessionCount, type PracticeSet } from "$lib/catalog/practice";
  import PracticeSessionChrome from "$lib/components/practice/PracticeSessionChrome.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";

  let { set }: { set: PracticeSet } = $props();

  const SK_CHARS = [
    "á",
    "ä",
    "č",
    "ď",
    "é",
    "í",
    "ĺ",
    "ľ",
    "ň",
    "ó",
    "ô",
    "ŕ",
    "š",
    "ť",
    "ú",
    "ý",
    "ž",
  ] as const;
</script>

<div class="mx-auto w-full max-w-[640px]" data-clock-q1-boot>
  <PracticeSessionChrome
    backHref="/practice"
    backLabel="Practice"
    total={practiceSessionCount(set)}
  />

  <section
    class="pointer-events-none overflow-hidden rounded-(--frame-radius) border border-slate-200 bg-surface shadow-(--shadow-border)"
  >
    <div class="px-7 py-8 max-[560px]:px-4 max-[560px]:py-6">
      <p
        class="m-0 mb-4 text-sm font-medium text-slate-500"
        data-clock-q1-kicker
        hidden
      ></p>

      <div class="grid gap-4" data-clock-q1-scene hidden></div>

      <template data-clock-q1-scene-template>
        <article
          class="rounded-(--control-radius) border border-slate-200 bg-slate-50/80 px-4 py-3.5"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0 flex-1">
              <p
                class="m-0 mb-2 text-[0.64rem] font-bold tracking-[0.14em] text-slate-500 uppercase"
                data-clock-q1-scene-speaker
                hidden
              ></p>

              <p
                class="m-0 font-serif text-[clamp(1.15rem,2.8vw,1.4rem)] font-semibold leading-snug text-slate-900"
              >
                <span lang="sk" data-clock-q1-scene-sk></span>
              </p>
            </div>

            <button
              class="audio-button relative inline-grid size-7 shrink-0 place-items-center rounded-full border border-slate-300 bg-(--surface) text-blue-900 shadow-(--shadow-border)"
              type="button"
              tabindex="-1"
              aria-hidden="true"
            >
              <svg
                class="relative size-4 fill-none stroke-current"
                viewBox="0 0 24 24"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M11 6 7 9.5H4v5h3L11 18V6Z" fill="currentColor" stroke="none" />
                <path d="M15.2 9.2a4.2 4.2 0 0 1 0 5.6M18.2 7a7 7 0 0 1 0 10" />
              </svg>
            </button>
          </div>

          <p
            class="m-0 mt-1.5 text-sm leading-snug text-slate-500"
            data-clock-q1-scene-en
          ></p>
          <p
            class="m-0 mt-2 text-xs font-semibold tracking-wide text-blue-700 underline decoration-blue-700/30 underline-offset-2"
            data-clock-q1-scene-en-toggle
            hidden
          >
            Show English
          </p>
        </article>
      </template>

      <p
        class="mt-5 mb-2 text-[0.64rem] font-bold tracking-[0.14em] text-slate-500 uppercase"
        data-clock-q1-you
        hidden
      >
        You
      </p>

      <p
        class="m-0 font-serif text-sm font-medium leading-snug text-slate-500"
        data-clock-q1-prompt-sk
        hidden
        lang="sk"
      ></p>

      <!-- Pre-paint boot fills this via applyClockQ1View. -->
      <!-- svelte-ignore a11y_missing_content -->
      <h1
        class="m-0 font-serif text-[clamp(1.1rem,2.5vw,1.35rem)] font-semibold leading-snug text-pretty text-slate-900"
        data-clock-q1-prompt
      ></h1>

      <div class="mt-6 flex justify-center" data-clock-q1-prompt-clock hidden></div>

      <div data-clock-q1-tiles hidden></div>

      <div data-clock-q1-choices hidden></div>

      <div class="mt-6 grid gap-3" data-clock-q1-typed hidden>
        <input
          class="min-h-[3.25rem] w-full rounded-(--control-radius) border border-slate-300 bg-control px-4 py-3 font-serif text-xl text-slate-900 outline-none placeholder:text-slate-400"
          placeholder="Type in Slovak…"
          readonly
        />

        <div class="flex flex-wrap gap-1.5">
          {#each SK_CHARS as char (char)}
            <button
              class="min-w-9 rounded-(--control-radius) border border-slate-200 bg-slate-50 px-2 py-1.5 font-serif text-sm text-slate-600"
              tabindex="-1"
              type="button"
            >
              {char}
            </button>
          {/each}
        </div>
      </div>

      <div class="mt-6 border-t border-slate-200 pt-4" data-clock-q1-hint hidden>
        <div
          class="rounded-(--control-radius) border border-dashed border-slate-300 bg-slate-50/90"
        >
          <div class="flex w-full items-center gap-3 px-3.5 py-3 text-left">
            <span
              class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-800"
              aria-hidden="true"
            >
              ?
            </span>

            <span class="min-w-0 flex-1">
              <span class="block text-sm font-semibold text-slate-900">Grammar hint</span>
              <span class="block text-sm text-slate-600" data-clock-q1-hint-chip></span>
            </span>

            <span class="shrink-0 text-xs font-semibold text-blue-800">Show</span>

            <svg
              class="size-4 shrink-0 fill-none stroke-slate-400 stroke-2"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
        </div>
      </div>

      <p
        class="mt-6 border-t border-slate-200 pt-4 text-xs text-slate-500"
        data-clock-q1-source
        hidden
      >
        From lesson:
        <TextLink class="text-xs" data-clock-q1-source-href href="/lessons">
          <span data-clock-q1-source-label></span>
        </TextLink>
      </p>
    </div>

    <footer
      class="flex flex-col-reverse items-stretch gap-3 border-t border-slate-200 bg-paper/70 px-7 py-5 max-[560px]:px-4 max-[560px]:py-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <button
        class="border-0 bg-transparent py-1 text-left text-sm font-bold text-blue-800 underline underline-offset-2"
        type="button"
        tabindex="-1"
        data-clock-q1-reveal
        hidden
      >
        Reveal answer
      </button>
      <span data-clock-q1-reveal-spacer aria-hidden="true"></span>
      <Button
        class="w-full sm:min-w-[9rem] sm:w-auto"
        disabled
        type="button"
        variant="accent"
      >
        Check
      </Button>
    </footer>
  </section>
</div>
