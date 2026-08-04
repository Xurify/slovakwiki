<script lang="ts">
  import Eyebrow from "$lib/components/ui/Eyebrow.svelte";
  import Lead from "$lib/components/ui/Lead.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";

  import {
    featuredResources,
    resourceCostLabel,
    resourceGroups,
    resourcesByGroup,
  } from "$lib/content/resources";

  const featured = featuredResources();

  const groupNavClass =
    "flex flex-wrap gap-x-4 gap-y-2 border-b border-slate-200 pb-4 text-sm";
  const groupBlockClass = "mt-12 scroll-mt-28 border-t border-slate-200 pt-10";
  const resourceBlockClass = "mt-8 first:mt-6";
  const metaClass =
    "mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500";
  const linkListClass = "mt-3 space-y-2 text-sm";
  const externalLinkClass =
    "text-blue-800 underline decoration-slate-300 underline-offset-2 hover:decoration-blue-800";
</script>

<main class="py-12 pb-20 max-[600px]:py-8">
  <PageShell class="max-w-[880px]">
    <nav class="mb-6 flex gap-2 text-xs text-slate-500" aria-label="Breadcrumb">
      <TextLink href="/dictionary">Dictionary</TextLink>
      <span aria-hidden="true">/</span>
      <span>Resources</span>
    </nav>

    <header class="max-w-[640px]">
      <Eyebrow>Outside this site</Eyebrow>
      <h1>Resources</h1>
      <Lead>
        Curated courses, apps, textbooks, and media for learning Slovak. Data sources
        behind this wiki stay on
        <TextLink href="/references">References</TextLink>.
      </Lead>
    </header>

    <nav class="mt-10 {groupNavClass}" aria-label="Resource categories">
      {#each resourceGroups as group (group.id)}
        <a class="text-blue-800 hover:underline" href="#resources-{group.id}">
          {group.title}
        </a>
      {/each}
    </nav>

    {#if featured.length}
      <section class="mt-10" aria-labelledby="resources-featured">
        <h2 id="resources-featured" class="font-serif text-2xl text-blue-800">
          Start here
        </h2>
        <p class="mt-2 font-serif text-[1.02rem] leading-relaxed text-slate-600">
          Strong free (or library-friendly) picks if you want a short list.
        </p>

        <ul class="mt-6 space-y-4">
          {#each featured as resource (resource.id)}
            <li class="border-b border-slate-200 pb-4 last:border-0">
              <a
                class="font-serif text-lg font-semibold text-blue-800 underline decoration-slate-300 underline-offset-2 hover:decoration-blue-800"
                href={resource.href}
                rel="noopener noreferrer"
                target="_blank"
              >
                {resource.name}
              </a>
              <p class="mt-1 text-sm leading-relaxed text-slate-600">
                {resource.summary}
              </p>
              <p class={metaClass}>
                <span>{resourceCostLabel(resource.cost)}</span>
                {#if resource.level}
                  <span aria-hidden="true">·</span>
                  <span>{resource.level}</span>
                {/if}
              </p>
            </li>
          {/each}
        </ul>
      </section>
    {/if}

    {#each resourceGroups as group (group.id)}
      <section
        class={groupBlockClass}
        id="resources-{group.id}"
        aria-labelledby="resources-heading-{group.id}"
      >
        <h2 id="resources-heading-{group.id}" class="font-serif text-2xl text-blue-800">
          {group.title}
        </h2>
        <p class="mt-2 font-serif text-[1.02rem] leading-relaxed text-slate-600">
          {group.summary}
        </p>

        {#each resourcesByGroup(group.id) as resource (resource.id)}
          <article class={resourceBlockClass}>
            <h3 class="font-serif text-lg font-semibold text-slate-900">
              <a
                class={externalLinkClass}
                href={resource.href}
                rel="noopener noreferrer"
                target="_blank"
              >
                {resource.name}
              </a>
            </h3>

            <p class="mt-1 text-sm leading-relaxed text-slate-600">
              {resource.summary}
            </p>

            {#if resource.note}
              <p class="mt-2 text-xs leading-relaxed text-slate-500">
                {resource.note}
              </p>
            {/if}

            <p class={metaClass}>
              <span>{resourceCostLabel(resource.cost)}</span>
              {#if resource.level}
                <span aria-hidden="true">·</span>
                <span>{resource.level}</span>
              {/if}
            </p>

            {#if resource.links?.length}
              <ul class={linkListClass}>
                {#each resource.links as link (link.href)}
                  <li>
                    <a
                      class={externalLinkClass}
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
          </article>
        {/each}
      </section>
    {/each}
  </PageShell>
</main>
