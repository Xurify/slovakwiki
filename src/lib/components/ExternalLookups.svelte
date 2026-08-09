<script lang="ts">
  import {
    externalLookupsForLemma,
    type ExternalLookupLink,
  } from "$lib/content/external-lookups";

  let {
    lemma,
    class: className = "",
  }: {
    lemma: string;
    class?: string;
  } = $props();

  const links: ExternalLookupLink[] = $derived(externalLookupsForLemma(lemma));
</script>

{#if links.length > 0}
  <section
    id="lookups"
    class="scroll-mt-[88px] {className}"
    aria-labelledby="lookups-heading"
  >
    <h2 id="lookups-heading" class="mb-3 text-xl">Look up this word</h2>

    <ul class="m-0 flex list-none flex-wrap gap-2 p-0">
      {#each links as link (link.id)}
        <li>
          <a
            class="inline-flex items-center gap-2 rounded-(--control-radius) border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm font-semibold text-slate-800 transition-colors hover:border-blue-800 hover:bg-blue-50 hover:text-blue-900"
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
