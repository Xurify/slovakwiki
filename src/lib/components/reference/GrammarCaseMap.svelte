<script lang="ts">
  import type { CaseReference } from "$lib/catalog/types";
  import { cx } from "$lib/ui/classes";

  let {
    cases,
    current,
  }: {
    cases: CaseReference[];
    /** Slug of the case being read, marked in the list. */
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
          "group grid grid-cols-[1.5rem_minmax(0,1fr)] items-baseline gap-x-3 py-2.5 no-underline",
          here && "pointer-events-none",
        )}
        href="/grammar/cases/{item.slug}"
        aria-current={here ? "page" : undefined}
      >
        <span class="text-sm text-slate-400 tabular-nums">{index + 1}</span>

        <span class="min-w-0">
          <span class="flex flex-wrap items-baseline gap-x-3">
            <strong
              class={cx(
                "font-serif text-lg font-semibold",
                here ? "text-blue-800" : "text-slate-900 group-hover:text-blue-800",
              )}
            >
              {item.name}
            </strong>

            {#if question.sk}
              <span class="font-serif text-slate-700" lang="sk">{question.sk}</span>
            {/if}

            {#if question.en}
              <span class="text-sm text-slate-500">{question.en}</span>
            {/if}

            {#if here}
              <span class="text-xs font-semibold text-blue-800">You are here</span>
            {:else if item.role}
              <span class="text-sm text-slate-500">{item.role}</span>
            {/if}
          </span>

          {#if item.explanation}
            <span class="mt-0.5 block text-sm leading-relaxed text-slate-600">
              {item.explanation}
            </span>
          {/if}
        </span>
      </a>
    </li>
  {/each}
</ol>
