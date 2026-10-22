<script lang="ts">
  import { panelClass, tagClass } from "$lib/components/ui/system-ui";
  import { pronounById, wordCategoryLabel } from "$lib/catalog/search/pronouns";
  import { normalizeSearchText } from "$lib/catalog/search/ui";

  import { dictionaryEntryHref } from "./dictionary-lookup";
  import PronounTable from "./PronounTable.svelte";
  import type { SearchVisit } from "./search-history";
  import { wordMetaLabel, type BestMatch, type TopicRow } from "./search-page-model";
  import { inlineLinkClass, matchMarkClass } from "./search-results-ui";

  let {
    match,
    onvisit,
    topic,
  }: {
    match: BestMatch;
    onvisit: (visit: SearchVisit) => void;
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
    match.type === "word" && match.entry.formsVerified
      ? [...new Set(match.entry.forms ?? [])].slice(0, 16)
      : [],
  );
  const related = $derived(
    match.type === "pronoun"
      ? match.pronoun.related
          .map((id) => pronounById(id))
          .filter((pronoun) => pronoun !== undefined)
      : [],
  );

  /** Personal pronouns list bare lemmas: with glosses, the eight of them wrap badly. */
  const showGlosses = $derived(
    match.type === "pronoun" && match.pronoun.kind === "gendered",
  );
  const hasFooter = $derived(related.length > 0 || topic !== undefined || !!entryHref);

  const headwordClass =
    "m-0 font-serif text-[2rem] leading-tight font-normal text-slate-900";
  const footerLabelClass = "text-xs text-slate-500";
  const footerValueClass = "flex min-w-0 flex-wrap items-baseline gap-x-4 gap-y-1";

  function visitEntry(): void {
    if (!entry || !entryHref) return;
    onvisit({
      href: entryHref,
      kind: "word",
      label: entry.slovak,
      category: wordCategoryLabel(entry.slovak, entry.category),
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
  <header class="font-serif text-[2rem] leading-tight">
    <h2 class="{headwordClass} inline" lang="sk">
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

    <span class="{tagClass} ml-1 align-middle font-sans">
      {match.type === "pronoun" ? "Pronoun" : wordMetaLabel(match.entry)}
    </span>
  </header>

  {#if match.type === "word"}
    <p class="m-0 mt-2 text-[0.95rem] text-slate-700">{match.entry.english}</p>

    {#if formsShown.length > 0}
      <div
        class="mt-4 grid grid-cols-[4.5rem_minmax(0,1fr)] items-baseline gap-x-4 text-sm"
      >
        <span class={footerLabelClass}>Forms</span>

        <span class="min-w-0 font-serif text-slate-800" lang="sk">
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

  <dl
    class="m-0 mt-4 grid grid-cols-[4.5rem_minmax(0,1fr)] items-baseline gap-x-4 gap-y-2 border-t border-slate-200 pt-3 text-sm"
    class:hidden={!hasFooter}
  >
    {#if related.length > 0}
      <dt class={footerLabelClass}>Related</dt>

      <dd class="m-0 {footerValueClass}">
        {#each related as pronoun (pronoun.id)}
          <a
            class={inlineLinkClass}
            href={`/search?q=${encodeURIComponent(pronoun.lemma)}`}
          >
            <span lang="sk">{pronoun.lemma}</span>
            {#if showGlosses}
              <span class="font-normal text-slate-500">· {pronoun.english}</span>
            {/if}
          </a>
        {/each}
      </dd>
    {/if}

    {#if topic}
      <dt class={footerLabelClass}>Learn it</dt>

      <dd class="m-0 {footerValueClass}">
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
      </dd>
    {/if}

    {#if entryHref}
      <dd class="m-0 {related.length > 0 || topic ? 'col-start-2' : 'col-span-2'}">
        <a class={inlineLinkClass} href={entryHref} onclick={visitEntry}>
          Open the full entry
        </a>
      </dd>
    {/if}
  </dl>
</article>
