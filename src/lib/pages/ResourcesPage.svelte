<script lang="ts">
  import ResourceSiteIcon from "$lib/components/ResourceSiteIcon.svelte";
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import Eyebrow from "$lib/components/ui/Eyebrow.svelte";
  import Lead from "$lib/components/ui/Lead.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";

  import {
    featuredResources,
    resourceCostLabel,
    resourceGroups,
    resourcesByGroup,
    type LearningResource,
    type ResourceCost,
  } from "$lib/content/resources";

  const featured = featuredResources();

  const panelClass =
    "overflow-hidden rounded-(--frame-radius) bg-surface ring-1 ring-inset ring-slate-200";

  const categoryChipClass =
    "inline-flex items-center rounded-(--control-radius) border border-slate-300 bg-surface px-3 py-1.5 text-sm text-blue-800 transition-colors hover:border-blue-600 hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600";

  const featuredCardClass =
    "flex h-full flex-col rounded-(--frame-radius) border border-slate-200 bg-surface p-5 transition-colors hover:border-blue-400 hover:bg-blue-50/40";

  const rowClass =
    "border-b border-slate-200 px-4 py-4 last:border-b-0 max-[600px]:px-3.5";

  const titleLinkClass =
    "group/title inline-flex items-center gap-2.5 font-serif text-base font-semibold leading-snug text-blue-800 transition-colors hover:text-blue-900";

  const subLinkClass =
    "text-sm text-blue-800 underline decoration-slate-300 underline-offset-2 transition-colors hover:decoration-blue-800";

  const badgeBase =
    "rounded-full px-2 py-0.5 text-[0.68rem] font-semibold uppercase tracking-[0.04em]";

  function costBadgeClass(cost: ResourceCost): string {
    switch (cost) {
      case "free":
        return `${badgeBase} bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200/80`;
      case "freemium":
        return `${badgeBase} bg-blue-50 text-blue-800 ring-1 ring-inset ring-blue-200/80`;
      case "paid":
        return `${badgeBase} bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200`;
      case "mixed":
        return `${badgeBase} bg-amber-50 text-amber-900 ring-1 ring-inset ring-amber-200/80`;
    }
  }

  function levelBadgeClass(): string {
    return `${badgeBase} bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200`;
  }
</script>

{#snippet resourceBadges(resource: LearningResource)}
  <div class="flex flex-wrap items-center gap-2">
    <span class={costBadgeClass(resource.cost)}>
      {resourceCostLabel(resource.cost)}
    </span>

    {#if resource.level}
      <span class={levelBadgeClass()}>{resource.level}</span>
    {/if}
  </div>
{/snippet}

{#snippet resourceBody(resource: LearningResource)}
  <p class="m-0 mt-2 text-sm leading-relaxed text-slate-700">
    {resource.summary}
  </p>

  {#if resource.note}
    <p class="m-0 mt-2 text-xs leading-relaxed text-slate-500">
      {resource.note}
    </p>
  {/if}

  <div class="mt-3">
    {@render resourceBadges(resource)}
  </div>

  {#if resource.links?.length}
    <ul class="mt-3 space-y-1.5 border-t border-slate-200/80 pt-3">
      {#each resource.links as link (link.href)}
        <li>
          <a
            class={subLinkClass}
            href={link.href}
            rel="noopener noreferrer"
            target="_blank"
          >
            {link.label}
          </a>

          {#if link.note}
            <span class="mt-0.5 block text-xs text-slate-500">{link.note}</span>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
{/snippet}

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

    <nav class="mt-9" aria-label="Resource categories">
      <Eyebrow>Categories</Eyebrow>

      <div class="mt-3 flex flex-wrap gap-2">
        {#each resourceGroups as group (group.id)}
          <a class={categoryChipClass} href="#resources-{group.id}">
            {group.title}
          </a>
        {/each}
      </div>
    </nav>

    {#if featured.length}
      <section class="mt-12" aria-labelledby="resources-featured">
        <div class="mb-5 border-b border-slate-200/80 pb-3.5">
          <h2 id="resources-featured" class="m-0 text-xl">Start here</h2>
          <p class="m-0 mt-1 max-w-xl text-sm leading-snug text-slate-600">
            Strong free (or library-friendly) picks if you want a short list.
          </p>
        </div>

        <div class="grid grid-cols-2 gap-4 max-[760px]:grid-cols-1">
          {#each featured as resource (resource.id)}
            <article class={featuredCardClass}>
              <a
                class="{titleLinkClass} group"
                href={resource.href}
                rel="noopener noreferrer"
                target="_blank"
              >
                <ResourceSiteIcon resourceId={resource.id} size="md" />
                <span>{resource.name}</span>
                <ArrowRight
                  class="opacity-45 transition-opacity group-hover/title:opacity-100"
                />
              </a>

              {@render resourceBody(resource)}
            </article>
          {/each}
        </div>
      </section>
    {/if}

    <div class="mt-14 space-y-14" aria-label="Resource groups">
      {#each resourceGroups as group (group.id)}
        {@const resources = resourcesByGroup(group.id)}

        <section
          id="resources-{group.id}"
          class="scroll-mt-[88px]"
          aria-labelledby="resources-heading-{group.id}"
        >
          <div
            class="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-slate-200/80 pb-3.5"
          >
            <div class="grid gap-1">
              <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h2 id="resources-heading-{group.id}" class="m-0 text-xl">
                  {group.title}
                </h2>

                <p class="m-0 text-xs tabular-nums text-slate-500">
                  {resources.length}
                  {resources.length === 1 ? "pick" : "picks"}
                </p>
              </div>

              <p class="m-0 max-w-xl text-sm leading-snug text-slate-600">
                {group.summary}
              </p>
            </div>
          </div>

          <div class={panelClass}>
            {#each resources as resource (resource.id)}
              <article class={rowClass}>
                <a
                  class="{titleLinkClass} group"
                  href={resource.href}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <ResourceSiteIcon resourceId={resource.id} size="md" />
                  <span>{resource.name}</span>
                  <ArrowRight
                    class="opacity-45 transition-opacity group-hover/title:opacity-100"
                  />
                </a>

                {@render resourceBody(resource)}
              </article>
            {/each}
          </div>
        </section>
      {/each}
    </div>
  </PageShell>
</main>
