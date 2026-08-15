<script lang="ts">
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import ResourceSiteIcon from "$lib/components/resources/ResourceSiteIcon.svelte";

  import {
    type LearningResource,
    resourceCostLabel,
  } from "$lib/catalog/resources/catalog";
  import {
    RESOURCE_FEATURED_LINK_LIMIT,
    resourcesFeaturedCardClass,
    resourcesFeaturedLinkChipClass,
    resourcesFeaturedMetaPillClass,
  } from "$lib/pages/resources-page-ui";

  let { resource }: { resource: LearningResource } = $props();

  const links = $derived((resource.links ?? []).slice(0, RESOURCE_FEATURED_LINK_LIMIT));
</script>

<article class={resourcesFeaturedCardClass}>
  <div class="flex items-start gap-3.5">
    <ResourceSiteIcon resourceId={resource.id} size="lg" class="shrink-0" />

    <div class="min-w-0 flex-1">
      <a
        class="group inline-flex items-start gap-1.5 font-serif text-[1.05rem] font-semibold leading-snug text-blue-800 transition-colors hover:underline hover:underline-offset-2"
        href={resource.href}
        rel="noopener noreferrer"
        target="_blank"
      >
        <span class="min-w-0">{resource.name}</span>
        <ArrowRight class="mt-1 shrink-0 opacity-50 group-hover:opacity-100" />
      </a>

      <div class="mt-2 flex flex-wrap gap-1.5">
        <span class={resourcesFeaturedMetaPillClass}>
          {resourceCostLabel(resource.cost)}
        </span>

        {#if resource.level}
          <span class={resourcesFeaturedMetaPillClass}>{resource.level}</span>
        {/if}
      </div>
    </div>
  </div>

  <p class="m-0 mt-4 text-sm leading-relaxed text-slate-600">
    {resource.summary}
  </p>

  {#if links.length}
    <div class="mt-auto flex flex-wrap gap-2 pt-4">
      {#each links as link (link.href)}
        <a
          class={resourcesFeaturedLinkChipClass}
          href={link.href}
          rel="noopener noreferrer"
          target="_blank"
        >
          {link.label}
        </a>
      {/each}
    </div>
  {/if}
</article>
