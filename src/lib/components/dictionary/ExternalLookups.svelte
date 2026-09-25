<script lang="ts">
  import {
    externalLookupsForLemma,
    type ExternalLookupGroup,
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

  const GROUP_LABEL: Record<ExternalLookupGroup, string> = {
    translate: "Translate",
    dictionary: "Dictionaries",
    examples: "In context",
    images: "Images",
  };

  const GROUP_ORDER: ExternalLookupGroup[] = [
    "dictionary",
    "translate",
    "examples",
    "images",
  ];

  const links: ExternalLookupLink[] = $derived(
    externalLookupsForLemma(lemma, { dialect }),
  );

  const groups = $derived(
    GROUP_ORDER.map((group) => ({
      group,
      links: links.filter((link) => link.group === group),
    })).filter((entry) => entry.links.length > 0),
  );

  const linkClass =
    "inline-flex items-center gap-1.5 text-sm text-slate-700 no-underline transition-colors hover:text-blue-800";
</script>

{#if groups.length > 0}
  <section
    id="lookups"
    class="scroll-mt-[88px] {className}"
    aria-labelledby="lookups-heading"
  >
    <h2 id="lookups-heading" class="m-0 mb-4 font-serif text-xl text-slate-900">
      Look it up elsewhere
    </h2>

    <dl class="m-0 grid gap-y-3">
      {#each groups as entry (entry.group)}
        <div
          class="grid grid-cols-[7.5rem_1fr] items-baseline gap-x-4 max-[560px]:grid-cols-1 max-[560px]:gap-y-1.5"
        >
          <dt class="text-xs font-semibold tracking-wide text-slate-500 uppercase">
            {GROUP_LABEL[entry.group]}
          </dt>

          <dd class="m-0">
            <ul class="m-0 flex list-none flex-wrap gap-x-5 gap-y-2 p-0">
              {#each entry.links as link (link.id)}
                <li>
                  <a
                    class={linkClass}
                    href={link.href}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <img
                      class="size-3.5 shrink-0 rounded-[3px] opacity-90"
                      src={link.icon}
                      alt=""
                      width="14"
                      height="14"
                      loading="lazy"
                      decoding="async"
                    />
                    <span>{link.label}</span>
                  </a>
                </li>
              {/each}
            </ul>
          </dd>
        </div>
      {/each}
    </dl>
  </section>
{/if}
