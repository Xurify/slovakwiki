<script lang="ts">
  import { resourceIconUrl } from "$lib/content/resources";

  let {
    resourceId,
    size = "sm",
  }: {
    resourceId: string;
    size?: "sm" | "md";
  } = $props();

  const boxClass = size === "md" ? "size-8 rounded-md" : "size-5 rounded-sm";
  const dimension = size === "md" ? 32 : 20;

  function hideBrokenIcon(event: Event) {
    const img = event.currentTarget;
    if (img instanceof HTMLImageElement) {
      img.closest("[data-resource-icon]")?.remove();
    }
  }
</script>

<span
  data-resource-icon
  class="inline-flex shrink-0 items-center justify-center overflow-hidden bg-white ring-1 ring-inset ring-slate-200 {boxClass}"
>
  <img
    class="size-full object-contain"
    src={resourceIconUrl(resourceId)}
    alt=""
    width={dimension}
    height={dimension}
    loading="lazy"
    decoding="async"
    onerror={hideBrokenIcon}
  />
</span>
