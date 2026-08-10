<script lang="ts">
  import ResourceSiteIcon from "$lib/components/ResourceSiteIcon.svelte";

  import { type LearningResource } from "$lib/content/resources";
  import {
    resourceMetaLine,
    resourcesRowClass,
    resourcesSubLinkClass,
    resourcesTitleLinkClass,
  } from "$lib/pages/resources-page-ui";

  let { resource }: { resource: LearningResource } = $props();
</script>

<article class={resourcesRowClass}>
  <div class="flex items-start gap-3">
    <ResourceSiteIcon resourceId={resource.id} size="md" class="mt-0.5 shrink-0" />

    <div class="min-w-0 flex-1">
      <a
        class={resourcesTitleLinkClass}
        href={resource.href}
        rel="noopener noreferrer"
        target="_blank"
      >
        {resource.name}
      </a>

      <p class="m-0 mt-1.5 text-sm leading-relaxed text-slate-600">
        {resource.summary}
      </p>

      {#if resource.note}
        <p class="m-0 mt-2 text-sm leading-relaxed text-slate-500">
          {resource.note}
        </p>
      {/if}

      <p class="m-0 mt-2.5 text-xs text-slate-500">
        {resourceMetaLine(resource)}
      </p>

      {#if resource.links?.length}
        <ul class="m-0 mt-3 space-y-1.5">
          {#each resource.links as link (link.href)}
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
                <span class="mt-0.5 block text-xs text-slate-500">{link.note}</span>
              {/if}
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  </div>
</article>
