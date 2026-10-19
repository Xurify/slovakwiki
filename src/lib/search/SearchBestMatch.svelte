<script lang="ts">
  import { panelClass, tagClass } from "$lib/components/ui/system-ui";
  import { pronounById } from "$lib/catalog/search/pronouns";
  import { normalizeSearchText, searchMetaLabel } from "$lib/catalog/search/ui";

  import { dictionaryEntryHref } from "./dictionary-lookup";
  import PronounTable from "./PronounTable.svelte";
  import type { SearchVisit } from "./search-history";
  import type { BestMatch, TopicRow } from "./search-page-model";
  import { inlineLinkClass, matchMarkClass } from "./search-results-ui";

  let {
    match,
    onvisit,
    topic,
  }: {
    match: BestMatch;
    onvisit: (visit: SearchVisit) => void;
    /** Lesson, practice and grammar for the pronoun's topic. */
    topic?: TopicRow;
  } = $props();

  const typed = $derived(match.formOf?.form ?? "");
  const typedKey = $derived(normalizeSearchText(typed));
  const lemma = $derived(
    match.type === "pronoun" ? match.pronoun.lemma : match.entry.slovak,
  );
  const entry = $derived(match.entry);
  const entryHref = $derived(entry ? dictionaryEntryHref(entry) : undefined);
  const formsShown = $derived(
    match.type === "word" ? [...new Set(match.entry.forms ?? [])].slice(0, 16) : [],
  );
  const related = $derived(
    match.type === "pronoun"
      ? match.pronoun.related
          .map((id) => pronounById(id))
          .filter((pronoun) => pronoun !== undefined)
      : [],
  );

  const headwordClass =
    "m-0 font-serif text-[2rem] leading-tight font-normal text-slate-900";
  const footerLabelClass = "w-20 shrink-0 text-xs text-slate-500 max-[600px]:w-full";

  function visitEntry(): void {
    if (!entry || !entryHref) return;
    onvisit({
      href: entryHref,
      kind: "word",
      label: entry.slovak,
      category: entry.category,
    });
  }
</script>

{#if match.formOf}
  <p class="m-0 mb-3 text-sm text-slate-700">
    <span class="font-serif font-semibold text-slate-900" lang="sk"
      >{match.formOf.form}</span
    >
    is a form of
    <span class="font-serif font-semibold text-slate-900" lang="sk">{lemma}</span
    >{#if match.type === "pronoun"}: {match.formOf.description}{/if}.
  </p>
{/if}

<article class="{panelClass} p-5 max-[600px]:p-4">
  <header class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
    <h2 class={headwordClass} lang="sk">
      {#if entryHref}
        <a
          class="text-inherit no-underline hover:text-blue-800"
          href={entryHref}
          onclick={visitEntry}
        >
          {lemma}
        </a>
      {:else}
        {lemma}
      {/if}
    </h2>

    <span class={tagClass}>
      {match.type === "pronoun"
        ? "Pronoun"
        : searchMetaLabel("word", match.entry.category)}
    </span>
  </header>

  {#if match.type === "word"}
    <p class="m-0 mt-2 text-[0.95rem] text-slate-700">{match.entry.english}</p>

    {#if formsShown.length > 0}
      <div class="mt-4 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
        <span class={footerLabelClass}>Forms</span>

        <span class="min-w-0 flex-1 font-serif text-slate-800" lang="sk">
          {#each formsShown as form, index (form)}
            {#if index > 0}
              <span class="text-slate-400">, </span>
            {/if}

            {#if typedKey && normalizeSearchText(form) === typedKey}
              <mark class={matchMarkClass}>{form}</mark>
            {:else}
              {form}
            {/if}
          {/each}
        </span>
      </div>
    {/if}
  {:else}
    <p class="m-0 mt-2 text-[0.95rem] text-slate-700">
      {match.pronoun.english}
      <span class="text-slate-500">· {match.pronoun.note}</span>
    </p>

    <div class="mt-4">
      <PronounTable pronoun={match.pronoun} {typed} />
    </div>
  {/if}

  <div class="mt-4 flex flex-col gap-2 border-t border-slate-200 pt-3 text-sm">
    {#if related.length > 0}
      <div class="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <span class={footerLabelClass}>Related</span>

        {#each related as pronoun (pronoun.id)}
          <a
            class={inlineLinkClass}
            href={`/search?q=${encodeURIComponent(pronoun.lemma)}`}
          >
            <span lang="sk">{pronoun.lemma}</span>
            <span class="font-normal text-slate-500">· {pronoun.english}</span>
          </a>
        {/each}
      </div>
    {/if}

    {#if topic}
      <div class="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <span class={footerLabelClass}>Learn it</span>

        {#each topic.links as link (link.href)}
          <a
            class={inlineLinkClass}
            href={link.href}
            onclick={() =>
              onvisit({ href: link.href, kind: link.kind, label: topic.title })}
          >
            {link.label}
          </a>
        {/each}
      </div>
    {/if}

    {#if entryHref}
      <div>
        <a class={inlineLinkClass} href={entryHref} onclick={visitEntry}>
          Open the full entry
        </a>
      </div>
    {/if}
  </div>
</article>
