<script lang="ts">
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";

  import type { CaseReference } from "$lib/catalog/types";
  import { cx } from "$lib/ui/classes";

  let {
    cases,
    current,
  }: {
    cases: CaseReference[];
    /** Slug of the case being read, highlighted in the list. */
    current?: string;
  } = $props();

  function splitQuestion(question: string | undefined): { sk: string; en?: string } {
    const [sk = "", en] = (question ?? "").split(" · ");
    return { sk, en };
  }
</script>

<ol class="m-0 list-none border-t border-slate-200 p-0">
  {#each cases as item, index (item.slug)}
    {@const question = splitQuestion(item.question)}
    {@const here = item.slug === current}

    <li class="border-b border-slate-200">
      <a
        class={cx(
          "group grid grid-cols-[2.25rem_minmax(0,1fr)_auto] items-baseline gap-x-4 py-5 no-underline max-[560px]:grid-cols-[1.75rem_minmax(0,1fr)]",
          here && "pointer-events-none",
        )}
        href="/grammar/cases/{item.slug}"
        aria-current={here ? "page" : undefined}
      >
        <span
          class="font-serif text-[1.35rem] leading-none font-semibold tracking-[-0.05em] text-slate-300 tabular-nums"
        >
          {index + 1}
        </span>

        <span class="min-w-0">
          <span class="flex flex-wrap items-baseline gap-x-3">
            <strong
              class={cx(
                "font-serif text-[1.3rem] font-semibold tracking-[-0.025em]",
                here ? "text-blue-800" : "text-slate-900 group-hover:text-blue-800",
              )}
            >
              {item.name}
            </strong>

            {#if question.sk}
              <span class="font-serif text-[1.02rem] text-slate-700" lang="sk">
                {question.sk}
              </span>
            {/if}

            {#if question.en}
              <span class="text-[0.85rem] text-slate-500">{question.en}</span>
            {/if}
          </span>

          {#if item.explanation}
            <span
              class="mt-1.5 block max-w-[62ch] text-[0.9rem] leading-relaxed text-pretty text-slate-600"
            >
              {item.explanation}
            </span>
          {/if}
        </span>

        <span
          class="flex items-center gap-2 font-sans text-[0.64rem] font-bold tracking-[0.12em] whitespace-nowrap text-slate-500 uppercase max-[560px]:col-start-2 max-[560px]:mt-2"
        >
          {#if here}
            <span class="text-blue-800">You are here</span>
          {:else}
            {item.role}
            <ArrowRight class="text-slate-400 group-hover:text-blue-800" />
          {/if}
        </span>
      </a>
    </li>
  {/each}
</ol>
