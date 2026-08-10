<script lang="ts">
  import ResourceEntry from "$lib/components/ResourceEntry.svelte";
  import Eyebrow from "$lib/components/ui/Eyebrow.svelte";
  import Lead from "$lib/components/ui/Lead.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";

  import {
    featuredResources,
    resourceGroups,
    resourcesByGroup,
  } from "$lib/content/resources";
  import {
    resourcesMobileChipClass,
    resourcesPanelClass,
    resourcesSidebarLinkClass,
  } from "$lib/pages/resources-page-ui";

  const featured = featuredResources();
</script>

<main class="py-12 pb-20 max-[600px]:py-8">
  <PageShell class="max-w-[960px]">
    <nav class="mb-6 flex gap-2 text-xs text-slate-500" aria-label="Breadcrumb">
      <TextLink href="/dictionary">Dictionary</TextLink>
      <span aria-hidden="true">/</span>
      <span>Resources</span>
    </nav>

    <header class="max-w-[640px]">
      <h1>Resources</h1>
      <Lead>
        Curated courses, apps, textbooks, and media for learning Slovak. Data sources
        behind this wiki stay on
        <TextLink href="/references">References</TextLink>.
      </Lead>
    </header>

    <nav class="mt-9 min-[901px]:hidden" aria-label="Resource categories">
      <Eyebrow>Categories</Eyebrow>

      <div class="mt-3 flex flex-wrap gap-2">
        {#if featured.length}
          <a class={resourcesMobileChipClass} href="#resources-featured">Start here</a>
        {/if}

        {#each resourceGroups as group (group.id)}
          <a class={resourcesMobileChipClass} href="#resources-{group.id}">
            {group.title}
          </a>
        {/each}
      </div>
    </nav>

    <div
      class="mt-12 grid grid-cols-1 gap-10 min-[901px]:grid-cols-[200px_minmax(0,1fr)] min-[901px]:gap-12"
    >
      <aside
        class="sticky top-(--header-height) h-fit max-[900px]:hidden"
        aria-label="Resource categories"
      >
        <Eyebrow compact tone="muted">Categories</Eyebrow>

        <nav class="mt-2 flex flex-col">
          {#if featured.length}
            <a class={resourcesSidebarLinkClass} href="#resources-featured">
              <span>Start here</span>
            </a>
          {/if}

          {#each resourceGroups as group (group.id)}
            {@const count = resourcesByGroup(group.id).length}
            <a class={resourcesSidebarLinkClass} href="#resources-{group.id}">
              <span>{group.title}</span>
              <span class="shrink-0 text-xs tabular-nums text-slate-400">{count}</span>
            </a>
          {/each}
        </nav>

        <div class="mt-6 border-t border-slate-200/80 pt-5">
          <p class="m-0 text-xs leading-relaxed text-slate-500">
            Need attribution and corpus notes?
            <TextLink href="/references">References</TextLink>
          </p>
        </div>
      </aside>

      <div class="space-y-12">
        {#if featured.length}
          <section
            id="resources-featured"
            class="scroll-mt-[88px]"
            aria-labelledby="resources-featured-heading"
          >
            <h2 id="resources-featured-heading" class="m-0 text-xl">Start here</h2>

            <p class="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
              Strong free (or library-friendly) picks if you want a short list.
            </p>

            <div class="{resourcesPanelClass} mt-4">
              {#each featured as resource (resource.id)}
                <ResourceEntry {resource} />
              {/each}
            </div>
          </section>
        {/if}

        {#each resourceGroups as group (group.id)}
          {@const resources = resourcesByGroup(group.id)}

          <section
            id="resources-{group.id}"
            class="scroll-mt-[88px]"
            aria-labelledby="resources-heading-{group.id}"
          >
            <h2 id="resources-heading-{group.id}" class="m-0 text-xl">
              {group.title}
            </h2>

            <p class="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
              {group.summary}
            </p>

            <div class="{resourcesPanelClass} mt-4">
              {#each resources as resource (resource.id)}
                <ResourceEntry {resource} />
              {/each}
            </div>
          </section>
        {/each}
      </div>
    </div>
  </PageShell>
</main>
