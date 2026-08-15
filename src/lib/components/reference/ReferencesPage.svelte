<script lang="ts">
  import Eyebrow from "$lib/components/ui/Eyebrow.svelte";
  import Lead from "$lib/components/ui/Lead.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";

  import { referenceGroups, referencesByGroup } from "$lib/catalog/data-sources/catalog";
  import {
    resourcesMobileChipClass,
    resourcesPanelClass,
    resourcesSidebarLinkClass,
    resourcesSubLinkClass,
    resourcesTextRowClass,
  } from "$lib/components/resources/resources-page-ui";

  const referenceShortLabel: Record<string, string> = {
    dictionary: "Dictionary",
    corpus: "Corpus",
    examples: "Examples",
  };
</script>

<main class="py-12 pb-20 max-[600px]:py-8">
  <PageShell class="max-w-[960px]">
    <nav class="mb-6 flex gap-2 text-xs text-slate-500" aria-label="Breadcrumb">
      <TextLink href="/dictionary">Dictionary</TextLink>
      <span aria-hidden="true">/</span>
      <span>References</span>
    </nav>

    <header class="max-w-[640px]">
      <h1>References</h1>
      <Lead>
        Trusted sources behind dictionary entries, frequency lists, and optional example
        sentences. For courses, apps, and media, see
        <TextLink href="/resources">Resources</TextLink>. To take our dictionary data with
        you, see
        <TextLink href="/downloads">Downloads</TextLink>.
      </Lead>
    </header>

    <nav class="mt-9 min-[901px]:hidden" aria-label="Reference areas">
      <Eyebrow>Areas</Eyebrow>

      <div class="mt-3 flex flex-wrap gap-2">
        {#each referenceGroups as group (group.id)}
          <a class={resourcesMobileChipClass} href="#ref-{group.id}">
            {referenceShortLabel[group.id] ?? group.title}
          </a>
        {/each}
      </div>
    </nav>

    <div
      class="mt-12 grid grid-cols-1 gap-10 min-[901px]:grid-cols-[11.5rem_minmax(0,1fr)] min-[901px]:gap-12"
    >
      <aside
        class="sticky top-(--header-height) h-fit max-[900px]:hidden"
        aria-label="On this page"
      >
        <Eyebrow compact tone="muted">On this page</Eyebrow>

        <nav class="mt-2 flex flex-col">
          {#each referenceGroups as group (group.id)}
            <a class={resourcesSidebarLinkClass} href="#ref-{group.id}">
              {referenceShortLabel[group.id] ?? group.title}
            </a>
          {/each}
        </nav>
      </aside>

      <div class="space-y-12" aria-label="Reference groups">
        {#each referenceGroups as group (group.id)}
          {@const sources = referencesByGroup(group.id)}

          <section
            id="ref-{group.id}"
            class="scroll-mt-[88px]"
            aria-labelledby="ref-heading-{group.id}"
          >
            <h2 id="ref-heading-{group.id}" class="m-0 text-xl">{group.title}</h2>

            <p class="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
              {group.summary}
            </p>

            <div class="{resourcesPanelClass} mt-4">
              {#each sources as source (source.id)}
                <article class={resourcesTextRowClass}>
                  <h3
                    class="m-0 font-serif text-base font-semibold leading-snug text-slate-900"
                  >
                    {source.name}
                  </h3>

                  <p class="m-0 mt-1.5 text-sm leading-relaxed text-slate-600">
                    {source.usedFor}
                  </p>

                  {#if source.license}
                    <p class="m-0 mt-2 text-sm leading-relaxed text-slate-500">
                      {source.license}
                    </p>
                  {/if}

                  {#if source.links.length}
                    <ul class="m-0 mt-3 space-y-1.5 text-sm">
                      {#each source.links as link (link.href)}
                        <li>
                          <a
                            class={resourcesSubLinkClass}
                            href={link.href}
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            {link.label}
                          </a>

                          {#if link.note}
                            <span class="mt-0.5 block text-xs text-slate-500">
                              {link.note}
                            </span>
                          {/if}
                        </li>
                      {/each}
                    </ul>
                  {/if}
                </article>
              {/each}
            </div>
          </section>
        {/each}
      </div>
    </div>
  </PageShell>
</main>
