<script lang="ts">
  import {
    referenceCardClass,
    referenceH2Class,
    referenceSectionClass,
    referenceSectionLeadClass,
  } from "$lib/components/reference/reference-ui";

  import {
    externalLookupsForLemma,
    type ExternalLookupLink,
  } from "$lib/catalog/dictionary/external-lookups";

  let {
    lemma,
    dialect = false,
    class: className = "",
  }: {
    lemma: string;
    dialect?: boolean;
    class?: string;
  } = $props();

  const links: ExternalLookupLink[] = $derived(
    externalLookupsForLemma(lemma, { dialect }),
  );
</script>

{#if links.length > 0}
  <section
    id="lookups"
    class="{referenceSectionClass} {className}"
    aria-labelledby="lookups-heading"
  >
    <h2 id="lookups-heading" class={referenceH2Class}>Look it up elsewhere</h2>

    <p class={referenceSectionLeadClass}>
      Other dictionaries, translators, and corpora. Each opens in a new tab.
    </p>

    <ul class="{referenceCardClass} m-0 mt-5 flex list-none flex-wrap gap-2 p-4">
      {#each links as link (link.id)}
        <li>
          <a
            class="inline-flex items-center gap-2 rounded-(--control-radius) bg-slate-50 px-2.5 py-1.5 text-sm font-semibold text-slate-800 no-underline ring-1 ring-slate-200/80 transition-colors ring-inset hover:bg-blue-50 hover:text-blue-800"
            href={link.href}
            rel="noopener noreferrer"
            target="_blank"
          >
            <img
              class="size-4 shrink-0 rounded-sm"
              src={link.icon}
              alt=""
              width="16"
              height="16"
              loading="lazy"
              decoding="async"
            />
            <span>{link.label}</span>
            <span class="font-normal text-slate-400" aria-hidden="true">↗</span>
          </a>
        </li>
      {/each}
    </ul>
  </section>
{/if}
