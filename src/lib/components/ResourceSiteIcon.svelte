<script lang="ts">
  import { resourceIconUrl } from "$lib/content/resources";

  let { resourceId }: { resourceId: string } = $props();

  function hideBrokenIcon(event: Event) {
    const img = event.currentTarget;
    if (img instanceof HTMLImageElement) {
      img.closest("[data-resource-icon]")?.remove();
    }
  }
</script>

<span
  data-resource-icon
  class="inline-flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-white ring-1 ring-inset ring-slate-200"
>
  <img
    class="size-full object-contain"
    src={resourceIconUrl(resourceId)}
    alt=""
    width="20"
    height="20"
    loading="lazy"
    decoding="async"
    onerror={hideBrokenIcon}
  />
</span>
