<script lang="ts">
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";

  import { grammarEyebrowClass } from "$lib/components/reference/grammar-topic-ui";
  import type { CaseReference } from "$lib/catalog/types";
  import { cx } from "$lib/ui/classes";

  let { cases }: { cases: CaseReference[] } = $props();

  function splitQuestion(question: string | undefined): { sk: string; en?: string } {
    const [sk = "", en] = (question ?? "").split(" · ");
    return { sk, en };
  }

  const cardClass = cx(
    "group flex h-full flex-col rounded-(--frame-radius) bg-surface/80 px-4 py-4 no-underline shadow-(--shadow-border)",
    "transition-[background-color,box-shadow] duration-150 hover:bg-surface hover:shadow-(--shadow-border-hover)",
  );
</script>

<ol class="m-0 grid list-none gap-3 p-0 sm:grid-cols-2">
  {#each cases as item, index (item.slug)}
    {@const question = splitQuestion(item.question)}

    <li>
      <a class={cardClass} href="/grammar/cases/{item.slug}">
        <span class="flex items-baseline justify-between gap-3">
          <span class={grammarEyebrowClass}>
            <span class="tabular-nums">{index + 1}</span>
            {#if item.role}
              <span class="mx-1 text-slate-400" aria-hidden="true">·</span>
              {item.role}
            {/if}
          </span>

          <ArrowRight class="text-slate-400 group-hover:text-blue-800" />
        </span>

        <strong
          class="mt-1.5 font-serif text-lg leading-snug tracking-tight text-blue-800 underline-offset-2 group-hover:underline"
        >
          {item.name}
        </strong>

        {#if question.sk}
          <span class="mt-0.5 text-sm text-slate-500">
            <span class="font-serif font-semibold text-slate-700" lang="sk">
              {question.sk}
            </span>
            {#if question.en}
              {question.en}
            {/if}
          </span>
        {/if}

        {#if item.explanation}
          <span class="mt-2 text-sm leading-relaxed text-pretty text-slate-600">
            {item.explanation}
          </span>
        {/if}
      </a>
    </li>
  {/each}
</ol>
