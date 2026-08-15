<script lang="ts">
  import ResourceSiteIcon from "$lib/components/resources/ResourceSiteIcon.svelte";

  import {
    type LearningResource,
    resourceCostLabel,
  } from "$lib/catalog/resources/catalog";
  import {
    resourcesAnnotatedLinkLabelClass,
    resourcesFeaturedLinkChipClass,
    resourcesFeaturedMetaPillClass,
    resourcesNoteClass,
    resourcesRowClass,
    resourcesTitleLinkClass,
  } from "$lib/pages/resources-page-ui";

  let { resource }: { resource: LearningResource } = $props();

  const links = $derived(resource.links ?? []);

  // Annotated links need room for their note; plain ones scan better as chips.
  const hasLinkNotes = $derived(links.some((link) => Boolean(link.note)));
</script>

<article class={resourcesRowClass}>
  <div class="flex items-start gap-3.5">
    <ResourceSiteIcon resourceId={resource.id} size="md" class="mt-0.5 shrink-0" />

    <div class="min-w-0 flex-1">
      <div
        class="flex items-start justify-between gap-4 max-[560px]:flex-col max-[560px]:gap-2"
      >
        <a
          class={resourcesTitleLinkClass}
          href={resource.href}
          rel="noopener noreferrer"
          target="_blank"
        >
          {resource.name}
        </a>

        <div class="flex shrink-0 flex-wrap gap-1.5 pt-1 max-[560px]:pt-0">
          <span class={resourcesFeaturedMetaPillClass}>
            {resourceCostLabel(resource.cost)}
          </span>

          {#if resource.level}
            <span class={resourcesFeaturedMetaPillClass}>{resource.level}</span>
          {/if}
        </div>
      </div>

      <p class="m-0 mt-2 text-sm leading-relaxed text-slate-600">
        {resource.summary}
      </p>

      {#if resource.note}
        <p class={resourcesNoteClass}>
          {resource.note}
        </p>
      {/if}

      {#if links.length}
        {#if hasLinkNotes}
          <ul class="m-0 mt-3 space-y-2.5">
            {#each links as link (link.href)}
              <li>
                <a
                  class={resourcesAnnotatedLinkLabelClass}
                  href={link.href}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {link.label}
                </a>

                {#if link.note}
                  <span class="mt-0.5 block text-xs leading-relaxed text-slate-500">
                    {link.note}
                  </span>
                {/if}
              </li>
            {/each}
          </ul>
        {:else}
          <div class="mt-3 flex flex-wrap gap-2">
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
      {/if}
    </div>
  </div>
</article>
