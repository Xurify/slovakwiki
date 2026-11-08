<script lang="ts">
  import GrammarRichText from "$lib/components/reference/GrammarRichText.svelte";
  import type { CaseReference } from "$lib/catalog/types";
  import { caseTileSrc } from "$lib/catalog/motifs/art";
  import { cx } from "$lib/ui/classes";

  let {
    cases,
    current,
    compact = false,
  }: {
    cases: CaseReference[];
    /** Names and roles only, for a list that links on to the full page. */
    compact?: boolean;
    /** Slug of the case being read, marked in the list. */
    current?: string;
  } = $props();

  function splitQuestion(question: string | undefined): { sk: string; en?: string } {
    const [sk = "", en] = (question ?? "").split(" · ");
    return { sk, en };
  }
</script>

<ol class="m-0 list-none border-t border-slate-200 p-0">
  {#each cases as item (item.slug)}
    {@const question = splitQuestion(item.question)}
    {@const here = item.slug === current}

    <li class="border-b border-slate-200">
      <a
        class={cx(
          "group grid grid-cols-[2.75rem_minmax(0,1fr)] items-start gap-x-3.5 py-3 no-underline",
          here && "pointer-events-none",
        )}
        href="/grammar/cases/{item.slug}"
        aria-current={here ? "page" : undefined}
      >
        <img
          src={caseTileSrc(item.slug)}
          alt=""
          width="512"
          height="512"
          loading="lazy"
          decoding="async"
          class="size-11 rounded-(--control-radius) object-cover ring-1 ring-slate-900/10 ring-inset"
        />

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

          {#if item.explanation && !compact}
            <span class="mt-0.5 block text-sm leading-relaxed text-slate-600">
              <GrammarRichText text={item.explanation} />
            </span>
          {/if}
        </span>
      </a>
    </li>
  {/each}
</ol>
